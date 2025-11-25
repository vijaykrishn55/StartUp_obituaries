import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, TrendingUp, Eye, DollarSign } from "lucide-react";

export const InvestorProfileSidebar = () => {
  return (
    <Card className="sticky top-20">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
        </div>
        <h3 className="font-semibold text-lg">Victoria Capital</h3>
        <p className="text-sm text-muted-foreground">Managing Partner @ VC Ventures</p>
        <Badge variant="secondary" className="mt-2 w-fit mx-auto">
          Angel Investor
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Investments
            </span>
            <span className="font-semibold">24</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Portfolio Value
            </span>
            <span className="font-semibold">$4.2M</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Deal Flow
            </span>
            <span className="font-semibold">156</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Avg Check Size
            </span>
            <span className="font-semibold">$50K</span>
          </div>
        </div>
        <div className="pt-4 border-t space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Investment Focus</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">AI/ML</Badge>
            <Badge variant="outline" className="text-xs">SaaS</Badge>
            <Badge variant="outline" className="text-xs">FinTech</Badge>
            <Badge variant="outline" className="text-xs">HealthTech</Badge>
          </div>
        </div>
        <div className="pt-2">
          <Button variant="outline" className="w-full" size="sm">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
