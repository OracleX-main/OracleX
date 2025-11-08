import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCheck, Clock, Users, Plus } from "lucide-react";
import { formatNumber, formatDate, formatProposalStatus } from "@/lib/formatters";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import apiService from "@/services/api";
import governanceWeb3Service from "@/services/governanceWeb3";
import { toast } from "sonner";

interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  startTime: number;
  endTime: number;
  executed: boolean;
  canceled: boolean;
  quorum: string;
}

const Governance = () => {
  const { isConnected, address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'passed' | 'all'>('active');
  const [votingProposal, setVotingProposal] = useState<number | null>(null);

  useEffect(() => {
    fetchProposals();
  }, [activeTab]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      let data: Proposal[];
      
      if (activeTab === 'active') {
        data = await apiService.getActiveProposals();
      } else {
        // Get all proposals and filter if needed
        data = await apiService.getProposals();
        
        if (activeTab === 'passed') {
          data = data.filter(p => {
            const now = Math.floor(Date.now() / 1000);
            if (p.executed || p.canceled) return false;
            if (now <= p.endTime) return false;
            
            const totalVotes = BigInt(p.forVotes) + BigInt(p.againstVotes) + BigInt(p.abstainVotes);
            const quorumReached = totalVotes >= BigInt(p.quorum);
            const passed = BigInt(p.forVotes) > BigInt(p.againstVotes);
            
            return quorumReached && passed;
          });
        }
      }
      
      setProposals(data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, support: 0 | 1 | 2) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setVotingProposal(proposalId);
      toast.info('Confirm transaction in your wallet...');

      const txHash = await governanceWeb3Service.castVote(proposalId, support);

      toast.success('Vote cast successfully!', {
        description: `Transaction: ${txHash.slice(0, 10)}...`
      });

      await fetchProposals();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to cast vote');
    } finally {
      setVotingProposal(null);
    }
  };
  const getStatusColor = (proposal: Proposal) => {
    if (proposal.canceled) return "bg-gray-600";
    if (proposal.executed) return "bg-blue-600";
    
    const now = Math.floor(Date.now() / 1000);
    if (now > proposal.endTime) {
      const totalVotes = BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes);
      const quorumReached = totalVotes >= BigInt(proposal.quorum);
      const passed = BigInt(proposal.forVotes) > BigInt(proposal.againstVotes);
      
      if (quorumReached && passed) return "bg-green-600";
      return "bg-red-600";
    }
    
    return "bg-yellow-600";
  };

  const getStatusLabel = (proposal: Proposal) => {
    if (proposal.canceled) return "Canceled";
    if (proposal.executed) return "Executed";
    
    const now = Math.floor(Date.now() / 1000);
    if (now > proposal.endTime) {
      const totalVotes = BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes);
      const quorumReached = totalVotes >= BigInt(proposal.quorum);
      const passed = BigInt(proposal.forVotes) > BigInt(proposal.againstVotes);
      
      if (quorumReached && passed) return "Passed";
      return "Rejected";
    }
    
    return "Active";
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading proposals...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-gold bg-clip-text text-transparent">DAO Governance</span>
            </h1>
            <p className="text-muted-foreground">Vote on proposals and shape the future of OracleX</p>
          </div>
          <Button className="gap-2 bg-gradient-gold hover:shadow-glow-primary">
            <Plus className="w-4 h-4" />
            Create Proposal
          </Button>
        </div>

        <Tabs defaultValue="active" className="mb-8" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="bg-card border border-primary/30">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-6">
          {proposals.length === 0 ? (
            <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No proposals found</p>
              </CardContent>
            </Card>
          ) : (
            proposals.map((proposal) => {
              const totalVotes = BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes);
              const forPercentage = totalVotes > 0 
                ? Number((BigInt(proposal.forVotes) * BigInt(100)) / totalVotes)
                : 0;
              const quorumPercentage = Number((totalVotes * BigInt(100)) / BigInt(proposal.quorum));

            return (
              <Card key={proposal.id} className="bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{proposal.title}</CardTitle>
                        <Badge className={getStatusColor(proposal)}>
                          {getStatusLabel(proposal)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{proposal.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <BadgeCheck className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">For</p>
                        <p className="font-bold text-green-500">{formatNumber(parseInt(proposal.forVotes))}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Against</p>
                        <p className="font-bold text-red-500">{formatNumber(parseInt(proposal.againstVotes))}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ends</p>
                        <p className="font-bold">{formatDate(new Date(proposal.endTime * 1000))}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Voting Progress</span>
                      <span className="font-semibold">{forPercentage.toFixed(1)}% For</span>
                    </div>
                    <Progress value={forPercentage} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quorum</span>
                      <span className="font-semibold">{quorumPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={quorumPercentage} className="h-2" />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleVote(proposal.id, 1)}
                      disabled={votingProposal === proposal.id || !address}
                    >
                      {votingProposal === proposal.id ? "Voting..." : "Vote For"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-red-600 text-red-600 hover:bg-red-600/10"
                      onClick={() => handleVote(proposal.id, 0)}
                      disabled={votingProposal === proposal.id || !address}
                    >
                      {votingProposal === proposal.id ? "Voting..." : "Vote Against"}
                    </Button>
                    <Link to={`/governance/${proposal.id}`}>
                      <Button variant="outline" className="border-primary/40">
                        View Details
                      </Button>
                    </Link>
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

export default Governance;