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
import { useAuth } from "@/contexts/AuthContext";
import { JoinNowDialog } from "@/components/JoinNowDialog";
import { SignInDialog } from "@/components/SignInDialog";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featuredStories, setFeaturedStories] = useState<any[]>([]);
  const [featuredFounders, setFeaturedFounders] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [featuredInvestors, setFeaturedInvestors] = useState<any[]>([]);
  const [featuredAssets, setFeaturedAssets] = useState<any[]>([]);
  const [stats, setStats] = useState({
    founders: 0,
    stories: 0,
    jobs: 0,
    investors: 0,
    assetsTraded: 0
  });
  const [loading, setLoading] = useState(true);
  const [joinNowOpen, setJoinNowOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storiesRes, foundersRes, jobsRes, investorsRes, assetsRes]: any[] = await Promise.all([
          api.getStories({ limit: 3 }),
          api.getFounders({ limit: 2 }),
          api.getJobs({ limit: 2 }),
          api.getInvestors({ limit: 3 }),
          api.getAssets({ limit: 3 })
        ]);
        setFeaturedStories(storiesRes.data || []);
        setFeaturedFounders(foundersRes.data || []);
        setFeaturedJobs(jobsRes.data || []);
        setFeaturedInvestors(investorsRes.data || []);
        setFeaturedAssets(assetsRes.data || []);
        
        // Calculate stats from totals
        const totalAssetValue = (assetsRes.data || []).reduce((acc: number, asset: any) => acc + (asset.price || 0), 0);
        setStats({
          founders: foundersRes.total || foundersRes.data?.length || 0,
          stories: storiesRes.total || storiesRes.data?.length || 0,
          jobs: jobsRes.total || jobsRes.data?.length || 0,
          investors: investorsRes.total || investorsRes.data?.length || 0,
          assetsTraded: totalAssetValue
        });
      } catch (error) {
        console.error('Failed to fetch featured data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle navigation with auth check
  const handleAuthNavigation = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      setJoinNowOpen(true);
    }
  };

  // Handle story click
  const handleStoryClick = (storyId: string) => {
    if (user) {
      navigate(`/stories/${storyId}`);
    } else {
      setJoinNowOpen(true);
    }
  };

  // Handle founder click
  const handleFounderClick = (founderId: string, userId?: string) => {
    if (user) {
      navigate(`/profile/${userId || founderId}`);
    } else {
      setJoinNowOpen(true);
    }
  };

  // Handle job click
  const handleJobClick = (jobId: string) => {
    if (user) {
      navigate(`/jobs/${jobId}`);
    } else {
      setJoinNowOpen(true);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero onJoinNow={() => setJoinNowOpen(true)} onSignIn={() => setSignInOpen(true)} />

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
            <Button variant="ghost" className="group hidden sm:flex" onClick={() => handleAuthNavigation('/stories')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredStories.map((story) => (
              <div key={story._id} onClick={() => handleStoryClick(story._id)} className="cursor-pointer">
                <StoryCard 
                  title={story.title}
                  excerpt={story.excerpt || story.content?.substring(0, 150) + '...'}
                  author={{
                    name: story.author?.name || 'Anonymous',
                    avatar: story.author?.avatar,
                    role: story.author?.userType || 'Founder'
                  }}
                  readTime={story.readTime || Math.ceil((story.content?.length || 500) / 1000)}
                  category={story.category || 'General'}
                  trending={story.trending}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="ghost" className="group" onClick={() => handleAuthNavigation('/stories')}>
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
              onClick={() => handleAuthNavigation('/failure-heatmap')}
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
              onClick={() => handleAuthNavigation('/marketplace')}
            >
              <div className="mb-6 inline-flex rounded-2xl bg-green-100 dark:bg-green-900/50 p-4">
                <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Resurrection Marketplace</h3>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                Buy/sell assets from failed startups. {formatCurrency(stats.assetsTraded)} traded so far. One founder's shutdown is another's opportunity.
              </p>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                Browse Assets
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div 
              className="group rounded-2xl border-0 bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 dark:from-red-950/30 dark:via-rose-950/30 dark:to-red-900/30 p-8 transition-all hover:shadow-2xl cursor-pointer"
              onClick={() => handleAuthNavigation('/war-rooms')}
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
            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg cursor-pointer" onClick={() => handleAuthNavigation('/stories')}>
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Learn from Failures</h3>
              <p className="text-sm text-muted-foreground">
                Access {stats.stories}+ real stories and insights from founders who've navigated failure
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg cursor-pointer" onClick={() => handleAuthNavigation('/founders')}>
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Connect with Peers</h3>
              <p className="text-sm text-muted-foreground">
                Network with {stats.founders}+ other founders and build meaningful relationships
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg cursor-pointer" onClick={() => handleAuthNavigation('/investors')}>
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Find Investors</h3>
              <p className="text-sm text-muted-foreground">
                Connect with {stats.investors}+ investors who value experience and resilience
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg cursor-pointer" onClick={() => handleAuthNavigation('/jobs')}>
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Discover Opportunities</h3>
              <p className="text-sm text-muted-foreground">
                Find your next role from {stats.jobs}+ jobs in the startup ecosystem
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
            <Button variant="ghost" className="group hidden sm:flex" onClick={() => handleAuthNavigation('/founders')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredFounders.map((founder) => (
              <div key={founder._id} onClick={() => handleFounderClick(founder._id, founder.user?._id || founder.user)} className="cursor-pointer">
                <FounderCard 
                  name={founder.user?.name || founder.name || 'Unknown Founder'}
                  avatar={founder.user?.avatar || founder.avatar}
                  bio={founder.bio || founder.user?.bio || 'Experienced entrepreneur sharing lessons learned.'}
                  location={founder.location || founder.user?.location || 'Location not specified'}
                  previousStartup={founder.startups?.[0]?.name || founder.companyName || 'Previous Startup'}
                  skills={Array.isArray(founder.skills) ? founder.skills : (Array.isArray(founder.user?.skills) ? founder.user.skills : ['Entrepreneurship'])}
                  openToConnect={founder.openToConnect !== false}
                />
              </div>
            ))}
            
            {/* CTA Card */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center">
              <Users className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Join Our Community
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Connect with {stats.founders}+ founders who've been through it all
              </p>
              <Button onClick={() => user ? navigate('/profile') : setJoinNowOpen(true)}>
                {user ? 'View Your Profile' : 'Create Profile'}
              </Button>
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
            <Button variant="ghost" className="group hidden sm:flex" onClick={() => handleAuthNavigation('/jobs')}>
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <div key={job._id} onClick={() => handleJobClick(job._id)}>
                <JobCard 
                  title={job.title}
                  company={job.company?.name || job.companyName || 'Company'}
                  location={job.location || 'Remote'}
                  type={job.type || job.employmentType || 'Full-time'}
                  salary={job.salary?.min && job.salary?.max ? `$${job.salary.min/1000}K - $${job.salary.max/1000}K` : job.salaryRange}
                  postedDate={job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                  tags={Array.isArray(job.skills) ? job.skills : (Array.isArray(job.requirements) ? job.requirements.slice(0, 3) : [])}
                  isRemote={job.isRemote || job.location?.toLowerCase()?.includes('remote') || false}
                  jobId={job._id}
                />
              </div>
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
              <Button variant="outline" onClick={() => handleAuthNavigation('/jobs')}>Post Job</Button>
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
                Join {stats.founders + stats.investors}+ founders and investors who are learning, connecting, and growing together
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="group"
                  onClick={() => user ? navigate('/dashboard') : setJoinNowOpen(true)}
                >
                  {user ? 'Go to Dashboard' : 'Join StartUp Obituaries Today'}
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
                <li><a onClick={() => handleAuthNavigation('/stories')} className="hover:text-foreground cursor-pointer">Stories</a></li>
                <li><a onClick={() => handleAuthNavigation('/founders')} className="hover:text-foreground cursor-pointer">Founders</a></li>
                <li><a onClick={() => handleAuthNavigation('/war-rooms')} className="hover:text-foreground cursor-pointer">War Rooms</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a onClick={() => handleAuthNavigation('/jobs')} className="hover:text-foreground cursor-pointer">Job Board</a></li>
                <li><a onClick={() => handleAuthNavigation('/investors')} className="hover:text-foreground cursor-pointer">Investors</a></li>
                <li><a onClick={() => handleAuthNavigation('/marketplace')} className="hover:text-foreground cursor-pointer">Marketplace</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 StartUp Obituaries. Rising from failure, stronger than before.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialogs */}
      <JoinNowDialog 
        open={joinNowOpen} 
        onOpenChange={setJoinNowOpen}
        onSwitchToSignIn={() => {
          setJoinNowOpen(false);
          setSignInOpen(true);
        }}
      />
      <SignInDialog 
        open={signInOpen} 
        onOpenChange={setSignInOpen}
        onSwitchToJoinNow={() => {
          setSignInOpen(false);
          setJoinNowOpen(true);
        }}
      />
    </div>
  );
};

export default Index;
