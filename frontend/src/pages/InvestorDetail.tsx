import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { SubmitPitchDialog } from "@/components/SubmitPitchDialog";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Mail, 
  UserPlus, 
  Loader2, 
  MapPin, 
  Globe, 
  TrendingUp,
  DollarSign,
  Target,
  Briefcase,
  CheckCircle,
  Building
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const InvestorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [investor, setInvestor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [submitPitchOpen, setSubmitPitchOpen] = useState(false);

  useEffect(() => {
    const fetchInvestor = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response: any = await api.getInvestorById(id);
        setInvestor(response.data || response);
      } catch (error) {
        console.error('Failed to fetch investor:', error);
        toast({
          title: "Error",
          description: "Failed to load investor profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInvestor();
  }, [id]);

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact this investor.",
        variant: "destructive",
      });
      return;
    }

    if (investor?.user?._id) {
      navigate(`/messages?user=${investor.user._id}`);
    } else {
      setSubmitPitchOpen(true);
    }
  };

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to connect with investors.",
        variant: "destructive",
      });
      return;
    }

    if (!investor?.user?._id) {
      toast({
        title: "Cannot connect",
        description: "This investor doesn't have a linked account.",
        variant: "destructive",
      });
      return;
    }

    try {
      setConnecting(true);
      await api.sendConnectionRequest(investor.user._id);
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
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Investor not found</h2>
          <Button onClick={() => navigate('/investors')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Investors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-br from-background via-background to-primary/5 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/investors')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Investors
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={investor.user?.avatar} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {investor.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{investor.name}</h1>
                {investor.user?.verified && (
                  <CheckCircle className="h-6 w-6 text-primary" />
                )}
                <Badge variant="secondary" className="text-sm">
                  {investor.type}
                </Badge>
              </div>
              
              {investor.location && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{investor.location}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleContact}>
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
                {investor.user?._id && (
                  <Button 
                    variant="outline" 
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    {connecting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Connect
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSubmitPitchOpen(true)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Submit Pitch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {investor.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              {/* Investment Portfolio */}
              {investor.investments && investor.investments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Portfolio Investments
                    </CardTitle>
                    <CardDescription>
                      Recent investments made by {investor.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {investor.investments.map((investment: any, index: number) => (
                        <div key={investment._id || index}>
                          {index > 0 && <Separator className="my-4" />}
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{investment.company}</h4>
                              <p className="text-sm text-muted-foreground">
                                Invested in {investment.year}
                              </p>
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {investment.amount}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Quick Info */}
            <div className="space-y-6">
              {/* Investment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Investment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Focus Area</p>
                      <p className="font-medium">{investor.focus || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Investment Stage</p>
                      <p className="font-medium">{investor.stage || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Check Size</p>
                      <p className="font-medium">{investor.checkSize || "Not specified"}</p>
                    </div>
                  </div>
                  
                  {investor.website && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <a 
                            href={investor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* CTA Card */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Ready to pitch?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submit your pitch deck and get a chance to connect with {investor.name}.
                  </p>
                  <Button className="w-full" onClick={() => setSubmitPitchOpen(true)}>
                    Submit Your Pitch
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <SubmitPitchDialog open={submitPitchOpen} onOpenChange={setSubmitPitchOpen} />
    </div>
  );
};

export default InvestorDetail;
