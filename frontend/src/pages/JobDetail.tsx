import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ApplyJobDialog } from "@/components/ApplyJobDialog";
import {
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Bookmark,
  ExternalLink,
  Globe,
} from "lucide-react";

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const data: any = await api.getJobById(jobId!);
      setJob(data.data || data);
    } catch (error) {
      console.error("Failed to load job:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">Loading job...</div>
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
          onClick={() => navigate('/jobs')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={job.companyLogo} alt={job.company} />
                    <AvatarFallback>{job.company.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{job.company}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Posted {job.postedDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.isRemote && (
                        <Badge className="bg-accent text-accent-foreground">Remote</Badge>
                      )}
                      {job.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{job.applicants} applicants</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="lg" className="flex-1" onClick={() => setApplyDialogOpen(true)}>
                    Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setBookmarked(!bookmarked)}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-sm">
                    {job.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">About {job.company}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{job.companyInfo.about}</p>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Company size</span>
                    <span className="font-medium">{job.companyInfo.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Founded</span>
                    <span className="font-medium">{job.companyInfo.founded}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Funding</span>
                    <span className="font-medium">{job.companyInfo.funding}</span>
                  </div>
                </div>

                <Separator />

                <Button variant="outline" className="w-full" size="sm" asChild>
                  <a href={job.companyInfo.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-sm">Salary</p>
                    <p className="text-sm text-muted-foreground">{job.salary}</p>
                  </div>
                </div>
                {job.equity && (
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-sm">Equity</p>
                      <p className="text-sm text-muted-foreground">{job.equity}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-semibold text-sm">Employment Type</p>
                    <p className="text-sm text-muted-foreground">{job.type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-sm">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {job.location}
                      {job.isRemote && " (Remote)"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Ready to apply?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join {job.company} and help shape the future of B2B SaaS.
                </p>
                <Button className="w-full" size="lg" onClick={() => setApplyDialogOpen(true)}>
                  Apply for this position
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ApplyJobDialog
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        jobTitle={job.title}
        company={job.company}
      />
    </div>
  );
};

export default JobDetail;
