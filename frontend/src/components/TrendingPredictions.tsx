import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { marketService, type Market } from "@/services";

const TrendingPredictions = () => {
  const { data: marketsResponse, loading, error } = useApi(
    () => marketService.getTrendingMarkets(6),
    [],
    {
      onError: (error) => {
        console.error('Failed to fetch trending markets:', error);
      }
    }
  );

  const markets = marketsResponse?.data || [];

  const formatTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return "< 1 hour";
  };

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const calculatePercentages = (market: Market) => {
    const outcomes = market.outcomes || [];
    if (outcomes.length < 2) return { yes: 50, no: 50 };
    
    const total = outcomes.reduce((sum, outcome) => sum + parseFloat(outcome.totalStaked), 0);
    if (total === 0) return { yes: 50, no: 50 };
    
    const yesStaked = parseFloat(outcomes[0]?.totalStaked || '0');
    const noStaked = parseFloat(outcomes[1]?.totalStaked || '0');
    
    return {
      yes: Math.round((yesStaked / total) * 100),
      no: Math.round((noStaked / total) * 100)
    };
  };

  if (loading) {
    return (
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading trending predictions...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <p className="text-muted-foreground">Unable to load trending predictions</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

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
          {markets.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No trending markets available</p>
              <Link to="/create-market">
                <Button className="mt-4">Create First Market</Button>
              </Link>
            </div>
          ) : (
            markets.map((market, index) => {
              const percentages = calculatePercentages(market);
              const participants = market.predictions?.length || 0;
              
              return (
                <Link key={market.id} to={`/markets/${market.id}`}>
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
                          {market.category}
                        </Badge>
                        <Badge variant="outline" className="gap-1 border-accent/40 text-accent">
                          <TrendingUp className="w-3 h-3" />
                          AI {market.confidence ? Math.round(market.confidence) : '--'}%
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {market.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      {/* Yes/No Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-success">Yes {percentages.yes}%</span>
                          <span className="text-prediction-no">No {percentages.no}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                          <div 
                            className="bg-success transition-all duration-500 ease-out hover:brightness-110"
                            style={{ width: `${percentages.yes}%` }}
                          />
                          <div 
                            className="bg-prediction-no transition-all duration-500 ease-out hover:brightness-110"
                            style={{ width: `${percentages.no}%` }}
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
                          <div className="text-sm font-semibold text-foreground">{participants}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">Closes in</span>
                          </div>
                          <div className="text-sm font-semibold text-foreground">{formatTimeLeft(market.endDate)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Volume</div>
                          <div className="text-sm font-semibold text-primary">{formatVolume(market.totalVolume)}</div>
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
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default TrendingPredictions;
