import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, VideoOff, MessageSquare, Users, CheckSquare, Link2, ArrowLeft, 
  StopCircle, Plus, LogIn, LogOut, BarChart3, Send, FileText, ThumbsUp,
  Clock, AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const messageTypes = [
  { value: 'chat', label: 'Chat', icon: '💬' },
  { value: 'advice', label: 'Advice', icon: '💡' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'resource', label: 'Resource', icon: '📎' },
  { value: 'action', label: 'Action Item', icon: '✅' },
];

const participantRoles = [
  { value: 'Mentor', label: 'Mentor - Provide guidance' },
  { value: 'Investor', label: 'Investor - Offer connections' },
  { value: 'Founder', label: 'Founder - Share experience' },
  { value: 'Expert', label: 'Expert - Technical advice' },
  { value: 'Supporter', label: 'Supporter - Emotional support' },
];

const WarRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [text, setText] = useState("");
  const [messageType, setMessageType] = useState("chat");
  const [showVideo, setShowVideo] = useState(false);
  const [endSummary, setEndSummary] = useState("");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinRole, setJoinRole] = useState("Supporter");
  const [newAction, setNewAction] = useState("");
  const [newResource, setNewResource] = useState({ title: "", url: "" });
  const [activeTab, setActiveTab] = useState("chat");
  const [showAddAction, setShowAddAction] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["war-room", id],
    queryFn: () => api.getWarRoomById(id as string),
    enabled: !!id,
    refetchInterval: 5000,
  });

  // Join war room mutation
  const joinWarRoom = useMutation({
    mutationFn: () => api.joinWarRoom(id as string, joinRole),
    onSuccess: () => {
      toast({ title: "Joined War Room", description: `You've joined as a ${joinRole}` });
      setShowJoinDialog(false);
      qc.invalidateQueries({ queryKey: ["war-room", id] });
    },
    onError: (e: any) => {
      toast({ title: "Failed to join", description: e?.message || "Could not join the war room.", variant: "destructive" });
    }
  });

  const sendMsg = useMutation({
    mutationFn: () => api.sendWarRoomMessage(id as string, text, messageType),
    onSuccess: () => { 
      setText(""); 
      setMessageType("chat");
      qc.invalidateQueries({ queryKey: ["war-room", id] }); 
    },
    onError: (e: any) => {
      toast({ title: "Failed to send", description: e?.message || "You must join the war room first", variant: "destructive" });
    }
  });

  const endWarRoom = useMutation({
    mutationFn: () => api.endWarRoom(id as string, { resolved: true }, endSummary),
    onSuccess: () => {
      toast({ title: "War Room Ended", description: "The session has been concluded." });
      setShowEndDialog(false);
      setShowVideo(false); // Close video call when ending
      qc.invalidateQueries({ queryKey: ["war-room", id] });
    },
    onError: (e: any) => {
      toast({ title: "Failed to end", description: e?.message || "Could not end the war room.", variant: "destructive" });
    }
  });

  const addAction = useMutation({
    mutationFn: () => api.addWarRoomAction(id as string, newAction),
    onSuccess: () => {
      toast({ title: "Action added" });
      setNewAction("");
      setShowAddAction(false);
      qc.invalidateQueries({ queryKey: ["war-room", id] });
    },
    onError: (e: any) => {
      toast({ title: "Failed to add", description: e?.message || "You must join the war room first", variant: "destructive" });
    }
  });

  const updateAction = useMutation({
    mutationFn: ({ actionId, status }: { actionId: string; status: string }) => 
      api.updateWarRoomAction(id as string, actionId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["war-room", id] });
    },
  });

  const addResource = useMutation({
    mutationFn: () => api.addWarRoomResource(id as string, newResource),
    onSuccess: () => {
      toast({ title: "Resource added" });
      setNewResource({ title: "", url: "" });
      setShowAddResource(false);
      qc.invalidateQueries({ queryKey: ["war-room", id] });
    },
    onError: (e: any) => {
      toast({ title: "Failed to add", description: e?.message || "You must join the war room first", variant: "destructive" });
    }
  });

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.messages?.length]);

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading war room...</p>
        </div>
      </div>
    </div>
  );
  
  if (error || !data) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg mb-4">Failed to load war room</p>
          <Button onClick={() => navigate('/war-rooms')}>Back to War Rooms</Button>
        </div>
      </div>
    </div>
  );

  const wr: any = data;
  
  // Generate a unique Jitsi room name based on war room ID
  const jitsiRoomName = `startup-warroom-${id}`;
  const userName = user?.name || 'Guest';
  const userId = (user as any)?._id || (user as any)?.id;
  const hostId = wr.host?._id || wr.host;
  const isHost = user && hostId && (hostId === userId);
  const isEnded = wr.status === 'Closed' || wr.status === 'completed' || wr.status === 'ended' || !wr.isLive;
  
  // Check if user is a participant
  const isParticipant = wr.participants?.some((p: any) => {
    const pUserId = p.user?._id || p.user;
    return pUserId === userId;
  }) || isHost;

  // Get current user's role
  const myParticipation = wr.participants?.find((p: any) => {
    const pUserId = p.user?._id || p.user;
    return pUserId === userId;
  });
  const myRole = myParticipation?.role || (isHost ? 'Host' : null);

  // Get message type badge color
  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'advice': return 'bg-green-500';
      case 'question': return 'bg-blue-500';
      case 'resource': return 'bg-purple-500';
      case 'action': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <Button
          variant="ghost"
          onClick={() => navigate('/war-rooms')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to War Rooms
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{wr.title}</h1>
              {wr.isLive && !isEnded && <Badge className="bg-red-500 animate-pulse">● LIVE</Badge>}
              <Badge variant={isEnded ? "secondary" : "outline"}>{wr.status}</Badge>
              {myRole && (
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                  {myRole === 'Host' ? '👑 Host' : myRole}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{wr.startupName} • {wr.situation}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {wr.participants?.length || 0} participants
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {wr.messages?.length || 0} messages
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(wr.scheduledTime).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Join Button - Show if not a participant and room is not ended */}
            {!isParticipant && !isEnded && (
              <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Join War Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join War Room</DialogTitle>
                    <DialogDescription>
                      Select your role to join this war room and help the founder.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Your Role</Label>
                      <Select value={joinRole} onValueChange={setJoinRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {participantRoles.map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => joinWarRoom.mutate()}
                      disabled={joinWarRoom.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {joinWarRoom.isPending ? "Joining..." : "Join"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            {/* Video Button */}
            {!isEnded && isParticipant && (
              <Button 
                onClick={() => setShowVideo(!showVideo)}
                variant={showVideo ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {showVideo ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                {showVideo ? "Leave Video" : "Join Video"}
              </Button>
            )}
            
            {isHost && !isEnded && (
              <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <StopCircle className="h-4 w-4" />
                    End War Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>End War Room</DialogTitle>
                    <DialogDescription>
                      This will conclude the session and notify all participants. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="summary">Session Summary</Label>
                      <Textarea
                        id="summary"
                        placeholder="Write a brief summary of what was discussed and any outcomes..."
                        value={endSummary}
                        onChange={(e) => setEndSummary(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEndDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => endWarRoom.mutate()}
                      disabled={endWarRoom.isPending}
                    >
                      {endWarRoom.isPending ? "Ending..." : "End Session"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Not Joined Banner */}
        {!isParticipant && !isEnded && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">You haven't joined this war room yet</p>
                    <p className="text-sm text-muted-foreground">Join to send messages and help the founder</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowJoinDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Join Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ended Banner */}
        {isEnded && (
          <Card className="mb-6 border-orange-500 bg-orange-500/10">
            <CardContent className="py-4">
              <p className="text-center font-medium">This war room session has ended.</p>
              {wr.summary && <p className="text-center text-sm text-muted-foreground mt-1">{wr.summary}</p>}
            </CardContent>
          </Card>
        )}

        {/* Video Section - Jitsi Meet */}
        {showVideo && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://meet.jit.si/${jitsiRoomName}?userInfo.displayName="${encodeURIComponent(userName)}"#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  style={{ border: 0 }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Discussion
                </CardTitle>
                <CardDescription>
                  Share advice, ask questions, and collaborate on solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto border rounded-md p-3 space-y-3 bg-muted/30 mb-4">
                  {Array.isArray(wr.messages) && wr.messages.length > 0 ? wr.messages.map((m: any) => (
                    <div key={m._id} className="bg-background rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={m.user?.avatar} />
                          <AvatarFallback>{m.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{m.user?.name || 'Anonymous'}</span>
                            {m.type && m.type !== 'chat' && (
                              <Badge variant="outline" className="text-xs">
                                {messageTypes.find(t => t.value === m.type)?.icon} {m.type}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(m.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-muted-foreground text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No messages yet. {isParticipant ? "Start the conversation!" : "Join to participate!"}</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (text.trim() && isParticipant && !isEnded) sendMsg.mutate(); }} className="space-y-2">
                  <div className="flex gap-2">
                    <Select value={messageType} onValueChange={setMessageType} disabled={isEnded || !isParticipant}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {messageTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              {type.icon} {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder={!isParticipant ? "Join to send messages..." : isEnded ? "This session has ended" : "Type a message..."} 
                      value={text} 
                      onChange={(e) => setText(e.target.value)}
                      disabled={isEnded || !isParticipant}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={sendMsg.isPending || text.trim().length === 0 || isEnded || !isParticipant}
                      className="px-6"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                  {!isParticipant && !isEnded && (
                    <p className="text-xs text-muted-foreground">
                      You need to join the war room to send messages
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Participants */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Participants ({wr.participants?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <ul className="space-y-3">
                    {Array.isArray(wr.participants) && wr.participants.length > 0 ? wr.participants.map((p: any) => (
                      <li key={p._id} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={p.user?.avatar} />
                          <AvatarFallback>{p.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{p.user?.name ?? "User"}</div>
                          <div className="flex items-center gap-2">
                            {p.role && (
                              <Badge variant="outline" className="text-xs">
                                {p.role}
                              </Badge>
                            )}
                            {p.user?._id === hostId && (
                              <Badge className="text-xs bg-purple-500">Host</Badge>
                            )}
                          </div>
                        </div>
                      </li>
                    )) : <li className="text-sm text-muted-foreground text-center py-4">No participants yet.</li>}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Action Items
                  </div>
                  {!isEnded && isParticipant && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAddAction(!showAddAction)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showAddAction && (
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="New action item..."
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                      className="text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => addAction.mutate()}
                      disabled={!newAction.trim() || addAction.isPending}
                    >
                      Add
                    </Button>
                  </div>
                )}
                <ul className="space-y-2">
                  {Array.isArray(wr.actionItems) && wr.actionItems.length > 0 ? wr.actionItems.map((a: any) => (
                    <li key={a._id} className="flex items-start gap-2 text-sm">
                      <Badge 
                        variant={a.status === 'Completed' ? 'default' : 'outline'} 
                        className="mt-0.5 text-xs cursor-pointer"
                        onClick={() => {
                          if (!isEnded && isParticipant) {
                            const newStatus = a.status === 'Completed' ? 'Pending' : 'Completed';
                            updateAction.mutate({ actionId: a._id, status: newStatus });
                          }
                        }}
                      >
                        {a.status}
                      </Badge>
                      <span className={a.status === 'Completed' ? 'line-through text-muted-foreground' : ''}>
                        {a.description}
                      </span>
                    </li>
                  )) : <li className="text-sm text-muted-foreground">No actions yet.</li>}
                </ul>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Resources
                  </div>
                  {!isEnded && isParticipant && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAddResource(!showAddResource)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showAddResource && (
                  <div className="space-y-2 mb-3">
                    <Input
                      placeholder="Resource title"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="URL"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        className="text-sm"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => addResource.mutate()}
                        disabled={!newResource.url.trim() || addResource.isPending}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
                <ul className="space-y-2">
                  {Array.isArray(wr.resources) && wr.resources.length > 0 ? wr.resources.map((r: any) => (
                    <li key={r._id}>
                      <a 
                        className="text-sm text-primary hover:underline flex items-center gap-2" 
                        href={r.url} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        <Link2 className="h-3 w-3" />
                        {r.title || r.url}
                      </a>
                    </li>
                  )) : <li className="text-sm text-muted-foreground">No resources yet.</li>}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WarRoomDetail;
