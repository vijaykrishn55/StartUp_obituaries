import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RichPostEditor } from "./RichPostEditor";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2,
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Users as UsersIcon,
  Rocket,
  Edit3,
  TrendingDown,
  Lightbulb,
  Briefcase,
  MessageSquare as MessageSquareIcon,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UnifiedFeedProps {
  searchQuery?: string;
}

const feedPosts = [
  {
    id: 1,
    type: "funding",
    author: "Sarah Chen",
    role: "Founder @ AI Solutions",
    company: "AI Solutions",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    time: "2h ago",
    content: "🎉 Excited to announce that we've just closed our $2M seed round! This funding will help us scale our AI platform and expand our team. Looking for strategic partnerships and talented engineers to join us on this journey.",
    fundingAmount: "$2M",
    stage: "Seed",
    sector: "AI/ML",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    likes: 234,
    comments: 45,
    shares: 12
  },
  {
    id: 2,
    type: "pitch",
    author: "Michael Rodriguez",
    role: "CEO @ GreenTech Ventures",
    company: "GreenTech Ventures",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    time: "5h ago",
    content: "After 3 years of bootstrapping, here are the 5 most important lessons I learned:\n\n1. Cash flow is king\n2. Build in public\n3. Customer feedback > your assumptions\n4. Hire slowly, fire quickly\n5. Mental health matters\n\nWhat would you add to this list?",
    likes: 567,
    comments: 89,
    shares: 34
  },
  {
    id: 3,
    type: "job",
    author: "Emily Watson",
    role: "Co-Founder @ HealthTech Inc",
    company: "HealthTech Inc",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    time: "1d ago",
    content: "We're hiring! 🚀 Looking for a Senior Full Stack Developer to join our mission of revolutionizing healthcare. Must have:\n\n• 5+ years React/Node.js\n• Experience with scalable systems\n• Passion for healthcare innovation\n\nRemote-friendly, competitive salary + equity. DM me!",
    jobTitle: "Senior Full Stack Developer",
    location: "Remote",
    salary: "$120K - $180K",
    likes: 156,
    comments: 28,
    shares: 8
  }
];

export const UnifiedFeed = ({ searchQuery = "" }: UnifiedFeedProps) => {
  const navigate = useNavigate();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [realPosts, setRealPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.getPosts();
      const posts = response.data || response.posts || response || [];
      setRealPosts(posts);
    } catch (error: any) {
      console.error("Failed to fetch posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Combine real posts with mock data, real posts first
  const allPosts = [...realPosts, ...feedPosts];

  // Filter feed posts based on search query
  const filteredFeedPosts = allPosts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const author = post.author?.name || post.author || '';
    const content = post.content || '';
    const company = post.author?.company || post.company || '';
    
    return (
      author.toLowerCase().includes(query) ||
      company.toLowerCase().includes(query) ||
      content.toLowerCase().includes(query) ||
      (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );
  });

  const handlePublish = async (postData: any) => {
    try {
      await api.createPost(postData);
      toast({
        title: "Success",
        description: "Post published successfully",
      });
      setIsEditorOpen(false);
      fetchPosts(); // Refresh feed
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish post",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.likePost(postId);
      fetchPosts(); // Refresh to show updated like count
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleInterest = (company: string) => {
    toast({
      title: "Interest expressed",
      description: `${company} will be notified.`,
    });
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "postmortem":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "funding":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "job":
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case "insight":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case "question":
        return <MessageSquareIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <Rocket className="h-4 w-4" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "postmortem":
        return "Postmortem";
      case "funding":
        return "Funding";
      case "job":
        return "Job Opening";
      case "insight":
        return "Insight";
      case "question":
        return "Question";
      default:
        return "Post";
    }
  };

  return (
    <div className="space-y-6">
      <RichPostEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onPublish={handlePublish}
      />

      {/* Create Post Prompt */}
      <Card 
        className="cursor-pointer hover:border-primary transition-colors"
        onClick={() => setIsEditorOpen(true)}
      >
        <CardContent className="pt-6">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center justify-between">
              <p className="text-muted-foreground">
                Share a postmortem, funding news, or insights...
              </p>
              <Button variant="ghost" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Feed Posts */}
      {filteredFeedPosts.length === 0 && searchQuery ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">
              No posts found matching "{searchQuery}"
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading posts...</p>
          </CardContent>
        </Card>
      ) : (
        filteredFeedPosts.map((post) => {
          const postId = post._id || post.id;
          const isRealPost = !!post._id;
          const author = post.author?.name || post.author || 'Unknown';
          const authorAvatar = post.author?.avatar || post.avatar;
          const authorRole = post.author?.role || post.author?.headline || post.role;
          const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : post.time;
          
          return (
        <Card 
          key={postId} 
          className={`transition-shadow hover:shadow-md ${isRealPost ? 'cursor-pointer' : ''}`} 
          onClick={() => isRealPost && navigate(`/posts/${postId}`)}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate('/profile')}>
                  <AvatarImage src={authorAvatar} />
                  <AvatarFallback>{author[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm">{author}</h4>
                  <p className="text-xs text-muted-foreground">{authorRole}</p>
                  <p className="text-xs text-muted-foreground">{createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {post.stage && <Badge variant="secondary">{post.stage}</Badge>}
                {post.sector && <Badge variant="outline">{post.sector}</Badge>}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Save post</DropdownMenuItem>
                    <DropdownMenuItem>Hide post</DropdownMenuItem>
                    <DropdownMenuItem>Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="text-sm whitespace-pre-line mb-4">{post.content}</p>

            {post.fundingAmount && (
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Raising</p>
                  <p className="font-semibold">{post.fundingAmount}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Stage</p>
                  <p className="font-semibold">{post.stage}</p>
                </div>
              </div>
            )}

            {post.jobTitle && (
              <div className="p-3 bg-muted rounded-lg mb-4">
                <p className="font-semibold text-sm mb-1">{post.jobTitle}</p>
                <p className="text-xs text-muted-foreground">{post.location} • {post.salary}</p>
              </div>
            )}

            {post.image && (
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full rounded-lg mb-4"
              />
            )}

            <Separator className="mb-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <span>{post.likes?.length || post.likes || 0} likes</span>
              <div className="flex gap-3">
                <span>{post.comments?.length || post.comments || 0} comments</span>
                <span>{post.shares || 0} shares</span>
              </div>
            </div>
            <Separator className="mb-3" />
            <div className="flex items-center justify-between gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isRealPost) handleLike(postId);
                }}
                className="flex-1"
                disabled={!isRealPost}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
            {(post.type === "funding" || post.type === "pitch") && (
              <>
                <Separator className="my-3" />
                <Button 
                  className="w-full"
                  onClick={() => handleInterest(post.company)}
                >
                  Express Interest
                </Button>
              </>
            )}
            {post.type === "job" && (
              <>
                <Separator className="my-3" />
                <Button className="w-full" disabled={!isRealPost}>
                  Apply Now
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        );
        })
      )}
    </div>
  );
};
