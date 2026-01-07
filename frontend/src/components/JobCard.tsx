import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplyJobDialog } from "@/components/ApplyJobDialog";
import { MapPin, DollarSign, Clock, Building2, Check, Users } from "lucide-react";

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
  hasApplied?: boolean;
  isOwner?: boolean;
  applicants?: number;
}

const JobCard = ({ 
  title, 
  company, 
  location, 
  type, 
  salary, 
  postedDate, 
  tags, 
  isRemote, 
  jobId,
  hasApplied = false,
  isOwner = false,
  applicants = 0
}: JobCardProps) => {
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applied, setApplied] = useState(hasApplied);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/jobs/${jobId || '1'}`);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwner) {
      navigate(`/jobs/${jobId}/applications`);
    } else if (!applied) {
      setApplyDialogOpen(true);
    }
  };

  const handleApplicationSuccess = () => {
    setApplied(true);
  };

  return (
    <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg" onClick={handleCardClick}>
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{type}</Badge>
            {isRemote && <Badge className="bg-accent text-accent-foreground">Remote</Badge>}
          </div>
          {applied && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <Check className="h-3 w-3 mr-1" />
              Applied
            </Badge>
          )}
          {isOwner && (
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              Your Post
            </Badge>
          )}
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
          {Array.isArray(tags) && tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {isOwner ? (
          <Button className="w-full" variant="outline" onClick={handleApplyClick}>
            <Users className="h-4 w-4 mr-2" />
            View Applications {applicants > 0 && `(${applicants})`}
          </Button>
        ) : applied ? (
          <Button className="w-full bg-green-600 hover:bg-green-700" disabled onClick={handleApplyClick}>
            <Check className="h-4 w-4 mr-2" />
            Application Submitted
          </Button>
        ) : (
          <Button className="w-full" onClick={handleApplyClick}>Apply Now</Button>
        )}
      </CardFooter>

      <ApplyJobDialog 
        open={applyDialogOpen} 
        onOpenChange={setApplyDialogOpen}
        jobTitle={title}
        company={company}
        jobId={jobId}
        onSuccess={handleApplicationSuccess}
      />
    </Card>
  );
};

export default JobCard;
