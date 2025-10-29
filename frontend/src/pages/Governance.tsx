import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCheck, Clock, Users, Plus } from "lucide-react";
import { mockProposals } from "@/lib/mockData";
import { formatNumber, formatDate, formatProposalStatus } from "@/lib/formatters";
import { Link } from "react-router-dom";

const Governance = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-600";
      case "passed": return "bg-blue-600";
      case "rejected": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

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

        <Tabs defaultValue="active" className="mb-8">
          <TabsList className="bg-card border border-primary/30">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-6">
          {mockProposals.map((proposal) => {
            const totalVotes = proposal.votesFor + proposal.votesAgainst;
            const forPercentage = (proposal.votesFor / totalVotes) * 100;
            const quorumPercentage = (totalVotes / proposal.quorum) * 100;

            return (
              <Card key={proposal.id} className="bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{proposal.title}</CardTitle>
                        <Badge className={getStatusColor(proposal.status)}>
                          {formatProposalStatus(proposal.status)}
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
                        <p className="font-bold text-green-500">{formatNumber(proposal.votesFor)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Against</p>
                        <p className="font-bold text-red-500">{formatNumber(proposal.votesAgainst)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ends</p>
                        <p className="font-bold">{formatDate(proposal.votingEndsAt)}</p>
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
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Vote For
                    </Button>
                    <Button variant="outline" className="flex-1 border-red-600 text-red-600 hover:bg-red-600/10">
                      Vote Against
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
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default Governance;