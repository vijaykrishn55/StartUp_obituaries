import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, Home, Briefcase, Users, TrendingUp, MessageSquare, MapPin, Package, Video } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SignInDialog } from "@/components/SignInDialog";
import { JoinNowDialog } from "@/components/JoinNowDialog";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [joinNowOpen, setJoinNowOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
    window.location.reload();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')} className="flex items-center gap-3 cursor-pointer group">
            <svg 
              className="h-9 w-9 transition-all group-hover:scale-110" 
              viewBox="0 0 40 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
                fill="url(#logoGrad)"
              />
              
              {/* Minimalist RIP */}
              <text 
                x="20" 
                y="23" 
                fontFamily="monospace" 
                fontSize="6" 
                fontWeight="600" 
                fill="url(#logoGrad)"
                textAnchor="middle"
                letterSpacing="1"
              >
                RIP
              </text>
              
              {/* Simple declining graph line */}
              <path 
                d="M14 28 L17 26 L20 28 L23 25 L26 28" 
                stroke="url(#logoGrad)"
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
                stroke="url(#logoGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xl font-bold text-foreground leading-tight tracking-tight">Startup Obituaries</span>
              {location.pathname === '/' && (
                <span className="text-[10px] text-muted-foreground/70 font-medium tracking-[0.15em] uppercase leading-none">Where Failures Find Legacy</span>
              )}
            </div>
          </button>

          {/* Right Side Navigation */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {isAuthenticated && user ? (
              <>
                <Button
                  variant={isActive('/dashboard') ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  title="Home"
                  className="w-10 h-10 p-0"
                >
                  <Home className="h-5 w-5" />
                </Button>
                <Button
                  variant={isActive('/founders') ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate('/founders')}
                  title="Founders"
                  className="w-10 h-10 p-0"
                >
                  <Users className="h-5 w-5" />
                </Button>
                <Button
                  variant={isActive('/investors') ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate('/investors')}
                  title="Investors"
                  className="w-10 h-10 p-0"
                >
                  <TrendingUp className="h-5 w-5" />
                </Button>
                <Button
                  variant={isActive('/jobs') ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate('/jobs')}
                  title="Jobs"
                  className="w-10 h-10 p-0"
                >
                  <Briefcase className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/failure-heatmap')}>
                      <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                      <div>
                        <div className="font-medium">Failure Heatmap</div>
                        <div className="text-xs text-muted-foreground">Learn from failures</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/marketplace')}>
                      <Package className="mr-2 h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-medium">Marketplace</div>
                        <div className="text-xs text-muted-foreground">Buy/sell assets</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/war-rooms')}>
                      <Video className="mr-2 h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-medium">War Rooms</div>
                        <div className="text-xs text-muted-foreground">Live support</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <NotificationDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setSignInOpen(true)}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => setJoinNowOpen(true)}>Join Now</Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {isAuthenticated && (
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                  activeClassName="text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Home
                </NavLink>
              )}
              <NavLink
                to="/founders"
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                activeClassName="text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                Founders
              </NavLink>
              <NavLink
                to="/investors"
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                activeClassName="text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="h-5 w-5" />
                Investors
              </NavLink>
              <NavLink
                to="/jobs"
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                activeClassName="text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Briefcase className="h-5 w-5" />
                Jobs
              </NavLink>
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-3">More Features</p>
                <NavLink
                  to="/failure-heatmap"
                  className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                  activeClassName="text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MapPin className="h-5 w-5 text-orange-500" />
                  Failure Heatmap
                </NavLink>
                <NavLink
                  to="/marketplace"
                  className="flex items-center gap-3 text-sm font-medium text-muted-foreground mt-3"
                  activeClassName="text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-5 w-5 text-green-500" />
                  Marketplace
                </NavLink>
                <NavLink
                  to="/war-rooms"
                  className="flex items-center gap-3 text-sm font-medium text-muted-foreground mt-3"
                  activeClassName="text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Video className="h-5 w-5 text-red-500" />
                  War Rooms
                </NavLink>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t">
                {isAuthenticated && user ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/profile');
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setMobileMenuOpen(false);
                      setSignInOpen(true);
                    }}>
                      Sign In
                    </Button>
                    <Button size="sm" onClick={() => {
                      setMobileMenuOpen(false);
                      setJoinNowOpen(true);
                    }}>Join Now</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <SignInDialog 
        open={signInOpen} 
        onOpenChange={setSignInOpen}
        onSwitchToJoinNow={() => {
          setSignInOpen(false);
          setJoinNowOpen(true);
        }}
      />
      <JoinNowDialog 
        open={joinNowOpen} 
        onOpenChange={setJoinNowOpen}
        onSwitchToSignIn={() => {
          setJoinNowOpen(false);
          setSignInOpen(true);
        }}
      />
    </nav>
  );
};

export default Navigation;
