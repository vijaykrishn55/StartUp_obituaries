import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, VideoOff, MessageSquare, Users, CheckSquare, Link2, ArrowLeft, 
  StopCircle, Plus, Settings
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

const WarRoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [endSummary, setEndSummary] = useState("");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [newAction, setNewAction] = useState("");
  const [newResource, setNewResource] = useState({ title: "", url: "" });
  const [showAddAction, setShowAddAction] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["war-room", id],
    queryFn: () => api.getWarRoomById(id as string),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const sendMsg = useMutation({
    mutationFn: () => api.sendWarRoomMessage(id as string, text),
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["war-room", id] }); },
  });

  const endWarRoom = useMutation({
    mutationFn: () => api.endWarRoom(id as string, { resolved: true }, endSummary),
    onSuccess: () => {
      toast({ title: "War Room Ended", description: "The session has been concluded." });
      setShowEndDialog(false);
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
  });

  if (isLoading) return <div className="min-h-screen bg-background"><Navigation /><div className="p-6 pt-24">Loading...</div></div>;
  if (error || !data) return <div className="min-h-screen bg-background"><Navigation /><div className="p-6 pt-24">Failed to load war room.</div></div>;

  const wr: any = data;
  
  // Generate a unique Jitsi room name based on war room ID
  const jitsiRoomName = `startup-warroom-${id}`;
  const userName = user?.name || 'Guest';
  const userId = (user as any)?._id || (user as any)?.id;
  const hostId = wr.host?._id || wr.host;
  const isHost = user && hostId && (hostId === userId);
  const isEnded = wr.status === 'Closed' || wr.status === 'completed' || wr.status === 'ended' || !wr.isLive;

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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{wr.title}</h1>
              {wr.isLive && !isEnded && <Badge className="bg-red-500">● LIVE</Badge>}
              <Badge variant={isEnded ? "secondary" : "outline"}>{wr.status}</Badge>
            </div>
            <p className="text-muted-foreground">{wr.startupName} • {wr.situation}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEnded && (
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
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] overflow-y-auto border rounded-md p-3 space-y-3 bg-muted/30 mb-4">
                  {Array.isArray(wr.messages) && wr.messages.length > 0 ? wr.messages.map((m: any) => (
                    <div key={m._id} className="bg-background rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{m.user?.name || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(m.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm">{m.text}</div>
                    </div>
                  )) : (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) sendMsg.mutate(); }} className="flex gap-2">
                  <Input 
                    placeholder={isEnded ? "This session has ended" : "Type a message..."} 
                    value={text} 
                    onChange={(e) => setText(e.target.value)}
                    disabled={isEnded}
                  />
                  <Button type="submit" disabled={sendMsg.isPending || text.trim().length === 0 || isEnded}>
                    Send
                  </Button>
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
                <ul className="space-y-2">
                  {Array.isArray(wr.participants) && wr.participants.length > 0 ? wr.participants.map((p: any) => (
                    <li key={p._id} className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {p.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{p.user?.name ?? "User"}</div>
                        {p.role && <div className="text-xs text-muted-foreground">{p.role}</div>}
                      </div>
                    </li>
                  )) : <li className="text-sm text-muted-foreground">No participants listed.</li>}
                </ul>
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
                  {!isEnded && (
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
                        variant={a.status === 'completed' ? 'default' : 'outline'} 
                        className="mt-0.5 text-xs cursor-pointer"
                        onClick={() => {
                          if (!isEnded) {
                            const newStatus = a.status === 'completed' ? 'pending' : 'completed';
                            updateAction.mutate({ actionId: a._id, status: newStatus });
                          }
                        }}
                      >
                        {a.status}
                      </Badge>
                      <span className={a.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
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
                  {!isEnded && (
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
                        className="text-sm text-primary hover:underline" 
                        href={r.url} 
                        target="_blank" 
                        rel="noreferrer"
                      >
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
