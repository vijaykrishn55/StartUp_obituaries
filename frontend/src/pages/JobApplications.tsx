import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Mail,
  Phone,
  Linkedin,
  Globe,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  Users,
  ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Application {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  linkedIn?: string;
  portfolio?: string;
  resume: string;
  coverLetter: string;
  status: 'submitted' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  createdAt: string;
  applicant?: {
    _id: string;
    name: string;
    avatar?: string;
    email: string;
    bio?: string;
  };
}

const statusConfig = {
  submitted: { label: 'Submitted', color: 'bg-gray-500', icon: Clock },
  reviewing: { label: 'Reviewing', color: 'bg-blue-500', icon: Eye },
  interview: { label: 'Interview', color: 'bg-purple-500', icon: Users },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  accepted: { label: 'Accepted', color: 'bg-green-500', icon: CheckCircle2 },
};

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobResponse, applicationsResponse]: any = await Promise.all([
        api.getJobById(jobId!),
        api.getJobApplications(jobId!),
      ]);
      
      setJob(jobResponse.data || jobResponse);
      setApplications(applicationsResponse.data || applicationsResponse || []);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await api.updateApplicationStatus(applicationId, newStatus);
      
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId ? { ...app, status: newStatus as Application['status'] } : app
        )
      );
      
      toast({
        title: "Status updated",
        description: `Application status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const openApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">Job not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job
        </Button>

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <p className="text-muted-foreground mt-1">{job.company} · {job.location}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5" />
                  {applications.length} Applications
                </div>
                <p className="text-sm text-muted-foreground">
                  Posted {formatDate(job.createdAt)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground">
                When candidates apply for this position, they'll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const StatusIcon = statusConfig[application.status]?.icon || Clock;
              
              return (
                <Card key={application._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={application.applicant?.avatar} 
                          alt={application.fullName} 
                        />
                        <AvatarFallback>
                          {application.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{application.fullName}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                              <a 
                                href={`mailto:${application.email}`}
                                className="flex items-center gap-1 hover:text-primary"
                              >
                                <Mail className="h-4 w-4" />
                                {application.email}
                              </a>
                              {application.phone && (
                                <a 
                                  href={`tel:${application.phone}`}
                                  className="flex items-center gap-1 hover:text-primary"
                                >
                                  <Phone className="h-4 w-4" />
                                  {application.phone}
                                </a>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Applied {formatDate(application.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`${statusConfig[application.status]?.color} text-white`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[application.status]?.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {application.linkedIn && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={application.linkedIn} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4 mr-1" />
                                LinkedIn
                              </a>
                            </Button>
                          )}
                          {application.portfolio && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={application.portfolio} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4 mr-1" />
                                Portfolio
                              </a>
                            </Button>
                          )}
                          {application.resume && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={application.resume} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-1" />
                                Resume
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-center justify-between">
                          <Select
                            value={application.status}
                            onValueChange={(value) => handleStatusChange(application._id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="reviewing">Reviewing</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button onClick={() => openApplicationDetails(application)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedApplication.applicant?.avatar} />
                    <AvatarFallback>
                      {selectedApplication.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedApplication.fullName}
                </DialogTitle>
                <DialogDescription>
                  Application for {job.title} at {job.company}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <a href={`mailto:${selectedApplication.email}`} className="ml-2 text-primary hover:underline">
                        {selectedApplication.email}
                      </a>
                    </div>
                    {selectedApplication.phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <a href={`tel:${selectedApplication.phone}`} className="ml-2 text-primary hover:underline">
                          {selectedApplication.phone}
                        </a>
                      </div>
                    )}
                    {selectedApplication.linkedIn && (
                      <div>
                        <span className="text-muted-foreground">LinkedIn:</span>
                        <a href={selectedApplication.linkedIn} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline">
                          View Profile
                        </a>
                      </div>
                    )}
                    {selectedApplication.portfolio && (
                      <div>
                        <span className="text-muted-foreground">Portfolio:</span>
                        <a href={selectedApplication.portfolio} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline">
                          View Portfolio
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Resume */}
                <div>
                  <h4 className="font-semibold mb-2">Resume</h4>
                  <Button variant="outline" asChild>
                    <a href={selectedApplication.resume} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Resume
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                </div>

                <Separator />

                {/* Cover Letter */}
                <div>
                  <h4 className="font-semibold mb-2">Cover Letter</h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Status Update */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">Application Status</h4>
                    <p className="text-sm text-muted-foreground">
                      Applied on {formatDate(selectedApplication.createdAt)}
                    </p>
                  </div>
                  <Select
                    value={selectedApplication.status}
                    onValueChange={(value) => {
                      handleStatusChange(selectedApplication._id, value);
                      setSelectedApplication({ ...selectedApplication, status: value as Application['status'] });
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobApplications;
