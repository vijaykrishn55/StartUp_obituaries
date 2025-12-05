import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";
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
  X,
  Edit,
  Trash2
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
import { useNavigate } from "react-router-dom";

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
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [postImage, setPostImage] = useState<string>("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [postType, setPostType] = useState<string>("text");
  const [fundingStage, setFundingStage] = useState<string>("");
  const [fundingAmount, setFundingAmount] = useState<string>("");
  const [showFundingFields, setShowFundingFields] = useState(false);
  const [postTags, setPostTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const CONTENT_PREVIEW_LENGTH = 300;

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
        type: postType,
        title: postContent.substring(0, 100),
        tags: postTags,
      };

      if (postImage.trim()) {
        postData.coverImage = postImage;
        postData.image = postImage;
      }

      // Add funding details if funding post
      if (postType === 'funding' && fundingAmount && fundingStage) {
        postData.fundingAmount = fundingAmount;
        postData.fundingStage = fundingStage;
      }

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
      setPostImage("");
      setShowImageInput(false);
      setPostType("text");
      setFundingStage("");
      setFundingAmount("");
      setShowFundingFields(false);
      setPostTags([]);
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

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleEditComment = async (commentId: string, postId: string) => {
    if (!editCommentContent.trim()) return;
    try {
      await api.updateComment(commentId, editCommentContent);
      const response: any = await api.getPostComments(postId);
      const comments = response.data || response.comments || response || [];
      setPostComments(prev => ({ ...prev, [postId]: comments }));
      setEditingComment(null);
      setEditCommentContent("");
      toast({
        title: "Comment updated",
        description: "Your comment has been edited.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      const response: any = await api.getPostComments(postId);
      const comments = response.data || response.comments || response || [];
      setPostComments(prev => ({ ...prev, [postId]: comments }));
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const truncateContent = (content: string, postId: string) => {
    if (!content) return '';
    if (content.length <= CONTENT_PREVIEW_LENGTH || expandedPosts[postId]) {
      return content;
    }
    return content.substring(0, CONTENT_PREVIEW_LENGTH);
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

              {showImageInput && (
                <div className="mt-4 space-y-3 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Add Image</h4>
                    <Button variant="ghost" size="sm" onClick={() => { setShowImageInput(false); setPostImage(""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Enter image URL (e.g., https://images.unsplash.com/...)"
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                  />
                  {postImage && (
                    <img
                      src={postImage}
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              )}

              {/* Funding Post Fields */}
              {showFundingFields && (
                <div className="mt-4 space-y-3 p-4 border rounded-lg bg-green-500/5">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Funding Announcement
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => { setShowFundingFields(false); setPostType("text"); setFundingAmount(""); setFundingStage(""); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Amount Raised</label>
                      <Input
                        placeholder="e.g., $2M"
                        value={fundingAmount}
                        onChange={(e) => setFundingAmount(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Stage</label>
                      <Select value={fundingStage} onValueChange={setFundingStage}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B</SelectItem>
                          <SelectItem value="series-c">Series C+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Input */}
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {postTags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => setPostTags(postTags.filter((_, i) => i !== idx))}>
                    #{tag} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {postTags.length < 5 && (
                  <Input
                    placeholder="Add tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && currentTag.trim()) {
                        e.preventDefault();
                        if (!postTags.includes(currentTag.trim())) {
                          setPostTags([...postTags, currentTag.trim()]);
                        }
                        setCurrentTag("");
                      }
                    }}
                    className="w-24 h-7 text-xs"
                  />
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant={showImageInput ? "secondary" : "ghost"} 
                    size="sm"
                    onClick={() => { setShowImageInput(!showImageInput); if (showImageInput) setPostImage(""); }}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button 
                    variant={showFundingFields ? "secondary" : "ghost"} 
                    size="sm"
                    onClick={() => { 
                      setShowFundingFields(!showFundingFields); 
                      setPostType(showFundingFields ? "text" : "funding");
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Funding
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toast({ title: "Coming Soon", description: "Video upload will be available soon" })}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/posts/new/article')}
                  >
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
        const isAuthor = post.author?._id === user?.id || post.author?.id === user?.id;
        const contentLength = post.content?.length || 0;
        const shouldTruncate = contentLength > CONTENT_PREVIEW_LENGTH;
        const isExpanded = expandedPosts[post._id];

        return (
          <Card key={post._id} className="cursor-pointer" onClick={() => navigate(`/posts/${post._id}`)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                  <Avatar className="cursor-pointer" onClick={() => navigate(`/profile/${post.author?._id || post.author?.id}`)}>
                    <AvatarImage src={post.author?.avatar} />
                    <AvatarFallback>{post.author?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm hover:underline cursor-pointer" onClick={() => navigate(`/profile/${post.author?._id || post.author?.id}`)}>{post.author?.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {post.author?.headline || (post.author?.role && post.author?.company 
                        ? `${post.author.role} at ${post.author.company}` 
                        : post.author?.role || post.author?.company || post.author?.userType || 'Founder')}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTime(post.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {/* Funding stage and tag badges */}
                  {post.fundingStage && (
                    <Badge variant="outline" className="text-xs capitalize">{post.fundingStage.replace('-', ' ')}</Badge>
                  )}
                  {post.tags && post.tags.length > 0 && post.tags.slice(0, 2).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBookmark(post._id)}>Save post</DropdownMenuItem>
                      {isAuthor && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(`/posts/${post._id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit post
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePost(post._id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete post
                          </DropdownMenuItem>
                        </>
                      )}
                      {!isAuthor && (
                        <>
                          <DropdownMenuItem>Hide post</DropdownMenuItem>
                          <DropdownMenuItem>Report</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4" onClick={(e) => e.stopPropagation()}>
              {post.title && post.title !== post.content?.substring(0, 100) && (
                <h3 className="font-semibold text-lg cursor-pointer hover:text-primary" onClick={() => navigate(`/posts/${post._id}`)}>{post.title}</h3>
              )}
              
              <div>
                <p className="text-sm whitespace-pre-line">
                  {truncateContent(post.content, post._id)}
                  {shouldTruncate && !isExpanded && '...'}
                </p>
                {shouldTruncate && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isExpanded) {
                        navigate(`/posts/${post._id}`);
                      } else {
                        toggleExpanded(post._id);
                      }
                    }}
                  >
                    {isExpanded ? 'Show less' : 'See more'}
                  </Button>
                )}
              </div>

              {/* Funding Info Box - like image 2 */}
              {(post.fundingAmount || post.fundingStage) && (
                <div className="flex items-center gap-6 p-4 rounded-lg border bg-muted/30">
                  {post.fundingAmount && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Raising</p>
                        <p className="font-bold">{post.fundingAmount}</p>
                      </div>
                    </div>
                  )}
                  {post.fundingStage && (
                    <div>
                      <p className="text-xs text-muted-foreground">Stage</p>
                      <p className="font-bold capitalize">{post.fundingStage.replace('-', ' ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Company Info Box for postmortem type */}
              {(post.companyName || post.foundedYear || post.closedYear || post.totalFunding) && (
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg border bg-orange-500/10">
                  {post.companyName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="font-bold">{post.companyName}</p>
                    </div>
                  )}
                  {post.foundedYear && (
                    <div>
                      <p className="text-xs text-muted-foreground">Founded</p>
                      <p className="font-semibold">{post.foundedYear}</p>
                    </div>
                  )}
                  {post.closedYear && (
                    <div>
                      <p className="text-xs text-muted-foreground">Closed</p>
                      <p className="font-semibold">{post.closedYear}</p>
                    </div>
                  )}
                  {post.totalFunding && (
                    <div>
                      <p className="text-xs text-muted-foreground">Total Raised</p>
                      <p className="font-semibold">{post.totalFunding}</p>
                    </div>
                  )}
                </div>
              )}
              
              {(post.image || post.coverImage) && (
                <img 
                  src={post.image || post.coverImage} 
                  alt="Post content" 
                  className="w-full rounded-lg max-h-96 object-cover cursor-pointer"
                  onClick={() => navigate(`/posts/${post._id}`)}
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
                    {postComments[post._id]?.map((comment: any) => {
                      const isCommentAuthor = comment.user?._id === user?.id || comment.user?.id === user?.id || comment.author?._id === user?.id;
                      const commentId = comment._id || comment.id;
                      
                      return (
                        <div key={commentId} className="flex gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user?.avatar || comment.author?.avatar} />
                            <AvatarFallback>{(comment.user?.name || comment.author?.name)?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            {editingComment === commentId ? (
                              <div className="space-y-2">
                                <Input
                                  value={editCommentContent}
                                  onChange={(e) => setEditCommentContent(e.target.value)}
                                  placeholder="Edit your comment..."
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleEditComment(commentId, post._id)}>Save</Button>
                                  <Button size="sm" variant="outline" onClick={() => { setEditingComment(null); setEditCommentContent(""); }}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="bg-muted p-2 rounded-lg relative group">
                                  <div className="flex justify-between items-start">
                                    <p className="font-semibold text-xs">{comment.user?.name || comment.author?.name}</p>
                                    {isCommentAuthor && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => { setEditingComment(commentId); setEditCommentContent(comment.content); }}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleDeleteComment(commentId, post._id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatTime(comment.createdAt)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
