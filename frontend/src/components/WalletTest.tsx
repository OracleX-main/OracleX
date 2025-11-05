import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { getMetaMaskProvider, detectWallets, isMetaMaskAvailable } from '../utils/walletDetection';

const WalletTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runWalletTests = async () => {
    setIsLoading(true);
    const results: string[] = [];

    try {
      // Test 1: Check if MetaMask is available
      const isMetaMaskDetected = isMetaMaskAvailable();
      results.push(`✅ MetaMask Available: ${isMetaMaskDetected}`);

      // Test 2: Detect all wallets
      const detectedWallets = detectWallets();
      results.push(`📱 Detected Wallets: ${detectedWallets.join(', ') || 'None'}`);

      // Test 3: Get MetaMask provider
      const metaMaskProvider = getMetaMaskProvider();
      results.push(`🔗 MetaMask Provider: ${metaMaskProvider ? 'Found' : 'Not Found'}`);

      // Test 4: Test provider properties
      if (metaMaskProvider) {
        results.push(`🏷️ Provider isMetaMask: ${metaMaskProvider.isMetaMask}`);
        results.push(`🆔 Provider ID: ${metaMaskProvider._metamask?.isUnlocked !== undefined ? 'MetaMask' : 'Unknown'}`);
      }

      // Test 5: Check for Phantom interference
      if ((window as any).phantom?.ethereum) {
        results.push(`⚠️ Phantom Detected: May cause conflicts`);
      } else {
        results.push(`✅ No Phantom Interference`);
      }

      // Test 6: Test account access
      if (metaMaskProvider) {
        try {
          const accounts = await metaMaskProvider.request({ method: 'eth_accounts' });
          results.push(`👤 Connected Accounts: ${accounts.length}`);
        } catch (error) {
          results.push(`❌ Account Access Error: ${(error as Error).message}`);
        }
      }

    } catch (error) {
      results.push(`❌ Test Error: ${(error as Error).message}`);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Wallet Detection Test</CardTitle>
        <CardDescription>
          Test the enhanced wallet detection system to verify MetaMask prioritization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runWalletTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Running Tests...' : 'Run Wallet Tests'}
        </Button>

        {testResults.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="font-mono text-sm">
                    {result}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletTest;