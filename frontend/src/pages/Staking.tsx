import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, Clock, Wallet } from "lucide-react";
import { mockStakingData } from "@/lib/mockData";
import { formatCurrency, formatPercentage, formatDate, formatStakingPeriod } from "@/lib/formatters";
import { StakingPeriod } from "@/lib/enums";

const Staking = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<StakingPeriod>(StakingPeriod.FLEXIBLE);

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
            value={formatCurrency(mockStakingData.totalStaked)}
            icon={Coins}
          />
          <StatCard
            title="Available Balance"
            value={formatCurrency(mockStakingData.availableBalance)}
            icon={Wallet}
          />
          <StatCard
            title="Pending Rewards"
            value={formatCurrency(mockStakingData.pendingRewards)}
            icon={TrendingUp}
            trend="+5.2%"
            trendUp={true}
          />
          <StatCard
            title="Current APY"
            value={formatPercentage(mockStakingData.apy)}
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
                          onClick={() => setStakeAmount(mockStakingData.availableBalance.toString())}
                        >
                          MAX
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Available: {formatCurrency(mockStakingData.availableBalance)} ORX
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Staking Period</label>
                      <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as StakingPeriod)}>
                        <SelectTrigger className="bg-card border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={StakingPeriod.FLEXIBLE}>
                            {formatStakingPeriod(StakingPeriod.FLEXIBLE)} - 12% APY
                          </SelectItem>
                          <SelectItem value={StakingPeriod.THIRTY_DAYS}>
                            {formatStakingPeriod(StakingPeriod.THIRTY_DAYS)} - 15% APY
                          </SelectItem>
                          <SelectItem value={StakingPeriod.NINETY_DAYS}>
                            {formatStakingPeriod(StakingPeriod.NINETY_DAYS)} - 18% APY
                          </SelectItem>
                          <SelectItem value={StakingPeriod.ONE_YEAR}>
                            {formatStakingPeriod(StakingPeriod.ONE_YEAR)} - 25% APY
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Annual Rewards</span>
                        <span className="font-semibold">
                          {formatCurrency(parseFloat(stakeAmount || "0") * 0.18)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lock Period</span>
                        <span className="font-semibold">{formatStakingPeriod(selectedPeriod)}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-gold hover:shadow-glow-primary">
                      Stake ORX
                    </Button>
                  </TabsContent>

                  <TabsContent value="unstake" className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount to Unstake</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="bg-card border-primary/30"
                      />
                      <p className="text-sm text-muted-foreground">
                        Staked: {formatCurrency(mockStakingData.totalStaked)} ORX
                      </p>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Unlock Date</p>
                      <p className="font-semibold">{formatDate(mockStakingData.unlockDate)}</p>
                    </div>

                    <Button variant="outline" className="w-full border-primary/40">
                      Unstake ORX
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
                    {formatCurrency(mockStakingData.pendingRewards)}
                  </p>
                  <p className="text-sm text-muted-foreground">ORX Tokens</p>
                </div>
                <Button className="w-full bg-gradient-gold hover:shadow-glow-primary">
                  Claim Rewards
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