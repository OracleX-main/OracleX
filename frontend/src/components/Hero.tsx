import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, TrendingUp, Hexagon } from "lucide-react";
import heroBg from "@/assets/bnb-hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Hexagon Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute inset-0 hexagon-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-mesh" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/30 shadow-glow-card animate-fade-in">
            <Hexagon className="w-4 h-4 text-primary fill-primary/20 animate-pulse" />
            <span className="text-sm font-medium text-foreground">Powered by BNB Chain</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <span className="bg-gradient-primary bg-clip-text text-transparent animate-shimmer" style={{ backgroundSize: '200% auto' }}>
              Predict the Future
            </span>
            <br />
            <span className="text-foreground">with AI Intelligence</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            Join the world's first AI-powered social prediction network. Create markets with natural language, 
            track sentiment in real-time, and earn from your insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <Button size="lg" className="gap-2 bg-gradient-gold hover:shadow-glow-primary transition-all relative overflow-hidden group hover:scale-105 duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative text-primary-foreground font-semibold">Start Predicting</span>
              <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-primary/40 hover:border-primary hover:bg-primary/10 transition-all hover:scale-105 duration-300">
              <TrendingUp className="w-4 h-4" />
              Explore Markets
            </Button>
          </div>

          {/* Stats - Enhanced and Distinct */}
          <div className="grid grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              <div className="relative bg-gradient-card backdrop-blur-sm border border-primary/30 rounded-2xl p-6 hover:border-primary transition-all duration-300 hover:shadow-glow-card hover:-translate-y-1">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2 animate-shimmer" style={{ backgroundSize: '200% auto' }}>
                  $2.4M+
                </div>
                <div className="text-sm text-muted-foreground font-medium">Total Volume</div>
              </div>
            </div>
            <div className="relative group" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              <div className="relative bg-gradient-card backdrop-blur-sm border border-primary/30 rounded-2xl p-6 hover:border-primary transition-all duration-300 hover:shadow-glow-card hover:-translate-y-1">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2 animate-shimmer" style={{ backgroundSize: '200% auto', animationDelay: '0.5s' }}>
                  12K+
                </div>
                <div className="text-sm text-muted-foreground font-medium">Active Users</div>
              </div>
            </div>
            <div className="relative group" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-gold opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              <div className="relative bg-gradient-card backdrop-blur-sm border border-primary/30 rounded-2xl p-6 hover:border-primary transition-all duration-300 hover:shadow-glow-card hover:-translate-y-1">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2 animate-shimmer" style={{ backgroundSize: '200% auto', animationDelay: '1s' }}>
                  89%
                </div>
                <div className="text-sm text-muted-foreground font-medium">AI Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-glow-pulse" />
    </section>
  );
};

export default Hero;
