import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, User } from "@/contexts/AuthContext";

interface JoinNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinNowDialog = ({ open, onOpenChange }: JoinNowDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<User['userType'] | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      toast({
        title: "Please select a user type",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, userType);
      
      toast({
        title: "Account created successfully!",
        description: `Welcome to Rebound, ${name}!`,
      });
      
      onOpenChange(false);
      
      // Route based on user type
      const dashboardRoute = userType === "investor" ? "/investor-dashboard" : "/dashboard";
      
      setName("");
      setEmail("");
      setPassword("");
      setUserType("");
      navigate(dashboardRoute);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Rebound</DialogTitle>
          <DialogDescription>
            Create your account and start connecting with the startup community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-name">Full Name</Label>
            <Input
              id="join-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="join-email">Email</Label>
            <Input
              id="join-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="join-password">Password</Label>
            <Input
              id="join-password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-type">I am a...</Label>
            <Select value={userType} onValueChange={setUserType} required>
              <SelectTrigger id="user-type">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="founder">Founder</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="job-seeker">Job Seeker</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our{" "}
            <a href="#" className="hover:text-foreground underline">
              Terms of Service
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
