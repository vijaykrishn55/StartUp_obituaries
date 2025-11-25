import { useState, useMemo, useEffect } from "react";
import Navigation from "@/components/Navigation";
import StoryCard from "@/components/StoryCard";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";

const Stories = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response: any = await api.getStories({ 
          category: activeCategory !== 'all' ? activeCategory : undefined,
          limit: 50 
        });
        setStories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch stories:', error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [activeCategory]);

  // Filter stories based on active category
  const filteredStories = useMemo(() => {
    if (activeCategory === "all") {
      return stories;
    }
    return stories.filter((story: any) => 
      story.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [activeCategory, stories]);

  // Get visible stories based on count
  const visibleStories = filteredStories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredStories.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="border-b border-border bg-gradient-to-br from-background via-background to-secondary py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Learning Hub</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Real stories from founders who've experienced failure and emerged with valuable lessons
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="all">All Stories</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="leadership">Leadership</TabsTrigger>
              <TabsTrigger value="career">Career</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">Loading stories...</p>
                  </div>
                ) : visibleStories.length > 0 ? (
                  visibleStories.map((story: any, index: number) => (
                    <StoryCard 
                      key={story._id || index}
                      title={story.title}
                      excerpt={story.excerpt}
                      author={story.author}
                      readTime={story.readTime}
                      category={story.category}
                      trending={story.trending}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No stories found in this category.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {hasMore && (
            <div className="mt-12 text-center">
              <Button size="lg" onClick={handleLoadMore}>
                Load More Stories
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Stories;
