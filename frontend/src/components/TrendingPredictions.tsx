import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const predictions = [
  {
    id: 1,
    question: "Will ETH reach $4,000 before February 2025?",
    category: "Crypto",
    yesPercentage: 68,
    noPercentage: 32,
    participants: 1247,
    timeLeft: "5 days",
    volume: "$45.2K",
    aiConfidence: 72
  },
  {
    id: 2,
    question: "Will OpenAI release GPT-5 in Q1 2025?",
    category: "Technology",
    yesPercentage: 45,
    noPercentage: 55,
    participants: 892,
    timeLeft: "12 days",
    volume: "$32.8K",
    aiConfidence: 58
  },
  {
    id: 3,
    question: "Will Lakers make NBA Playoffs 2025?",
    category: "Sports",
    yesPercentage: 79,
    noPercentage: 21,
    participants: 2103,
    timeLeft: "3 days",
    volume: "$67.5K",
    aiConfidence: 84
  }
];

const TrendingPredictions = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-12 animate-slide-up">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Trending </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">Predictions</span>
            </h2>
            <p className="text-muted-foreground">Most active markets right now</p>
          </div>
          <Link to="/markets">
            <Button variant="outline" className="gap-2 border-primary/40 hover:border-primary hover:shadow-glow-accent transition-all">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {predictions.map((prediction, index) => (
            <Link key={prediction.id} to="/markets">
              <Card 
                className="bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary hover:shadow-glow-card transition-all duration-300 group cursor-pointer relative overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
              >
              {/* Shimmer Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              </div>
              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/40 font-medium">
                    {prediction.category}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-accent/40 text-accent">
                    <TrendingUp className="w-3 h-3" />
                    AI {prediction.aiConfidence}%
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {prediction.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                {/* Yes/No Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-success">Yes {prediction.yesPercentage}%</span>
                    <span className="text-prediction-no">No {prediction.noPercentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                    <div 
                      className="bg-success transition-all duration-500 ease-out hover:brightness-110"
                      style={{ width: `${prediction.yesPercentage}%` }}
                    />
                    <div 
                      className="bg-prediction-no transition-all duration-500 ease-out hover:brightness-110"
                      style={{ width: `${prediction.noPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span className="text-xs">Participants</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{prediction.participants.toLocaleString()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">Closes in</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">{prediction.timeLeft}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Volume</div>
                    <div className="text-sm font-semibold text-primary">{prediction.volume}</div>
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full bg-gradient-gold hover:shadow-glow-primary transition-all relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative text-primary-foreground font-medium">Make Prediction</span>
                </Button>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingPredictions;
