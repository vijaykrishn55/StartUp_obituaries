import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  ExternalLink
} from "lucide-react";

const portfolioCompanies = [
  {
    id: 1,
    name: "TechStart Inc",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=TechStart",
    sector: "SaaS",
    invested: "$100K",
    valuation: "$5M",
    currentValue: "$180K",
    roi: "+80%",
    positive: true,
    stage: "Series A",
    lastUpdate: "2 days ago",
    metrics: {
      arr: "$2.5M",
      growth: "25%",
      runway: "18 months"
    }
  },
  {
    id: 2,
    name: "HealthCare AI",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=HealthCare",
    sector: "HealthTech",
    invested: "$50K",
    valuation: "$3M",
    currentValue: "$125K",
    roi: "+150%",
    positive: true,
    stage: "Seed",
    lastUpdate: "1 week ago",
    metrics: {
      arr: "$800K",
      growth: "40%",
      runway: "12 months"
    }
  },
  {
    id: 3,
    name: "FinTech Solutions",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=FinTech",
    sector: "FinTech",
    invested: "$75K",
    valuation: "$8M",
    currentValue: "$65K",
    roi: "-13%",
    positive: false,
    stage: "Seed",
    lastUpdate: "3 days ago",
    metrics: {
      arr: "$1.2M",
      growth: "10%",
      runway: "8 months"
    }
  },
  {
    id: 4,
    name: "EduPlatform",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=EduPlatform",
    sector: "EdTech",
    invested: "$150K",
    valuation: "$12M",
    currentValue: "$300K",
    roi: "+100%",
    positive: true,
    stage: "Series A",
    lastUpdate: "5 days ago",
    metrics: {
      arr: "$4M",
      growth: "30%",
      runway: "24 months"
    }
  }
];

export const Portfolio = () => {
  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-xl font-bold">$2.4M</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="text-xl font-bold">$3.2M</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total ROI</p>
              <p className="text-xl font-bold text-green-500">+33%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Companies</p>
              <p className="text-xl font-bold">24</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Portfolio Health</span>
              <span className="font-semibold">82%</span>
            </div>
            <Progress value={82} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Companies */}
      {portfolioCompanies.map((company) => (
        <Card key={company.id}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={company.logo} />
                <AvatarFallback>{company.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {company.sector} • {company.stage}
                    </p>
                  </div>
                  <Badge 
                    variant={company.positive ? "default" : "destructive"}
                    className={company.positive ? "bg-green-500" : ""}
                  >
                    {company.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {company.roi}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Invested</p>
                <p className="font-semibold">{company.invested}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valuation</p>
                <p className="font-semibold">{company.valuation}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Value</p>
                <p className="font-semibold">{company.currentValue}</p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg space-y-2">
              <p className="text-xs font-semibold">Key Metrics</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">ARR</p>
                  <p className="font-semibold">{company.metrics.arr}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Growth</p>
                  <p className="font-semibold">{company.metrics.growth}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Runway</p>
                  <p className="font-semibold">{company.metrics.runway}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Updated {company.lastUpdate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Contact Team
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
