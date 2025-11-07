import PageLayout from "@/components/layout/PageLayout";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { TrendingUp, Users, Target, AlertCircle } from "lucide-react";
import { formatNumber, formatCurrency, formatPercentage } from "@/lib/formatters";
import { useEffect, useState } from "react";
import apiService from "@/services/api";

interface AnalyticsOverview {
  totalVolume: number;
  totalMarkets: number;
  totalUsers: number;
  activeUsers: number;
  totalPredictions: number;
  aiAccuracy: number;
  disputeRate: number;
}

const Analytics = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch overview data
        const overviewResponse = await apiService.getAnalyticsOverview();
        if (overviewResponse.success) {
          setOverview(overviewResponse.data);
        }

        // Fetch volume data
        const volumeResponse = await apiService.getAnalyticsVolume('30d');
        if (volumeResponse.success && volumeResponse.data.daily) {
          setVolumeData(volumeResponse.data.daily.slice(-6)); // Last 6 periods
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const categoryData = [
    { name: "Crypto", value: 35, color: "hsl(45 100% 51%)" },
    { name: "Sports", value: 25, color: "hsl(38 92% 50%)" },
    { name: "Politics", value: 20, color: "hsl(32 88% 45%)" },
    { name: "AI Trends", value: 15, color: "hsl(142 76% 36%)" },
    { name: "Other", value: 5, color: "hsl(222 47% 15%)" },
  ];

  const accuracyData = [
    { week: "Week 1", ai: 88, community: 82 },
    { week: "Week 2", ai: 89, community: 84 },
    { week: "Week 3", ai: 87, community: 83 },
    { week: "Week 4", ai: 90, community: 85 },
  ];

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !overview) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <p className="text-red-500">{error || 'Failed to load analytics'}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Platform Analytics</span>
          </h1>
          <p className="text-muted-foreground">Monitor platform performance and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Volume"
            value={formatCurrency(overview.totalVolume)}
            icon={TrendingUp}
            trend="+18.2%"
            trendUp={true}
          />
          <StatCard
            title="Active Users"
            value={formatNumber(overview.activeUsers)}
            icon={Users}
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title="AI Accuracy"
            value={formatPercentage(overview.aiAccuracy / 100)}
            icon={Target}
            trend="+2.1%"
            trendUp={true}
          />
          <StatCard
            title="Dispute Rate"
            value={formatPercentage(overview.disputeRate / 100)}
            icon={AlertCircle}
            trend="-0.5%"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Volume Chart */}
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardHeader>
              <CardTitle>Monthly Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80 w-full">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="volume" fill="hsl(45 100% 51%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardHeader>
              <CardTitle>Markets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80 w-full">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Accuracy Comparison */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle>AI vs Community Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-80 w-full">
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="ai" stroke="hsl(45 100% 51%)" strokeWidth={2} name="AI Oracle" />
                <Line type="monotone" dataKey="community" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Community" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Analytics;