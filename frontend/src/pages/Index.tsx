import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import StoryCard from "@/components/StoryCard";
import { api } from "@/lib/api";
import FounderCard from "@/components/FounderCard";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, Users, TrendingUp, Briefcase, MapPin, Package, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [featuredStories, setFeaturedStories] = useState<any[]>([]);
  const [featuredFounders, setFeaturedFounders] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storiesRes, foundersRes, jobsRes]: any[] = await Promise.all([
          api.getStories({ limit: 3 }),
          api.getFounders({ limit: 2 }),
          api.getJobs({ limit: 2 })
        ]);
        setFeaturedStories(storiesRes.data || []);
        setFeaturedFounders(foundersRes.data || []);
        setFeaturedJobs(jobsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch featured data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />

      {/* Featured Stories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured Stories</h2>
              <p className="mt-2 text-muted-foreground">
                Real experiences from founders who've been there
              </p>
            </div>
            <Button variant="ghost" className="group hidden sm:flex">
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredStories.map((story, index) => (
              <StoryCard key={index} {...story} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="ghost" className="group">
              View All Stories
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Innovative Features Showcase */}
      <section className="border-y border-border bg-gradient-to-b from-background to-secondary/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">Unique Features for Founders</h2>
            <p className="mt-2 text-muted-foreground">
              Revolutionary tools that treat failure as a feature, not a bug
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-12">
            <div 
              className="group rounded-2xl border-0 bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-orange-950/30 dark:via-red-950/30 dark:to-orange-900/30 p-8 transition-all hover:shadow-2xl cursor-pointer"
              onClick={() => navigate('/failure-heatmap')}
            >
              <div className="mb-6 inline-flex rounded-2xl bg-orange-100 dark:bg-orange-900/50 p-4">
                <MapPin className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Failure Heatmap</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                See where startups fail geographically and why. Understand patterns, avoid mistakes, and make data-driven decisions.
              </p>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                Explore Map
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div 
              className="group rounded-2xl border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-green-900/30 p-8 transition-all hover:shadow-2xl cursor-pointer"
              onClick={() => navigate('/marketplace')}
            >
              <div className="mb-6 inline-flex rounded-2xl bg-green-100 dark:bg-green-900/50 p-4">
                <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Resurrection Marketplace</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Buy/sell assets from failed startups. $12.4M traded so far. One founder's shutdown is another's opportunity.
              </p>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                Browse Assets
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div 
              className="group rounded-2xl border-0 bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 dark:from-red-950/30 dark:via-rose-950/30 dark:to-red-900/30 p-8 transition-all hover:shadow-2xl cursor-pointer"
              onClick={() => navigate('/war-rooms')}
            >
              <div className="mb-6 inline-flex rounded-2xl bg-red-100 dark:bg-red-900/50 p-4">
                <Video className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Live Autopsy War Rooms</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Real-time community support during shutdowns. You're not alone. Get live advice from mentors and fellow founders.
              </p>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                Join a Room
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Learn from Failures</h3>
              <p className="text-sm text-muted-foreground">
                Access real stories and insights from founders who've navigated failure
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Connect with Peers</h3>
              <p className="text-sm text-muted-foreground">
                Network with other founders and build meaningful relationships
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Find Investors</h3>
              <p className="text-sm text-muted-foreground">
                Connect with investors who value experience and resilience
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Discover Opportunities</h3>
              <p className="text-sm text-muted-foreground">
                Find your next role or co-founder in the startup ecosystem
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Founders */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Connect with Founders</h2>
              <p className="mt-2 text-muted-foreground">
                Network with resilient entrepreneurs ready to share their wisdom
              </p>
            </div>
            <Button variant="ghost" className="group hidden sm:flex">
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredFounders.map((founder, index) => (
              <FounderCard key={index} {...founder} />
            ))}
            
            {/* CTA Card */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
              <Users className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Join Our Community
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Connect with 500+ founders who've been through it all
              </p>
              <Button>Create Profile</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Board Preview */}
      <section className="border-t border-border bg-secondary/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Latest Opportunities</h2>
              <p className="mt-2 text-muted-foreground">
                Find your next venture or help build someone else's dream
              </p>
            </div>
            <Button variant="ghost" className="group hidden sm:flex">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job, index) => (
              <JobCard key={index} {...job} />
            ))}

            {/* CTA Card */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <Briefcase className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Post a Job
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Reach experienced founders looking for their next challenge
              </p>
              <Button variant="outline">Post Job</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-8 py-16 text-center lg:px-16">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-primary-foreground lg:text-4xl">
                Ready to Turn Your Experience Into Opportunity?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
                Join thousands of founders who are learning, connecting, and growing together
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" variant="secondary" className="group">
                  Join StartUp Obituaries Today
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-foreground/10"></div>
            <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-primary-foreground/10"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-2">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">StartUp Obituaries</span>
              </div>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                A community platform where failed startup founders share experiences, 
                connect with investors, and discover new opportunities.
              </p>
            </div>
            
            <div>
              <h3 className="mb-4 font-semibold text-foreground">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Stories</a></li>
                <li><a href="#" className="hover:text-foreground">Founders</a></li>
                <li><a href="#" className="hover:text-foreground">Events</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Job Board</a></li>
                <li><a href="#" className="hover:text-foreground">Investors</a></li>
                <li><a href="#" className="hover:text-foreground">Guidelines</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 StartUp Obituaries. Rising from failure, stronger than before.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
