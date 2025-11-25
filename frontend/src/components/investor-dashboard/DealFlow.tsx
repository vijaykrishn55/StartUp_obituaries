import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, TrendingUp, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const deals = [
  {
    id: 1,
    company: "AI Analytics Pro",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=AIAnalytics",
    stage: "Seed",
    sector: "AI/ML",
    raising: "$1.5M",
    valuation: "$8M",
    traction: "500K ARR",
    growth: "15% MoM",
    team: "Ex-Google, Stanford",
    status: "Hot",
    description: "AI-powered analytics platform for enterprise clients. Strong product-market fit with Fortune 500 companies."
  },
  {
    id: 2,
    company: "EduTech Solutions",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=EduTech",
    stage: "Series A",
    sector: "EdTech",
    raising: "$5M",
    valuation: "$25M",
    traction: "2M ARR",
    growth: "20% MoM",
    team: "2nd time founders",
    status: "New",
    description: "Revolutionizing online education with personalized learning paths. 50K+ active students."
  },
  {
    id: 3,
    company: "FinFlow",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=FinFlow",
    stage: "Pre-seed",
    sector: "FinTech",
    raising: "$500K",
    valuation: "$3M",
    traction: "100K ARR",
    growth: "25% MoM",
    team: "Ex-Goldman Sachs",
    status: "Hot",
    description: "Modern banking infrastructure for SMBs. Already processing $10M+ in transactions monthly."
  },
  {
    id: 4,
    company: "GreenEnergy Co",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=GreenEnergy",
    stage: "Seed",
    sector: "CleanTech",
    raising: "$2M",
    valuation: "$10M",
    traction: "800K ARR",
    growth: "18% MoM",
    team: "MIT, Tesla Alumni",
    status: "Trending",
    description: "Sustainable energy solutions for residential markets. Patent-pending technology."
  }
];

export const DealFlow = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const { toast } = useToast();

  const handleRequestInfo = (company: string) => {
    toast({
      title: "Information requested",
      description: `${company} will send you their pitch deck and financials.`,
    });
  };

  const handleScheduleMeeting = (company: string) => {
    toast({
      title: "Meeting request sent",
      description: `${company} will receive your meeting request.`,
    });
  };

  const handlePass = (company: string) => {
    toast({
      title: "Passed on deal",
      description: `${company} has been moved to your archive.`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Flow Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="pre-seed">Pre-seed</SelectItem>
                <SelectItem value="seed">Seed</SelectItem>
                <SelectItem value="series-a">Series A</SelectItem>
                <SelectItem value="series-b">Series B</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="ai">AI/ML</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
                <SelectItem value="healthtech">HealthTech</SelectItem>
                <SelectItem value="edtech">EdTech</SelectItem>
                <SelectItem value="cleantech">CleanTech</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-muted-foreground">Total Deals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">23</p>
              <p className="text-xs text-muted-foreground">Under Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">In Discussion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Cards */}
      {deals.map((deal) => (
        <Card key={deal.id}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={deal.logo} />
                <AvatarFallback>{deal.company[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{deal.company}</h3>
                    <p className="text-sm text-muted-foreground">{deal.team}</p>
                  </div>
                  <Badge 
                    variant={deal.status === "Hot" ? "default" : "secondary"}
                    className={deal.status === "Hot" ? "bg-red-500" : ""}
                  >
                    {deal.status}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{deal.stage}</Badge>
                  <Badge variant="outline">{deal.sector}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{deal.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <p className="text-xs">Raising</p>
                </div>
                <p className="font-semibold">{deal.raising}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <p className="text-xs">Valuation</p>
                </div>
                <p className="font-semibold">{deal.valuation}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <p className="text-xs">Traction</p>
                </div>
                <p className="font-semibold">{deal.traction}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <p className="text-xs">Growth</p>
                </div>
                <p className="font-semibold">{deal.growth}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => handleRequestInfo(deal.company)}
              >
                Request Info
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleScheduleMeeting(deal.company)}
              >
                Schedule Meeting
              </Button>
              <Button 
                variant="ghost"
                onClick={() => handlePass(deal.company)}
              >
                Pass
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
