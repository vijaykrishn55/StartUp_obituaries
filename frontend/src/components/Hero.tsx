import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen, Briefcase } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-900/30 bg-red-950/20 px-4 py-1.5 text-sm font-medium text-red-400 w-fit mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
              Memorializing the fallen, learning from the lost
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
              Every Startup Has an{" "}
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
                Ending Story
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Honor the ventures that didn't make it. Share post-mortems, 
              preserve lessons learned, and help the next generation avoid 
              the same fate. In death, startups teach more than in life.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Explore Stories
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <div>
                <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  500+
                </div>
                <p className="text-sm text-muted-foreground mt-1">Founders</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                  <BookOpen className="h-5 w-5 text-primary" />
                  200+
                </div>
                <p className="text-sm text-muted-foreground mt-1">Stories</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                  <Briefcase className="h-5 w-5 text-primary" />
                  150+
                </div>
                <p className="text-sm text-muted-foreground mt-1">Jobs</p>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={heroImage}
                alt="Startup founders collaborating and learning together"
                className="h-full w-full object-cover shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 rounded-xl border border-red-900/30 bg-black/80 p-4 shadow-lg backdrop-blur-sm lg:p-6 hidden sm:block">
              <p className="text-sm font-medium text-gray-200">
                "Writing my startup's obituary was therapeutic. Others learned from my mistakes."
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-900 to-orange-900 flex items-center justify-center text-xs text-red-200 font-bold">†</div>
                <div>
                  <p className="text-xs font-semibold text-gray-200">Sarah Chen</p>
                  <p className="text-xs text-red-400/80">Founder (2019-2023)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
