import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, TrendingUp } from "lucide-react";

interface StoryCardProps {
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  readTime: number;
  category: string;
  trending?: boolean;
}

const StoryCard = ({ title, excerpt, author, readTime, category, trending }: StoryCardProps) => {
  return (
    <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <div className="mb-3 flex items-center justify-between">
          <Badge variant="secondary">{category}</Badge>
          {trending && (
            <div className="flex items-center gap-1 text-xs text-accent">
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium">Trending</span>
            </div>
          )}
        </div>
        <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2">{excerpt}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.avatar} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{author.name}</p>
            <p className="text-xs text-muted-foreground">{author.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{readTime} min read</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StoryCard;
