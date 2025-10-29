import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award } from "lucide-react";
import { mockLeaderboard } from "@/lib/mockData";
import { formatCurrency, formatPercentage, formatAddress } from "@/lib/formatters";
import { TimeFilter } from "@/lib/enums";

const Leaderboard = () => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-muted-foreground font-bold">#{rank}</span>;
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-gold bg-clip-text text-transparent">Leaderboard</span>
            </h1>
            <p className="text-muted-foreground">Top predictors by accuracy and earnings</p>
          </div>
          <Select defaultValue={TimeFilter.ALL_TIME}>
            <SelectTrigger className="w-48 bg-card border-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TimeFilter.ALL_TIME}>All Time</SelectItem>
              <SelectItem value={TimeFilter.THIS_MONTH}>This Month</SelectItem>
              <SelectItem value={TimeFilter.THIS_WEEK}>This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {mockLeaderboard.map((entry) => (
            <Card key={entry.rank} className="bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{entry.username}</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatAddress(entry.address)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.badges.map((badge, i) => (
                        <Badge key={i} variant="outline" className="border-primary/40 text-primary">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-8 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Earned</p>
                      <p className="font-bold text-primary">{formatCurrency(entry.totalEarned)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                      <p className="font-bold">{formatPercentage(entry.winRate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                      <p className="font-bold">{formatPercentage(entry.accuracyScore)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Predictions</p>
                      <p className="font-bold">{entry.totalPredictions}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Leaderboard;