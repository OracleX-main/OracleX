import { Button } from "@/components/ui/button";
import { Brain, Wallet, Menu, Hexagon } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-primary/20 shadow-glow-card animate-slide-up">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-glow-accent group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Hexagon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              OracleX
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#markets" className="text-foreground hover:text-primary transition-colors font-medium">
              Markets
            </a>
            <a href="#create" className="text-foreground hover:text-primary transition-colors font-medium">
              Create
            </a>
            <a href="#leaderboard" className="text-foreground hover:text-primary transition-colors font-medium">
              Leaderboard
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors font-medium">
              How It Works
            </a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button className="gap-2 bg-gradient-gold hover:shadow-glow-primary transition-all relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Wallet className="w-4 h-4 relative z-10" />
              <span className="relative z-10 text-primary-foreground font-medium">Connect Wallet</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <a href="#markets" className="block text-foreground hover:text-primary transition-colors font-medium">
              Markets
            </a>
            <a href="#create" className="block text-foreground hover:text-primary transition-colors font-medium">
              Create
            </a>
            <a href="#leaderboard" className="block text-foreground hover:text-primary transition-colors font-medium">
              Leaderboard
            </a>
            <a href="#how-it-works" className="block text-foreground hover:text-primary transition-colors font-medium">
              How It Works
            </a>
            <div className="pt-4 space-y-2">
              <Button variant="ghost" className="w-full hover:text-primary">
                Sign In
              </Button>
              <Button className="w-full gap-2 bg-gradient-gold hover:shadow-glow-primary transition-all">
                <Wallet className="w-4 h-4" />
                <span className="text-primary-foreground font-medium">Connect Wallet</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
