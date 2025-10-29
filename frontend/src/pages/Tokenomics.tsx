import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { Coins, Users, TrendingUp, Lock } from "lucide-react";

const Tokenomics = () => {
  const distributionData = [
    { name: "Public Sale", value: 30, color: "hsl(45 100% 51%)" },
    { name: "Team & Advisors", value: 20, color: "hsl(38 92% 50%)" },
    { name: "Ecosystem Fund", value: 25, color: "hsl(32 88% 45%)" },
    { name: "Staking Rewards", value: 15, color: "hsl(142 76% 36%)" },
    { name: "Liquidity", value: 10, color: "hsl(222 47% 15%)" },
  ];

  const utilityPoints = [
    { icon: Coins, title: "Governance", description: "Vote on protocol upgrades and parameter changes" },
    { icon: TrendingUp, title: "Staking Rewards", description: "Earn passive income by staking ORX tokens" },
    { icon: Users, title: "Market Creation", description: "Create and curate prediction markets" },
    { icon: Lock, title: "Dispute Resolution", description: "Stake tokens to participate in dispute voting" },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Tokenomics</span>
          </h1>
          <p className="text-muted-foreground">Understanding the ORX token economy</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Supply</p>
              <p className="text-3xl font-bold text-primary">100M</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Circulating</p>
              <p className="text-3xl font-bold text-primary">45M</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Market Cap</p>
              <p className="text-3xl font-bold text-primary">$45M</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Staking APY</p>
              <p className="text-3xl font-bold text-primary">18.5%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Token Distribution */}
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardHeader>
              <CardTitle>Token Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80 w-full">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Vesting Schedule */}
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardHeader>
              <CardTitle>Vesting Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Public Sale</span>
                  <span className="font-semibold">Immediate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Team & Advisors</span>
                  <span className="font-semibold">24 months linear</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ecosystem Fund</span>
                  <span className="font-semibold">48 months linear</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Staking Rewards</span>
                  <span className="font-semibold">60 months linear</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Liquidity</span>
                  <span className="font-semibold">Immediate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Utility */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle>Token Utility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {utilityPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{point.title}</h3>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Tokenomics;