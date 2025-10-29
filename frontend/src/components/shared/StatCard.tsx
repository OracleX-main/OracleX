import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: StatCardProps) => {
  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary transition-all duration-300 hover:shadow-glow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              {value}
            </p>
            {trend && (
              <p className={`text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trend}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;