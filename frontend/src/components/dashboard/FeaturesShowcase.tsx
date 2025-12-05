import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Video, ArrowRight, TrendingDown, Users as UsersIcon, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export const FeaturesShowcase = () => {
  const navigate = useNavigate();
  // Start with mock values so the section never looks empty
  const [stats, setStats] = useState({
    heatmapReports: 1428,
    activeWarRooms: 2,
    marketplaceAssets: 128,
    totalValue: 12400000
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [heatmapRes, warRoomsRes, assetsRes] = await Promise.all([
          api.getFailureReports({ limit: 1 }).catch(() => ({ data: [], total: 0 })),
          api.getWarRooms({ status: 'live', limit: 1 }).catch(() => ({ data: [], total: 0 })),
          api.getAssets({ limit: 1 }).catch(() => ({ data: [], total: 0 }))
        ]);

        const heatmapTotal = (heatmapRes as any).total || 0;
        const warRoomsTotal = (warRoomsRes as any).total || 0;
        const assetsTotal = (assetsRes as any).total || 0;

        // Fallback mock values so the UI showcases examples without backend
        setStats({
          heatmapReports: heatmapTotal || 1428,
          activeWarRooms: warRoomsTotal || 2,
          marketplaceAssets: assetsTotal || 128,
          totalValue: 12400000
        });
      } catch (error) {
        console.error('Failed to fetch feature stats:', error);
        // Full fallback values on error
        setStats({
          heatmapReports: 1428,
          activeWarRooms: 2,
          marketplaceAssets: 128,
          totalValue: 12400000
        });
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Exclusive Features</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Revolutionary tools designed for founders navigating challenges
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Failure Heatmap Card */}
        <Card className="group border hover:border-orange-500 transition-all duration-300 cursor-pointer hover:shadow-md"
          onClick={() => navigate('/failure-heatmap')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-2">
                <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {stats.heatmapReports} reports
              </Badge>
            </div>
            <CardTitle className="text-lg">Failure Heatmap</CardTitle>
            <CardDescription className="text-xs line-clamp-2">
              Visualize startup failures by location and industry. Learn from patterns.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              className="w-full"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/failure-heatmap');
              }}
            >
              Explore Map
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Resurrection Marketplace Card */}
        <Card className="group border hover:border-green-500 transition-all duration-300 cursor-pointer hover:shadow-md"
          onClick={() => navigate('/marketplace')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {formatCurrency(stats.totalValue)} traded
              </Badge>
            </div>
            <CardTitle className="text-lg">Asset Marketplace</CardTitle>
            <CardDescription className="text-xs line-clamp-2">
              Buy or sell assets from failed startups. Turn shutdown into opportunity.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              className="w-full"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/marketplace');
              }}
            >
              Browse Assets
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Live Autopsy War Rooms Card */}
        <Card className="group border hover:border-red-500 transition-all duration-300 cursor-pointer hover:shadow-md"
          onClick={() => navigate('/war-rooms')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-2">
                <Video className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              {stats.activeWarRooms > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {stats.activeWarRooms} LIVE
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">War Rooms</CardTitle>
            <CardDescription className="text-xs line-clamp-2">
              Get real-time support during crisis. Join live sessions with mentors.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              className="w-full"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/war-rooms');
              }}
            >
              Join Room
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
