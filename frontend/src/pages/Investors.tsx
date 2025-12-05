import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { SubmitPitchDialog } from "@/components/SubmitPitchDialog";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Users, Mail, Search, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Investors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitPitchOpen, setSubmitPitchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        setLoading(true);
        const response: any = await api.getInvestors({ limit: 50 });
        setInvestors(response.data || []);
      } catch (error) {
        console.error('Failed to fetch investors:', error);
        setInvestors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestors();
  }, []);

  // Filter investors based on search query
  const filteredInvestors = useMemo(() => {
    if (!searchQuery.trim()) {
      return investors;
    }

    const query = searchQuery.toLowerCase();
    return investors.filter(investor =>
      investor.name.toLowerCase().includes(query) ||
      investor.type.toLowerCase().includes(query) ||
      investor.focus.toLowerCase().includes(query) ||
      investor.stage.toLowerCase().includes(query) ||
      investor.location.toLowerCase().includes(query) ||
      investor.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get visible investors based on count
  const visibleInvestors = filteredInvestors.slice(0, visibleCount);
  const hasMore = visibleCount < filteredInvestors.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleContact = async (investorId: string, investorUserId?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact investors.",
        variant: "destructive",
      });
      return;
    }

    // If investor has a user ID, navigate to messages
    if (investorUserId) {
      navigate(`/messages?user=${investorUserId}`);
    } else {
      // Otherwise, open pitch dialog
      toast({
        title: "Submit a Pitch",
        description: "Contact this investor by submitting a pitch.",
      });
      setSubmitPitchOpen(true);
    }
  };

  const handleConnect = async (investorId: string, investorUserId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to connect with investors.",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnectingTo(investorUserId);
      await api.sendConnectionRequest(investorUserId);
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request.",
        variant: "destructive",
      });
    } finally {
      setConnectingTo(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="border-b border-border bg-gradient-to-br from-background via-background to-secondary py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Investor Directory</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Connect with investors who value experience, resilience, and the lessons learned from failure
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Looking for funding for your next venture?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These investors specifically seek founders with prior startup experience, including those who've faced setbacks.
                </p>
                <Button onClick={() => setSubmitPitchOpen(true)}>Submit Your Pitch</Button>
              </div>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search investors by name, focus, stage, or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(6);
                }}
              />
            </div>
          </div>

          {searchQuery && (
            <div className="mb-4 text-sm text-muted-foreground">
              Found {filteredInvestors.length} investor{filteredInvestors.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleInvestors.length > 0 ? (
              visibleInvestors.map((investor, index) => (
              <Card key={index} className="group overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mb-3 flex items-start justify-between">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {investor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {investor.type}
                    </span>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {investor.name}
                  </CardTitle>
                  <CardDescription>{investor.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{investor.description}</p>
                  
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Focus:</span>
                      <span className="font-medium text-foreground">{investor.focus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stage:</span>
                      <span className="font-medium text-foreground">{investor.stage}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Check Size:</span>
                      <span className="font-medium text-foreground">{investor.checkSize}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleContact(investor._id, investor.userId)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                    {investor.userId && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={connectingTo === investor.userId}
                        onClick={() => handleConnect(investor._id, investor.userId)}
                      >
                        {connectingTo === investor.userId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No investors found matching your search.</p>
                <Button 
                  variant="link" 
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <Button size="lg" onClick={handleLoadMore}>
                Load More Investors
              </Button>
            </div>
          )}
        </div>
      </section>

      <SubmitPitchDialog open={submitPitchOpen} onOpenChange={setSubmitPitchOpen} />
    </div>
  );
};

export default Investors;
