import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isConnected, connectWallet, isConnecting } = useWallet();
  const location = useLocation();

  // Allow access to home page and docs without wallet connection
  const publicRoutes = ['/', '/docs', '/tokenomics'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-gold flex items-center justify-center shadow-glow-accent">
                <Shield className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                Wallet Required
              </h2>
              <p className="text-muted-foreground text-lg">
                Connect your wallet to access OracleX prediction markets and start trading.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-card/50 border border-border rounded-lg p-6 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Why connect your wallet?</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                    Place predictions on markets
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                    Manage your portfolio
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                    Participate in governance
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                    Earn rewards through staking
                  </li>
                </ul>
              </div>

              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full gap-2 bg-gradient-gold hover:shadow-glow-primary transition-all relative overflow-hidden group"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Wallet className="w-5 h-5 relative z-10" />
                <span className="relative z-10 text-primary-foreground font-medium">
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </span>
              </Button>

              <p className="text-xs text-muted-foreground">
                We support MetaMask and other Web3 wallets. 
                Make sure you're connected to BNB Smart Chain.
              </p>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => window.open('https://metamask.io/', '_blank')}
                className="text-primary hover:text-primary/80"
              >
                Don't have a wallet? Get MetaMask
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;