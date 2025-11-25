import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const ProfileSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="sticky top-20">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
            <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <h3 className="font-semibold text-lg">{user?.name || 'User'}</h3>
        <p className="text-sm text-muted-foreground">{user?.bio || user?.company || 'Startup Enthusiast'}</p>
        {user?.userType === 'premium' && (
          <Badge variant="secondary" className="mt-2 w-fit mx-auto">
            Premium Member
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Connections
            </span>
            <span className="font-semibold">{user?.connections?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Profile Views
            </span>
            <span className="font-semibold">{user?.profileViews || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Post Impressions
            </span>
            <span className="font-semibold">{user?.postImpressions || 0}</span>
          </div>
        </div>
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={() => navigate('/profile')}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
