import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Image, 
  Video, 
  FileText, 
  BarChart, 
  ThumbsUp, 
  MessageCircle, 
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Post } from "@/lib/data";

export const DashboardFeed = () => {
  const [postContent, setPostContent] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response: any = await api.getPosts({ limit: 20 });
      setPosts(response.data || response.posts || response || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!postContent.trim() && !showPoll) return;

    try {
      const postData: any = {
        content: postContent,
        type: "text",
      };

      if (showPoll && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
        postData.poll = {
          question: pollQuestion,
          options: pollOptions.filter(o => o.trim()).map(text => ({ text, votes: [] })),
        };
      }

      await api.createPost(postData);
      toast({
        title: "Post published!",
        description: "Your post has been shared with your network.",
      });
      setPostContent("");
      setPollQuestion("");
      setPollOptions(["", ""]);
      setShowPoll(false);
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.likePost(postId);
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const isLiked = p.likes.includes(user?.id || '');
          return {
            ...p,
            likes: isLiked 
              ? p.likes.filter(id => id !== user?.id)
              : [...p.likes, user?.id || '']
          };
        }
        return p;
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      await api.bookmarkPost(postId);
      toast({
        title: "Success",
        description: "Post bookmark status updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to bookmark post",
        variant: "destructive",
      });
    }
  };

  const toggleComments = async (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    
    if (!postComments[postId]) {
      try {
        const response: any = await api.getPostComments(postId);
        const comments = response.data || response.comments || response || [];
        setPostComments(prev => ({ ...prev, [postId]: comments }));
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      await api.commentOnPost(postId, content);
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      const response: any = await api.getPostComments(postId);
      const comments = response.data || response.comments || response || [];
      setPostComments(prev => ({ ...prev, [postId]: comments }));
      setPosts(prev => prev.map(p => 
        p._id === postId ? { ...p, comments: [...(p.comments || []), { user: user?.id, content }] } : p
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (postId: string, optionIndex: number) => {
    try {
      await api.votePoll(postId, optionIndex);
      const updatedPost = await api.getPostById(postId);
      setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));
      toast({
        title: "Vote recorded!",
        description: "Your vote has been counted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to vote",
        variant: "destructive",
      });
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts, updates, or ask questions..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              
              {showPoll && (
                <div className="mt-4 space-y-3 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Create Poll</h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowPoll(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Poll question"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                  />
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                      />
                      {pollOptions.length > 2 && (
                        <Button variant="ghost" size="sm" onClick={() => removePollOption(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 10 && (
                    <Button variant="outline" size="sm" onClick={addPollOption}>
                      Add Option
                    </Button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Image className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Article
                  </Button>
                  <Button 
                    variant={showPoll ? "secondary" : "ghost"} 
                    size="sm"
                    onClick={() => setShowPoll(!showPoll)}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Poll
                  </Button>
                </div>
                <Button onClick={handlePost} disabled={!postContent.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed Posts */}
      {posts.map((post) => {
        const isLiked = post.likes?.includes(user?.id || '');
        const likeCount = post.likes?.length || 0;
        const commentCount = post.comments?.length || 0;

        return (
          <Card key={post._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={post.author?.avatar} />
                    <AvatarFallback>{post.author?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm">{post.author?.name}</h4>
                    <p className="text-xs text-muted-foreground">{post.author?.headline || post.author?.role}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(post.createdAt)}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBookmark(post._id)}>Save post</DropdownMenuItem>
                    <DropdownMenuItem>Hide post</DropdownMenuItem>
                    <DropdownMenuItem>Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm whitespace-pre-line">{post.content}</p>
              
              {post.image && (
                <img 
                  src={post.image} 
                  alt="Post content" 
                  className="w-full rounded-lg"
                />
              )}

              {post.poll && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold">{post.poll.question}</h4>
                  {post.poll.options.map((option, index) => {
                    const totalVotes = post.poll!.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
                    const voteCount = option.votes?.length || 0;
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    const hasVoted = option.votes?.some(v => v === user?.id);

                    return (
                      <div key={index} className="space-y-1">
                        <Button
                          variant={hasVoted ? "secondary" : "outline"}
                          className="w-full justify-start"
                          onClick={() => handleVote(post._id, index)}
                        >
                          {option.text}
                        </Button>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Progress value={percentage} className="h-2 flex-1" />
                          <span>{percentage.toFixed(0)}% ({voteCount})</span>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground">
                    {post.poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0)} total votes
                  </p>
                </div>
              )}

              <Separator />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
                <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-around">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleLike(post._id)}
                  className={`flex-1 ${isLiked ? 'text-blue-600' : ''}`}
                >
                  <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  Like
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toggleComments(post._id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleBookmark(post._id)}>
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>

              {showComments[post._id] && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          value={commentInputs[post._id] || ""}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                        />
                        <Button size="sm" onClick={() => handleComment(post._id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {postComments[post._id]?.map((comment: any) => (
                      <div key={comment._id} className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user?.avatar} />
                          <AvatarFallback>{comment.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted p-2 rounded-lg">
                            <p className="font-semibold text-xs">{comment.user?.name}</p>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
