import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Trophy, Target, Zap } from "lucide-react";
import { formatCurrency, formatPercentage, formatDate, formatPredictionOutcome } from "@/lib/formatters";
import { apiService } from "@/services/api";
import { toast } from "sonner";

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<any>('/users/portfolio');
        if (response.success && response.data) {
          setPortfolio(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        toast.error('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Loading portfolio...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!portfolio) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No portfolio data available</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const winRate = portfolio.resolvedPredictions > 0 
    ? (portfolio.wonPredictions / portfolio.resolvedPredictions) * 100 
    : 0;
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
            title="Total Returns"
            value={formatCurrency(parseFloat(portfolio.totalReturns))}
            icon={TrendingUp}
            trend={`${portfolio.returnPercentage}%`}
            trendUp={parseFloat(portfolio.returnPercentage) > 0}
          />
          <StatCard
            title="Win Rate"
            value={formatPercentage(winRate)}
            icon={Trophy}
          />
          <StatCard
            title="Total Invested"
            value={formatCurrency(parseFloat(portfolio.totalInvested))}
            icon={Target}
          />
          <StatCard
            title="Active Positions"
            value={portfolio.activePredictions.toString()}
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
                <TabsTrigger value="active">Active ({portfolio.activePredictions})</TabsTrigger>
                <TabsTrigger value="won">Won ({portfolio.wonPredictions})</TabsTrigger>
                <TabsTrigger value="history">History ({portfolio.resolvedPredictions})</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Market</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Odds</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.positions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No active predictions
                        </TableCell>
                      </TableRow>
                    ) : (
                      portfolio.positions.map((position: any) => (
                        <TableRow key={position.marketId}>
                          <TableCell className="font-medium">{position.marketTitle}</TableCell>
                          <TableCell>
                            <Badge className={position.outcome.toLowerCase() === "yes" ? "bg-green-600" : "bg-red-600"}>
                              {position.outcome}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(position.shares)}</TableCell>
                          <TableCell>{formatPercentage(position.averagePrice * 100)}</TableCell>
                          <TableCell>{formatCurrency(position.value)}</TableCell>
                          <TableCell className={position.unrealizedPnL >= 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(position.unrealizedPnL)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="won">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Market</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Resolved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.history.filter((h: any) => h.status === 'WON').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No won predictions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      portfolio.history
                        .filter((h: any) => h.status === 'WON')
                        .map((prediction: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{prediction.marketTitle}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-600">{prediction.outcome}</Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(prediction.shares)}</TableCell>
                            <TableCell className="text-green-600">
                              +{formatCurrency(prediction.pnl)} ({formatPercentage(prediction.pnlPercentage)})
                            </TableCell>
                            <TableCell>{formatDate(prediction.resolvedAt)}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="history">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Market</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resolved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolio.history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No resolved predictions
                        </TableCell>
                      </TableRow>
                    ) : (
                      portfolio.history.map((prediction: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{prediction.marketTitle}</TableCell>
                          <TableCell>
                            <Badge className={prediction.status === 'WON' ? "bg-green-600" : "bg-red-600"}>
                              {prediction.outcome}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(prediction.shares)}</TableCell>
                          <TableCell className={prediction.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                            {prediction.pnl >= 0 ? '+' : ''}{formatCurrency(prediction.pnl)} ({formatPercentage(prediction.pnlPercentage)})
                          </TableCell>
                          <TableCell>
                            <Badge variant={prediction.status === 'WON' ? 'default' : 'secondary'}>
                              {prediction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(prediction.resolvedAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Portfolio;