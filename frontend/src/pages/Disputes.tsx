import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Clock, Users } from "lucide-react";
import { mockDisputes } from "@/lib/mockData";
import { formatCurrency, formatDate, formatDisputeStatus, formatAddress } from "@/lib/formatters";

const Disputes = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-yellow-600";
      case "voting": return "bg-blue-600";
      case "resolved": return "bg-green-600";
      case "rejected": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

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
          {mockDisputes.map((dispute) => {
            const totalVotes = dispute.votesFor + dispute.votesAgainst;
            const forPercentage = totalVotes > 0 ? (dispute.votesFor / totalVotes) * 100 : 0;

            return (
              <Card key={dispute.id} className="bg-gradient-card backdrop-blur-sm border-primary/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl">{dispute.marketTitle}</CardTitle>
                        <Badge className={getStatusColor(dispute.status)}>
                          {formatDisputeStatus(dispute.status)}
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
                        <p className="font-bold text-green-500">{dispute.votesFor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Votes Against</p>
                        <p className="font-bold text-red-500">{dispute.votesAgainst}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Voting Ends</p>
                        <p className="font-bold">{formatDate(dispute.votingEndsAt)}</p>
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
                      <span className="font-semibold">{formatCurrency(dispute.stakeAmount)}</span>
                    </div>
                    <div className="flex gap-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Vote For
                      </Button>
                      <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600/10">
                        Vote Against
                      </Button>
                    </div>
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

export default Disputes;