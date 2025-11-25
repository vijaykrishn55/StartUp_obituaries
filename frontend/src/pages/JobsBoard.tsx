import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import JobCard from "@/components/JobCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobsBoard = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  const handleNetworkClick = () => {
    navigate("/dashboard");
  };

  const handleMessageClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onHomeClick={handleHomeClick}
        onNetworkClick={handleNetworkClick}
        onMessageClick={handleMessageClick}
        activeView="jobs"
      />
      
      <section className="border-b border-border bg-gradient-to-br from-background via-background to-secondary py-12">
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

      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs by title, company, or skills..."
                className="pl-10"
              />
            </div>
            <Button>Filter</Button>
            <Button variant="outline">Post a Job</Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="full-time">Full-time</TabsTrigger>
              <TabsTrigger value="co-founder">Co-founder</TabsTrigger>
              <TabsTrigger value="remote">Remote</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job, index) => (
                  <JobCard key={index} {...job} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="full-time">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.filter(j => j.type === "Full-time").map((job, index) => (
                  <JobCard key={index} {...job} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="co-founder">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.filter(j => j.type === "Co-founder").map((job, index) => (
                  <JobCard key={index} {...job} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="remote">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.filter(j => j.isRemote).map((job, index) => (
                  <JobCard key={index} {...job} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center">
            <Button size="lg">Load More Jobs</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobsBoard;
