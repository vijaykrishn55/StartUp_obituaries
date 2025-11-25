import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import JobCard from "@/components/JobCard";
import { api } from "@/lib/api";

interface JobsTabProps {
  searchQuery?: string;
}

export const JobsTab = ({ searchQuery: externalSearchQuery = "" }: JobsTabProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Use external search query if provided (from header), otherwise use local
  const activeSearchQuery = externalSearchQuery || localSearchQuery;

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await api.getJobs();
        setJobs(response.data || response.jobs || response || []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search and tab
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
    if (activeSearchQuery.trim()) {
      const query = activeSearchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        (job.salary && job.salary.toLowerCase().includes(query)) ||
        job.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [activeTab, activeSearchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search jobs by title, company, skills, or location..."
            className="pl-10"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
        </div>
        <Button>Filter</Button>
        <Button variant="outline">Post a Job</Button>
      </div>

      {activeSearchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} matching "{activeSearchQuery}"
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="full-time">Full-time ({jobs.filter(j => j.type === "Full-time").length})</TabsTrigger>
          <TabsTrigger value="co-founder">Co-founder ({jobs.filter(j => j.type === "Co-founder").length})</TabsTrigger>
          <TabsTrigger value="remote">Remote ({jobs.filter(j => j.isRemote).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {activeSearchQuery
                  ? `No jobs found matching "${activeSearchQuery}"`
                  : "No jobs available in this category"}
              </p>
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <JobCard key={index} {...job} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
