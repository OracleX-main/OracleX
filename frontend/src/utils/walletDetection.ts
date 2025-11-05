// Wallet detection utilities
export interface WalletProvider {
  isMetaMask?: boolean;
  isPhantom?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  providers?: any[];
}

export interface DetectedWallet {
  name: string;
  provider: any;
  icon: string;
  isInstalled: boolean;
}

/**
 * Get the MetaMask provider specifically
 */
export const getMetaMaskProvider = (): any | null => {
  if (typeof window === 'undefined') return null;

  // If window.ethereum is MetaMask
  if (window.ethereum?.isMetaMask && !window.ethereum?.isRabby) {
    return window.ethereum;
  }

  // If multiple providers exist, find MetaMask
  if (window.ethereum?.providers) {
    return window.ethereum.providers.find((provider: any) => 
      provider.isMetaMask && !provider.isRabby
    );
  }

  return null;
};

/**
 * Detect all available wallets
 */
export const detectWallets = (): DetectedWallet[] => {
  if (typeof window === 'undefined') return [];

  const wallets: DetectedWallet[] = [];
  
  // MetaMask detection
  const metaMaskProvider = getMetaMaskProvider();
  wallets.push({
    name: 'MetaMask',
    provider: metaMaskProvider,
    icon: '/metamask-icon.svg',
    isInstalled: !!metaMaskProvider
  });

  // Phantom detection (Solana wallet, but sometimes interferes)
  if (window.phantom?.ethereum) {
    wallets.push({
      name: 'Phantom',
      provider: window.phantom.ethereum,
      icon: '/phantom-icon.svg',
      isInstalled: true
    });
  }

  // Coinbase Wallet detection
  if (window.ethereum?.isCoinbaseWallet) {
    wallets.push({
      name: 'Coinbase Wallet',
      provider: window.ethereum,
      icon: '/coinbase-icon.svg',
      isInstalled: true
    });
  }

  // Rabby Wallet detection
  if (window.ethereum?.isRabby) {
    wallets.push({
      name: 'Rabby Wallet',
      provider: window.ethereum,
      icon: '/rabby-icon.svg',
      isInstalled: true
    });
  }

  return wallets;
};

/**
 * Check if MetaMask is available and prioritize it
 */
export const isMetaMaskAvailable = (): boolean => {
  return !!getMetaMaskProvider();
};

/**
 * Get the preferred Ethereum provider (MetaMask first)
 */
export const getPreferredProvider = (): any | null => {
  // Always prefer MetaMask if available
  const metaMask = getMetaMaskProvider();
  if (metaMask) return metaMask;

  // Fallback to other Ethereum providers
  if (window.ethereum && !window.ethereum.isPhantom) {
    return window.ethereum;
  }

  return null;
};

// Extend the global Window interface
declare global {
  interface Window {
    ethereum?: any;
    phantom?: {
      ethereum?: any;
    };
  }
}