import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Send,
  Heart,
  ChevronUp,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [likingComment, setLikingComment] = useState<string | null>(null);

  const deletePost = useMutation({
    mutationFn: () => api.deletePost(postId!),
    onSuccess: () => {
      toast({ title: "Post deleted" });
      navigate('/dashboard');
    },
    onError: (e: any) => toast({ title: "Failed to delete", description: e?.message ?? "", variant: "destructive" })
  });

  useEffect(() => {
    if (postId) {
      fetchPostData();
    }
  }, [postId]);

  const fetchPostData = async () => {
    try {
      setLoading(true);
      const [postData, commentsData]: any[] = await Promise.all([
        api.getPostById(postId!),
        api.getPostComments(postId!)
      ]);
      setPost(postData.data || postData);
      setComments(commentsData.data || commentsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      const res = await sharePost(post._id);
      // Always update local state with new share count from backend if available
      if (res && res.data && typeof res.data.shares === 'number') {
        setPost((prev) => prev ? { ...prev, shares: res.data.shares } : prev);
      } else {
        setPost((prev) => prev ? { ...prev, shares: (prev.shares || 0) + 1 } : prev);
      }
      toast.success('Post shared!');
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  const handleBookmark = async () => {
    try {
      await api.bookmarkPost(postId!);
      toast({
        title: "Success",
        description: "Bookmark status updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to bookmark post",
        variant: "destructive",
      });
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.commentOnPost(postId!, comment);
      toast({
        title: "Comment posted",
        description: "Your comment has been added",
      });
      setComment("");
      fetchPostData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      setLikingComment(commentId);
      await api.likeComment(commentId);
      // Update comment likes in state
      setComments(prev => prev.map(c => {
        if (c._id === commentId || c.id === commentId) {
          const userId = user?._id || user?.id;
          const isLiked = c.likes?.includes(userId);
          return {
            ...c,
            likes: isLiked 
              ? c.likes.filter((id: string) => id !== userId)
              : [...(c.likes || []), userId]
          };
        }
        return c;
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to like comment",
        variant: "destructive",
      });
    } finally {
      setLikingComment(null);
    }
  };

  const handleReplyToComment = async (commentId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      await api.replyToComment(commentId, replyContent);
      toast({
        title: "Reply posted",
        description: "Your reply has been added",
      });
      setReplyContent("");
      setReplyingTo(null);
      fetchPostData(); // Refresh to get updated comments
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-8">Loading post...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-8">Post not found</div>
        </div>
      </div>
    );
  }

  const liked = post?.likes?.includes(user?.id);
  const bookmarked = post?.bookmarkedBy?.includes(user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          {/* Post Header */}
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${post.author?._id || post.author?.id}`)}>
                  <AvatarImage src={post.author?.avatar} alt={post.author?.name} />
                  <AvatarFallback>{post.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/profile/${post.author?._id || post.author?.id}`)}>
                    {post.author?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {post.author?.headline || (post.author?.role && post.author?.company 
                      ? `${post.author.role} at ${post.author.company}` 
                      : post.author?.title || post.author?.role || post.author?.company || 'Founder')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    }) : post.timestamp}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user?.id === post.author._id && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => toast({ title: 'Edit coming soon' })}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm('Delete this post?')) deletePost.mutate();
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {post.type === "funding" && (
              <Badge variant="default" className="w-fit mb-3 bg-green-500">
                <DollarSign className="h-3 w-3 mr-1" />
                Funding Announcement
              </Badge>
            )}

            <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
            {post.subtitle && (
              <p className="text-lg text-muted-foreground mb-4">{post.subtitle}</p>
            )}
          </CardHeader>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="px-6 mb-6">
              <img
                src={post.coverImage}
                alt="Post cover"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Company Info for postmortem type */}
          {(post.companyName || post.foundedYear || post.closedYear || post.totalFunding) && (
            <div className="px-6 mb-6">
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="flex flex-wrap gap-6">
                  {post.companyName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-xl font-bold">{post.companyName}</p>
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
              </div>
            </div>
          )}

          {/* Funding Details */}
          {(post.type === "funding" || post.fundingAmount || post.fundingStage) && (
            <div className="px-6 mb-6">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                {post.fundingAmount && (
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {post.fundingAmount.startsWith('$') ? post.fundingAmount : `$${post.fundingAmount}`}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {post.fundingStage && <span className="capitalize">{post.fundingStage.replace('-', ' ')}</span>}
                  {post.fundingStage && post.investors && ' • '}
                  {post.investors && `Led by ${post.investors}`}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="px-6 mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag: string, idx: number) => (
                <Badge key={idx} variant="secondary">#{tag}</Badge>
              ))}
            </div>
          )}

          {/* Post Content */}
          <CardContent className="space-y-6">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">{post.content}</div>
            </div>

            <Separator />

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={liked ? "default" : "ghost"}
                  size="sm"
                  onClick={handleLike}
                  className="gap-2"
                >
                  {liked ? (
                    <Heart className="h-4 w-4 fill-current" />
                  ) : (
                    <ThumbsUp className="h-4 w-4" />
                  )}
                  <span>{post.likes?.length || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments?.length || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>{post.shares || 0}</span>
                </Button>
              </div>
              <Button
                variant={bookmarked ? "default" : "ghost"}
                size="sm"
                onClick={handleBookmark}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
              </Button>
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>

              {/* Add Comment */}
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>YO</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setComment("")}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleComment} disabled={!comment.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => {
                  const commentId = comment._id || comment.id;
                  const isLikedByUser = comment.likes?.includes(user?._id || user?.id);
                  
                  return (
                  <div key={commentId} className="flex gap-3">
                    <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/profile/${comment.author?._id || comment.author?.id}`)}>
                      <AvatarImage src={comment.author?.avatar} alt={comment.author?.name} />
                      <AvatarFallback>{comment.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 
                              className="font-semibold text-sm cursor-pointer hover:underline" 
                              onClick={() => navigate(`/profile/${comment.author?._id || comment.author?.id}`)}
                            >
                              {comment.author?.name || 'Unknown User'}
                            </h4>
                            <p className="text-xs text-muted-foreground">{comment.author?.title || comment.author?.userType}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : comment.timestamp}
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 ml-2">
                        <Button 
                          variant={isLikedByUser ? "default" : "ghost"} 
                          size="sm" 
                          className="h-8 text-xs"
                          disabled={likingComment === commentId}
                          onClick={() => handleLikeComment(commentId)}
                        >
                          {likingComment === commentId ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <ThumbsUp className={`h-3 w-3 mr-1 ${isLikedByUser ? 'fill-current' : ''}`} />
                          )}
                          {comment.likes?.length || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => setReplyingTo(replyingTo === commentId ? null : commentId)}
                        >
                          Reply
                        </Button>
                      </div>
                      
                      {/* Reply Input */}
                      {replyingTo === commentId && (
                        <div className="mt-3 ml-2 flex gap-2">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                          <div className="flex flex-col gap-1">
                            <Button 
                              size="sm" 
                              onClick={() => handleReplyToComment(commentId)}
                              disabled={!replyContent.trim()}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent("");
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Show Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-6 mt-3 space-y-3 border-l-2 border-muted pl-4">
                          {comment.replies.map((reply: any) => (
                            <div key={reply._id || reply.id} className="flex gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={reply.author?.avatar} />
                                <AvatarFallback>{reply.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-muted/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs">{reply.author?.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ''}
                                  </span>
                                </div>
                                <p className="text-sm">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default PostDetail;
