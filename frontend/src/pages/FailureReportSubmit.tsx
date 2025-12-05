import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { ArrowLeft, MapPin } from "lucide-react";

const industries = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
  'Food & Beverage', 'Real Estate', 'Manufacturing', 'Entertainment', 'Other'
];

const reasons = [
  'Ran out of cash', 'No market need', 'Got outcompeted', 'Pricing/Cost issues',
  'Poor product', 'Business model failure', 'Poor marketing', 'Ignored customers',
  'Product mis-timed', 'Lost focus', 'Team/Investor issues', 'Pivot gone wrong',
  'Legal challenges', 'Other'
];

const FailureReportSubmit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({
    startupName: "",
    industry: "Technology",
    location: { city: "", state: "", country: "", coordinates: { latitude: 0, longitude: 0 } },
    teamSize: 1,
    fundingRaised: 0,
    operationalMonths: 1,
    failureDate: "",
    primaryReason: "No market need",
    detailedAnalysis: "",
    lessonsLearned: [""],
    anonymousPost: false,
  });

  const create = useMutation({
    mutationFn: () => api.createFailureReport(form),
    onSuccess: () => {
      toast({ title: "Success", description: "Failure report submitted successfully" });
      navigate('/failure-heatmap');
    },
    onError: (e: any) => toast({ title: "Submission failed", description: e?.message ?? "", variant: "destructive" })
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm({
            ...form,
            location: {
              ...form.location,
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }
          });
          toast({ title: "Location detected", description: "Coordinates have been filled in" });
        },
        () => {
          toast({ title: "Error", description: "Could not get your location", variant: "destructive" });
        }
      );
    }
  };

  const addLesson = () => {
    setForm({ ...form, lessonsLearned: [...form.lessonsLearned, ""] });
  };

  const updateLesson = (index: number, value: string) => {
    const lessons = [...form.lessonsLearned];
    lessons[index] = value;
    setForm({ ...form, lessonsLearned: lessons });
  };

  const removeLesson = (index: number) => {
    if (form.lessonsLearned.length > 1) {
      setForm({ ...form, lessonsLearned: form.lessonsLearned.filter((_: any, i: number) => i !== index) });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/failure-heatmap')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Heatmap
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit Failure Report</CardTitle>
            <CardDescription>
              Share your story to help other founders learn from your experience. 
              Your transparency can prevent others from making the same mistakes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="industry">Industry *</Label>
                <Select value={form.industry} onValueChange={(value) => setForm({ ...form, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(ind => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input 
                  id="city"
                  value={form.location.city} 
                  onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })}
                  placeholder="City"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input 
                  id="state"
                  value={form.location.state} 
                  onChange={(e) => setForm({ ...form, location: { ...form.location, state: e.target.value } })}
                  placeholder="State or Province"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input 
                  id="country"
                  value={form.location.country} 
                  onChange={(e) => setForm({ ...form, location: { ...form.location, country: e.target.value } })}
                  placeholder="Country"
                />
              </div>

              <div className="space-y-2">
                <Label>Coordinates</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={form.location.coordinates.latitude} 
                    onChange={(e) => setForm({ ...form, location: { ...form.location, coordinates: { ...form.location.coordinates, latitude: parseFloat(e.target.value) || 0 } } })}
                    placeholder="Latitude"
                  />
                  <Input 
                    type="number" 
                    value={form.location.coordinates.longitude} 
                    onChange={(e) => setForm({ ...form, location: { ...form.location, coordinates: { ...form.location.coordinates, longitude: parseFloat(e.target.value) || 0 } } })}
                    placeholder="Longitude"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={handleGetLocation}>
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size *</Label>
                <Input 
                  id="teamSize"
                  type="number" 
                  min={1} 
                  value={form.teamSize} 
                  onChange={(e) => setForm({ ...form, teamSize: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundingRaised">Funding Raised ($)</Label>
                <Input 
                  id="fundingRaised"
                  type="number" 
                  min={0} 
                  value={form.fundingRaised} 
                  onChange={(e) => setForm({ ...form, fundingRaised: parseInt(e.target.value) || 0 })}
                  placeholder="Amount in USD"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="operationalMonths">Months in Operation *</Label>
                <Input 
                  id="operationalMonths"
                  type="number" 
                  min={1} 
                  value={form.operationalMonths} 
                  onChange={(e) => setForm({ ...form, operationalMonths: parseInt(e.target.value) || 1 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="failureDate">Failure Date *</Label>
                <Input 
                  id="failureDate"
                  type="date" 
                  value={form.failureDate} 
                  onChange={(e) => setForm({ ...form, failureDate: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="primaryReason">Primary Reason for Failure *</Label>
                <Select value={form.primaryReason} onValueChange={(value) => setForm({ ...form, primaryReason: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons.map(reason => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="detailedAnalysis">Detailed Analysis (min 100 characters) *</Label>
                <Textarea 
                  id="detailedAnalysis"
                  rows={6} 
                  value={form.detailedAnalysis} 
                  onChange={(e) => setForm({ ...form, detailedAnalysis: e.target.value })}
                  placeholder="Share what happened, what went wrong, and what you learned..."
                />
                <p className={`text-xs ${(form.detailedAnalysis?.length || 0) >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {form.detailedAnalysis?.length || 0}/100 characters
                </p>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Lessons Learned</Label>
                {form.lessonsLearned.map((lesson: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={lesson}
                      onChange={(e) => updateLesson(index, e.target.value)}
                      placeholder={`Lesson ${index + 1}`}
                    />
                    {form.lessonsLearned.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLesson(index)}>
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addLesson}>
                  Add Another Lesson
                </Button>
              </div>

              <div className="md:col-span-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymousPost"
                  checked={form.anonymousPost}
                  onChange={(e) => setForm({ ...form, anonymousPost: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="anonymousPost" className="text-sm font-normal">
                  Post anonymously (your name won't be shown)
                </Label>
              </div>
            </div>

            <Button 
              onClick={() => create.mutate()} 
              disabled={create.isPending || (form.detailedAnalysis?.length ?? 0) < 100 || !form.startupName || !form.location?.city || !form.location?.state || !form.location?.country || !form.failureDate}
              className="w-full"
            >
              {create.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FailureReportSubmit;
