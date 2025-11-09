import { Button } from "@/components/ui/button";
import { Menu, Hexagon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import WalletButton from "./WalletButton";
import oraclexLogo from "@/assets/oraclex_logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-primary/20 shadow-glow-card animate-slide-up">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <img src={oraclexLogo} alt="OracleX" className="h-10 w-auto group-hover:scale-110 transition-all duration-300" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/markets" className="text-foreground hover:text-primary transition-colors font-medium">
              Markets
            </Link>
            <Link to="/portfolio" className="text-foreground hover:text-primary transition-colors font-medium">
              Portfolio
            </Link>
            <Link to="/faucet" className="text-foreground hover:text-primary transition-colors font-medium">
              Faucet
            </Link>
            <Link to="/governance" className="text-foreground hover:text-primary transition-colors font-medium">
              Governance
            </Link>
            <Link to="/leaderboard" className="text-foreground hover:text-primary transition-colors font-medium">
              Leaderboard
            </Link>
            <Link to="/staking" className="text-foreground hover:text-primary transition-colors font-medium">
              Staking
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <WalletButton />
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
            <Link to="/markets" className="block text-foreground hover:text-primary transition-colors font-medium">
              Markets
            </Link>
            <Link to="/portfolio" className="block text-foreground hover:text-primary transition-colors font-medium">
              Portfolio
            </Link>
            <Link to="/faucet" className="block text-foreground hover:text-primary transition-colors font-medium">
              Faucet
            </Link>
            <Link to="/governance" className="block text-foreground hover:text-primary transition-colors font-medium">
              Governance
            </Link>
            <Link to="/leaderboard" className="block text-foreground hover:text-primary transition-colors font-medium">
              Leaderboard
            </Link>
            <Link to="/staking" className="block text-foreground hover:text-primary transition-colors font-medium">
              Staking
            </Link>
            <div className="pt-4 space-y-2">
              <Button variant="ghost" className="w-full hover:text-primary">
                Sign In
              </Button>
              <WalletButton variant="mobile" className="w-full" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
