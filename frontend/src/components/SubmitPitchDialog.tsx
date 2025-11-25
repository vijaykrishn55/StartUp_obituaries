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

interface SubmitPitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmitPitchDialog = ({ open, onOpenChange }: SubmitPitchDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    companyName: "",
    founderName: "",
    email: "",
    website: "",
    industry: "",
    stage: "",
    fundingGoal: "",
    pitch: "",
    deckUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call real API to submit pitch
      await api.createPitch(formData);
      
      toast({
        title: "Pitch submitted successfully!",
        description: "We'll review your pitch and get back to you soon.",
      });

      // Reset form
      setFormData({
        companyName: "",
        founderName: "",
        email: "",
        website: "",
        industry: "",
        stage: "",
        fundingGoal: "",
        pitch: "",
        deckUrl: "",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to submit pitch",
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
          <DialogTitle>Submit Your Pitch</DialogTitle>
          <DialogDescription>
            Share your startup details and pitch with our investor community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              placeholder="Your startup name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founder-name">Founder Name *</Label>
              <Input
                id="founder-name"
                placeholder="Your name"
                value={formData.founderName}
                onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                required
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourcompany.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
                required
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="healthtech">HealthTech</SelectItem>
                  <SelectItem value="edtech">EdTech</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="ai-ml">AI/ML</SelectItem>
                  <SelectItem value="blockchain">Blockchain</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select 
                value={formData.stage} 
                onValueChange={(value) => setFormData({ ...formData, stage: value })}
                required
              >
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="mvp">MVP</SelectItem>
                  <SelectItem value="pre-seed">Pre-seed</SelectItem>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="series-a">Series A</SelectItem>
                  <SelectItem value="series-b">Series B+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funding-goal">Funding Goal *</Label>
            <Input
              id="funding-goal"
              placeholder="e.g., $500K - $1M"
              value={formData.fundingGoal}
              onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pitch">Elevator Pitch *</Label>
            <Textarea
              id="pitch"
              placeholder="Describe your startup, what problem you're solving, and your unique value proposition..."
              value={formData.pitch}
              onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deck-url">Pitch Deck URL</Label>
            <Input
              id="deck-url"
              type="url"
              placeholder="Link to your pitch deck (Google Drive, Dropbox, etc.)"
              value={formData.deckUrl}
              onChange={(e) => setFormData({ ...formData, deckUrl: e.target.value })}
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
              {isLoading ? "Submitting..." : "Submit Pitch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
