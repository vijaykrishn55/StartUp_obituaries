import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ThumbsUp, MessageCircle, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const myPosts = [
  {
    id: 1,
    content: "Just launched our new feature! Check it out and let me know what you think. We've been working on this for months and can't wait to hear your feedback.",
    date: "2 days ago",
    views: 1234,
    likes: 89,
    comments: 23,
    trending: true
  },
  {
    id: 2,
    content: "Hiring alert! We're looking for a Senior Full Stack Developer to join our growing team. Experience with React and Node.js required. Remote-friendly!",
    date: "1 week ago",
    views: 3456,
    likes: 156,
    comments: 45,
    trending: false
  },
  {
    id: 3,
    content: "Reflecting on our journey from idea to product-market fit. Here are 7 pivots we made along the way...",
    date: "2 weeks ago",
    views: 5678,
    likes: 234,
    comments: 67,
    trending: true
  }
];

export const MyPosts = () => {
  const { toast } = useToast();

  const handleEdit = (postId: number) => {
    toast({
      title: "Edit post",
      description: "Post editing feature coming soon!",
    });
  };

  const handleDelete = (postId: number) => {
    toast({
      title: "Post deleted",
      description: "Your post has been removed.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </div>
            <div>
              <p className="text-2xl font-bold">10.2K</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
            <div>
              <p className="text-2xl font-bold">479</p>
              <p className="text-xs text-muted-foreground">Total Likes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">135</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {myPosts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex gap-3 flex-1">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">You</h4>
                    {post.trending && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{post.date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEdit(post.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{post.content}</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span>{post.likes} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments} comments</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
