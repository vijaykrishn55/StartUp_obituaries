import { useState } from "react";
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
import { Rocket, Search, Users, Bell, Settings, LogOut, User, MessageSquare, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const handleLogout = () => {
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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Rocket className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground hidden sm:inline">Rebound</span>
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
              {activeView !== "network" && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  2
                </Badge>
              )}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                5
              </Badge>
            </Button>

            {/* Messages */}
            <Button 
              variant={activeView === "messages" ? "default" : "ghost"}
              size="sm" 
              className="relative"
              onClick={onMessageClick}
              title="Messages"
            >
              <MessageSquare className="h-5 w-5" />
              {activeView !== "messages" && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">john@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
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
