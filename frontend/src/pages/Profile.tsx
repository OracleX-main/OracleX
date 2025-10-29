import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, ExternalLink } from "lucide-react";
import { mockUserPortfolio, mockUserPredictions, mockTransactions } from "@/lib/mockData";
import { formatCurrency, formatPercentage, formatAddress, formatDate, formatTransactionType } from "@/lib/formatters";

const Profile = () => {
  const userAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

  const copyAddress = () => {
    navigator.clipboard.writeText(userAddress);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                  {userAddress.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold">Anonymous User</h1>
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Rank #{mockUserPortfolio.rank}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <code className="text-sm text-muted-foreground">{formatAddress(userAddress)}</code>
                  <Button size="icon" variant="ghost" onClick={copyAddress}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/40">Top Predictor</Badge>
                  <Badge className="bg-primary/20 text-primary border-primary/40">Crypto Expert</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{mockUserPortfolio.reputationScore}</p>
                  <p className="text-sm text-muted-foreground">Reputation</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{mockUserPortfolio.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Streak</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-2">{formatCurrency(mockUserPortfolio.totalEarned)}</p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-2">{formatPercentage(mockUserPortfolio.winRate)}</p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-2">{formatPercentage(mockUserPortfolio.accuracyScore)}</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-primary mb-2">{mockUserPortfolio.activePredictions}</p>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Market</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUserPredictions.map((prediction) => (
                      <TableRow key={prediction.id}>
                        <TableCell className="font-medium">{prediction.marketTitle}</TableCell>
                        <TableCell>
                          <Badge className={prediction.outcome === "yes" ? "bg-green-600" : "bg-red-600"}>
                            {prediction.outcome.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(prediction.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(prediction.placedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="transactions">
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
                    {mockTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/40">
                            {formatTransactionType(tx.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{tx.marketTitle}</TableCell>
                        <TableCell className="text-primary">{formatCurrency(tx.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(tx.timestamp)}</TableCell>
                      </TableRow>
                    ))}
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

export default Profile;