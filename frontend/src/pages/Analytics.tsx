import PageLayout from "@/components/layout/PageLayout";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { TrendingUp, Users, Target, AlertCircle } from "lucide-react";
import { mockAnalytics } from "@/lib/mockData";
import { formatNumber, formatCurrency, formatPercentage } from "@/lib/formatters";

const Analytics = () => {
  const volumeData = [
    { month: "Jan", volume: 180000 },
    { month: "Feb", volume: 220000 },
    { month: "Mar", volume: 280000 },
    { month: "Apr", volume: 350000 },
    { month: "May", volume: 420000 },
    { month: "Jun", volume: 520000 },
  ];

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
            value={formatCurrency(mockAnalytics.totalVolume)}
            icon={TrendingUp}
            trend="+18.2%"
            trendUp={true}
          />
          <StatCard
            title="Active Users"
            value={formatNumber(mockAnalytics.activeUsers)}
            icon={Users}
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title="AI Accuracy"
            value={formatPercentage(mockAnalytics.averageAccuracy)}
            icon={Target}
            trend="+2.1%"
            trendUp={true}
          />
          <StatCard
            title="Dispute Rate"
            value={formatPercentage(mockAnalytics.disputeRate)}
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