import { useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Clock, AlertCircle, BrainCircuit } from "lucide-react";
import { mockMarkets, mockAIAnalysis } from "@/lib/mockData";
import { formatCurrency, formatTimeRemaining, formatCategoryLabel, formatPercentage } from "@/lib/formatters";

const MarketDetails = () => {
  const { id } = useParams();
  const market = mockMarkets.find(m => m.id === id) || mockMarkets[0];
  const [selectedOutcome, setSelectedOutcome] = useState<"yes" | "no">("yes");

  const trendData = [
    { date: "Jan 15", yes: 65, no: 35 },
    { date: "Jan 18", yes: 66, no: 34 },
    { date: "Jan 21", yes: 67, no: 33 },
    { date: "Jan 24", yes: 68, no: 32 },
    { date: "Jan 27", yes: 67.5, no: 32.5 },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="border-primary/40 text-primary mb-4">
            {formatCategoryLabel(market.category)}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{market.title}</h1>
          <p className="text-muted-foreground text-lg">{market.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prediction Card */}
            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle>Place Your Prediction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={selectedOutcome === "yes" ? "default" : "outline"}
                    className={selectedOutcome === "yes" ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setSelectedOutcome("yes")}
                  >
                    Yes - {formatPercentage(market.yesOdds)}
                  </Button>
                  <Button
                    variant={selectedOutcome === "no" ? "default" : "outline"}
                    className={selectedOutcome === "no" ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => setSelectedOutcome("no")}
                  >
                    No - {formatPercentage(market.noOdds)}
                  </Button>
                </div>
                <Progress value={market.yesOdds} className="h-3" />
                <Button className="w-full bg-gradient-gold hover:shadow-glow-primary">
                  Confirm Prediction
                </Button>
              </CardContent>
            </Card>

            {/* Market Trend Chart */}
            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle>Market Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64 w-full">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="yes" stroke="hsl(142 76% 36%)" strokeWidth={2} />
                    <Line type="monotone" dataKey="no" stroke="hsl(0 72% 51%)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                  AI Oracle Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Confidence Score</span>
                  <span className="text-2xl font-bold text-primary">{mockAIAnalysis.confidenceScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sentiment</span>
                  <Badge className="bg-green-600">{mockAIAnalysis.sentiment}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data Sources</span>
                  <span className="font-semibold">{mockAIAnalysis.dataSources}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Key Factors:</p>
                  <ul className="space-y-1">
                    {mockAIAnalysis.keyFactors.map((factor, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {factor}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle>Market Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Pool Size</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(market.poolSize)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Participants</span>
                  </div>
                  <span className="font-semibold">{market.participants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Time Left</span>
                  </div>
                  <span className="font-semibold">{formatTimeRemaining(market.endDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                  <span className="font-semibold">{formatCurrency(market.volume24h)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Dispute */}
            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Dispute Resolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Disagree with the outcome? Submit a dispute with evidence.
                </p>
                <Button variant="outline" className="w-full border-primary/40">
                  Submit Dispute
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MarketDetails;