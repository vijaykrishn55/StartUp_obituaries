import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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

export const DealFlow = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const { toast } = useToast();

  const { data: pitchesData, isLoading } = useQuery({
    queryKey: ["pitches"],
    queryFn: () => api.getPitches(),
  });

  const deals = Array.isArray(pitchesData) ? pitchesData : (pitchesData as any)?.data || [];

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
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading pitches...</div>
      ) : deals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No pitches available yet.</div>
      ) : deals.map((deal: any) => (
        <Card key={deal.id}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={deal.logo || deal.founder?.avatar} />
                <AvatarFallback>{(deal.companyName || deal.company || 'C')[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{deal.companyName || deal.company || 'Startup'}</h3>
                    <p className="text-sm text-muted-foreground">{deal.founder?.name || deal.team || 'Team'}</p>
                  </div>
                  <Badge 
                    variant={deal.status === "Hot" || deal.status === "reviewing" ? "default" : "secondary"}
                    className={deal.status === "Hot" ? "bg-red-500" : ""}
                  >
                    {deal.status || 'New'}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{deal.stage || deal.fundingStage || 'Seed'}</Badge>
                  <Badge variant="outline">{deal.sector || deal.industry || 'Tech'}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{deal.description || deal.pitch || deal.problem || 'No description provided.'}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <p className="text-xs">Raising</p>
                </div>
                <p className="font-semibold">{deal.raising || (deal.fundingAmount ? `$${deal.fundingAmount.toLocaleString()}` : 'N/A')}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <p className="text-xs">Valuation</p>
                </div>
                <p className="font-semibold">{deal.valuation || (deal.currentValuation ? `$${deal.currentValuation.toLocaleString()}` : 'N/A')}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <p className="text-xs">Traction</p>
                </div>
                <p className="font-semibold">{deal.traction || (deal.revenue ? `$${deal.revenue.toLocaleString()} ARR` : 'N/A')}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <p className="text-xs">Growth</p>
                </div>
                <p className="font-semibold">{deal.growth || (deal.metrics?.growth ? `${deal.metrics.growth}% MoM` : 'N/A')}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => handleRequestInfo(deal.companyName || deal.company || 'Company')}
              >
                Request Info
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleScheduleMeeting(deal.companyName || deal.company || 'Company')}
              >
                Schedule Meeting
              </Button>
              <Button 
                variant="ghost"
                onClick={() => handlePass(deal.companyName || deal.company || 'Company')}
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
