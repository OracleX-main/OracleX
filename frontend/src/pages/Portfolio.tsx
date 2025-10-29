import PageLayout from "@/components/layout/PageLayout";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Trophy, Target, Zap } from "lucide-react";
import { mockUserPortfolio, mockUserPredictions } from "@/lib/mockData";
import { formatCurrency, formatPercentage, formatDate, formatPredictionOutcome } from "@/lib/formatters";

const Portfolio = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Portfolio</span>
          </h1>
          <p className="text-muted-foreground">Track your predictions and earnings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Earned"
            value={formatCurrency(mockUserPortfolio.totalEarned)}
            icon={TrendingUp}
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title="Win Rate"
            value={formatPercentage(mockUserPortfolio.winRate)}
            icon={Trophy}
            trend="+3.2%"
            trendUp={true}
          />
          <StatCard
            title="Accuracy Score"
            value={formatPercentage(mockUserPortfolio.accuracyScore)}
            icon={Target}
          />
          <StatCard
            title="Current Streak"
            value={mockUserPortfolio.currentStreak}
            icon={Zap}
          />
        </div>

        {/* Predictions Table */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle>Your Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="bg-card border border-primary/30 mb-6">
                <TabsTrigger value="active">Active ({mockUserPortfolio.activePredictions})</TabsTrigger>
                <TabsTrigger value="won">Won ({mockUserPortfolio.totalWon})</TabsTrigger>
                <TabsTrigger value="lost">Lost ({mockUserPortfolio.totalLost})</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Market</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Odds</TableHead>
                      <TableHead>Potential Return</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUserPredictions.map((prediction) => (
                      <TableRow key={prediction.id}>
                        <TableCell className="font-medium">{prediction.marketTitle}</TableCell>
                        <TableCell>
                          <Badge className={prediction.outcome === "yes" ? "bg-green-600" : "bg-red-600"}>
                            {formatPredictionOutcome(prediction.outcome)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(prediction.amount)}</TableCell>
                        <TableCell>{formatPercentage(prediction.odds)}</TableCell>
                        <TableCell className="text-primary font-semibold">
                          {formatCurrency(prediction.potentialReturn)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(prediction.placedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="won">
                <div className="text-center py-12 text-muted-foreground">
                  No won predictions yet
                </div>
              </TabsContent>

              <TabsContent value="lost">
                <div className="text-center py-12 text-muted-foreground">
                  No lost predictions yet
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Portfolio;