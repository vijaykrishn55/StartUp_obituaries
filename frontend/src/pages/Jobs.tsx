import { useState, useMemo, useEffect } from "react";
import Navigation from "@/components/Navigation";
import JobCard from "@/components/JobCard";
import { api } from "@/lib/api";
import { PostJobDialog } from "@/components/PostJobDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Jobs = () => {
  const { isAuthenticated, user } = useAuth();
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response: any = await api.getJobs({ limit: 50 });
        setJobs(response.data || []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch user's applications to check which jobs they've applied to
  useEffect(() => {
    const fetchMyApplications = async () => {
      if (!isAuthenticated) return;
      try {
        const response: any = await api.getMyJobApplications();
        const applications = response.data || response || [];
        const appliedIds = new Set<string>(
          applications.map((app: any) => app.job?._id || app.job).filter(Boolean)
        );
        setAppliedJobIds(appliedIds);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      }
    };
    fetchMyApplications();
  }, [isAuthenticated]);

  // Filter jobs based on search query and active tab
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Filter by tab
    if (activeTab === "full-time") {
      filtered = filtered.filter(job => job.type === "Full-time");
    } else if (activeTab === "co-founder") {
      filtered = filtered.filter(job => job.type === "Co-founder");
    } else if (activeTab === "remote") {
      filtered = filtered.filter(job => job.isRemote);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [activeTab, searchQuery, jobs]);

  // Get visible jobs based on count
  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(6); // Reset visible count when searching
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setVisibleCount(6); // Reset visible count when changing tabs
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="border-b border-border bg-gradient-to-br from-background via-background to-secondary py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Job Board</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover opportunities with startups and companies that value your experience
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs by title, company, or skills..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button variant="outline" onClick={() => setPostJobOpen(true)}>Post a Job</Button>
          </div>

          {searchQuery && (
            <div className="mb-4 text-sm text-muted-foreground">
              Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}

          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-8">
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="full-time">Full-time</TabsTrigger>
              <TabsTrigger value="co-founder">Co-founder</TabsTrigger>
              <TabsTrigger value="remote">Remote</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  <div className="col-span-full text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading jobs...</p>
                  </div>
                ) : visibleJobs.length > 0 ? (
                  visibleJobs.map((job) => (
                    <JobCard 
                      key={job._id} 
                      jobId={job._id} 
                      hasApplied={appliedJobIds.has(job._id)}
                      isOwner={user && job.postedBy && (
                        (typeof job.postedBy === 'object' ? job.postedBy._id : job.postedBy) === (user._id || user.id)
                      )}
                      {...job} 
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? `No jobs found matching "${searchQuery}"` 
                        : "No jobs available in this category"}
                    </p>
                    {searchQuery && (
                      <Button 
                        variant="link" 
                        onClick={() => setSearchQuery("")}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {hasMore && (
            <div className="mt-12 text-center">
              <Button size="lg" onClick={handleLoadMore}>
                Load More Jobs
              </Button>
            </div>
          )}
        </div>
      </section>

      <PostJobDialog open={postJobOpen} onOpenChange={setPostJobOpen} />
    </div>
  );
};

export default Jobs;
