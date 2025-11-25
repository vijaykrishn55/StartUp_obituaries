import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyPosts } from "@/components/dashboard/MyPosts";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Briefcase, 
  Edit, 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  Calendar, 
  Award, 
  GraduationCap,
  Rocket,
  DollarSign,
  Target,
  CheckCircle2,
  XCircle,
  TrendingDown,
  BarChart3,
  Code,
  Globe,
  Twitter,
  Linkedin,
  Github,
  ExternalLink,
  Download,
  Share2,
  Star,
  ThumbsUp,
  MessageCircle,
  Zap,
  Trophy,
  Plus,
  Clock,
  X
} from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editAbout, setEditAbout] = useState("");
  const [editSocialLinks, setEditSocialLinks] = useState({
    website: "",
    twitter: "",
    linkedin: "",
    github: "",
    email: "",
  });
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [addingExperience, setAddingExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    period: "",
    description: "",
  });
  const [addingEducation, setAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({
    school: "",
    degree: "",
    period: "",
    details: "",
  });
  const [addingVenture, setAddingVenture] = useState(false);
  const [newVenture, setNewVenture] = useState({
    name: "",
    status: "active" as "active" | "acquired" | "closed",
    role: "",
    period: "",
    description: "",
    metrics: { key1: "", key2: "" },
    lesson: "",
  });
  const [startupJourneys, setStartupJourneys] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.getProfile();
        const profile = response.data || response.user || response;
        
        setProfileData(profile);
        
        // Update state with fetched data
        if (profile.skills) setSkills(profile.skills);
        if (profile.experience) setExperiences(profile.experience);
        if (profile.education) setEducations(profile.education);
        if (profile.ventures) setStartupJourneys(profile.ventures);
        if (profile.achievements) setAchievements(profile.achievements);
        if (profile.bio) setEditAbout(profile.bio);
        if (profile.socialLinks) setEditSocialLinks(profile.socialLinks);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const getDashboardRoute = () => {
    return user?.userType === 'investor' ? '/investor-dashboard' : '/dashboard';
  };

  const handleHomeClick = () => {
    navigate(getDashboardRoute());
  };

  const handleNetworkClick = () => {
    navigate(getDashboardRoute());
  };

  const handleMessageClick = () => {
    navigate(getDashboardRoute());
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onHomeClick={handleHomeClick}
        onNetworkClick={handleNetworkClick}
        onMessageClick={handleMessageClick}
        activeView="profile"
      />
      
      {/* Hero Section with Cover Photo */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20" />
        <div className="container mx-auto px-4">
          <div className="relative -mt-20">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <div className="relative">
                <Avatar className="h-40 w-40 border-4 border-background">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2 rounded-full h-8 w-8 p-0"
                  onClick={() => setEditProfileOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                    <p className="text-lg text-muted-foreground mb-2">
                      {user.bio || `${user.userType === 'founder' ? 'Startup Founder' : user.userType === 'investor' ? 'Angel Investor' : user.userType === 'job-seeker' ? 'Job Seeker' : 'Professional'}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {user.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {user.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined Recently
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        247 connections
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                    <Button size="sm" onClick={() => setEditProfileOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="default" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    Top Contributor
                  </Badge>
                  <Badge variant="secondary">Verified Founder</Badge>
                  <Badge variant="outline">Open to Opportunities</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Information */}
          <div className="lg:col-span-4 space-y-6">
            {/* About Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  About
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => {
                      setEditingSection(editingSection === "about" ? null : "about");
                      setEditAbout(user?.bio || "");
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingSection === "about" ? (
                  <div className="space-y-3">
                    <textarea
                      className="w-full min-h-[120px] p-3 text-sm border rounded-md resize-none"
                      value={editAbout}
                      onChange={(e) => setEditAbout(e.target.value)}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => {
                        // Save logic here
                        setEditingSection(null);
                      }}>
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditingSection(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">
                    {user?.bio || "Serial entrepreneur with 8+ years of experience building and scaling tech companies. Currently building TechStart, an AI-powered platform that revolutionizes enterprise workflows. Previously founded CloudSync (acquired 2021) and led engineering at Google. Passionate about AI/ML, product development, and helping other founders navigate the startup journey. Angel investor in 12+ early-stage startups."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Connect
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => {
                      setEditingSection(editingSection === "social" ? null : "social");
                      setEditSocialLinks({
                        website: user?.website || "",
                        twitter: user?.twitter || "",
                        linkedin: user?.linkedIn || "",
                        github: user?.github || "",
                        email: user?.email || "",
                      });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingSection === "social" ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Website</label>
                      <input
                        type="url"
                        className="w-full p-2 text-sm border rounded-md bg-background text-foreground"
                        value={editSocialLinks.website}
                        onChange={(e) => setEditSocialLinks({...editSocialLinks, website: e.target.value})}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Twitter</label>
                      <input
                        type="text"
                        className="w-full p-2 text-sm border rounded-md bg-background text-foreground"
                        value={editSocialLinks.twitter}
                        onChange={(e) => setEditSocialLinks({...editSocialLinks, twitter: e.target.value})}
                        placeholder="@username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">LinkedIn</label>
                      <input
                        type="text"
                        className="w-full p-2 text-sm border rounded-md bg-background text-foreground"
                        value={editSocialLinks.linkedin}
                        onChange={(e) => setEditSocialLinks({...editSocialLinks, linkedin: e.target.value})}
                        placeholder="in/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">GitHub</label>
                      <input
                        type="text"
                        className="w-full p-2 text-sm border rounded-md bg-background text-foreground"
                        value={editSocialLinks.github}
                        onChange={(e) => setEditSocialLinks({...editSocialLinks, github: e.target.value})}
                        placeholder="github.com/username"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => {
                        // Save logic here
                        setEditingSection(null);
                      }}>
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditingSection(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {(user?.website || editSocialLinks.website) && (
                      <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                        <a href={user?.website || editSocialLinks.website} target="_blank" rel="noopener noreferrer">
                          <LinkIcon className="h-4 w-4 mr-2" />
                          {user?.website || "yourwebsite.com"}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {(user?.twitter || editSocialLinks.twitter) && (
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Twitter className="h-4 w-4 mr-2" />
                        {user?.twitter || "@username"}
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    )}
                    {(user?.linkedIn || editSocialLinks.linkedin) && (
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Linkedin className="h-4 w-4 mr-2" />
                        {user?.linkedIn || "in/username"}
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    )}
                    {(user?.github || editSocialLinks.github) && (
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Github className="h-4 w-4 mr-2" />
                        {user?.github || "github.com/username"}
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      {user?.email}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Skills with Endorsements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Skills & Expertise
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => setEditingSection(editingSection === "skills" ? null : "skills")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingSection === "skills" ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 text-sm border rounded-md"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSkill.trim()) {
                            setSkills([...skills, { name: newSkill.trim(), endorsements: 0 }]);
                            setNewSkill("");
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => {
                          if (newSkill.trim()) {
                            setSkills([...skills, { name: newSkill.trim(), endorsements: 0 }]);
                            setNewSkill("");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{skill.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" onClick={() => setEditingSection(null)}>
                      Done
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {skills.slice(0, 5).map((skill, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-sm">{skill.name}</Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{skill.endorsements}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {skills.length > 5 && (
                      <Button variant="outline" className="w-full" size="sm">
                        Show all {skills.length} skills
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Startup Journey Timeline */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-blue-500" />
                  Startup Journey
                  <Badge variant="outline" className="ml-2 text-xs">
                    {startupJourneys.length} Ventures
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => setEditingSection(editingSection === "startups" ? null : "startups")}
                  >
                    {editingSection === "startups" ? "Done" : <Edit className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Timeline with connecting line */}
                <div className="relative space-y-6">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-red-500/20" />
                  
                  {startupJourneys.map((venture, index) => (
                    <div key={venture.id} className="relative pl-8">
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-background shadow-lg
                        ${venture.status === 'active' ? 'bg-blue-500' : 
                          venture.status === 'acquired' ? 'bg-green-500' : 'bg-red-500/50'}`}>
                        {venture.status === 'active' && <Zap className="h-3 w-3 text-white absolute top-0.5 left-0.5" />}
                        {venture.status === 'acquired' && <CheckCircle2 className="h-3 w-3 text-white absolute top-0.5 left-0.5" />}
                        {venture.status === 'closed' && <TrendingDown className="h-3 w-3 text-white absolute top-0.5 left-0.5" />}
                      </div>

                      {/* Venture card */}
                      <div className={`group hover:shadow-md transition-all duration-200 rounded-lg border-2 p-4
                        ${venture.status === 'active' ? 'border-blue-200 bg-blue-50/50 hover:border-blue-300' : 
                          venture.status === 'acquired' ? 'border-green-200 bg-green-50/50 hover:border-green-300' : 
                          'border-red-200/50 bg-red-50/30 hover:border-red-300/50'}`}>
                        
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-base mb-1">{venture.name}</h4>
                            <p className="text-xs text-muted-foreground">{venture.period} • {venture.role}</p>
                          </div>
                          <div className="flex items-center gap-2">
                          <Badge 
                            variant={venture.status === 'active' ? 'default' : venture.status === 'acquired' ? 'default' : 'destructive'}
                            className={`text-xs font-semibold shrink-0
                              ${venture.status === 'active' ? 'bg-blue-500' : 
                                venture.status === 'acquired' ? 'bg-green-500' : ''}`}
                          >
                            {venture.status === 'active' && <Zap className="h-3 w-3 mr-1" />}
                            {venture.status === 'acquired' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {venture.status === 'closed' && <TrendingDown className="h-3 w-3 mr-1" />}
                            {venture.status.charAt(0).toUpperCase() + venture.status.slice(1)}
                          </Badge>
                          {editingSection === "startups" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setStartupJourneys(startupJourneys.filter(v => v.id !== venture.id))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm mb-3">{venture.description}</p>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(venture.metrics).map(([key, value]) => (
                            <div key={key} className={`flex items-center gap-2 p-2 rounded-md text-xs font-medium
                              ${venture.status === 'active' ? 'bg-blue-100 text-blue-900' : 
                                venture.status === 'acquired' ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-900'}`}>
                              {key === 'raised' && <DollarSign className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'growth' && <TrendingUp className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'users' && <Users className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'exit' && <DollarSign className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'pivots' && <Target className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'duration' && <Clock className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Lesson learned for closed ventures */}
                        {venture.lesson && (
                          <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r">
                            <p className="text-xs">
                              <strong className="text-amber-700">Key Learning:</strong>
                              <span className="text-amber-900 ml-1">{venture.lesson}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new venture button and form */}
                {editingSection === "startups" && !addingVenture && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-6" 
                    size="sm"
                    onClick={() => setAddingVenture(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Venture
                  </Button>
                )}
                
                {addingVenture && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg space-y-3">
                    <h4 className="font-semibold text-sm mb-3">Add New Venture</h4>
                    <div>
                      <label className="text-xs font-medium">Venture Name *</label>
                      <input
                        type="text"
                        className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                        value={newVenture.name}
                        onChange={(e) => setNewVenture({...newVenture, name: e.target.value})}
                        placeholder="e.g., TechStart"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Status *</label>
                      <select
                        className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                        value={newVenture.status}
                        onChange={(e) => setNewVenture({...newVenture, status: e.target.value as "active" | "acquired" | "closed"})}
                      >
                        <option value="active">Active</option>
                        <option value="acquired">Acquired</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Your Role *</label>
                      <input
                        type="text"
                        className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                        value={newVenture.role}
                        onChange={(e) => setNewVenture({...newVenture, role: e.target.value})}
                        placeholder="e.g., Founder & CEO"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Period *</label>
                      <input
                        type="text"
                        className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                        value={newVenture.period}
                        onChange={(e) => setNewVenture({...newVenture, period: e.target.value})}
                        placeholder="e.g., 2022 - Present"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Description *</label>
                      <textarea
                        className="w-full p-2 text-sm border rounded-md mt-1 resize-none bg-background text-foreground"
                        rows={2}
                        value={newVenture.description}
                        onChange={(e) => setNewVenture({...newVenture, description: e.target.value})}
                        placeholder="Brief description of the venture"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Metric 1</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                          value={newVenture.metrics.key1}
                          onChange={(e) => setNewVenture({...newVenture, metrics: {...newVenture.metrics, key1: e.target.value}})}
                          placeholder="e.g., $12M raised"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Metric 2</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                          value={newVenture.metrics.key2}
                          onChange={(e) => setNewVenture({...newVenture, metrics: {...newVenture.metrics, key2: e.target.value}})}
                          placeholder="e.g., 40% MoM"
                        />
                      </div>
                    </div>
                    {newVenture.status === "closed" && (
                      <div>
                        <label className="text-xs font-medium">Key Learning</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                          value={newVenture.lesson}
                          onChange={(e) => setNewVenture({...newVenture, lesson: e.target.value})}
                          placeholder="What did you learn from this?"
                        />
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm"
                        onClick={() => {
                          if (newVenture.name && newVenture.role && newVenture.period && newVenture.description) {
                            const color = newVenture.status === 'active' ? 'blue' : newVenture.status === 'acquired' ? 'green' : 'red';
                            const metrics: any = {};
                            if (newVenture.metrics.key1) {
                              const metricKey = newVenture.status === 'active' ? 'raised' : newVenture.status === 'acquired' ? 'exit' : 'pivots';
                              metrics[metricKey] = newVenture.metrics.key1;
                            }
                            if (newVenture.metrics.key2) {
                              const metricKey = newVenture.status === 'active' ? 'growth' : newVenture.status === 'acquired' ? 'users' : 'duration';
                              metrics[metricKey] = newVenture.metrics.key2;
                            }
                            
                            const venture: any = {
                              id: Math.max(...startupJourneys.map(v => v.id)) + 1,
                              name: newVenture.name,
                              status: newVenture.status,
                              role: newVenture.role,
                              period: newVenture.period,
                              description: newVenture.description,
                              metrics,
                              color,
                            };
                            
                            if (newVenture.status === 'closed' && newVenture.lesson) {
                              venture.lesson = newVenture.lesson;
                            }
                            
                            setStartupJourneys([...startupJourneys, venture]);
                            setNewVenture({ name: "", status: "active", role: "", period: "", description: "", metrics: { key1: "", key2: "" }, lesson: "" });
                            setAddingVenture(false);
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setAddingVenture(false);
                          setNewVenture({ name: "", status: "active", role: "", period: "", description: "", metrics: { key1: "", key2: "" }, lesson: "" });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experience
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => setEditingSection(editingSection === "experience" ? null : "experience")}
                  >
                    {editingSection === "experience" ? "Done" : <Edit className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {experiences.map((exp, index) => (
                  <div key={exp.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{exp.title}</h4>
                            <p className="text-xs text-muted-foreground">{exp.company} • {exp.period}</p>
                            <p className="text-xs mt-1">{exp.description}</p>
                          </div>
                          {editingSection === "experience" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {editingSection === "experience" && !addingExperience && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => setAddingExperience(true)}
                  >
                    + Add Experience
                  </Button>
                )}
                {addingExperience && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                      <div>
                        <label className="text-xs font-medium">Job Title *</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                          value={newExperience.title}
                          onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                          placeholder="e.g., Senior Product Manager"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Company *</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                          placeholder="e.g., Google"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Period *</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                          value={newExperience.period}
                          onChange={(e) => setNewExperience({...newExperience, period: e.target.value})}
                          placeholder="e.g., 2020 - Present"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Description</label>
                        <textarea
                          className="w-full p-2 text-sm border rounded-md mt-1 resize-none bg-background text-foreground"
                          rows={3}
                          value={newExperience.description}
                          onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                          placeholder="Describe your role and achievements..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => {
                            if (newExperience.title && newExperience.company && newExperience.period) {
                              setExperiences([...experiences, { 
                                id: Math.max(...experiences.map(e => e.id)) + 1, 
                                ...newExperience 
                              }]);
                              setNewExperience({ title: "", company: "", period: "", description: "" });
                              setAddingExperience(false);
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setAddingExperience(false);
                            setNewExperience({ title: "", company: "", period: "", description: "" });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => setEditingSection(editingSection === "education" ? null : "education")}
                  >
                    {editingSection === "education" ? "Done" : <Edit className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {educations.map((edu, index) => (
                  <div key={edu.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded bg-red-500/10 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-red-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{edu.school}</h4>
                            <p className="text-xs text-muted-foreground">
                              {edu.degree} • {edu.period}
                            </p>
                            <p className="text-xs mt-1">{edu.details}</p>
                          </div>
                          {editingSection === "education" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEducations(educations.filter(e => e.id !== edu.id))}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {editingSection === "education" && !addingEducation && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => setAddingEducation(true)}
                  >
                    + Add Education
                  </Button>
                )}
                {addingEducation && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                      <div>
                        <label className="text-xs font-medium">School/University *</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                          value={newEducation.school}
                          onChange={(e) => setNewEducation({...newEducation, school: e.target.value})}
                          placeholder="e.g., Stanford University"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Degree *</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                          placeholder="e.g., Bachelor of Science"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Period *</label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border rounded-md mt-1 bg-background text-foreground"
                          value={newEducation.period}
                          onChange={(e) => setNewEducation({...newEducation, period: e.target.value})}
                          placeholder="e.g., 2016 - 2020"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Details</label>
                        <textarea
                          className="w-full p-2 text-sm border rounded-md mt-1 resize-none bg-background text-foreground"
                          rows={2}
                          value={newEducation.details}
                          onChange={(e) => setNewEducation({...newEducation, details: e.target.value})}
                          placeholder="GPA, major, activities, etc."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => {
                            if (newEducation.school && newEducation.degree && newEducation.period) {
                              setEducations([...educations, { 
                                id: Math.max(...educations.map(e => e.id)) + 1, 
                                ...newEducation 
                              }]);
                              setNewEducation({ school: "", degree: "", period: "", details: "" });
                              setAddingEducation(false);
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setAddingEducation(false);
                            setNewEducation({ school: "", degree: "", period: "", details: "" });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Achievements & Awards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Achievements
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => setEditingSection(editingSection === "achievements" ? null : "achievements")}
                  >
                    {editingSection === "achievements" ? "Done" : <Edit className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {achievements.map((achievement) => {
                  const iconConfig = {
                    trophy: { icon: Trophy, color: 'text-yellow-600' },
                    star: { icon: Star, color: 'text-blue-600' },
                    globe: { icon: Globe, color: 'text-green-600' },
                    award: { icon: Award, color: 'text-purple-600' },
                  };
                  const config = iconConfig[achievement.icon as keyof typeof iconConfig];
                  const Icon = config.icon;

                  return (
                    <div 
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm">{achievement.title}</h5>
                        <p className="text-xs text-muted-foreground">{achievement.year}</p>
                      </div>
                      {editingSection === "achievements" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setAchievements(achievements.filter(a => a.id !== achievement.id))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}

                {/* Add Achievement Button */}
                {editingSection === "achievements" && (
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Achievement
                  </Button>
                )}

                {editingSection === "achievements" && (
                  <Button variant="outline" className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Achievement
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Analytics & Posts */}
          <div className="lg:col-span-8 space-y-6">
            {/* Profile Strength */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Profile Strength
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Advanced</span>
                  <span className="text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Profile photo added
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Startup experience added
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Skills verified
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                    <span>Add portfolio projects</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    5+ connections
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                    <span>Get 3 recommendations</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Profile Analytics (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-2xl font-bold">352</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Profile Views</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-2xl font-bold">8.9K</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Post Impressions</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-2xl font-bold">47</span>
                    </div>
                    <p className="text-xs text-muted-foreground">New Connections</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <MessageCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-2xl font-bold">12.3%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Engagement Rate</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Export Full Analytics Report
                </Button>
              </CardContent>
            </Card>

            {/* Tabs for Posts/Activity */}
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">Posts & Articles</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-6">
                <MyPosts />
              </TabsContent>
              
              <TabsContent value="activity" className="mt-6 space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <ThumbsUp className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">Liked</span> a post about AI in healthcare
                          </p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex gap-3">
                        <MessageCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">Commented</span> on Sarah's funding announcement
                          </p>
                          <p className="text-xs text-muted-foreground">5 hours ago</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex gap-3">
                        <Users className="h-5 w-5 text-purple-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">Connected</span> with 3 new founders
                          </p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recommendations" className="mt-6 space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="border-l-4 border-primary pl-4">
                        <div className="flex items-start gap-3 mb-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                            <AvatarFallback>SC</AvatarFallback>
                          </Avatar>
                          <div>
                            <h5 className="font-semibold text-sm">Sarah Chen</h5>
                            <p className="text-xs text-muted-foreground">CEO at AI Solutions</p>
                          </div>
                        </div>
                        <p className="text-sm italic">
                          "John is an exceptional technical leader with deep expertise in AI/ML. 
                          His strategic thinking and ability to build high-performing teams is remarkable."
                        </p>
                      </div>
                      <Separator />
                      <div className="border-l-4 border-primary pl-4">
                        <div className="flex items-start gap-3 mb-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" />
                            <AvatarFallback>MR</AvatarFallback>
                          </Avatar>
                          <div>
                            <h5 className="font-semibold text-sm">Michael Rodriguez</h5>
                            <p className="text-xs text-muted-foreground">Partner at Sequoia Capital</p>
                          </div>
                        </div>
                        <p className="text-sm italic">
                          "One of the best founders I've worked with. John combines technical excellence 
                          with business acumen, a rare combination in the startup world."
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Ask for Recommendation
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
    </div>
  );
};

export default ProfilePage;
