import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, LineChart, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Natural Language Creation",
    description: "Just type your question. AI automatically creates prediction markets with optimal parameters"
  },
  {
    icon: LineChart,
    title: "Real-Time Sentiment Tracking",
    description: "AI monitors social media, news, and on-chain data to track prediction sentiment live"
  },
  {
    icon: Shield,
    title: "AI Oracle Resolution",
    description: "Trustless market resolution powered by AI that verifies outcomes from multiple data sources"
  },
  {
    icon: Zap,
    title: "Trend Prediction Engine",
    description: "ML models forecast upcoming events and suggest profitable prediction opportunities"
  }
];

const AIFeatures = () => {
  return (
    <section className="py-24 px-4 bg-secondary/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 hexagon-pattern opacity-20" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center space-y-4 mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4 shadow-glow-accent animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Powered by Advanced AI</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-foreground">AI-First </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Intelligence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every aspect enhanced by cutting-edge machine learning and natural language processing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 hover:shadow-glow-card transition-all duration-300 hover:-translate-y-1 group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-gold flex items-center justify-center shadow-glow-accent group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIFeatures;
