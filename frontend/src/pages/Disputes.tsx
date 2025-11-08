import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Clock, Users } from "lucide-react";
import { formatCurrency, formatDate, formatAddress } from "@/lib/formatters";
import { useEffect, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import apiService from "@/services/api";
import disputeWeb3Service from "@/services/disputeWeb3";
import { toast } from "sonner";

interface Dispute {
  id: number;
  marketId: number;
  challenger: string;
  evidence: string;
  votesFor: string;
  votesAgainst: string;
  totalVoters: number;
  deadline: number;
  resolved: boolean;
  upheld: boolean;
  stakeAmount: string;
}

const Disputes = () => {
  const { isConnected, address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [votingDispute, setVotingDispute] = useState<number | null>(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getActiveDisputes();
      setDisputes(data);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (disputeId: number, support: boolean) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setVotingDispute(disputeId);
      toast.info('Confirm transaction in your wallet...');

      const txHash = await disputeWeb3Service.voteOnDispute(disputeId, support ? 1 : 0);

      toast.success('Vote cast successfully!', {
        description: `Transaction: ${txHash.slice(0, 10)}...`
      });

      await fetchDisputes();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to cast vote');
    } finally {
      setVotingDispute(null);
    }
  };
  const getStatusColor = (dispute: Dispute) => {
    if (dispute.resolved) {
      return dispute.upheld ? "bg-green-600" : "bg-red-600";
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (now > dispute.deadline) return "bg-gray-600";
    
    return "bg-yellow-600";
  };

  const getStatusLabel = (dispute: Dispute) => {
    if (dispute.resolved) {
      return dispute.upheld ? "Upheld" : "Rejected";
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (now > dispute.deadline) return "Voting Ended";
    
    return "Voting Open";
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading disputes...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Dispute Center</span>
          </h1>
          <p className="text-muted-foreground">Review and vote on market outcome disputes</p>
        </div>

        <div className="space-y-6">
          {disputes.length === 0 ? (
            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No active disputes</p>
              </CardContent>
            </Card>
          ) : (
            disputes.map((dispute) => {
              const totalVotes = BigInt(dispute.votesFor) + BigInt(dispute.votesAgainst);
              const forPercentage = totalVotes > 0 
                ? Number((BigInt(dispute.votesFor) * BigInt(100)) / totalVotes)
                : 0;

            return (
              <Card key={dispute.id} className="bg-gradient-card backdrop-blur-sm border-primary/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl">Market #{dispute.marketId} Dispute</CardTitle>
                        <Badge className={getStatusColor(dispute)}>
                          {getStatusLabel(dispute)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Challenged by {formatAddress(dispute.challenger)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-card/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Evidence Submitted:</p>
                    <p className="text-sm text-muted-foreground">{dispute.evidence}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Votes For</p>
                        <p className="font-bold text-green-500">{parseInt(dispute.votesFor)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Votes Against</p>
                        <p className="font-bold text-red-500">{parseInt(dispute.votesAgainst)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Voting Ends</p>
                        <p className="font-bold">{formatDate(new Date(dispute.deadline * 1000))}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Community Vote</span>
                      <span className="font-semibold">{forPercentage.toFixed(1)}% Support</span>
                    </div>
                    <Progress value={forPercentage} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Stake Required: </span>
                      <span className="font-semibold">{formatCurrency(parseInt(dispute.stakeAmount) / 1e18)}</span>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVote(dispute.id, true)}
                        disabled={votingDispute === dispute.id || !address}
                      >
                        {votingDispute === dispute.id ? "Voting..." : "Vote For"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-red-600 text-red-600 hover:bg-red-600/10"
                        onClick={() => handleVote(dispute.id, false)}
                        disabled={votingDispute === dispute.id || !address}
                      >
                        {votingDispute === dispute.id ? "Voting..." : "Vote Against"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Disputes;