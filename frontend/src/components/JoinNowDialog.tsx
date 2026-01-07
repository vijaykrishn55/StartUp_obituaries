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
  onSwitchToSignIn?: () => void;
}

export const JoinNowDialog = ({ open, onOpenChange, onSwitchToSignIn }: JoinNowDialogProps) => {
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
    // Frontend validation
    if (!name.trim() || name.length < 2) {
      toast({ title: "Name must be at least 2 characters.", variant: "destructive" });
      return;
    }
    // Validate name contains only letters and spaces (no numbers)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim())) {
      toast({ title: "Name must contain only letters and spaces.", variant: "destructive" });
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!password || password.length < 8) {
      toast({ title: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (!userType) {
      toast({ title: "Please select a user type", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password, userType);
      
      toast({
        title: "Account created successfully!",
        description: `Welcome to StartUp Obituaries, ${name}!`,
      });
      onOpenChange(false);
      
      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setUserType("");
      
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error: any) {
      let message = error instanceof Error ? error.message : "Please try again.";
      if (message.includes("User already exists")) {
        message = "An account with this email already exists.";
      } else if (message.includes("required")) {
        message = "Please fill in all required fields.";
      } else if (message.includes("valid email")) {
        message = "Please enter a valid email address.";
      } else if (message.includes("Password")) {
        message = "Password must be at least 8 characters.";
      }
      toast({ title: "Registration failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join StartUp Obituaries</DialogTitle>
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
              onChange={(e) => {
                // Only allow letters and spaces
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setName(value);
              }}
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
          {onSwitchToSignIn && (
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button 
                type="button"
                onClick={onSwitchToSignIn}
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </button>
            </div>
          )}
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
