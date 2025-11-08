import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, Clock, Wallet } from "lucide-react";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { stakingWeb3Service } from "@/services/stakingWeb3";
import { useWallet } from "@/contexts/WalletContext";

const Staking = () => {
  const { address, isConnected } = useWallet();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("2592000"); // 30 days in seconds
  const [loading, setLoading] = useState(true);
  const [stakingData, setStakingData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStakingData();
  }, [address]);

  const fetchStakingData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview data
      const overviewData = await apiService.getStakingOverview();
      setOverview(overviewData.data);

      // Fetch user-specific data if connected
      if (address && isConnected) {
        const userStakingData = await apiService.getStakingInfo(address);
        setStakingData(userStakingData.data);
      }
    } catch (error) {
      console.error('Error fetching staking data:', error);
      toast.error('Failed to load staking data');
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info('Confirm transaction in your wallet...');

      const txHash = await stakingWeb3Service.stakeTokens(
        stakeAmount,
        parseInt(selectedPeriod),
        false // Set to true if registering as validator
      );

      toast.success('Tokens staked successfully!', {
        description: `Transaction: ${txHash.slice(0, 10)}...`
      });

      setStakeAmount('');
      await fetchStakingData();
    } catch (error: any) {
      console.error('Error staking tokens:', error);
      toast.error(error.message || 'Failed to stake tokens');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnstake = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info('Confirm transaction in your wallet...');

      const txHash = await stakingWeb3Service.unstakeTokens(unstakeAmount);

      toast.success('Tokens unstaked successfully!', {
        description: `Transaction: ${txHash.slice(0, 10)}...`
      });

      setUnstakeAmount('');
      await fetchStakingData();
    } catch (error: any) {
      console.error('Error unstaking tokens:', error);
      toast.error(error.message || 'Failed to unstake tokens');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info('Confirm transaction in your wallet...');

      const txHash = await stakingWeb3Service.claimRewards();

      toast.success('Rewards claimed successfully!', {
        description: `Transaction: ${txHash.slice(0, 10)}...`
      });

      await fetchStakingData();
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      toast.error(error.message || 'Failed to claim rewards');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading staking data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const totalStaked = stakingData?.amount || "0";
  const availableBalance = "0"; // Would need to fetch from ORX token contract
  const pendingRewards = stakingData?.pendingRewards || "0";
  const currentAPY = overview?.currentAPY || "18";
  const unlockDate = stakingData?.timestamp 
    ? new Date((stakingData.timestamp + stakingData.lockPeriod) * 1000)
    : new Date();


  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Staking</span>
          </h1>
          <p className="text-muted-foreground">Stake ORX tokens to earn rewards and participate in governance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Staked"
            value={formatCurrency(parseFloat(totalStaked))}
            icon={Coins}
          />
          <StatCard
            title="Available Balance"
            value={formatCurrency(parseFloat(availableBalance))}
            icon={Wallet}
          />
          <StatCard
            title="Pending Rewards"
            value={formatCurrency(parseFloat(pendingRewards))}
            icon={TrendingUp}
            trend="+5.2%"
            trendUp={true}
          />
          <StatCard
            title="Current APY"
            value={formatPercentage(parseFloat(currentAPY))}
            icon={Clock}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stake/Unstake Card */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle>Manage Staking</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="stake">
                  <TabsList className="grid w-full grid-cols-2 bg-card border border-primary/30 mb-6">
                    <TabsTrigger value="stake">Stake</TabsTrigger>
                    <TabsTrigger value="unstake">Unstake</TabsTrigger>
                  </TabsList>

                  <TabsContent value="stake" className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount to Stake</label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="bg-card border-primary/30 pr-16"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-primary"
                          onClick={() => setStakeAmount(availableBalance)}
                        >
                          MAX
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Available: {formatCurrency(parseFloat(availableBalance))} ORX
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Staking Period</label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="bg-card border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">
                            30 days - 15% APY
                          </SelectItem>
                          <SelectItem value="90">
                            90 days - 18% APY
                          </SelectItem>
                          <SelectItem value="180">
                            180 days - 22% APY
                          </SelectItem>
                          <SelectItem value="365">
                            365 days - 25% APY
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Annual Rewards</span>
                        <span className="font-semibold">
                          {formatCurrency(parseFloat(stakeAmount || "0") * (parseFloat(currentAPY) / 100))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lock Period</span>
                        <span className="font-semibold">{selectedPeriod} days</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-gold hover:shadow-glow-primary"
                      onClick={handleStake}
                      disabled={isSubmitting || !address || !stakeAmount || parseFloat(stakeAmount) <= 0}
                    >
                      {isSubmitting ? "Staking..." : "Stake ORX"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="unstake" className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount to Unstake</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="bg-card border-primary/30"
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Staked: {formatCurrency(parseFloat(totalStaked))} ORX
                      </p>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Unlock Date</p>
                      <p className="font-semibold">{formatDate(unlockDate)}</p>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full border-primary/40"
                      onClick={handleUnstake}
                      disabled={isSubmitting || !address || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                    >
                      {isSubmitting ? "Unstaking..." : "Unstake ORX"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Rewards Card */}
          <div className="space-y-6">
            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle>Pending Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <p className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
                    {formatCurrency(parseFloat(pendingRewards))}
                  </p>
                  <p className="text-sm text-muted-foreground">ORX Tokens</p>
                </div>
                <Button 
                  className="w-full bg-gradient-gold hover:shadow-glow-primary"
                  onClick={handleClaimRewards}
                  disabled={isSubmitting || !address || parseFloat(pendingRewards) <= 0}
                >
                  {isSubmitting ? "Claiming..." : "Claim Rewards"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardHeader>
                <CardTitle>Staking Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-muted-foreground">Earn passive income on your ORX holdings</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-muted-foreground">Participate in platform governance</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm text-muted-foreground">Higher APY for longer lock periods</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Staking;