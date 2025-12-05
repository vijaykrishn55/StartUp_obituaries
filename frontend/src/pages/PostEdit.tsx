import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, X, Image as ImageIcon } from "lucide-react";

const PostEdit = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    coverImage: "",
    tags: [] as string[],
    type: "text",
    // Postmortem fields
    companyName: "",
    foundedYear: "",
    closedYear: "",
    totalFunding: "",
    // Funding fields
    fundingAmount: "",
    fundingStage: "",
    investors: "",
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response: any = await api.getPostById(postId!);
      const postData = response.data || response;
      setPost(postData);
      setFormData({
        title: postData.title || "",
        subtitle: postData.subtitle || "",
        content: postData.content || "",
        coverImage: postData.coverImage || postData.image || "",
        tags: postData.tags || [],
        type: postData.type || "text",
        companyName: postData.companyName || "",
        foundedYear: postData.foundedYear || "",
        closedYear: postData.closedYear || "",
        totalFunding: postData.totalFunding || "",
        fundingAmount: postData.fundingAmount || "",
        fundingStage: postData.fundingStage || "",
        investors: postData.investors || "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load post",
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Post content is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await api.updatePost(postId!, formData);
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
      navigate(`/posts/${postId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  // Check if user is the author
  const userId = (user as any)?._id || user?.id;
  const authorId = post?.author?._id || post?.author?.id || post?.author;
  const isAuthor = authorId === userId;

  if (!isAuthor) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">You don't have permission to edit this post.</p>
              <Button className="mt-4" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Add a title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle (optional)</Label>
                <Input
                  id="subtitle"
                  placeholder="Add a subtitle..."
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="coverImage"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                {formData.coverImage && (
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg mt-2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[200px]"
                  required
                />
              </div>

              {(formData.type === 'postmortem' || post?.type === 'postmortem') && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm">Postmortem Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="companyName" className="text-xs">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="e.g., TechStartup Inc"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalFunding" className="text-xs">Total Funding</Label>
                      <Input
                        id="totalFunding"
                        value={formData.totalFunding}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalFunding: e.target.value }))}
                        placeholder="e.g., $2M"
                      />
                    </div>
                    <div>
                      <Label htmlFor="foundedYear" className="text-xs">Founded</Label>
                      <Input
                        id="foundedYear"
                        value={formData.foundedYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: e.target.value }))}
                        placeholder="e.g., 2019"
                      />
                    </div>
                    <div>
                      <Label htmlFor="closedYear" className="text-xs">Closed</Label>
                      <Input
                        id="closedYear"
                        value={formData.closedYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, closedYear: e.target.value }))}
                        placeholder="e.g., 2023"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(formData.type === 'funding' || post?.type === 'funding') && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm">Funding Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="fundingAmount" className="text-xs">Amount Raised</Label>
                      <Input
                        id="fundingAmount"
                        value={formData.fundingAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, fundingAmount: e.target.value }))}
                        placeholder="e.g., $5M"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fundingStage" className="text-xs">Stage</Label>
                      <Input
                        id="fundingStage"
                        value={formData.fundingStage}
                        onChange={(e) => setFormData(prev => ({ ...prev, fundingStage: e.target.value }))}
                        placeholder="e.g., Series A"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="investors" className="text-xs">Lead Investors</Label>
                      <Input
                        id="investors"
                        value={formData.investors}
                        onChange={(e) => setFormData(prev => ({ ...prev, investors: e.target.value }))}
                        placeholder="e.g., Sequoia Capital, a16z"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostEdit;
