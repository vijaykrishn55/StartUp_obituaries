import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
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
  X,
  Loader2
} from "lucide-react";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === user?._id || userId === user?.id;
  const displayUser = isOwnProfile ? user : profileData;
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
  const [connectionsCount, setConnectionsCount] = useState(0);
  
  // Investor-specific state
  const [investorProfile, setInvestorProfile] = useState<any>(null);
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    postImpressions: 0,
    newConnections: 0,
    engagementRate: 0,
    totalConnections: 0
  });

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // If viewing another user's profile, fetch their data
        const response = userId && !isOwnProfile 
          ? await api.getProfile(userId)
          : await api.getProfile();
        const profile = response.data?.user || response.data || response.user || response;
        
        setProfileData(profile);
        
        // Update state with fetched data (for display and editing)
        if (profile.skills) setSkills(profile.skills);
        if (profile.experiences) setExperiences(profile.experiences);
        if (profile.education) setEducations(profile.education);
        if (profile.startupJourneys) setStartupJourneys(profile.startupJourneys);
        if (profile.achievements) setAchievements(profile.achievements);
        if (isOwnProfile) {
          if (profile.bio) setEditAbout(profile.bio);
          setEditSocialLinks({
            website: profile.website || "",
            twitter: profile.twitter || "",
            linkedin: profile.linkedIn || "",
            github: profile.github || "",
            email: profile.email || "",
          });
        }
        
        // Fetch investor profile if user is an investor
        if (profile.userType === 'investor') {
          try {
            const investorsRes: any = await api.getInvestors({ limit: 100 });
            const investors = investorsRes.data || [];
            const userInvestorProfile = investors.find((inv: any) => 
              inv.user?._id === profile._id || inv.user === profile._id
            );
            if (userInvestorProfile) {
              setInvestorProfile(userInvestorProfile);
            }
          } catch (e) {
            console.error('Failed to fetch investor profile');
          }
        }
        
        // Fetch connections count and analytics
        try {
          const connResponse: any = await api.getConnections();
          const connections = connResponse.data || connResponse.connections || [];
          setConnectionsCount(Array.isArray(connections) ? connections.length : 0);
          
          // Fetch analytics for own profile
          if (isOwnProfile) {
            const analyticsRes: any = await api.getProfileAnalytics();
            if (analyticsRes.data) {
              setAnalytics({
                profileViews: analyticsRes.data.profileViews || 0,
                postImpressions: analyticsRes.data.postImpressions || 0,
                newConnections: analyticsRes.data.newConnections || 0,
                engagementRate: analyticsRes.data.engagementRate || 0,
                totalConnections: analyticsRes.data.totalConnections || 0
              });
              // Update connections count from analytics for accuracy
              setConnectionsCount(analyticsRes.data.totalConnections || 0);
            }
          }
        } catch (e) {
          console.error('Failed to fetch connections/analytics');
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user || userId) {
      fetchProfile();
    }
  }, [user, userId, isOwnProfile]);

  // Save about section
  const handleSaveAbout = async () => {
    try {
      setSaving(true);
      await api.updateProfile({ bio: editAbout });
      toast({ title: "Success", description: "About section updated" });
      setEditingSection(null);
      if (refreshUser) refreshUser();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update about section", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Save social links
  const handleSaveSocialLinks = async () => {
    try {
      setSaving(true);
      await api.updateProfile({
        website: editSocialLinks.website,
        twitter: editSocialLinks.twitter,
        linkedIn: editSocialLinks.linkedin,
        github: editSocialLinks.github,
      });
      toast({ title: "Success", description: "Social links updated" });
      setEditingSection(null);
      if (refreshUser) refreshUser();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update social links", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Add skill
  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      setSaving(true);
      await api.addSkill({ name: newSkill.trim() });
      setSkills([...skills, { name: newSkill.trim() }]);
      setNewSkill("");
      toast({ title: "Success", description: "Skill added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add skill", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Remove skill
  const handleRemoveSkill = async (skillId: string, index: number) => {
    try {
      if (skillId) {
        await api.deleteSkill(skillId);
      }
      setSkills(skills.filter((_, i) => i !== index));
      toast({ title: "Success", description: "Skill removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove skill", variant: "destructive" });
    }
  };

  // Add experience
  const handleAddExperience = async () => {
    if (!newExperience.title || !newExperience.company) return;
    try {
      setSaving(true);
      const response: any = await api.addExperience(newExperience);
      setExperiences([...experiences, response.data || newExperience]);
      setNewExperience({ title: "", company: "", period: "", description: "" });
      setAddingExperience(false);
      toast({ title: "Success", description: "Experience added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add experience", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Delete experience
  const handleDeleteExperience = async (expId: string, index: number) => {
    try {
      if (expId) {
        await api.deleteExperience(expId);
      }
      setExperiences(experiences.filter((_, i) => i !== index));
      toast({ title: "Success", description: "Experience removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove experience", variant: "destructive" });
    }
  };

  // Add education
  const handleAddEducation = async () => {
    if (!newEducation.school || !newEducation.degree) return;
    try {
      setSaving(true);
      const response: any = await api.addEducation(newEducation);
      setEducations([...educations, response.data || newEducation]);
      setNewEducation({ school: "", degree: "", period: "", details: "" });
      setAddingEducation(false);
      toast({ title: "Success", description: "Education added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add education", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Delete education
  const handleDeleteEducation = async (eduId: string, index: number) => {
    try {
      if (eduId) {
        await api.deleteEducation(eduId);
      }
      setEducations(educations.filter((_, i) => i !== index));
      toast({ title: "Success", description: "Education removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove education", variant: "destructive" });
    }
  };

  // Add venture
  const handleAddVenture = async () => {
    if (!newVenture.name || !newVenture.role) return;
    try {
      setSaving(true);
      const response: any = await api.addVenture(newVenture);
      setStartupJourneys([...startupJourneys, response.data || newVenture]);
      setNewVenture({
        name: "", status: "active", role: "", period: "", description: "",
        metrics: { key1: "", key2: "" }, lesson: "",
      });
      setAddingVenture(false);
      toast({ title: "Success", description: "Venture added" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add venture", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Delete venture
  const handleDeleteVenture = async (ventureId: string, index: number) => {
    try {
      if (ventureId) {
        await api.deleteVenture(ventureId);
      }
      setStartupJourneys(startupJourneys.filter((_, i) => i !== index));
      toast({ title: "Success", description: "Venture removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove venture", variant: "destructive" });
    }
  };

  // Share profile
  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${user?._id || user?.id}`;
    navigator.clipboard.writeText(profileUrl);
    toast({ title: "Success", description: "Profile link copied to clipboard" });
  };

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleNetworkClick = () => {
    navigate('/dashboard');
  };

  const handleMessageClick = () => {
    navigate('/dashboard');
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
                  <AvatarImage src={displayUser?.avatar} />
                  <AvatarFallback>{displayUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2 rounded-full h-8 w-8 p-0"
                    onClick={() => setEditProfileOpen(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{displayUser?.name}</h1>
                    <p className="text-lg text-muted-foreground mb-2">
                      {displayUser?.headline || displayUser?.bio || (displayUser?.userType === 'founder' ? 'Startup Founder' : displayUser?.userType === 'investor' ? 'Angel Investor' : displayUser?.userType === 'job-seeker' ? 'Job Seeker' : 'Professional')}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {displayUser?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {displayUser.location}
                        </span>
                      )}
                      {displayUser?.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined {new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {connectionsCount} connections
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShareProfile}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                    {isOwnProfile && (
                      <Button size="sm" onClick={() => setEditProfileOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                    {!isOwnProfile && (
                      <Button size="sm" onClick={() => navigate(`/messages?user=${displayUser?._id || displayUser?.id}`)}>
                        Message
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {displayUser?.userType && (
                    <Badge variant="secondary" className="capitalize">
                      {displayUser.userType.replace('-', ' ')}
                    </Badge>
                  )}
                  {/* Investor-specific badges */}
                  {investorProfile && (
                    <>
                      {investorProfile.type && (
                        <Badge variant="outline">{investorProfile.type}</Badge>
                      )}
                      {investorProfile.checkSize && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {investorProfile.checkSize}
                        </Badge>
                      )}
                    </>
                  )}
                  {displayUser?.verified && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {displayUser?.openToOpportunities && (
                    <Badge variant="outline">Open to Opportunities</Badge>
                  )}
                  {connectionsCount >= 50 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Networker
                    </Badge>
                  )}
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
                  {isOwnProfile && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => {
                        setEditingSection(editingSection === "about" ? null : "about");
                        setEditAbout(displayUser?.bio || "");
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingSection === "about" && isOwnProfile ? (
                  <div className="space-y-3">
                    <textarea
                      className="w-full min-h-[120px] p-3 text-sm border rounded-md resize-none bg-background text-foreground"
                      value={editAbout}
                      onChange={(e) => setEditAbout(e.target.value)}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveAbout} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
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
                    {displayUser?.bio || (isOwnProfile ? "Add a description about yourself..." : "No bio available.")}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Connect
                  {isOwnProfile && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => {
                        setEditingSection(editingSection === "social" ? null : "social");
                        setEditSocialLinks({
                          website: displayUser?.website || "",
                          twitter: displayUser?.twitter || "",
                          linkedin: displayUser?.linkedIn || "",
                          github: displayUser?.github || "",
                          email: displayUser?.email || "",
                        });
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingSection === "social" && isOwnProfile ? (
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
                      <Button size="sm" onClick={handleSaveSocialLinks} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
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
                    {displayUser?.website && (
                      <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                        <a href={displayUser.website} target="_blank" rel="noopener noreferrer">
                          <LinkIcon className="h-4 w-4 mr-2" />
                          {displayUser.website}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {displayUser?.twitter && (
                      <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                        <a href={`https://twitter.com/${displayUser.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4 mr-2" />
                          {displayUser.twitter}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {displayUser?.linkedIn && (
                      <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                        <a href={`https://linkedin.com/${displayUser.linkedIn}`} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          {displayUser.linkedIn}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {displayUser?.github && (
                      <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                        <a href={`https://github.com/${displayUser.github}`} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          {displayUser.github}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    )}
                    {displayUser?.email && (
                      <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                        <a href={`mailto:${displayUser.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          {displayUser.email}
                        </a>
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Skills with Endorsements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Skills & Expertise
                  {isOwnProfile && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => setEditingSection(editingSection === "skills" ? null : "skills")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isOwnProfile && editingSection === "skills" ? (
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
                        <div key={skill._id || index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{skill.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveSkill(skill._id, index)}
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
                    {skills.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Code className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No skills added yet</p>
                        {isOwnProfile && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setEditingSection("skills")}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Skills
                          </Button>
                        )}
                      </div>
                    ) : (
                    <>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 5).map((skill, index) => (
                        <Badge key={skill._id || index} variant="secondary" className="text-sm">{skill.name}</Badge>
                      ))}
                    </div>
                    {skills.length > 5 && (
                      <Button variant="outline" className="w-full" size="sm">
                        Show all {skills.length} skills
                      </Button>
                    )}
                    </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Investment Portfolio - Only for investors */}
            {(profileData?.userType === 'investor' || user?.userType === 'investor') && investorProfile && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    Investment Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Focus Area</p>
                      <p className="font-medium text-sm">{investorProfile.focus || 'Not specified'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Investment Stage</p>
                      <p className="font-medium text-sm">{investorProfile.stage || 'Not specified'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Check Size</p>
                      <p className="font-medium text-sm">{investorProfile.checkSize || 'Not specified'}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Investor Type</p>
                      <p className="font-medium text-sm">{investorProfile.type || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {investorProfile.investments && investorProfile.investments.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Portfolio ({investorProfile.investments.length} investments)
                      </h4>
                      <div className="space-y-3">
                        {investorProfile.investments.map((inv: any, index: number) => (
                          <div key={inv._id || index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{inv.company}</p>
                              <p className="text-xs text-muted-foreground">{inv.year}</p>
                            </div>
                            <Badge variant="outline" className="font-mono">{inv.amount}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Startup Journey Timeline - Only for non-investors */}
            {profileData?.userType !== 'investor' && user?.userType !== 'investor' && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-blue-500" />
                  Startup Journey
                  <Badge variant="outline" className="ml-2 text-xs">
                    {startupJourneys.length} Ventures
                  </Badge>
                  {isOwnProfile && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => setEditingSection(editingSection === "startups" ? null : "startups")}
                    >
                      {editingSection === "startups" ? "Done" : <Edit className="h-4 w-4" />}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Timeline with connecting line */}
                {startupJourneys.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Rocket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No startup journeys added yet</p>
                    {isOwnProfile && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => { setEditingSection("startups"); setAddingVenture(true); }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Your First Venture
                      </Button>
                    )}
                  </div>
                ) : (
                <div className="relative space-y-6">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 to-red-500/20" />
                  
                  {startupJourneys.map((venture, index) => (
                    <div key={venture._id || index} className="relative pl-8">
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
                            {venture.status ? venture.status.charAt(0).toUpperCase() + venture.status.slice(1) : 'Active'}
                          </Badge>
                          {isOwnProfile && editingSection === "startups" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteVenture(venture._id || venture.id, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          </div>
                        </div>

                        {/* Description */}
                        {venture.description && <p className="text-sm mb-3">{venture.description}</p>}

                        {/* Metrics Grid - only show if metrics exist and have values */}
                        {venture.metrics && Object.keys(venture.metrics).length > 0 && Object.values(venture.metrics).some(v => v) && (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(venture.metrics).filter(([_, value]) => value).map(([key, value]) => (
                            <div key={key} className={`flex items-center gap-2 p-2 rounded-md text-xs font-medium
                              ${venture.status === 'active' ? 'bg-blue-100 text-blue-900' : 
                                venture.status === 'acquired' ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-900'}`}>
                              {key === 'raised' && <DollarSign className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'growth' && <TrendingUp className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'users' && <Users className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'exit' && <DollarSign className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'pivots' && <Target className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              {key === 'duration' && <Clock className={`h-3.5 w-3.5 ${venture.status === 'active' ? 'text-blue-600' : venture.status === 'acquired' ? 'text-green-600' : 'text-gray-600'}`} />}
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                        )}

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
                )}

                {/* Add new venture button and form */}
                {isOwnProfile && editingSection === "startups" && !addingVenture && (
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
                
                {isOwnProfile && addingVenture && (
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
            )}

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experience
                  {isOwnProfile && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => setEditingSection(editingSection === "experience" ? null : "experience")}
                    >
                      {editingSection === "experience" ? "Done" : <Edit className="h-4 w-4" />}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {experiences.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Briefcase className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No experience added yet</p>
                    {isOwnProfile && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => { setEditingSection("experience"); setAddingExperience(true); }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Experience
                      </Button>
                    )}
                  </div>
                ) : (
                <>
                {experiences.map((exp, index) => (
                  <div key={exp._id || index}>
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
                            {exp.description && <p className="text-xs mt-1">{exp.description}</p>}
                          </div>
                          {isOwnProfile && editingSection === "experience" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteExperience(exp._id, index)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </>
                )}
                {isOwnProfile && editingSection === "experience" && !addingExperience && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => setAddingExperience(true)}
                  >
                    + Add Experience
                  </Button>
                )}
                {isOwnProfile && addingExperience && (
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
                  {isOwnProfile && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => setEditingSection(editingSection === "education" ? null : "education")}
                    >
                      {editingSection === "education" ? "Done" : <Edit className="h-4 w-4" />}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {educations.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <GraduationCap className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No education added yet</p>
                    {isOwnProfile && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => { setEditingSection("education"); setAddingEducation(true); }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Education
                      </Button>
                    )}
                  </div>
                ) : (
                <>
                {educations.map((edu, index) => (
                  <div key={edu._id || index}>
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
                            {edu.details && <p className="text-xs mt-1">{edu.details}</p>}
                          </div>
                          {isOwnProfile && editingSection === "education" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteEducation(edu._id, index)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </>
                )}
                {isOwnProfile && editingSection === "education" && !addingEducation && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => setAddingEducation(true)}
                  >
                    + Add Education
                  </Button>
                )}
                {isOwnProfile && addingEducation && (
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
                  {isOwnProfile && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => setEditingSection(editingSection === "achievements" ? null : "achievements")}
                    >
                      {editingSection === "achievements" ? "Done" : <Edit className="h-4 w-4" />}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {achievements.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Trophy className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No achievements added yet</p>
                    {isOwnProfile && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setEditingSection("achievements")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Achievement
                      </Button>
                    )}
                  </div>
                ) : (
                <>
                {achievements.map((achievement, index) => {
                  const iconConfig: Record<string, { icon: any; color: string }> = {
                    trophy: { icon: Trophy, color: 'text-yellow-600' },
                    star: { icon: Star, color: 'text-blue-600' },
                    globe: { icon: Globe, color: 'text-green-600' },
                    award: { icon: Award, color: 'text-purple-600' },
                  };
                  const config = iconConfig[achievement.icon as string] || { icon: Award, color: 'text-purple-600' };
                  const Icon = config.icon;

                  return (
                    <div 
                      key={achievement._id || index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm">{achievement.title}</h5>
                        {achievement.year && <p className="text-xs text-muted-foreground">{achievement.year}</p>}
                      </div>
                      {isOwnProfile && editingSection === "achievements" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setAchievements(achievements.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                </>
                )}

                {/* Add Achievement Button */}
                {isOwnProfile && editingSection === "achievements" && (
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Achievement
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Analytics & Posts */}
          <div className="lg:col-span-8 space-y-6">
            {/* Profile Strength - Only show on own profile */}
            {isOwnProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Profile Strength
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  // Calculate profile strength based on real data
                  const checks = {
                    hasPhoto: displayUser?.avatar && !displayUser.avatar.includes('shadcn.png') && !displayUser.avatar.includes('dicebear'),
                    hasExperience: experiences?.length > 0 || displayUser?.experiences?.length > 0,
                    hasSkills: skills?.length > 0 || displayUser?.skills?.length > 0,
                    hasVentures: startupJourneys?.length > 0 || displayUser?.startupJourneys?.length > 0,
                    hasConnections: connectionsCount >= 5,
                    hasBio: displayUser?.bio && displayUser.bio.length > 20,
                    hasHeadline: displayUser?.headline && displayUser.headline.length > 5,
                    hasLocation: !!displayUser?.location
                  };
                  
                  const completed = Object.values(checks).filter(Boolean).length;
                  const total = Object.keys(checks).length;
                  const percentage = Math.round((completed / total) * 100);
                  
                  const getStrengthLabel = (pct: number) => {
                    if (pct >= 90) return 'All-Star';
                    if (pct >= 75) return 'Advanced';
                    if (pct >= 50) return 'Intermediate';
                    if (pct >= 25) return 'Beginner';
                    return 'Getting Started';
                  };
                  
                  return (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{getStrengthLabel(percentage)}</span>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-2 ${checks.hasPhoto ? 'text-muted-foreground' : ''}`}>
                          {checks.hasPhoto ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          Profile photo added
                        </div>
                        <div className={`flex items-center gap-2 ${checks.hasExperience ? 'text-muted-foreground' : ''}`}>
                          {checks.hasExperience ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          Experience added
                        </div>
                        <div className={`flex items-center gap-2 ${checks.hasSkills ? 'text-muted-foreground' : ''}`}>
                          {checks.hasSkills ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          Skills added
                        </div>
                        <div className={`flex items-center gap-2 ${checks.hasVentures ? 'text-muted-foreground' : ''}`}>
                          {checks.hasVentures ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          Startup journey added
                        </div>
                        <div className={`flex items-center gap-2 ${checks.hasConnections ? 'text-muted-foreground' : ''}`}>
                          {checks.hasConnections ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          5+ connections
                        </div>
                        <div className={`flex items-center gap-2 ${checks.hasBio ? 'text-muted-foreground' : ''}`}>
                          {checks.hasBio ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          Bio added
                        </div>
                        <div className={`flex items-center gap-2 ${checks.hasHeadline ? 'text-muted-foreground' : ''}`}>
                          {checks.hasHeadline ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          Headline added
                        </div>
                        <div className={`flex items-center gap-2 ${checks.hasLocation ? 'text-muted-foreground' : ''}`}>
                          {checks.hasLocation ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                          Location added
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
            )}

            {/* Analytics Dashboard - Only show on own profile */}
            {isOwnProfile && (
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
                      <span className="text-2xl font-bold">{analytics.profileViews}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Profile Views</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-2xl font-bold">
                        {analytics.postImpressions >= 1000 
                          ? `${(analytics.postImpressions / 1000).toFixed(1)}K` 
                          : analytics.postImpressions}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Post Impressions</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-2xl font-bold">{analytics.newConnections}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">New Connections</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <MessageCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-2xl font-bold">{analytics.engagementRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Engagement Rate</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Export Full Analytics Report
                </Button>
              </CardContent>
            </Card>
            )}

            {/* Tabs for Posts/Activity */}
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">Posts & Articles</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-6">
                <MyPosts userId={displayUser?._id || displayUser?.id} />
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
