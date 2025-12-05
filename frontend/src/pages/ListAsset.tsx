import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, DollarSign, MapPin, Tag, Package } from 'lucide-react';

const categories = [
  'Domain Names',
  'Source Code',
  'Customer Database',
  'Social Media Accounts',
  'Physical Equipment',
  'Intellectual Property',
  'Brand Assets',
  'Marketing Materials',
  'Office Furniture',
  'Inventory',
  'Partnerships/Contracts',
  'Other'
];

const conditions = ['Excellent', 'Good', 'Fair', 'As-Is'];

export default function ListAsset() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    askingPrice: '',
    originalValue: '',
    condition: 'Good',
    location: {
      city: '',
      state: '',
      country: ''
    },
    shippingAvailable: false,
    tags: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const createAssetMutation = useMutation({
    mutationFn: (data: any) => api.createAsset(data),
    onSuccess: (result: any) => {
      toast({
        title: 'Asset Listed',
        description: 'Your asset has been successfully listed on the marketplace.'
      });
      navigate(`/marketplace/${result._id || result.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to list asset',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.description || !formData.askingPrice) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.description.length < 50) {
      toast({
        title: 'Description too short',
        description: 'Description must be at least 50 characters.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);
      
      // Upload images first
      const uploadedImageUrls: string[] = [];
      for (const image of images) {
        const result = await api.uploadFile(image, 'document');
        if (result?.url) {
          uploadedImageUrls.push(result.url);
        }
      }

      const assetData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        askingPrice: parseFloat(formData.askingPrice),
        originalValue: formData.originalValue ? parseFloat(formData.originalValue) : undefined,
        condition: formData.condition,
        location: {
          city: formData.location.city || undefined,
          state: formData.location.state || undefined,
          country: formData.location.country || undefined
        },
        shippingAvailable: formData.shippingAvailable,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: uploadedImageUrls
      };

      createAssetMutation.mutate(assetData);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto p-6 pt-24">
        <Button
          variant="ghost"
          onClick={() => navigate('/marketplace')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              List an Asset for Sale
            </CardTitle>
            <CardDescription>
              Sell assets from your startup to other entrepreneurs. This could be equipment, 
              software, domain names, or other valuable resources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Premium .com Domain Name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Images
                </Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setImages(prev => [...prev, ...files]);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreviewUrls(prev => [...prev, reader.result as string]);
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="h-8 w-8" />
                    <span>Click to upload images</span>
                    <span className="text-xs">PNG, JPG up to 10MB</span>
                  </label>
                </div>
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => {
                            setImages(prev => prev.filter((_, i) => i !== index));
                            setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description * (min 50 characters)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your asset in detail. Include specifications, history, and any relevant information..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                />
                <p className="text-xs text-gray-500">
                  {formData.description.length}/50 characters minimum
                </p>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="askingPrice">Asking Price ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="askingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={formData.askingPrice}
                      onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalValue">Original Value ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="originalValue"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      className="pl-9"
                      value={formData.originalValue}
                      onChange={(e) => setFormData({ ...formData, originalValue: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {cond}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="City"
                    value={formData.location.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="State/Region"
                    value={formData.location.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, state: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Country"
                    value={formData.location.country}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, country: e.target.value }
                    })}
                  />
                </div>
              </div>

              {/* Shipping */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="shipping"
                  checked={formData.shippingAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, shippingAvailable: checked })}
                />
                <Label htmlFor="shipping">Shipping available</Label>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags (comma separated)
                </Label>
                <Input
                  id="tags"
                  placeholder="e.g., tech, startup, saas, domain"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/marketplace')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAssetMutation.isPending || uploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {uploading ? 'Uploading images...' : createAssetMutation.isPending ? 'Listing...' : 'List Asset'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
