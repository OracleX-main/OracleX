import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, ExternalLink } from "lucide-react";
import { formatCurrency, formatPercentage, formatAddress, formatDate } from "@/lib/formatters";
import { useWallet } from "@/contexts/WalletContext";
import { useEffect, useState } from "react";
import apiService from "@/services/api";

interface UserProfile {
  id: string;
  walletAddress: string;
  reputation: number;
  joinedAt: string;
  stats: {
    marketsCreated: number;
    marketsParticipated: number;
    totalPredictions: number;
    activePredictions: number;
    totalVolume: string;
    totalEarned: string;
    winRate: number;
    avgReturn: number;
  };
}

interface Transaction {
  id: string;
  type: string;
  marketId: string;
  marketTitle: string;
  outcome: string;
  amount: number;
  odds: number;
  potential: number;
  timestamp: string;
  status: string;
  txHash?: string;
}

interface Prediction {
  marketId: string;
  marketTitle: string;
  outcome: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  unrealizedPnL: number;
  status: string;
}

const Profile = () => {
  const { address } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile data
        const profileResponse = await apiService.getUserProfile();
        if (profileResponse.success) {
          setProfile(profileResponse.data);
        }

        // Fetch portfolio data for predictions
        const portfolioResponse = await apiService.getUserPortfolio();
        if (portfolioResponse.success) {
          setPredictions(portfolioResponse.data.positions || []);
        }

        // Fetch transactions
        const transactionsResponse = await apiService.getUserTransactions();
        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.data || []);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchProfileData();
    }
  }, [address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading profile...</div>
        </div>
      </PageLayout>
    );
  }

  if (error || !profile) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-red-500">{error || 'Profile not found'}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                  {profile.walletAddress.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold">Anonymous User</h1>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <code className="text-sm text-muted-foreground">{formatAddress(profile.walletAddress)}</code>
                  <Button size="icon" variant="ghost" onClick={copyAddress}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <a 
                      href={`https://testnet.bscscan.com/address/${profile.walletAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{profile.reputation}</p>
                  <p className="text-sm text-muted-foreground">Reputation</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{profile.stats.marketsCreated}</p>
                  <p className="text-sm text-muted-foreground">Markets</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-2">{formatCurrency(parseFloat(profile.stats.totalEarned))}</p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-2">{formatPercentage(profile.stats.winRate / 100)}</p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-2">{profile.stats.marketsParticipated}</p>
              <p className="text-sm text-muted-foreground">Markets</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-2">{profile.stats.activePredictions}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="predictions">
              <TabsList className="bg-card border border-primary/30 mb-6">
                <TabsTrigger value="predictions">Predictions</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="predictions">
                {predictions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Market</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.map((prediction) => (
                        <TableRow key={prediction.marketId}>
                          <TableCell className="font-medium">{prediction.marketTitle}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-primary/40">
                              {prediction.outcome}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(prediction.shares)}</TableCell>
                          <TableCell>
                            <Badge className={
                              prediction.status === 'WON' ? 'bg-green-600' : 
                              prediction.status === 'LOST' ? 'bg-red-600' : 
                              'bg-blue-600'
                            }>
                              {prediction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No active predictions yet
                  </div>
                )}
              </TabsContent>

              <TabsContent value="transactions">
                {transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <Badge variant="outline" className="border-primary/40">
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{tx.marketTitle}</TableCell>
                          <TableCell className="text-primary">{formatCurrency(tx.amount)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(new Date(tx.timestamp))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No transactions yet
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Profile;