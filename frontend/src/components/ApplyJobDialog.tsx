import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { api } from "@/lib/api";

interface ApplyJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  company: string;
  jobId?: string;
  onSuccess?: () => void;
}

export const ApplyJobDialog = ({ open, onOpenChange, jobTitle, company, jobId, onSuccess }: ApplyJobDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    portfolio: "",
    coverLetter: "",
    resume: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!jobId) throw new Error("Missing job ID");

      if (!formData.resume) {
        throw new Error("Please upload your resume");
      }

      if ((formData.coverLetter?.trim()?.length || 0) < 100) {
        throw new Error("Cover letter must be at least 100 characters");
      }

      // 1) Upload resume to get URL
      const uploaded = await api.uploadFile(formData.resume, 'document');
      const resumeUrl = (uploaded as any)?.data?.url || (uploaded as any)?.url;
      if (!resumeUrl) throw new Error("Failed to upload resume");

      // 2) Call real apply endpoint with JSON payload
      await api.applyToJob(jobId, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        linkedIn: formData.linkedIn,
        portfolio: formData.portfolio,
        resume: resumeUrl,
        coverLetter: formData.coverLetter,
      });
      
      toast({
        title: "Application submitted!",
        description: `Your application for ${jobTitle} at ${company} has been submitted successfully.`,
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        linkedIn: "",
        portfolio: "",
        coverLetter: "",
        resume: null,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            {company} - Fill in your details to apply for this position.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name *</Label>
            <Input
              id="full-name"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedIn}
              onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio / Website</Label>
            <Input
              id="portfolio"
              type="url"
              placeholder="https://yourportfolio.com"
              value={formData.portfolio}
              onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume / CV *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
                className="cursor-pointer"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {formData.resume && (
              <p className="text-xs text-muted-foreground">
                Selected: {formData.resume.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-letter">Cover Letter *</Label>
            <Textarea
              id="cover-letter"
              placeholder="Tell us why you're interested in this role and what makes you a great fit..."
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              rows={6}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
