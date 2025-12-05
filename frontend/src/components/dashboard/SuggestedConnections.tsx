import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, X, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export const SuggestedConnections = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSuggestions();
    }
    fetchTrendingTopics();
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response: any = await api.getConnectionSuggestions(5);
      const data = response.data || response.suggestions || response || [];
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      // Try to fetch trending posts/topics from API
      const response: any = await api.getTrendingPosts(5).catch(() => null);
      if (response?.data) {
        // Extract unique tags from trending posts
        const tags: { tag: string; count: number }[] = [];
        const tagCounts: Record<string, number> = {};
        
        response.data.forEach((post: any) => {
          if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });
        
        Object.entries(tagCounts).forEach(([tag, count]) => {
          tags.push({ tag: `#${tag}`, count });
        });
        
        setTrendingTopics(tags.sort((a, b) => b.count - a.count).slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
    }
  };

  const handleConnect = async (userId: string, name: string) => {
    try {
      await api.sendConnectionRequest(userId);
      toast({
        title: "Connection request sent",
        description: `Your request to connect with ${name} has been sent.`,
      });
      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => (s._id || s.id) !== userId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = (userId: string, name: string) => {
    setDismissed(prev => new Set(prev).add(userId));
    toast({
      title: "Suggestion dismissed",
      description: `${name} has been removed from suggestions.`,
    });
  };

  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s._id || s.id));

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
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading suggestions...</p>
          ) : visibleSuggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No suggestions available</p>
          ) : (
            visibleSuggestions.map((person) => (
              <div key={person._id || person.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback>{person.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{person.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{person.userType || person.role || 'Member'}</p>
                    {person.company && (
                      <p className="text-xs text-muted-foreground truncate">{person.company}</p>
                    )}
                    {person.mutualConnections > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {person.mutualConnections} mutual connections
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(person._id || person.id, person.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleConnect(person._id || person.id, person.name)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No trending topics yet</p>
          ) : (
            trendingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{topic.tag}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.count} posts
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
