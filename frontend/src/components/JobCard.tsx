import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplyJobDialog } from "@/components/ApplyJobDialog";
import { MapPin, DollarSign, Clock, Building2 } from "lucide-react";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  postedDate: string;
  tags: string[];
  isRemote: boolean;
  jobId?: string;
}

const JobCard = ({ title, company, location, type, salary, postedDate, tags, isRemote, jobId }: JobCardProps) => {
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/jobs/${jobId || '1'}`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setApplyDialogOpen(true);
  };

  return (
    <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg" onClick={handleCardClick}>
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary">{type}</Badge>
          {isRemote && <Badge className="bg-accent text-accent-foreground">Remote</Badge>}
        </div>
        <CardTitle className="transition-colors group-hover:text-primary">{title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {company}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          {salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{salary}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{postedDate}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleApplyClick}>Apply Now</Button>
      </CardFooter>

      <ApplyJobDialog 
        open={applyDialogOpen} 
        onOpenChange={setApplyDialogOpen}
        jobTitle={title}
        company={company}
      />
    </Card>
  );
};

export default JobCard;
