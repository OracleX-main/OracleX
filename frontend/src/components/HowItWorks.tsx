import { Brain, TrendingUp, Wallet, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description: "Link your BNB Chain wallet or use social login for gasless transactions"
  },
  {
    icon: Brain,
    title: "Create or Join",
    description: "Use AI to create markets with natural language or browse trending predictions"
  },
  {
    icon: TrendingUp,
    title: "Predict & Stake",
    description: "Make your prediction and stake tokens. AI tracks real-time sentiment"
  },
  {
    icon: Trophy,
    title: "Win & Earn",
    description: "Accurate predictions earn you rewards. Build your reputation as a top predictor"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to start earning from your predictions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="relative bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary hover:shadow-glow-card transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <CardContent className="p-6 space-y-4">
                {/* Animated Border Effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-gold opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-gold flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-glow-accent">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
