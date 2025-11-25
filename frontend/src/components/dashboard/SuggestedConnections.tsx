import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const suggestions = [
  {
    id: 1,
    name: "Alex Thompson",
    role: "Angel Investor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    mutualConnections: 34,
    reason: "Works in Tech Industry"
  },
  {
    id: 2,
    name: "Rachel Green",
    role: "VP of Product",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel",
    mutualConnections: 12,
    reason: "Same company"
  },
  {
    id: 3,
    name: "Tom Baker",
    role: "Startup Founder",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
    mutualConnections: 28,
    reason: "Similar interests"
  }
];

const trendingTopics = [
  { tag: "#StartupFunding", posts: 1234 },
  { tag: "#AIInnovation", posts: 892 },
  { tag: "#ProductLaunch", posts: 567 },
  { tag: "#TechTrends", posts: 445 },
  { tag: "#FounderLife", posts: 389 }
];

export const SuggestedConnections = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConnect = (name: string) => {
    toast({
      title: "Connection request sent",
      description: `Your request to connect with ${name} has been sent.`,
    });
  };

  const handleDismiss = (name: string) => {
    toast({
      title: "Suggestion dismissed",
      description: `${name} has been removed from suggestions.`,
    });
  };

  return (
    <div className="space-y-6 sticky top-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Discover opportunities with startups and companies
          </p>
          <Button 
            className="w-full" 
            onClick={() => navigate("/jobs")}
          >
            Browse Jobs
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">People you may know</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.map((person) => (
            <div key={person.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback>{person.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{person.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{person.role}</p>
                  <p className="text-xs text-muted-foreground">
                    {person.mutualConnections} mutual connections
                  </p>
                  <p className="text-xs text-muted-foreground italic">{person.reason}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(person.name)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => handleConnect(person.name)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{topic.tag}</p>
                <p className="text-xs text-muted-foreground">
                  {topic.posts.toLocaleString()} posts
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
