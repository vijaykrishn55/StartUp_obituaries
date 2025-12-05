import { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, Package, Search, DollarSign, MapPin, Eye, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
export default function ResurrectionMarketplace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showInterestDialog, setShowInterestDialog] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // Debounce search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, searchTerm, user]);

  const loadData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const [assetsData, statsData] = await Promise.all([
        api.getAssets({ 
          category: filters.category,
          minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
          search: searchTerm,
          limit: 20 
        }),
        api.getMarketplaceStats()
      ]);
      setAssets(((assetsData as any).assets || []) as any[]);
      setStats(statsData as any);
    } catch (error: any) {
      console.error('Failed to load marketplace data:', error);
      
      // Retry once if it's a network error
      if (retryCount < 1 && (!error.message || error.message.includes('fetch'))) {
        setTimeout(() => loadData(retryCount + 1), 1000);
        return;
      }
      
      setError(error?.message || 'Failed to load marketplace data. Please check your connection and try again.');
      // Don't clear existing data if we have some
      if (!assets.length) setAssets([]);
      if (!stats) setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Domain Names', 'Source Code', 'Customer Database', 'Social Media Accounts',
    'Physical Equipment', 'Intellectual Property', 'Brand Assets', 'Marketing Materials',
    'Office Furniture', 'Inventory', 'Partnerships/Contracts', 'Other'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExpressInterest = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    // Validate message
    if (!interestMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    if (interestMessage.trim().length < 10) {
      alert('Please provide a more detailed message (at least 10 characters)');
      return;
    }

    // Validate offer amount if provided
    if (offerAmount && (isNaN(parseFloat(offerAmount)) || parseFloat(offerAmount) <= 0)) {
      alert('Please enter a valid offer amount');
      return;
    }

    try {
      await api.expressInterest(
        selectedAsset._id, 
        interestMessage.trim(),
        offerAmount ? parseFloat(offerAmount) : undefined
      );
      setShowInterestDialog(false);
      setInterestMessage('');
      setOfferAmount('');
      alert('Interest expressed successfully! The seller will be notified and may contact you soon.');
      loadData(); // Refresh the data
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to express interest. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  if (!user) {
    return null;
  }
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading marketplace data...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">{error}</p>
          <Button variant="outline" onClick={() => loadData()}>Retry</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Resurrection Marketplace</h1>
              <p className="text-xl opacity-90 mt-2">
                {formatCurrency((stats?.totalValueTraded || 0) as number)} in assets traded
              </p>
            </div>
          </div>
          <p className="text-lg opacity-80 max-w-3xl">
            Buy and sell assets from failed startups. One founder's shutdown is another's opportunity.
            Domain names, code, equipment, IP, and more.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalAssets}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to purchase</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Successfully Traded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalTraded}</div>
                <p className="text-xs text-muted-foreground mt-1">Assets sold</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(stats.totalValueTraded)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Traded so far</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Assets</CardTitle>
            <CardDescription>
              Search and filter through available assets from failed startups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select 
                value={filters.category || 'all'} 
                onValueChange={(value) => setFilters({...filters, category: value === 'all' ? '' : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={() => navigate('/marketplace/list-asset')} className="bg-green-600 hover:bg-green-700">
                List Asset
              </Button>
              <Button onClick={() => navigate('/marketplace/my-listings')} variant="outline">
                My Listings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset: any) => (
            <Card 
              key={asset._id} 
              className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
              onClick={() => navigate(`/marketplace/${asset._id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{asset.category}</Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {asset.views}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{asset.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {asset.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  {asset.failureReport && (
                    <p className="text-sm text-muted-foreground mb-3">
                      From: <span className="font-medium">{asset.failureReport.startupName}</span>
                    </p>
                  )}
                  
                  {asset.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      {asset.location.city}, {asset.location.country}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{asset.condition}</Badge>
                    {asset.shippingAvailable && (
                      <Badge variant="outline">Shipping Available</Badge>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Asking Price</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(asset.askingPrice)}
                      </p>
                      {asset.originalValue && (
                        <p className="text-xs text-muted-foreground line-through">
                          Original: {formatCurrency(asset.originalValue)}
                        </p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/marketplace/${asset._id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {assets.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                No assets found
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilters({ category: '', minPrice: '', maxPrice: '' });
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Interest Dialog */}
      <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Express Interest</DialogTitle>
            <DialogDescription>
              Send a message to the seller about {selectedAsset?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your Message</label>
              <Textarea
                placeholder="Tell the seller why you're interested..."
                value={interestMessage}
                onChange={(e) => setInterestMessage(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Your Offer (Optional)</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder={`Asking: ${selectedAsset ? formatCurrency(selectedAsset.askingPrice) : ''}`}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Make a counter-offer if you'd like to negotiate
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInterestDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExpressInterest}
              disabled={!interestMessage.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Send Interest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
