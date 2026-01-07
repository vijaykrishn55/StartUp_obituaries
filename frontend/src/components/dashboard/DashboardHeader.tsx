import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Users, Bell, Settings, LogOut, User, MessageSquare, Home, Sparkles, MapPin, Package, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { api } from "@/lib/api";

interface DashboardHeaderProps {
  onHomeClick?: () => void;
  onNetworkClick?: () => void;
  onMessageClick?: () => void;
  activeView?: string;
  onSearch?: (query: string) => void;
}

export const DashboardHeader = ({ onHomeClick, onNetworkClick, onMessageClick, activeView = "feed", onSearch }: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [connectionRequests, setConnectionRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [connRes, msgRes]: any[] = await Promise.all([
          api.getReceivedConnectionRequests().catch(() => ({ data: [] })),
          api.getConversations().catch(() => ({ data: [] }))
        ]);
        const requests = connRes.data || connRes || [];
        setConnectionRequests(Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending').length : 0);
        const convs = msgRes.data || msgRes || [];
        const unread = Array.isArray(convs) ? convs.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0) : 0;
        setUnreadMessages(unread);
      } catch (e) {
        console.error('Failed to fetch counts');
      }
    };
    if (user) fetchCounts();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeView) {
      case "feed":
        return "Search posts, funding news, insights...";
      case "network":
        return "Search people by name, role, company, or skills...";
      case "jobs":
        return "Search jobs by title, company, or skills...";
      case "messages":
        return "Search conversations...";
      default:
        return "Search...";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/dashboard")}>
            <svg 
              className="h-9 w-9 transition-all group-hover:scale-110" 
              viewBox="0 0 40 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="dashLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#ef4444', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#dc2626', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              
              {/* Modern tombstone shape */}
              <path 
                d="M10 35 V15 Q10 8 15 8 H25 Q30 8 30 15 V35 Q30 37 28 37 H12 Q10 37 10 35 Z" 
                fill="currentColor"
                className="text-foreground"
                opacity="0.9"
              />
              
              {/* Accent line - red gradient */}
              <rect 
                x="12" 
                y="12" 
                width="16" 
                height="2" 
                rx="1"
                fill="url(#dashLogoGrad)"
              />
              
              {/* Minimalist RIP */}
              <text 
                x="20" 
                y="23" 
                fontFamily="monospace" 
                fontSize="6" 
                fontWeight="600" 
                fill="url(#dashLogoGrad)"
                textAnchor="middle"
                letterSpacing="1"
              >
                RIP
              </text>
              
              {/* Simple declining graph line */}
              <path 
                d="M14 28 L17 26 L20 28 L23 25 L26 28" 
                stroke="url(#dashLogoGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.7"
              />
              
              {/* Base line */}
              <line 
                x1="12" 
                y1="35" 
                x2="28" 
                y2="35" 
                stroke="url(#dashLogoGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
            <span className="text-xl font-bold text-foreground hidden sm:inline tracking-tight">Startup Obituaries</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 w-full"
            />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2">
            {/* Home Button */}
            <Button
              variant={activeView === "feed" ? "default" : "ghost"}
              size="sm"
              onClick={onHomeClick}
              title="Home"
            >
              <Home className="h-5 w-5" />
            </Button>

            {/* Network Button */}
            <Button
              variant={activeView === "network" ? "default" : "ghost"}
              size="sm"
              onClick={onNetworkClick}
              className="relative"
              title="Network"
            >
              <Users className="h-5 w-5" />
              {activeView !== "network" && connectionRequests > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {connectionRequests > 9 ? '9+' : connectionRequests}
                </Badge>
              )}
            </Button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Messages */}
            <Button 
              variant={activeView === "messages" ? "default" : "ghost"}
              size="sm" 
              className="relative"
              onClick={onMessageClick}
              title="Messages"
            >
              <MessageSquare className="h-5 w-5" />
              {activeView !== "messages" && unreadMessages > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </Badge>
              )}
            </Button>

            {/* Features Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" title="Features">
                  <Sparkles className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Exclusive Features</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/failure-heatmap')} className="cursor-pointer">
                  <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">Failure Heatmap</span>
                    <span className="text-xs text-muted-foreground">Geographic failure insights</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/marketplace')} className="cursor-pointer">
                  <Package className="mr-2 h-4 w-4 text-green-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">Asset Marketplace</span>
                    <span className="text-xs text-muted-foreground">Buy/sell startup assets</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/war-rooms')} className="cursor-pointer">
                  <Video className="mr-2 h-4 w-4 text-red-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">Live War Rooms</span>
                    <span className="text-xs text-muted-foreground">Real-time crisis support</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
