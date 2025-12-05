import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookmarkedPosts = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["bookmarked-posts"],
    queryFn: () => api.getBookmarkedPosts(),
  });

  const posts = Array.isArray(data) ? data : (data as any)?.data || (data as any)?.posts || [];

  if (isLoading) return <div className="p-6">Loading bookmarked posts...</div>;
  if (error) return <div className="p-6">Failed to load bookmarks.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <BookmarkIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Bookmarked Posts</h1>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookmarkIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No bookmarked posts yet</p>
            <p className="text-sm mt-1">Posts you bookmark will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post: any) => (
            <Card
              key={post._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/posts/${post._id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{post.title || 'Untitled Post'}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span>{post.author?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{post.type || 'Post'}</Badge>
                </div>
              </CardHeader>
              {post.content && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>❤️ {post.likes?.length || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                    <span>👁️ {post.views || 0}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkedPosts;
