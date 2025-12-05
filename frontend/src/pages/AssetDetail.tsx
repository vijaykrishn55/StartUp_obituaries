import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { DollarSign, MapPin, Calendar, Eye, Users, ArrowLeft } from "lucide-react";

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showInterest, setShowInterest] = useState(false);
  const [message, setMessage] = useState("");
  const [offer, setOffer] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["asset", id],
    queryFn: () => api.getAssetById(id as string),
    enabled: !!id,
  });

  const expressInterest = useMutation({
    mutationFn: () => api.expressInterest(id as string, message, offer ? parseFloat(offer) : undefined),
    onSuccess: () => {
      toast({ title: "Interest expressed", description: "The seller will be notified." });
      setShowInterest(false);
      setMessage("");
      setOffer("");
      qc.invalidateQueries({ queryKey: ["asset", id] });
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.message ?? "", variant: "destructive" })
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !data) return <div className="p-6">Failed to load asset.</div>;

  const asset: any = data;
  const userId = (user as any)?._id || (user as any)?.id;
  const sellerId = asset.seller?._id || asset.seller;
  const isOwner = user && asset.seller && (sellerId === userId);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto p-6 pt-24 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/marketplace')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {asset.images && asset.images.length > 0 ? (
            <img src={asset.images[0]} alt={asset.title} className="w-full h-80 object-cover rounded-lg border" />
          ) : (
            <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
          {asset.images && asset.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {asset.images.slice(1, 5).map((img: string, i: number) => (
                <img key={i} src={img} alt={`${asset.title} ${i+2}`} className="w-full h-20 object-cover rounded border" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold">{asset.title}</h1>
              <Badge variant={asset.status === 'available' ? 'default' : 'secondary'}>
                {asset.status}
              </Badge>
            </div>
            <Badge variant="outline" className="mt-2">{asset.category}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="font-semibold">${(asset.askingPrice ?? asset.price)?.toLocaleString() ?? 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="font-semibold">
                  {asset.location 
                    ? [asset.location.city, asset.location.state, asset.location.country].filter(Boolean).join(', ') || 'Not specified'
                    : 'Not specified'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Listed</div>
                <div className="font-semibold">{new Date(asset.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Views</div>
                <div className="font-semibold">{asset.views ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {asset.description}
            </p>
          </div>

          {asset.specifications && (
            <div className="space-y-2">
              <h3 className="font-semibold">Specifications</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {asset.specifications}
              </p>
            </div>
          )}

          {asset.documents && asset.documents.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Documents</h3>
              <div className="flex flex-wrap gap-2">
                {asset.documents.map((doc: any, i: number) => (
                  <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                    {doc.title || `Document ${i+1}`}
                  </a>
                ))}
              </div>
            </div>
          )}

          {isOwner ? (
            <div className="p-3 bg-muted rounded-md text-center text-sm text-muted-foreground">
              This is your listing
            </div>
          ) : !showInterest ? (
            <Button onClick={() => setShowInterest(true)} disabled={asset.status !== 'Available' && asset.status !== 'available'} className="w-full">
              Express Interest
            </Button>
          ) : (
            <div className="space-y-3 p-4 border rounded-md">
              <h3 className="font-semibold">Express Your Interest</h3>
              <Textarea
                placeholder="Tell the seller why you're interested..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Input
                type="number"
                placeholder="Your offer (optional)"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={() => setShowInterest(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => expressInterest.mutate()} 
                  disabled={expressInterest.isPending || message.trim().length === 0}
                  className="flex-1"
                >
                  {expressInterest.isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {asset.seller && (
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">About the Seller</h2>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
              {asset.seller.name?.charAt(0) ?? 'S'}
            </div>
            <div>
              <div className="font-medium">{asset.seller.name}</div>
              <div className="text-sm text-muted-foreground">{asset.seller.company}</div>
            </div>
          </div>
        </div>
      )}

      {Array.isArray(asset.interestedBuyers) && asset.interestedBuyers.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">{asset.interestedBuyers.length} Interested Buyer{asset.interestedBuyers.length !== 1 ? 's' : ''}</h2>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AssetDetail;
