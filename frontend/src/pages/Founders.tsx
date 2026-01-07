import { useState, useMemo, useEffect } from "react";
import Navigation from "@/components/Navigation";
import FounderCard from "@/components/FounderCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Loader2 } from "lucide-react";

const Founders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [founders, setFounders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        setLoading(true);
        const response: any = await api.getFounders({ limit: 50 });
        setFounders(response.data || []);
      } catch (error) {
        console.error('Failed to fetch founders:', error);
        setFounders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFounders();
  }, []);

  // Filter founders based on search query
  const filteredFounders = useMemo(() => {
    if (!searchQuery.trim()) {
      return founders;
    }

    const query = searchQuery.toLowerCase();
    return founders.filter(founder => 
      founder.name?.toLowerCase().includes(query) ||
      founder.location?.toLowerCase().includes(query) ||
      founder.previousStartup?.toLowerCase().includes(query) ||
      founder.bio?.toLowerCase().includes(query) ||
      founder.skills?.some((skill: string) => skill.toLowerCase().includes(query))
    );
  }, [searchQuery, founders]);

  // Get visible founders based on count
  const visibleFounders = filteredFounders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredFounders.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="border-b border-border bg-gradient-to-br from-background via-background to-secondary py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Founder Directory</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Connect with experienced founders who've navigated the challenges of startup life
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
                placeholder="Search founders by name, skills, or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(6); // Reset visible count when searching
                }}
              />
            </div>
          </div>

          {searchQuery && (
            <div className="mb-4 text-sm text-muted-foreground">
              Found {filteredFounders.length} founder{filteredFounders.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading founders...</p>
              </div>
            ) : visibleFounders.length > 0 ? (
              visibleFounders.map((founder, index) => (
                <FounderCard key={founder._id || index} {...founder} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No founders found matching your search.</p>
                <Button 
                  variant="link" 
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <Button size="lg" onClick={handleLoadMore}>
                Load More Founders
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Founders;
