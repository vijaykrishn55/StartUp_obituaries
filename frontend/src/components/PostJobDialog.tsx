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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface PostJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobPosted?: () => void;
}

export const PostJobDialog = ({ open, onOpenChange, onJobPosted }: PostJobDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    description: "",
    requirements: "",
    tags: "",
    isRemote: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title length
    if (formData.title.trim().length < 5) {
      toast({
        title: "Title too short",
        description: "Job title must be at least 5 characters long",
        variant: "destructive",
      });
      return;
    }

    // Validate description length
    if (formData.description.trim().length < 100) {
      toast({
        title: "Description too short",
        description: "Job description must be at least 100 characters long",
        variant: "destructive",
      });
      return;
    }

    // Validate requirements length
    if (formData.requirements.trim().length < 50) {
      toast({
        title: "Requirements too short",
        description: "Job requirements must be at least 50 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const jobData = {
        ...formData,
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        salary: formData.salary.trim() || undefined,
        tags: tagsArray,
      };

      // Call real API to create job
      await api.createJob(jobData);
      
      toast({
        title: "Job posted successfully!",
        description: "Your job posting is now live.",
      });

      // Reset form
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "",
        salary: "",
        description: "",
        requirements: "",
        tags: "",
        isRemote: false,
      });

      onOpenChange(false);
      onJobPosted?.();
    } catch (error) {
      toast({
        title: "Failed to post job",
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
          <DialogTitle>Post a Job</DialogTitle>
          <DialogDescription>
            Fill in the details to post a new job opportunity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title * (min 5 characters)</Label>
            <Input
              id="job-title"
              placeholder="e.g., Senior Software Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={100}
            />
            {formData.title && (
              <p className={`text-xs ${formData.title.trim().length >= 5 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {formData.title.trim().length}/5 characters {formData.title.trim().length >= 5 && '✓'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              placeholder="Your company name"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Co-founder">Co-founder</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range</Label>
            <Input
              id="salary"
              placeholder="e.g., $100K - $150K"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description * (min 100 characters)</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
            {formData.description && (
              <p className={`text-xs ${formData.description.trim().length >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {formData.description.trim().length}/100 characters {formData.description.trim().length >= 100 && '✓'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements * (min 50 characters)</Label>
            <Textarea
              id="requirements"
              placeholder="List the key requirements and qualifications..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={4}
              required
            />
            {formData.requirements && (
              <p className={`text-xs ${formData.requirements.trim().length >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {formData.requirements.trim().length}/50 characters {formData.requirements.trim().length >= 50 && '✓'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g., React, Node.js, Startup (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRemote"
              checked={formData.isRemote}
              onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="isRemote" className="cursor-pointer">
              Remote position
            </Label>
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
              {isLoading ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
