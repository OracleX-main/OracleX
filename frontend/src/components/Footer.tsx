import { Hexagon, Twitter, Github, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-primary/20 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 hexagon-pattern opacity-10" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-glow-accent">
                <Hexagon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                OracleX
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The AI-powered social prediction & intelligence network on BNB Chain
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/markets" className="text-muted-foreground hover:text-primary transition-colors">Markets</Link></li>
              <li><Link to="/create-market" className="text-muted-foreground hover:text-primary transition-colors">Create Prediction</Link></li>
              <li><Link to="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">Leaderboard</Link></li>
              <li><Link to="/analytics" className="text-muted-foreground hover:text-primary transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/docs" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link to="/docs" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/disputes" className="text-muted-foreground hover:text-primary transition-colors">Disputes</Link></li>
              <li><Link to="/docs" className="text-muted-foreground hover:text-primary transition-colors">API</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/docs" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/tokenomics" className="text-muted-foreground hover:text-primary transition-colors">Tokenomics</Link></li>
              <li><Link to="/governance" className="text-muted-foreground hover:text-primary transition-colors">Governance</Link></li>
              <li><Link to="/docs" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 OracleX. All rights reserved. Built on BNB Chain.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
