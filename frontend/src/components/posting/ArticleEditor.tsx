import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Eye, ArrowLeft, Send } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

interface ArticleEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postType: string;
}

export const ArticleEditor = ({ open, onOpenChange, postType }: ArticleEditorProps) => {
  const { toast } = useToast();
  const [isPreview, setIsPreview] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const [article, setArticle] = useState({
    title: "",
    subtitle: "",
    coverImage: "",
    tags: [] as string[],
    content: ""
  });

  const handleAddTag = () => {
    if (currentTag.trim() && article.tags.length < 5) {
      setArticle({ ...article, tags: [...article.tags, currentTag.trim()] });
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setArticle({ ...article, tags: article.tags.filter((_, i) => i !== index) });
  };

  const handlePublish = () => {
    if (!article.title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title for your article",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Article published!",
      description: "Your article has been shared with your network.",
    });
    onOpenChange(false);
  };

  const getPlaceholder = () => {
    switch (postType) {
      case "launch":
        return "**Introducing [Product Name]**\n\n## The Problem\n\nDescribe the problem you're solving...\n\n## Our Solution\n\nExplain how your product addresses this...\n\n## Key Features\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n## What's Next\n\nShare your roadmap and vision...";
      case "funding":
        return "🎉 **Big news!** We're excited to announce that we've raised...\n\n## About the Round\n\n- **Amount**: $X million\n- **Stage**: Series A/Seed\n- **Lead Investor**: [Name]\n\n## What We'll Build\n\nThis funding will help us...\n\n## Join Our Journey\n\nWe're hiring! Looking for...";
      case "milestone":
        return "🚀 **Milestone Alert!**\n\nWe're thrilled to share that we've reached...\n\n## The Journey\n\nLooking back at where we started...\n\n## What This Means\n\nThis achievement represents...\n\n## Thank You\n\nNone of this would be possible without...";
      case "lesson":
        return "# Key Lesson: [Title]\n\n## The Context\n\nHere's what happened...\n\n## What I Learned\n\nThe main takeaway is...\n\n## How You Can Apply This\n\nIf you're facing a similar situation...";
      default:
        return "Start writing your article...\n\nUse **bold**, *italic*, and other formatting to make your content shine.\n\n## Add headings\n\nOrganize your thoughts with sections.\n\n- Use bullet points\n- To highlight key ideas\n\n> Add quotes to emphasize important points";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              {isPreview ? "Preview" : "Write Your Story"}
            </DialogTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? <ArrowLeft className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {isPreview ? "Edit" : "Preview"}
              </Button>
              <Button onClick={handlePublish}>
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {isPreview ? (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="max-w-3xl mx-auto py-8 px-6">
              {article.coverImage && (
                <img 
                  src={article.coverImage} 
                  alt="Cover" 
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <h1 className="text-4xl font-bold mb-2">{article.title || "Untitled Article"}</h1>
              {article.subtitle && (
                <p className="text-xl text-muted-foreground mb-4">{article.subtitle}</p>
              )}
              
              <div className="flex gap-2 mb-6">
                {article.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
              
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>{article.content || "Start writing to see preview..."}</ReactMarkdown>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 p-6">
              <div>
                <Label>Title *</Label>
                <Input
                  placeholder="Give your article a compelling title"
                  value={article.title}
                  onChange={(e) => setArticle({ ...article, title: e.target.value })}
                  className="text-lg font-semibold"
                />
              </div>
              
              <div>
                <Label>Subtitle</Label>
                <Input
                  placeholder="Add a subtitle to provide more context"
                  value={article.subtitle}
                  onChange={(e) => setArticle({ ...article, subtitle: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Cover Image URL</Label>
                <Input
                  placeholder="https://..."
                  value={article.coverImage}
                  onChange={(e) => setArticle({ ...article, coverImage: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Tags (up to 5)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(i)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold">Content</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Use markdown formatting to create beautiful, readable content
                </p>
                <RichTextEditor
                  value={article.content}
                  onChange={(value) => setArticle({ ...article, content: value })}
                  placeholder={getPlaceholder()}
                />
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
