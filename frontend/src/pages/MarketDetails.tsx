import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Clock, AlertCircle, BrainCircuit } from "lucide-react";
import { formatCurrency, formatTimeRemaining, formatCategoryLabel, formatPercentage } from "@/lib/formatters";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { web3Service } from "@/services/web3";

const MarketDetails = () => {
  const { id } = useParams();
  const { isConnected, address } = useWallet();
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0);
  const [predictionAmount, setPredictionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMarketDetails();
  }, [id]);

  const handlePredictionSubmit = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!predictionAmount || parseFloat(predictionAmount) <= 0) {
      toast.error('Please enter a valid prediction amount');
      return;
    }

    if (!market?.outcomes || !market.outcomes[selectedOutcome]) {
      toast.error('Please select an outcome');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedOutcomeData = market.outcomes[selectedOutcome];
      
      // Save prediction to database
      const response = await apiService.post<any>(`/markets/${market.id}/bet`, {
        outcomeId: selectedOutcomeData.id,
        amount: predictionAmount,
        odds: selectedOutcomeData.probability / 100, // Convert percentage to decimal
        txHash: '0xpending' // Placeholder for now, blockchain integration coming soon
      });

      toast.success('Prediction placed successfully!', {
        description: `You bet ${predictionAmount} on ${selectedOutcomeData.name}`
      });

      // Refresh market data
      await fetchMarketDetails();
      setPredictionAmount('');
      
    } catch (error: any) {
      console.error('Failed to place prediction:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to place prediction';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMarketDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await apiService.getMarket(id);
      if (response.success && response.data) {
        setMarket(response.data);
      } else {
        toast.error('Market not found');
      }
    } catch (error) {
      console.error('Failed to fetch market details:', error);
      toast.error('Failed to load market details');
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeSubmit = async () => {
    try {
      toast.info('Dispute submission pending blockchain integration');
      // TODO: Implement dispute submission to blockchain
      // await disputeContract.submitDispute(market.id, evidence);
    } catch (error) {
      console.error('Failed to submit dispute:', error);
      toast.error('Failed to submit dispute');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Loading market details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!market) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Market not found</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Calculate odds from outcomes
  const totalVolume = market.outcomes?.reduce((sum: number, outcome: any) => 
    sum + parseFloat(outcome.totalStaked || 0), 0) || 1;
  
  const outcomes = market.outcomes?.map((outcome: any) => ({
    ...outcome,
    odds: totalVolume > 0 ? (parseFloat(outcome.totalStaked || 0) / totalVolume) * 100 : 50
  })) || [];

  const trendData = [
    { date: "Jan 15", yes: outcomes[0]?.odds || 50, no: outcomes[1]?.odds || 50 },
    { date: "Jan 18", yes: outcomes[0]?.odds || 50, no: outcomes[1]?.odds || 50 },
    { date: "Jan 21", yes: outcomes[0]?.odds || 50, no: outcomes[1]?.odds || 50 },
    { date: "Jan 24", yes: outcomes[0]?.odds || 50, no: outcomes[1]?.odds || 50 },
    { date: "Jan 27", yes: outcomes[0]?.odds || 50, no: outcomes[1]?.odds || 50 },
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
                  {outcomes.map((outcome: any, index: number) => (
                    <Button
                      key={outcome.id}
                      variant={selectedOutcome === index ? "default" : "outline"}
                      className={selectedOutcome === index ? (index === 0 ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700") : ""}
                      onClick={() => setSelectedOutcome(index)}
                    >
                      {outcome.name} - {formatPercentage(outcome.odds)}
                    </Button>
                  ))}
                </div>
                <Progress value={outcomes[0]?.odds || 50} className="h-3" />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (USDT)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={predictionAmount}
                    onChange={(e) => setPredictionAmount(e.target.value)}
                    className="bg-card border-primary/30"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Potential Return: {predictionAmount && outcomes[selectedOutcome] 
                      ? formatCurrency(parseFloat(predictionAmount) * (outcomes[selectedOutcome].odds / 100))
                      : '$0.00'}
                  </p>
                </div>

                <Button 
                  className="w-full bg-gradient-gold hover:shadow-glow-primary"
                  onClick={handlePredictionSubmit}
                  disabled={isSubmitting || !predictionAmount}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Prediction'}
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
                  <span className="text-2xl font-bold text-primary">
                    {market.aiAnalysis?.confidence || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sentiment</span>
                  <Badge className="bg-green-600">
                    {market.aiAnalysis?.sentiment || 'Analyzing...'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data Sources</span>
                  <span className="font-semibold">
                    {market.aiAnalysis?.dataSources || 'Multiple'}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Analysis:</p>
                  <p className="text-sm text-muted-foreground">
                    {market.aiAnalysis?.summary || 'AI analysis pending...'}
                  </p>
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
                  <span className="font-semibold">{formatCurrency(parseFloat(market.totalVolume || 0))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Participants</span>
                  </div>
                  <span className="font-semibold">{market.predictions?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Time Left</span>
                  </div>
                  <span className="font-semibold">{formatTimeRemaining(new Date(market.endDate))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={market.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {market.status}
                  </Badge>
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
                <Button 
                  variant="outline" 
                  className="w-full border-primary/40"
                  onClick={handleDisputeSubmit}
                >
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