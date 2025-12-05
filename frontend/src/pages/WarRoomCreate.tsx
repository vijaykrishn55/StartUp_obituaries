import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Video, AlertCircle } from "lucide-react";

const situations = [
  'Running out of cash',
  'Losing key team members',
  'Product failure',
  'Legal issues',
  'Investor problems',
  'Market collapse',
  'Competition crisis',
  'Operational breakdown',
  'Customer churn',
  'Pivot decision',
  'Other crisis'
];

const urgencyLevels = [
  { value: 'Critical', label: 'Critical - Need immediate help (24-48 hours)', color: 'text-red-600' },
  { value: 'High', label: 'High - Urgent situation (1 week)', color: 'text-orange-600' },
  { value: 'Medium', label: 'Medium - Important decision (2-4 weeks)', color: 'text-yellow-600' },
  { value: 'Low', label: 'Low - Planning ahead', color: 'text-green-600' },
];

const WarRoomCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    title: "",
    startupName: "",
    situation: "",
    description: "",
    urgencyLevel: "High",
    scheduledTime: "",
    maxParticipants: 20,
    isPrivate: false,
    helpNeeded: [] as string[],
  });

  const helpOptions = [
    'Legal advice',
    'Financial guidance',
    'Investor connections',
    'Technical expertise',
    'Emotional support',
    'Strategic planning',
    'Hiring/HR help',
    'PR/Communications',
    'Pivot strategy',
    'Shutdown procedures',
  ];

  const createWarRoom = useMutation({
    mutationFn: () => api.createWarRoom(form),
    onSuccess: (data: any) => {
      toast({ title: "War Room Created", description: "Your war room is now live" });
      navigate(`/war-rooms/${data._id || data.id}`);
    },
    onError: (e: any) => {
      toast({ 
        title: "Failed to create war room", 
        description: e?.message || "Please check all required fields", 
        variant: "destructive" 
      });
    }
  });

  const toggleHelpNeeded = (help: string) => {
    setForm(prev => ({
      ...prev,
      helpNeeded: prev.helpNeeded.includes(help)
        ? prev.helpNeeded.filter(h => h !== help)
        : [...prev.helpNeeded, help]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.startupName || !form.situation || !form.description || !form.scheduledTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (form.description.length < 100) {
      toast({
        title: "Description too short",
        description: "Please provide at least 100 characters describing your situation",
        variant: "destructive"
      });
      return;
    }

    createWarRoom.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Please sign in to create a war room</p>
          <Button onClick={() => navigate('/')} className="mt-4">Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Request Support</h1>
              <p className="opacity-90">Create a war room to get help from the community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/war-rooms')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to War Rooms
        </Button>

        {/* Info Banner */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 mb-1">What is a War Room?</p>
                <p className="text-sm text-red-700">
                  A war room is a live session where founders facing a crisis can get real-time advice, 
                  support, and guidance from mentors, investors, and fellow entrepreneurs. 
                  All conversations are confidential by default.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create War Room</CardTitle>
            <CardDescription>
              Fill in the details about your situation. Be as honest as possible - 
              the community is here to help, not judge.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">War Room Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Need help deciding whether to pivot or shut down"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startupName">Startup Name *</Label>
                <Input
                  id="startupName"
                  value={form.startupName}
                  onChange={(e) => setForm({ ...form, startupName: e.target.value })}
                  placeholder="Your startup name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="situation">Situation Type *</Label>
                <Select value={form.situation} onValueChange={(value) => setForm({ ...form, situation: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your situation" />
                  </SelectTrigger>
                  <SelectContent>
                    {situations.map(sit => (
                      <SelectItem key={sit} value={sit}>{sit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgencyLevel">Urgency Level *</Label>
                <Select value={form.urgencyLevel} onValueChange={(value) => setForm({ ...form, urgencyLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        <span className={level.color}>{level.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Describe Your Situation * (min 100 characters)</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe what's happening, what you've tried, and what kind of help you need..."
                  rows={6}
                  required
                />
                <p className={`text-xs ${form.description.length >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {form.description.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>What kind of help do you need?</Label>
                <div className="flex flex-wrap gap-2">
                  {helpOptions.map(help => (
                    <Button
                      key={help}
                      type="button"
                      variant={form.helpNeeded.includes(help) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleHelpNeeded(help)}
                    >
                      {help}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">When do you want to start? *</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Choose a time when you're available. The war room will go live at this time.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={5}
                  max={100}
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) || 20 })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="isPrivate" className="font-medium">Private War Room</Label>
                  <p className="text-sm text-muted-foreground">
                    Only invited participants can join
                  </p>
                </div>
                <Switch
                  id="isPrivate"
                  checked={form.isPrivate}
                  onCheckedChange={(checked) => setForm({ ...form, isPrivate: checked })}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={createWarRoom.isPending}
                >
                  {createWarRoom.isPending ? "Creating..." : "Create War Room"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/war-rooms')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WarRoomCreate;
