import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Video, ArrowRight, Clock, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export const FeaturesWidget = () => {
  const navigate = useNavigate();
  const [liveWarRooms, setLiveWarRooms] = useState<any[]>([]);
  const [topAssets, setTopAssets] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidgetData = async () => {
      try {
        const [warRoomsRes, assetsRes, reportsRes] = await Promise.all([
          api.getWarRooms({ status: 'live', limit: 2 }).catch(() => ({ data: [] })),
          api.getAssets({ limit: 2 }).catch(() => ({ data: [] })),
          api.getFailureReports({ limit: 2 }).catch(() => ({ data: [] }))
        ]);

        setLiveWarRooms((warRoomsRes as any).data || []);
        setTopAssets((assetsRes as any).data || []);
        setRecentReports((reportsRes as any).data || []);
      } catch (error) {
        console.error('Failed to fetch widget data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgetData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Live War Rooms Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Video className="h-4 w-4 text-red-500" />
            Live War Rooms
            {liveWarRooms.length > 0 && (
              <Badge variant="destructive" className="ml-auto animate-pulse">
                {liveWarRooms.length} LIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-xs text-muted-foreground">Loading...</div>
          ) : liveWarRooms.length > 0 ? (
            <>
              {liveWarRooms.map((room, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/war-rooms/${room._id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{room.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {room.participants?.length || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(room.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate('/war-rooms')}
              >
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">No live sessions right now</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate('/war-rooms')}
              >
                Browse Schedule
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Marketplace Highlights Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-green-500" />
            Trending Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-xs text-muted-foreground">Loading...</div>
          ) : topAssets.length > 0 ? (
            <>
              {topAssets.map((asset, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/marketplace`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{asset.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-green-600">
                        ${asset.price?.toLocaleString() || 'N/A'}
                      </span>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {asset.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate('/marketplace')}
              >
                Browse Marketplace
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">No assets listed yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate('/marketplace')}
              >
                List an Asset
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Failure Insights Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-500" />
            Recent Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-xs text-muted-foreground">Loading...</div>
          ) : recentReports.length > 0 ? (
            <>
              {recentReports.map((report, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate('/failure-heatmap')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{report.companyName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {report.industry}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {report.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate('/failure-heatmap')}
              >
                View Heatmap
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">No recent reports</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate('/failure-heatmap')}
              >
                Explore Map
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
