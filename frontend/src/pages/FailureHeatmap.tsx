import { useState, useEffect, useMemo } from 'react';
import { MapPin, TrendingUp, DollarSign, Users, Calendar, AlertTriangle, BarChart3, PieChart, Globe, Flame, ArrowRight, Filter, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from "@/contexts/AuthContext";

// Country coordinates for the visual map
const countryCoordinates: Record<string, { x: number; y: number; name: string }> = {
  'USA': { x: 20, y: 40, name: 'United States' },
  'UK': { x: 48, y: 30, name: 'United Kingdom' },
  'Germany': { x: 52, y: 32, name: 'Germany' },
  'Singapore': { x: 75, y: 55, name: 'Singapore' },
  'UAE': { x: 62, y: 45, name: 'UAE' },
  'India': { x: 68, y: 48, name: 'India' },
  'Canada': { x: 18, y: 28, name: 'Canada' },
  'Australia': { x: 82, y: 72, name: 'Australia' },
  'France': { x: 50, y: 34, name: 'France' },
  'Japan': { x: 85, y: 38, name: 'Japan' },
  'Brazil': { x: 30, y: 65, name: 'Brazil' },
  'China': { x: 78, y: 40, name: 'China' },
};

// Reason colors for consistency
const reasonColors: Record<string, string> = {
  'Ran out of cash': 'bg-red-500',
  'No market need': 'bg-orange-500',
  'Got outcompeted': 'bg-yellow-500',
  'Pricing/Cost issues': 'bg-amber-500',
  'Poor product': 'bg-lime-500',
  'Business model failure': 'bg-green-500',
  'Poor marketing': 'bg-emerald-500',
  'Ignored customers': 'bg-teal-500',
  'Product mis-timed': 'bg-cyan-500',
  'Lost focus': 'bg-sky-500',
  'Team/Investor issues': 'bg-blue-500',
  'Pivot gone wrong': 'bg-indigo-500',
  'Legal challenges': 'bg-violet-500',
  'Other': 'bg-purple-500',
};

// Industry icons
const industryIcons: Record<string, string> = {
  'Technology': '💻',
  'Healthcare': '🏥',
  'Finance': '💰',
  'E-commerce': '🛒',
  'Education': '📚',
  'Food & Beverage': '🍔',
  'Real Estate': '🏠',
  'Manufacturing': '🏭',
  'Entertainment': '🎬',
  'Other': '📦',
};

export default function FailureHeatmap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    industry: '',
    reason: '',
    country: ''
  });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    const debounceTimer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, user]);

  const loadData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const [reportsData, analyticsData, heatmapDataResult] = await Promise.all([
        api.getFailureReports({ ...filters, limit: 20 }),
        api.getFailureAnalytics(),
        api.getHeatmapData(filters)
      ]);
      setReports((reportsData as any).reports || []);
      setAnalytics(analyticsData);
      setHeatmapData(heatmapDataResult as any);
    } catch (error: any) {
      console.error('Failed to load failure data:', error);
      
      if (retryCount < 1 && (!error.message || error.message.includes('fetch'))) {
        setTimeout(() => loadData(retryCount + 1), 1000);
        return;
      }
      
      setError(error?.message || 'Failed to load failure data. Please check your connection and try again.');
      if (!reports.length) setReports([]);
      if (!analytics) setAnalytics(null);
      if (!heatmapData.length) setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  };

  // Process heatmap data for the visual map
  const countryStats = useMemo(() => {
    const stats: Record<string, { count: number; totalFunding: number; topReason: string }> = {};
    
    heatmapData.forEach((item: any) => {
      const country = item.location?.country || item._id?.country;
      if (!country) return;
      
      if (!stats[country]) {
        stats[country] = { count: 0, totalFunding: 0, topReason: '' };
      }
      stats[country].count += item.count || 1;
      stats[country].totalFunding += item.totalFunding || 0;
    });
    
    // Also process from reports if heatmapData is empty
    if (heatmapData.length === 0) {
      reports.forEach((report: any) => {
        const country = report.location?.country;
        if (!country) return;
        
        if (!stats[country]) {
          stats[country] = { count: 0, totalFunding: 0, topReason: '' };
        }
        stats[country].count += 1;
        stats[country].totalFunding += report.fundingRaised || 0;
        stats[country].topReason = report.primaryReason;
      });
    }
    
    return stats;
  }, [heatmapData, reports]);

  const maxCount = useMemo(() => {
    return Math.max(...Object.values(countryStats).map(s => s.count), 1);
  }, [countryStats]);

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
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getReasonColor = (reason: string): "outline" | "destructive" | "secondary" | "default" => {
    const colors: Record<string, "outline" | "destructive" | "secondary" | "default"> = {
      'Ran out of cash': 'destructive',
      'No market need': 'secondary',
      'Got outcompeted': 'outline',
      'Business model failure': 'secondary',
      'Pricing/Cost issues': 'outline',
      'Legal challenges': 'destructive',
    };
    return colors[reason] || 'outline';
  };

  const getHeatIntensity = (count: number) => {
    const intensity = (count / maxCount) * 100;
    if (intensity > 75) return 'bg-red-500';
    if (intensity > 50) return 'bg-orange-500';
    if (intensity > 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!user) {
    return null;
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading failure data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">{error}</p>
            <Button variant="outline" onClick={() => loadData()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Flame className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Failure Heatmap</h1>
              <p className="text-xl opacity-90 mt-2">
                Learn from {analytics?.totalFailures || 0} startup failures worldwide
              </p>
            </div>
          </div>
          <p className="text-lg opacity-80 max-w-3xl mt-4">
            Visualize where startups fail, why they fail, and extract actionable insights 
            to avoid making the same mistakes.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Total Failures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-700 dark:text-red-300">{analytics.totalFailures}</div>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Documented cases</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Funding Lost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-700 dark:text-amber-300">
                  {formatCurrency(analytics.avgMetrics?.totalFundingLost || 0)}
                </div>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Combined losses</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Avg. Team Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                  {Math.round(analytics.avgMetrics?.avgTeamSize || 0)}
                </div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">People per startup</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Avg. Lifespan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                  {Math.round(analytics.avgMetrics?.avgOperationalMonths || 0)}
                </div>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Months</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Map View</span>
            </TabsTrigger>
            <TabsTrigger value="reasons" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">By Reason</span>
            </TabsTrigger>
            <TabsTrigger value="industries" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">By Industry</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Map View Tab */}
          <TabsContent value="overview">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Global Failure Distribution
                </CardTitle>
                <CardDescription>
                  Interactive map showing startup failures by location. Hover over markers for details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Visual Map */}
                <div className="relative w-full h-[400px] bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-950 dark:to-slate-900 rounded-xl overflow-hidden">
                  {/* World map background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg viewBox="0 0 100 60" className="w-full h-full">
                      <path d="M15,20 Q20,15 30,18 T45,22 T55,18 Q60,20 65,25 T80,30" 
                            fill="none" stroke="currentColor" strokeWidth="0.3" className="text-blue-500" />
                      <path d="M10,35 Q25,30 35,40 T55,45 T75,38" 
                            fill="none" stroke="currentColor" strokeWidth="0.3" className="text-blue-500" />
                    </svg>
                  </div>
                  
                  {/* Country markers */}
                  {Object.entries(countryCoordinates).map(([code, coords]) => {
                    const stats = countryStats[code];
                    if (!stats || stats.count === 0) return null;
                    
                    const size = Math.max(20, Math.min(60, 20 + (stats.count / maxCount) * 40));
                    const isHovered = hoveredCountry === code;
                    
                    return (
                      <div
                        key={code}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
                        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                        onMouseEnter={() => setHoveredCountry(code)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        onClick={() => setFilters({ ...filters, country: code })}
                      >
                        <div
                          className={`rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 ${getHeatIntensity(stats.count)} ${isHovered ? 'scale-125 ring-4 ring-white/50' : ''}`}
                          style={{ width: size, height: size }}
                        >
                          {stats.count}
                        </div>
                        
                        {/* Tooltip */}
                        {isHovered && (
                          <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-3 min-w-[180px] text-sm">
                            <div className="font-bold text-foreground mb-2">{coords.name}</div>
                            <div className="space-y-1 text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Failures:</span>
                                <span className="font-semibold text-red-500">{stats.count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Funding Lost:</span>
                                <span className="font-semibold text-amber-500">{formatCurrency(stats.totalFunding)}</span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-white dark:border-t-slate-800" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="text-xs font-semibold mb-2">Failure Intensity</div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-xs">Low</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-xs">Med</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-xs">High</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Country breakdown */}
                {analytics?.byCountry && analytics.byCountry.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                    {analytics.byCountry.slice(0, 10).map((item: any, idx: number) => (
                      <Button
                        key={idx}
                        variant={filters.country === item._id ? "default" : "outline"}
                        className="justify-start h-auto py-3"
                        onClick={() => setFilters({ ...filters, country: filters.country === item._id ? '' : item._id })}
                      >
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div className="text-left truncate">
                          <div className="font-medium truncate">{item._id}</div>
                          <div className="text-xs opacity-70">{item.count} failures</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reasons Tab */}
          <TabsContent value="reasons">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Failure Reasons
                  </CardTitle>
                  <CardDescription>
                    Why startups fail - ranked by frequency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.byReason?.slice(0, 8).map((item: any, idx: number) => {
                    const percentage = analytics.totalFailures > 0 
                      ? (item.count / analytics.totalFailures) * 100 
                      : 0;
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={`${reasonColors[item._id] || 'bg-gray-500'} text-white text-xs`}>
                              #{idx + 1}
                            </Badge>
                            <span className="text-sm font-medium">{item._id}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>What the data tells us</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                    <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400 mb-2">
                      <DollarSign className="h-5 w-5" />
                      Cash is King
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Running out of cash remains the #1 killer of startups. Most failures happen within 18 months of last funding.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900">
                    <div className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400 mb-2">
                      <Users className="h-5 w-5" />
                      Market Validation
                    </div>
                    <p className="text-sm text-orange-600 dark:text-orange-300">
                      "No market need" is often discovered too late. 42% of failed startups built products nobody wanted.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400 mb-2">
                      <TrendingUp className="h-5 w-5" />
                      Competition
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Getting outcompeted increases with company age. First-mover advantage means less than best execution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Industries Tab */}
          <TabsContent value="industries">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Failures by Industry
                  </CardTitle>
                  <CardDescription>
                    Which sectors see the most failures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.byIndustry?.map((item: any, idx: number) => {
                      const percentage = analytics.totalFailures > 0 
                        ? (item.count / analytics.totalFailures) * 100 
                        : 0;
                      return (
                        <Button
                          key={idx}
                          variant={filters.industry === item._id ? "default" : "ghost"}
                          className="w-full justify-between h-auto py-3"
                          onClick={() => setFilters({ ...filters, industry: filters.industry === item._id ? '' : item._id })}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{industryIcons[item._id] || '📦'}</span>
                            <span className="font-medium">{item._id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{item.count}</span>
                            <Badge variant="outline">{percentage.toFixed(0)}%</Badge>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Industry Risk Factors</CardTitle>
                  <CardDescription>Common patterns per industry</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">💻</span>
                      <span className="font-semibold">Technology</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      High competition, rapid market changes. Average lifespan: 22 months. Top cause: No market need.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🏥</span>
                      <span className="font-semibold">Healthcare</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Regulatory complexity, long sales cycles. Average lifespan: 36 months. Top cause: Legal challenges.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🛒</span>
                      <span className="font-semibold">E-commerce</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Thin margins, high CAC. Average lifespan: 24 months. Top cause: Pricing/Cost issues.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                  <Select 
                    value={filters.country || 'all'} 
                    onValueChange={(value) => setFilters({...filters, country: value === 'all' ? '' : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {analytics?.byCountry?.map((c: any) => (
                        <SelectItem key={c._id} value={c._id}>{c._id}</SelectItem>
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

            {/* Reports List */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Failure Reports</h2>
              <Button onClick={() => navigate('/failure-reports/submit')}>
                Share Your Story
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : reports.length > 0 ? (
              <div className="grid gap-6">
                {reports.map((report: any) => (
                  <Card 
                    key={report._id} 
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/failure-reports/${report._id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{industryIcons[report.industry] || '📦'}</span>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {report.anonymousPost ? 'Anonymous Startup' : report.startupName}
                            </CardTitle>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{report.industry}</Badge>
                            <Badge variant={getReasonColor(report.primaryReason as string)}>
                              {report.primaryReason}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 justify-end">
                            <MapPin className="h-4 w-4" />
                            {report.location.city}, {report.location.country}
                          </div>
                          <div className="flex items-center gap-1 justify-end mt-1">
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
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">{formatCurrency(report.fundingRaised)}</span>
                          <span className="text-muted-foreground">raised</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{report.teamSize}</span>
                          <span className="text-muted-foreground">team members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{report.operationalMonths}</span>
                          <span className="text-muted-foreground">months operational</span>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto group-hover:bg-primary group-hover:text-primary-foreground">
                          Read More <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                      {report.lessonsLearned && report.lessonsLearned.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Key Lesson:
                          </p>
                          <p className="text-sm text-muted-foreground italic">
                            "{report.lessonsLearned[0]}"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
