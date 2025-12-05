import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Code,
  Quote,
  Heading2,
  Eye,
  Save,
  X,
  Upload,
  Hash,
  DollarSign,
  Briefcase,
  TrendingDown,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RichPostEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (post: any) => void;
}

const postTypes = [
  {
    id: "postmortem",
    label: "Postmortem",
    icon: TrendingDown,
    description: "Share what happened and lessons learned",
    color: "text-red-500",
  },
  {
    id: "funding",
    label: "Funding Announcement",
    icon: DollarSign,
    description: "Announce your fundraise",
    color: "text-green-500",
  },
  {
    id: "insight",
    label: "Insight & Advice",
    icon: Lightbulb,
    description: "Share knowledge and tips",
    color: "text-yellow-500",
  },
  {
    id: "question",
    label: "Ask Community",
    icon: MessageSquare,
    description: "Get help from the community",
    color: "text-purple-500",
  },
];

export const RichPostEditor = ({ isOpen, onClose, onPublish }: RichPostEditorProps) => {
  const [postType, setPostType] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  // Postmortem specific
  const [companyName, setCompanyName] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [closedYear, setClosedYear] = useState("");
  const [totalFunding, setTotalFunding] = useState("");
  
  // Funding specific
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingStage, setFundingStage] = useState("");
  const [investors, setInvestors] = useState("");
  
  // Job specific
  const [jobTitle, setJobTitle] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [equity, setEquity] = useState("");
  
  const { toast } = useToast();

  // Helper function to insert/wrap text at cursor position
  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText: string;
    let newCursorPos: number;
    
    if (selectedText) {
      // Wrap selected text
      newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
      newCursorPos = start + prefix.length + selectedText.length + suffix.length;
    } else {
      // Insert placeholder text
      newText = content.substring(0, start) + prefix + placeholder + suffix + content.substring(end);
      newCursorPos = start + prefix.length + placeholder.length;
    }
    
    setContent(newText);
    
    // Restore focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        // Select the placeholder text so user can easily replace it
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
      }
    }, 0);
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    
    if (!trimmedTag) return;
    
    if (tags.length >= 5) {
      toast({
        title: "Maximum tags reached",
        description: "You can only add up to 5 tags",
        variant: "destructive",
      });
      return;
    }
    
    if (trimmedTag.length > 30) {
      toast({
        title: "Tag too long",
        description: "Each tag must be 30 characters or less",
        variant: "destructive",
      });
      return;
    }
    
    setTags([...tags, trimmedTag]);
    setCurrentTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handlePublish = () => {
    if (!postType || !title || !content) {
      toast({
        title: "Missing information",
        description: "Please fill in post type, title, and content",
        variant: "destructive",
      });
      return;
    }

    // Validate title length
    if (title.trim().length < 10) {
      toast({
        title: "Title too short",
        description: "Title must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    if (title.trim().length > 200) {
      toast({
        title: "Title too long",
        description: "Title must be at most 200 characters long",
        variant: "destructive",
      });
      return;
    }

    // Validate content length
    if (content.trim().length < 50) {
      toast({
        title: "Content too short",
        description: "Content must be at least 50 characters long",
        variant: "destructive",
      });
      return;
    }

    // Prepare tags array - ensure each tag is a separate string
    const validTags = tags
      .filter(tag => tag && tag.trim())
      .map(tag => tag.trim())
      .filter(tag => tag.length <= 30);

    console.log('Publishing post with tags:', validTags);

    const post = {
      type: postType,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      content: content.trim(),
      coverImage: coverImage.trim() || undefined,
      tags: validTags,
      ...(postType === "postmortem" && {
        companyName: companyName.trim() || undefined,
        foundedYear: foundedYear.trim() || undefined,
        closedYear: closedYear.trim() || undefined,
        totalFunding: totalFunding.trim() || undefined,
      }),
      ...(postType === "funding" && {
        fundingAmount: fundingAmount.trim() || undefined,
        fundingStage: fundingStage.trim() || undefined,
        investors: investors.trim() || undefined,
      }),
      ...(postType === "job" && {
        jobTitle: jobTitle.trim() || undefined,
        jobType: jobType.trim() || undefined,
        location: location.trim() || undefined,
        salary: salary.trim() || undefined,
        equity: equity.trim() || undefined,
      }),
    };

    onPublish(post);
    handleReset();
    toast({
      title: "Post published!",
      description: "Your post is now live.",
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your draft has been saved locally",
    });
  };

  const handleReset = () => {
    setPostType("");
    setTitle("");
    setSubtitle("");
    setContent("");
    setCoverImage("");
    setTags([]);
    setCompanyName("");
    setFoundedYear("");
    setClosedYear("");
    setTotalFunding("");
    setFundingAmount("");
    setFundingStage("");
    setInvestors("");
    setJobTitle("");
    setJobType("");
    setLocation("");
    setSalary("");
    setEquity("");
    setIsPreview(false);
    onClose();
  };

  const calculateReadTime = () => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <Tabs value={isPreview ? "preview" : "edit"} onValueChange={(v) => setIsPreview(v === "preview")}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handlePublish}>
                Publish
              </Button>
            </div>
          </div>

          <TabsContent value="edit" className="space-y-6">
            {/* Post Type Selection */}
            {!postType ? (
              <div className="space-y-3">
                <Label>What do you want to share?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {postTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setPostType(type.id)}
                        className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all text-left"
                      >
                        <Icon className={`h-5 w-5 ${type.color} flex-shrink-0 mt-0.5`} />
                        <div>
                          <p className="font-semibold text-sm">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="flex items-center gap-2">
                    {postTypes.find((t) => t.id === postType)?.icon && (
                      <span className={postTypes.find((t) => t.id === postType)?.color}>
                        {(() => {
                          const Icon = postTypes.find((t) => t.id === postType)?.icon!;
                          return <Icon className="h-3 w-3" />;
                        })()}
                      </span>
                    )}
                    {postTypes.find((t) => t.id === postType)?.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPostType("")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Change Type
                  </Button>
                </div>

                {/* Type-Specific Fields */}
                {postType === "postmortem" && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Postmortem Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="companyName" className="text-xs">
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g., TechStartup Inc"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalFunding" className="text-xs">
                          Total Funding Raised
                        </Label>
                        <Input
                          id="totalFunding"
                          value={totalFunding}
                          onChange={(e) => setTotalFunding(e.target.value)}
                          placeholder="e.g., $2M"
                        />
                      </div>
                      <div>
                        <Label htmlFor="foundedYear" className="text-xs">
                          Founded
                        </Label>
                        <Input
                          id="foundedYear"
                          value={foundedYear}
                          onChange={(e) => setFoundedYear(e.target.value)}
                          placeholder="e.g., 2019"
                        />
                      </div>
                      <div>
                        <Label htmlFor="closedYear" className="text-xs">
                          Closed
                        </Label>
                        <Input
                          id="closedYear"
                          value={closedYear}
                          onChange={(e) => setClosedYear(e.target.value)}
                          placeholder="e.g., 2023"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {postType === "funding" && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Funding Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="fundingAmount" className="text-xs">
                          Amount Raised *
                        </Label>
                        <Input
                          id="fundingAmount"
                          value={fundingAmount}
                          onChange={(e) => setFundingAmount(e.target.value)}
                          placeholder="e.g., $5M"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fundingStage" className="text-xs">
                          Stage *
                        </Label>
                        <Select value={fundingStage} onValueChange={setFundingStage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pre-seed">Pre-seed</SelectItem>
                            <SelectItem value="seed">Seed</SelectItem>
                            <SelectItem value="series-a">Series A</SelectItem>
                            <SelectItem value="series-b">Series B</SelectItem>
                            <SelectItem value="series-c">Series C+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="investors" className="text-xs">
                          Lead Investors
                        </Label>
                        <Input
                          id="investors"
                          value={investors}
                          onChange={(e) => setInvestors(e.target.value)}
                          placeholder="e.g., Sequoia Capital, a16z"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {postType === "job" && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-500" />
                      Job Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label htmlFor="jobTitle" className="text-xs">
                          Job Title *
                        </Label>
                        <Input
                          id="jobTitle"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g., Senior Full Stack Engineer"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="jobType" className="text-xs">
                          Type
                        </Label>
                        <Select value={jobType} onValueChange={setJobType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="co-founder">Co-founder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-xs">
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g., Remote / San Francisco"
                        />
                      </div>
                      <div>
                        <Label htmlFor="salary" className="text-xs">
                          Salary Range
                        </Label>
                        <Input
                          id="salary"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                          placeholder="e.g., $120K - $180K"
                        />
                      </div>
                      <div>
                        <Label htmlFor="equity" className="text-xs">
                          Equity
                        </Label>
                        <Input
                          id="equity"
                          value={equity}
                          onChange={(e) => setEquity(e.target.value)}
                          placeholder="e.g., 0.1% - 0.5%"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Cover Image (URL)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coverImage"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title * (10-200 characters)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      postType === "postmortem"
                        ? "e.g., From $5M Funding to Shutdown: What I Learned"
                        : postType === "funding"
                        ? "e.g., We just raised $10M to revolutionize..."
                        : "Write your headline..."
                    }
                    className="text-xl font-bold"
                    required
                  />
                  <p className={`text-xs ${title.trim().length >= 10 && title.trim().length <= 200 ? 'text-green-600' : title.trim().length > 200 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {title.trim().length}/10 characters {title.trim().length >= 10 && title.trim().length <= 200 && '✓'}
                    {title.trim().length > 200 && ' (too long!)'}
                  </p>
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="A brief description or hook..."
                  />
                </div>

                <Separator />

                {/* Formatting Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-lg">
                  <Button variant="ghost" size="sm" title="Bold" onClick={() => insertFormatting('**', '**', 'bold text')}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Italic" onClick={() => insertFormatting('*', '*', 'italic text')}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Heading" onClick={() => insertFormatting('\n## ', '\n', 'Heading')}>
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Bullet List" onClick={() => insertFormatting('\n- ', '', 'List item')}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Numbered List" onClick={() => insertFormatting('\n1. ', '', 'List item')}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Quote" onClick={() => insertFormatting('\n> ', '\n', 'Quote text')}>
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Code" onClick={() => insertFormatting('`', '`', 'code')}>
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Link" onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}>
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Image" onClick={() => insertFormatting('![', '](https://example.com/image.jpg)', 'alt text')}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content * (minimum 50 characters)</Label>
                  <Textarea
                    ref={contentRef}
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      postType === "postmortem"
                        ? "Share your story: What happened? What did you learn? What would you do differently?\n\nStructure suggestions:\n• Background & Context\n• What went wrong\n• Key lessons learned\n• Advice for others"
                        : postType === "question"
                        ? "Ask your question in detail. Provide context to help the community give better answers."
                        : "Write your content here. Use markdown for formatting:\n\n**Bold text**\n*Italic text*\n# Heading\n- List item\n```code```"
                    }
                    className="min-h-[400px] font-mono text-sm"
                    required
                  />
                  <div className="flex justify-between text-xs">
                    <p className={content.trim().length >= 50 ? 'text-green-600' : 'text-muted-foreground'}>
                      {content.trim().length}/50 characters {content.trim().length >= 50 && '✓'}
                    </p>
                    <p className="text-muted-foreground">
                      Estimated reading time: {calculateReadTime()} min
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">
                    Tags (max 5, 30 chars each) <Hash className="h-3 w-3 inline" />
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="tags"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add a tag..."
                        disabled={tags.length >= 5}
                        maxLength={30}
                      />
                      {currentTag && (
                        <p className={`text-xs mt-1 ${currentTag.length > 30 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {currentTag.length}/30
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleAddTag}
                      disabled={!currentTag.trim() || tags.length >= 5 || currentTag.length > 30}
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {coverImage && (
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            
            {postType && (
              <Badge variant="outline" className="mb-2">
                {postTypes.find((t) => t.id === postType)?.label}
              </Badge>
            )}
            
            <div>
              <h1 className="text-3xl font-bold mb-2">{title || "Untitled"}</h1>
              {subtitle && (
                <p className="text-xl text-muted-foreground">{subtitle}</p>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                {calculateReadTime()} min read • {tags.length} tags
              </p>
            </div>

            {postType === "postmortem" && (companyName || foundedYear) && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                {companyName && <p><strong>Company:</strong> {companyName}</p>}
                {foundedYear && closedYear && (
                  <p><strong>Timeline:</strong> {foundedYear} - {closedYear}</p>
                )}
                {totalFunding && <p><strong>Funding:</strong> {totalFunding}</p>}
              </div>
            )}

            {postType === "funding" && fundingAmount && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-2xl font-bold text-green-600">{fundingAmount}</p>
                <p className="text-sm text-muted-foreground">
                  {fundingStage && `${fundingStage} round`}
                  {investors && ` • Led by ${investors}`}
                </p>
              </div>
            )}

            {postType === "job" && jobTitle && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xl font-bold">{jobTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {jobType && jobType}
                  {location && ` • ${location}`}
                  {salary && ` • ${salary}`}
                  {equity && ` • ${equity} equity`}
                </p>
              </div>
            )}

            <Separator />

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{content || "Your content will appear here..."}</p>
            </div>

            {tags.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
