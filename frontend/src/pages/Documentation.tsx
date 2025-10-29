import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BookOpen, Github, FileText, ExternalLink } from "lucide-react";

const Documentation = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Documentation</span>
          </h1>
          <p className="text-muted-foreground">Learn about OracleX and how to get started</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">User Guide</h3>
              <p className="text-sm text-muted-foreground">Learn how to use OracleX</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <Github className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">GitHub</h3>
              <p className="text-sm text-muted-foreground">View our open source code</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Whitepaper</h3>
              <p className="text-sm text-muted-foreground">Read our technical paper</p>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 mb-8">
          <CardHeader>
            <CardTitle>About OracleX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              OracleX is the world's first AI-powered decentralized oracle prediction network built on BNB Chain. 
              We combine artificial intelligence with community wisdom to create accurate, transparent, and 
              trustworthy prediction markets.
            </p>
            <p className="text-muted-foreground">
              Our platform enables users to create markets, make predictions, and earn rewards based on their 
              accuracy. With AI-powered resolution and a robust dispute mechanism, OracleX ensures fair and 
              reliable outcomes for all participants.
            </p>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is OracleX?</AccordionTrigger>
                <AccordionContent>
                  OracleX is an AI-powered decentralized prediction market platform where users can create 
                  markets, make predictions, and earn rewards based on their accuracy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does the AI Oracle work?</AccordionTrigger>
                <AccordionContent>
                  Our AI Oracle analyzes multiple data sources, news sentiment, and historical patterns to 
                  provide confidence scores for market outcomes. It helps automate resolution while maintaining 
                  transparency.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>What is the ORX token used for?</AccordionTrigger>
                <AccordionContent>
                  ORX tokens are used for governance, staking rewards, market creation, and dispute resolution. 
                  Token holders can vote on protocol upgrades and earn passive income through staking.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I create a prediction market?</AccordionTrigger>
                <AccordionContent>
                  Navigate to the "Create Market" page, fill in the market details including title, description, 
                  category, end date, and outcome options. Submit the market and it will be available for 
                  predictions once approved.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>What happens if I disagree with a market outcome?</AccordionTrigger>
                <AccordionContent>
                  You can submit a dispute by staking ORX tokens and providing evidence. The community will 
                  vote on the dispute, and if successful, the market outcome will be corrected.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Partners */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle>Partners & Backers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-lg bg-primary/20 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-primary font-bold">BNB</span>
                </div>
                <p className="text-sm font-medium">BNB Chain</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-lg bg-primary/20 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-primary font-bold">SF</span>
                </div>
                <p className="text-sm font-medium">Seedify</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-lg bg-primary/20 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-primary font-bold">VC</span>
                </div>
                <p className="text-sm font-medium">Venture Capital</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-lg bg-primary/20 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-primary font-bold">AI</span>
                </div>
                <p className="text-sm font-medium">AI Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Documentation;