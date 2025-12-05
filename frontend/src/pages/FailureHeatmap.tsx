import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, DollarSign, Users, Calendar, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from "@/contexts/AuthContext";
export default function FailureHeatmap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    industry: '',
    reason: '',
    country: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // Debounce to avoid too many API calls when filters change rapidly
    const debounceTimer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, user]);

  const loadData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const [reportsData, analyticsData, heatmapData] = await Promise.all([
        api.getFailureReports({ ...filters, limit: 10 }),
        api.getFailureAnalytics(),
        api.getHeatmapData(filters)
      ]);
      setReports((reportsData as any).reports || []);
      setAnalytics(analyticsData);
      setHeatmapData(heatmapData as any);
    } catch (error: any) {
      console.error('Failed to load failure data:', error);
      
      // Retry once if it's a network error
      if (retryCount < 1 && (!error.message || error.message.includes('fetch'))) {
        setTimeout(() => loadData(retryCount + 1), 1000);
        return;
      }
      
      setError(error?.message || 'Failed to load failure data. Please check your connection and try again.');
      // Don't clear existing data if we have some
      if (!reports.length) setReports([]);
      if (!analytics) setAnalytics(null);
      if (!heatmapData.length) setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
    'Food & Beverage', 'Real Estate', 'Manufacturing', 'Entertainment', 'Other'
  ];

  const reasons = [
    'Ran out of cash', 'No market need', 'Got outcompeted', 'Pricing/Cost issues',
    'Poor product', 'Business model failure', 'Poor marketing', 'Ignored customers',
    'Product mis-timed', 'Lost focus', 'Team/Investor issues', 'Pivot gone wrong',
    'Legal challenges', 'Other'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getReasonColor = (reason: string) => {
    const colors: any = {
      'Ran out of cash': 'destructive',
      'No market need': 'secondary',
      'Got outcompeted': 'outline',
      'Poor product': 'secondary'
    };
    return colors[reason] || 'outline';
  };

  if (!user) {
    return null;
  }
  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading failure data...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
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
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <MapPin className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Failure Heatmap</h1>
              <p className="text-xl opacity-90 mt-2">
                Learn from {analytics?.totalFailures || 0} startup failures worldwide
              </p>
            </div>
          </div>
          <p className="text-lg opacity-80 max-w-3xl">
            See where startups fail geographically and why. Understand patterns, avoid mistakes,
            and make data-driven decisions for your venture.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Failures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.totalFailures}</div>
                <p className="text-xs text-muted-foreground mt-1">Documented cases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Funding Lost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(analytics.avgMetrics?.avgFunding || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per startup</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Team Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(analytics.avgMetrics?.avgTeamSize || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Team members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Lifespan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(analytics.avgMetrics?.avgOperationalMonths || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Months</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Failures</CardTitle>
            <CardDescription>
              Narrow down failures by industry, reason, or location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select 
                value={filters.industry || 'all'} 
                onValueChange={(value) => setFilters({...filters, industry: value === 'all' ? '' : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.reason || 'all'} 
                onValueChange={(value) => setFilters({...filters, reason: value === 'all' ? '' : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  {reasons.map(reason => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setFilters({ industry: '', reason: '', country: '' })}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Reasons */}
        {analytics?.byReason && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Top Failure Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.byReason.slice(0, 5).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{idx + 1}
                      </div>
                      <span>{item._id}</span>
                    </div>
                    <Badge variant="secondary">{item.count} failures</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Failures */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Failures</h2>
            <Button onClick={() => navigate('/failure-reports/submit')}>
              Share Your Story
            </Button>
          </div>

          <div className="grid gap-6">
            {reports.map((report: any) => (
              <Card 
                key={report._id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/failure-reports/${report._id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {report.anonymousPost ? 'Anonymous Startup' : report.startupName}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{report.industry}</Badge>
                        <Badge variant={getReasonColor(report.primaryReason)}>
                          {report.primaryReason}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {report.location.city}, {report.location.country}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.failureDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {report.detailedAnalysis}
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCurrency(report.fundingRaised)} raised</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{report.teamSize} team members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{report.operationalMonths} months operational</span>
                    </div>
                  </div>
                  {report.lessonsLearned && report.lessonsLearned.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Key Lesson:</p>
                      <p className="text-sm text-muted-foreground italic">
                        "{report.lessonsLearned[0]}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {reports.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  No failure reports found with current filters
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFilters({ industry: '', reason: '', country: '' })}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
