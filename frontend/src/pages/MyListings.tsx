import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Eye, DollarSign, Edit, Trash2, Package } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function MyListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-assets'],
    queryFn: () => api.getMyAssets(),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAsset(id),
    onSuccess: () => {
      toast({ title: 'Asset deleted', description: 'Your listing has been removed.' });
      qc.invalidateQueries({ queryKey: ['my-assets'] });
    },
    onError: (e: any) => {
      toast({ title: 'Delete failed', description: e?.message || 'Could not delete asset.', variant: 'destructive' });
    }
  });

  if (!user) {
    navigate('/');
    return null;
  }

  const assets = (data as any)?.assets || data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-6 pt-24">
        <Button
          variant="ghost"
          onClick={() => navigate('/marketplace')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-muted-foreground">Manage your assets on the marketplace</p>
          </div>
          <Button onClick={() => navigate('/marketplace/list-asset')} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            List New Asset
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading your listings...</div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">Failed to load listings.</div>
        ) : assets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">You haven't listed any assets yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start selling your startup assets to other entrepreneurs
              </p>
              <Button onClick={() => navigate('/marketplace/list-asset')} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                List Your First Asset
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset: any) => (
              <Card key={asset._id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline">{asset.category}</Badge>
                    <Badge 
                      variant={
                        asset.status === 'Available' ? 'default' : 
                        asset.status === 'Sold' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {asset.status}
                    </Badge>
                  </div>
                  <CardTitle 
                    className="text-lg line-clamp-2 cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/marketplace/${asset._id}`)}
                  >
                    {asset.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {asset.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {asset.images && asset.images.length > 0 && (
                      <img 
                        src={asset.images[0]} 
                        alt={asset.title} 
                        className="w-full h-32 object-cover rounded border"
                      />
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          ${asset.askingPrice?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{asset.views || 0} views</span>
                      </div>
                    </div>

                    {asset.interested && asset.interested.length > 0 && (
                      <div className="text-sm text-primary font-medium">
                        {asset.interested.length} interested buyer{asset.interested.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/marketplace/${asset._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{asset.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(asset._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
