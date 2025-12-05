import { useState, useEffect, useRef } from 'react';
import { Video, Users, Clock, AlertCircle, MessageSquare, CheckCircle, TrendingUp, AlertTriangle, History, User } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from "@/contexts/AuthContext";

export default function LiveAutopsyWarRooms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Separate state for each tab's data
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [upcomingRooms, setUpcomingRooms] = useState<any[]>([]);
  const [myWarRooms, setMyWarRooms] = useState<any[]>([]);
  const [pastWarRooms, setPastWarRooms] = useState<any[]>([]);
  
  // Track which tabs have been loaded
  const loadedTabs = useRef<Set<string>>(new Set());
  
  // Loading state per tab
  const [loadingTab, setLoadingTab] = useState<string | null>('live');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('live');

  // Initial load
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    // Load live rooms initially
    if (!loadedTabs.current.has('live')) {
      loadTabData('live');
    }
  }, [user]);

  // Load data when tab changes (only if not already loaded)
  useEffect(() => {
    if (user && !loadedTabs.current.has(activeTab)) {
      loadTabData(activeTab);
    }
  }, [activeTab, user]);

  const loadTabData = async (tab: string, forceRefresh = false) => {
    if (!forceRefresh && loadedTabs.current.has(tab)) {
      return; // Already loaded
    }

    try {
      setLoadingTab(tab);
      setError(null);
      
      if (tab === 'live') {
        const data = await api.getWarRooms({ status: 'Active', isLive: true, limit: 20 });
        setLiveRooms((data as any).warRooms || []);
      } else if (tab === 'upcoming') {
        const data = await api.getWarRooms({ status: 'Active', isLive: false, limit: 20 });
        setUpcomingRooms((data as any).warRooms || []);
      } else if (tab === 'my-rooms') {
        const data = await api.getWarRooms({ limit: 50 });
        const allRooms = (data as any).warRooms || [];
        const userId = (user as any)?._id || (user as any)?.id;
        const myRooms = allRooms.filter((wr: any) => {
          const hostId = wr.host?._id || wr.host;
          const isHost = hostId === userId;
          const isParticipant = wr.participants?.some((p: any) => {
            const pUserId = p.user?._id || p.user;
            return pUserId === userId;
          });
          return isHost || isParticipant;
        });
        setMyWarRooms(myRooms);
      } else if (tab === 'history') {
        const data = await api.getWarRooms({ status: 'Closed', limit: 20 });
        setPastWarRooms((data as any).warRooms || []);
      }
      
      loadedTabs.current.add(tab);
    } catch (error: any) {
      console.error('Failed to load war rooms:', error);
      setError(error?.message || 'Failed to load war rooms. Please check your connection and try again.');
    } finally {
      setLoadingTab(null);
    }
  };

  // Get rooms for current tab
  const getCurrentRooms = () => {
    switch (activeTab) {
      case 'live': return liveRooms;
      case 'upcoming': return upcomingRooms;
      case 'my-rooms': return myWarRooms;
      case 'history': return pastWarRooms;
      default: return liveRooms;
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'destructive';
      case 'High': return 'default';
      case 'Medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getSituationIcon = (situation: string) => {
    const icons: any = {
      'Running out of cash': '💸',
      'Losing key team members': '👥',
      'Product failure': '❌',
      'Legal issues': '⚖️',
      'Investor problems': '💼',
      'Market collapse': '📉',
      'Competition crisis': '⚔️',
      'Operational breakdown': '⚙️',
      'Customer churn': '🚪',
      'Pivot decision': '🔄',
      'Other crisis': '🚨'
    };
    return icons[situation] || '🆘';
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatScheduledTime = (date: string) => {
    const scheduled = new Date(date);
    const now = new Date();
    
    if (scheduled < now) {
      return 'Live Now';
    }
    
    return scheduled.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }
  
  // Only show full-page loading on initial load (no tabs loaded yet)
  if (loadedTabs.current.size === 0 && loadingTab) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading war rooms...</p>
        </div>
      </div>
    );
  }
  
  if (error && loadedTabs.current.size === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">{error}</p>
          <Button variant="outline" onClick={() => loadTabData(activeTab, true)}>Retry</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Video className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Live Autopsy War Rooms</h1>
              <p className="text-xl opacity-90 mt-2">
                Real-time community support during shutdowns
              </p>
            </div>
          </div>
          <p className="text-lg opacity-80 max-w-3xl">
            You're not alone. Join live sessions where founders facing shutdown get real-time advice,
            support, and guidance from mentors, investors, and fellow entrepreneurs.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                  Live Now
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="my-rooms" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My War Rooms
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
              <Button onClick={() => navigate('/war-rooms/create')} className="bg-red-600 hover:bg-red-700">
                Request Support
              </Button>
            </div>
          </Tabs>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-200 mb-1">How War Rooms Work</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Founders in crisis can create a war room to get immediate help. Join as a mentor,
                  investor, or supporter to provide advice, connections, and emotional support. All
                  conversations are confidential unless the founder chooses to share publicly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* War Rooms List */}
        {loadingTab === activeTab ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            {/* Get the right list based on active tab */}
            {(() => {
              const roomsList = getCurrentRooms();
              
              if (roomsList.length === 0) {
                return (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground mb-2">
                        {activeTab === 'my-rooms' ? "You haven't created or joined any war rooms yet" :
                         activeTab === 'history' ? "No past war rooms found" :
                         activeTab === 'live' ? "No live war rooms at the moment" :
                         activeTab === 'upcoming' ? "No upcoming war rooms scheduled" :
                         "No war rooms found"}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {activeTab === 'my-rooms' ? "Create a war room if you need support or join an existing one" :
                         "Be the first to create a war room if you need support"}
                      </p>
                      <Button 
                        onClick={() => navigate('/war-rooms/create')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Request Support
                      </Button>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div className="grid gap-6">
                  {roomsList.map((room: any) => {
                    const userId = (user as any)?._id || (user as any)?.id;
                    const hostId = room.host?._id || room.host;
                    const isMyRoom = hostId === userId;
                    const isClosed = room.status === 'Closed' || !room.isLive;
                    
                    return (
                      <Card 
                        key={room._id} 
                        className={`hover:shadow-lg transition-shadow cursor-pointer ${
                          room.isLive && room.status !== 'Closed' ? 'border-red-500 border-2' : ''
                        } ${isClosed ? 'opacity-75' : ''}`}
                        onClick={() => navigate(`/war-rooms/${room._id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {room.isLive && room.status !== 'Closed' ? (
                                  <Badge variant="destructive" className="animate-pulse">
                                    <div className="flex items-center gap-1">
                                      <div className="h-2 w-2 rounded-full bg-white"></div>
                                      LIVE
                                    </div>
                                  </Badge>
                                ) : room.status === 'Closed' ? (
                                  <Badge variant="secondary">Ended</Badge>
                                ) : null}
                                {isMyRoom && (
                                  <Badge variant="outline" className="border-blue-500 text-blue-500">
                                    Your Room
                                  </Badge>
                                )}
                                <Badge variant={getUrgencyColor(room.urgencyLevel)}>
                                  {room.urgencyLevel} Urgency
                                </Badge>
                                <span className="text-2xl">{getSituationIcon(room.situation)}</span>
                              </div>
                              <CardTitle className="text-2xl mb-2">{room.title}</CardTitle>
                              <CardDescription className="text-base">
                                {room.startupName} • {room.situation}
                              </CardDescription>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                <Clock className="h-4 w-4" />
                                {room.status === 'Closed' ? 'Ended' : formatScheduledTime(room.scheduledTime)}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {room.participants?.length || 0}/{room.maxParticipants} joined
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {room.description}
                          </p>

                          {/* Summary if closed */}
                          {room.status === 'Closed' && room.summary && (
                            <div className="bg-muted/50 rounded-lg p-3 mb-4">
                              <p className="text-sm font-medium mb-1">Session Summary:</p>
                              <p className="text-sm text-muted-foreground">{room.summary}</p>
                            </div>
                          )}

                          {/* Host Info */}
                          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                            <Avatar>
                              <AvatarImage src={room.host?.avatar} />
                              <AvatarFallback>{room.host?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{room.host?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {room.host?.title} at {room.host?.company}
                              </p>
                            </div>
                          </div>

                          {/* Participants Preview */}
                          {room.participants && room.participants.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">
                                {room.status === 'Closed' ? 'Participants:' : 'Active Participants:'}
                              </p>
                              <div className="flex -space-x-2">
                                {room.participants.slice(0, 5).map((participant: any, idx: number) => (
                                  <Avatar key={idx} className="border-2 border-background">
                                    <AvatarImage src={participant.user?.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {participant.user?.name?.[0] || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {room.participants.length > 5 && (
                                  <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                    +{room.participants.length - 5}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span>{room.messages?.length || 0} messages</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-muted-foreground" />
                              <span>{room.actionItems?.length || 0} action items</span>
                            </div>
                            {room.resources && room.resources.length > 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span>{room.resources.length} resources</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-4 border-t">
                            <Button 
                              className={`w-full ${room.isLive && room.status !== 'Closed' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                              variant={room.status === 'Closed' ? 'outline' : 'default'}
                            >
                              {room.status === 'Closed' ? 'View Archive' : room.isLive ? 'Join Live Session' : 'View Details'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
