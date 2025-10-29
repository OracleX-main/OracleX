import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, TrendingUp } from "lucide-react";
import { formatCurrency, formatTimeRemaining, formatCategoryLabel } from "@/lib/formatters";
import type { Market } from "@/lib/types";
import { Link } from "react-router-dom";

interface MarketCardProps {
  market: Market;
}

const MarketCard = ({ market }: MarketCardProps) => {
  return (
    <Link to={`/markets/${market.id}`}>
      <Card className="group hover:border-primary transition-all duration-300 hover:shadow-glow-card hover:-translate-y-1 bg-gradient-card backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {market.title}
            </CardTitle>
            <Badge variant="outline" className="border-primary/40 text-primary shrink-0">
              {formatCategoryLabel(market.category)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {market.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Yes: {market.yesOdds}%</span>
              <span className="text-muted-foreground">No: {market.noOdds}%</span>
            </div>
            <Progress value={market.yesOdds} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{formatCurrency(market.poolSize)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{market.participants}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{formatTimeRemaining(market.endDate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              <span className="text-muted-foreground">AI Confidence: </span>
              <span className="text-primary font-semibold">{market.confidenceScore}%</span>
            </div>
            <Button size="sm" className="bg-gradient-gold hover:shadow-glow-primary">
              Predict
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MarketCard;