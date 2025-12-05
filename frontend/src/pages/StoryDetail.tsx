import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const StoryDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["story", id],
    queryFn: () => api.getStoryById(id as string),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !data) return <div className="p-6">Failed to load story.</div>;

  const story: any = data;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{story.title}</h1>
      <div className="text-sm text-muted-foreground">
        {story.author?.name} • {new Date(story.createdAt).toLocaleDateString()}
      </div>
      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-7">
        {story.content || story.excerpt}
      </div>
    </div>
  );
};

export default StoryDetail;
