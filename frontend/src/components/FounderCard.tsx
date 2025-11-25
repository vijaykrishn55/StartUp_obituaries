import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";

interface FounderCardProps {
  name: string;
  avatar?: string;
  bio: string;
  location: string;
  previousStartup: string;
  skills: string[];
  openToConnect: boolean;
}

const FounderCard = ({ name, avatar, bio, location, previousStartup, skills, openToConnect }: FounderCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-lg">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              {location}
            </CardDescription>
            <p className="mt-2 text-sm text-muted-foreground">Previously: {previousStartup}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">{bio}</p>
        
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        {openToConnect && (
          <Button className="w-full" variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Connect
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default FounderCard;
