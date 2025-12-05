import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, SlidersHorizontal } from "lucide-react";
import JobCard from "@/components/JobCard";
import { PostJobDialog } from "@/components/PostJobDialog";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobsTabProps {
  searchQuery?: string;
}

export const JobsTab = ({ searchQuery: externalSearchQuery = "" }: JobsTabProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [filters, setFilters] = useState({
    remote: false,
    equity: false,
    recentlyPosted: false,
  });

  // Use external search query if provided (from header), otherwise use local
  const activeSearchQuery = externalSearchQuery || localSearchQuery;

  // Fetch jobs from API
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

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search, tab, and filters
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

    // Apply additional filters
    if (filters.remote) {
      filtered = filtered.filter(job => job.isRemote);
    }
    if (filters.equity) {
      filtered = filtered.filter(job => job.equity);
    }
    if (filters.recentlyPosted) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(job => new Date(job.createdAt) >= weekAgo);
    }

    // Filter by search query
    if (activeSearchQuery.trim()) {
      const query = activeSearchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        (job.salary && job.salary.toLowerCase().includes(query)) ||
        job.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [activeTab, activeSearchQuery, jobs, filters]);

  const handleJobPosted = () => {
    fetchJobs(); // Refresh jobs after posting
  };

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.remote}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, remote: checked }))}
            >
              Remote Only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.equity}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, equity: checked }))}
            >
              Offers Equity
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.recentlyPosted}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, recentlyPosted: checked }))}
            >
              Posted This Week
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={() => setPostJobOpen(true)}>Post a Job</Button>
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

      <PostJobDialog 
        open={postJobOpen} 
        onOpenChange={setPostJobOpen}
        onJobPosted={handleJobPosted}
      />
    </div>
  );
};
