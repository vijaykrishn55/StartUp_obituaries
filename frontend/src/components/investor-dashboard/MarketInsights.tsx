import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, DollarSign, Target } from "lucide-react";

const marketTrends = [
  { sector: "AI/ML", deals: 234, trend: "+15%", hot: true },
  { sector: "FinTech", deals: 189, trend: "+8%", hot: false },
  { sector: "HealthTech", deals: 156, trend: "+12%", hot: true },
  { sector: "CleanTech", deals: 98, trend: "+20%", hot: true },
  { sector: "EdTech", deals: 87, trend: "+5%", hot: false }
];

const hotDeals = [
  {
    id: 1,
    company: "NextGen AI",
    sector: "AI/ML",
    raising: "$2M",
    closing: "3 days"
  },
  {
    id: 2,
    company: "CryptoFlow",
    sector: "FinTech",
    raising: "$1.5M",
    closing: "1 week"
  },
  {
    id: 3,
    company: "MediCare Plus",
    sector: "HealthTech",
    raising: "$3M",
    closing: "5 days"
  }
];

const upcomingEvents = [
  { title: "Pitch Day: AI Startups", date: "Nov 15", attendees: 45 },
  { title: "FinTech Summit 2025", date: "Nov 20", attendees: 120 },
  { title: "Investor Networking", date: "Nov 25", attendees: 78 }
];

export const MarketInsights = () => {
  return (
    <div className="space-y-6 sticky top-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {marketTrends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-sm">{trend.sector}</div>
                {trend.hot && (
                  <Badge variant="destructive" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Hot
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{trend.deals} deals</p>
                <p className="text-xs font-semibold text-green-500">{trend.trend}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Hot Deals Closing Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hotDeals.map((deal) => (
            <div key={deal.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{deal.company}</p>
                  <Badge variant="outline" className="text-xs mt-1">{deal.sector}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">{deal.raising}</p>
                  <p className="text-xs text-red-500">Closes in {deal.closing}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Deal
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {event.date} • {event.attendees} attending
                </p>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2">
            View All Events
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <DollarSign className="h-4 w-4 mr-2" />
            Create Investment Thesis
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <TrendingUp className="h-4 w-4 mr-2" />
            Portfolio Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
