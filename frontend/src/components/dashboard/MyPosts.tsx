import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ThumbsUp, MessageCircle, TrendingUp, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Post {
  _id: string;
  content: string;
  title?: string;
  createdAt: string;
  views?: number;
  likes: string[];
  comments?: any[];
  trending?: boolean;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface MyPostsProps {
  userId?: string;
}

export const MyPosts = ({ userId }: MyPostsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });

  // Use provided userId or fall back to logged in user
  const targetUserId = userId || user?._id || user?.id;
  const isOwnProfile = !userId || userId === user?._id || userId === user?.id;

  useEffect(() => {
    fetchMyPosts();
  }, [targetUserId]);

  const fetchMyPosts = async () => {
    if (!targetUserId) return;
    
    try {
      setLoading(true);
      const response: any = await api.getUserPosts(targetUserId);
      const postsData = response.data || response.posts || [];
      setPosts(postsData);
      
      // Calculate stats
      const totalViews = postsData.reduce((acc: number, p: Post) => acc + (p.views || 0), 0);
      const totalLikes = postsData.reduce((acc: number, p: Post) => acc + (p.likes?.length || 0), 0);
      const totalComments = postsData.reduce((acc: number, p: Post) => acc + (p.comments?.length || 0), 0);
      
      setStats({
        totalPosts: postsData.length,
        totalViews,
        totalLikes,
        totalComments
      });
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast({
        title: "Error",
        description: "Failed to load your posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (postId: string) => {
    navigate(`/posts/${postId}/edit`);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    
    try {
      setDeleting(postToDelete);
      await api.deletePost(postToDelete);
      setPosts(posts.filter(p => p._id !== postToDelete));
      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPosts: prev.totalPosts - 1
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
      setPostToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isOwnProfile ? "My Posts" : "Posts"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalViews)}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalLikes)}</p>
              <p className="text-xs text-muted-foreground">Total Likes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalComments)}</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {isOwnProfile ? "You haven't created any posts yet." : "No posts yet."}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" onClick={() => navigate('/dashboard')}>
                Create Your First Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={post.author?.avatar || user?.avatar} />
                    <AvatarFallback>{post.author?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{isOwnProfile ? "You" : post.author?.name || "Unknown"}</h4>
                      {post.trending && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(post._id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={deleting === post._id}
                      onClick={() => {
                        setPostToDelete(post._id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      {deleting === post._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {post.title && <h3 className="font-semibold">{post.title}</h3>}
              <p className="text-sm">{post.content}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{formatNumber(post.views || 0)} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes?.length || 0} likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments?.length || 0} comments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
