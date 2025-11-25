import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2,
  Bookmark,
  TrendingUp,
  DollarSign,
  Users,
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const feedPosts = [
  {
    id: 1,
    type: "funding",
    company: "TechAI Solutions",
    companyAvatar: "https://api.dicebear.com/7.x/shapes/svg?seed=TechAI",
    author: "Sarah Chen, CEO",
    time: "3h ago",
    content: "🎉 We're thrilled to announce our $2M seed round led by Sequoia Capital! This funding will help us scale our AI platform and expand our team. Looking for strategic investors for our Series A in 6 months.",
    fundingAmount: "$2M",
    stage: "Seed",
    sector: "AI/ML",
    likes: 342,
    comments: 67,
    shares: 45
  },
  {
    id: 2,
    type: "pitch",
    company: "GreenTech Innovations",
    companyAvatar: "https://api.dicebear.com/7.x/shapes/svg?seed=GreenTech",
    author: "Michael Rodriguez, Founder",
    time: "5h ago",
    content: "Seeking $500K pre-seed to revolutionize sustainable energy storage. 3x YoY growth, 200+ enterprise clients, $1M ARR. Strong unit economics with 70% gross margin. Open to discussions with climate-focused investors.",
    fundingAmount: "$500K",
    stage: "Pre-seed",
    sector: "CleanTech",
    metrics: { arr: "$1M", growth: "3x", clients: 200 },
    likes: 189,
    comments: 34,
    shares: 28
  },
  {
    id: 3,
    type: "exit",
    company: "HealthSync",
    companyAvatar: "https://api.dicebear.com/7.x/shapes/svg?seed=HealthSync",
    author: "Emily Watson, Co-Founder",
    time: "1d ago",
    content: "Excited to share that HealthSync has been acquired by MedTech Global! Thank you to all our investors who believed in our vision. This wouldn't be possible without your support. 🙏",
    exitType: "Acquisition",
    sector: "HealthTech",
    likes: 891,
    comments: 156,
    shares: 89
  }
];

export const InvestorFeed = () => {
  const { toast } = useToast();

  const handleInterest = (company: string) => {
    toast({
      title: "Interest expressed",
      description: `${company} will be notified of your interest.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <p className="text-lg font-bold">34</p>
              <p className="text-xs text-muted-foreground">New Deals</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-lg font-bold">+12%</p>
              <p className="text-xs text-muted-foreground">Portfolio ROI</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-lg font-bold">89</p>
              <p className="text-xs text-muted-foreground">Network</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <DollarSign className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-lg font-bold">$2.4M</p>
              <p className="text-xs text-muted-foreground">Deployed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed Posts */}
      {feedPosts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.companyAvatar} />
                <AvatarFallback>{post.company[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{post.company}</h4>
                    <p className="text-xs text-muted-foreground">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{post.stage}</Badge>
                    <Badge variant="outline">{post.sector}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{post.content}</p>
            
            {post.fundingAmount && (
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Raising</p>
                  <p className="font-semibold">{post.fundingAmount}</p>
                </div>
                {post.metrics && (
                  <>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">ARR</p>
                      <p className="font-semibold">{post.metrics.arr}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Growth</p>
                      <p className="font-semibold">{post.metrics.growth}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            <Separator />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{post.likes} likes</span>
              <div className="flex gap-3">
                <span>{post.comments} comments</span>
                <span>{post.shares} shares</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="flex-1">
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
                <Separator />
                <Button 
                  className="w-full"
                  onClick={() => handleInterest(post.company)}
                >
                  Express Interest
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
