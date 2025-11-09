import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import PageLayout from "@/components/layout/PageLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplet, ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ethers } from 'ethers';

const ORX_TOKEN_ADDRESS = '0x7eE4f73bab260C11c68e5560c46E3975E824ed79';
const FAUCET_AMOUNT = '1000'; // 1000 ORX per request

const Faucet = () => {
  const { isConnected, address, provider } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [lastClaim, setLastClaim] = useState<Date | null>(null);

  // Check ORX balance
  const checkBalance = async () => {
    if (!isConnected || !address || !provider) return;

    try {
      const orxAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)'
      ];

      const orxContract = new ethers.Contract(ORX_TOKEN_ADDRESS, orxAbi, provider);
      const userBalance = await orxContract.balanceOf(address);
      setBalance(ethers.formatEther(userBalance));
    } catch (error) {
      console.error('Failed to check balance:', error);
    }
  };

  // Check balance on mount and when connected
  React.useEffect(() => {
    if (isConnected) {
      checkBalance();
    }
  }, [isConnected, address]);

  const handleClaim = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check cooldown (5 minutes)
    if (lastClaim) {
      const timeSinceLastClaim = Date.now() - lastClaim.getTime();
      const cooldownMs = 5 * 60 * 1000; // 5 minutes
      
      if (timeSinceLastClaim < cooldownMs) {
        const remainingMs = cooldownMs - timeSinceLastClaim;
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        toast.error(`Please wait ${remainingMinutes} minute(s) before claiming again`);
        return;
      }
    }

    setIsLoading(true);

    try {
      // Call backend faucet endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/faucet/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          amount: FAUCET_AMOUNT
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim tokens');
      }

      toast.success('ORX Tokens Claimed!', {
        description: `${FAUCET_AMOUNT} ORX sent to your wallet`,
        action: {
          label: 'View on BSCScan',
          onClick: () => window.open(`https://testnet.bscscan.com/tx/${data.txHash}`, '_blank')
        }
      });

      setLastClaim(new Date());
      
      // Wait a bit for blockchain confirmation, then refresh balance
      setTimeout(() => {
        checkBalance();
      }, 3000);

    } catch (error) {
      console.error('Failed to claim tokens:', error);
      toast.error('Claim Failed', {
        description: (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="pt-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please connect your wallet to claim test ORX tokens.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-gold bg-clip-text text-transparent">ORX Faucet</span>
          </h1>
          <p className="text-muted-foreground">Get free test ORX tokens for staking and predictions</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 mb-6">
          <CardHeader>
            <CardTitle>Your ORX Balance</CardTitle>
            <CardDescription>Current balance in your connected wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                  {parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })} ORX
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkBalance}
                className="border-primary/40"
              >
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Faucet Card */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-6 w-6 text-blue-500" />
              Claim Test Tokens
            </CardTitle>
            <CardDescription>
              Receive {FAUCET_AMOUNT} ORX tokens for testing (once every 5 minutes)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info Alert */}
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                <strong>Test Network Only:</strong> These are test tokens on BSC Testnet with no real value.
                Use them to test staking, governance, and prediction markets.
              </AlertDescription>
            </Alert>

            {/* Claim Button */}
            <Button 
              onClick={handleClaim}
              disabled={isLoading}
              className="w-full bg-gradient-gold hover:shadow-glow-primary text-lg py-6"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Claiming Tokens...
                </>
              ) : (
                <>
                  <Droplet className="h-5 w-5 mr-2" />
                  Claim {FAUCET_AMOUNT} ORX
                </>
              )}
            </Button>

            {lastClaim && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Last claimed: {lastClaim.toLocaleTimeString()}
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="space-y-3 pt-4 border-t border-primary/20">
              <h3 className="font-semibold text-sm">How to use ORX tokens:</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Claim test ORX tokens from this faucet</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Stake ORX tokens to participate in prediction markets</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Use ORX for governance voting on platform decisions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Earn rewards for accurate predictions</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://testnet.bscscan.com/token/${ORX_TOKEN_ADDRESS}`, '_blank')}
                className="flex-1 border-primary/40"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Token
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://testnet.bscscan.com/address/${address}`, '_blank')}
                className="flex-1 border-primary/40"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Your Wallet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30 mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Need BNB for Gas?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              You'll need some test BNB to pay for transaction fees on BSC Testnet.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://testnet.bnbchain.org/faucet-smart', '_blank')}
              className="border-primary/40"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Get Test BNB
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Faucet;
