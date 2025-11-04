import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { web3Service } from '@/services/web3';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  chainId: number | null;
  balance: string | null;
  orxBalance: string | null;
  switchToBNBChain: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [orxBalance, setOrxBalance] = useState<string | null>(null);

  // Target chain ID for BNB Smart Chain
  const TARGET_CHAIN_ID = 56; // BSC Mainnet
  const TARGET_CHAIN_ID_HEX = '0x38';

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          const balance = await provider.getBalance(address);
          
          setProvider(provider);
          setSigner(signer);
          setAddress(address);
          setChainId(Number(network.chainId));
          setBalance(ethers.formatEther(balance));
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const switchToTargetChain = async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: TARGET_CHAIN_ID_HEX,
                chainName: 'BNB Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://bsc-dataseed1.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding chain:', addError);
          toast.error('Failed to add BNB Smart Chain to your wallet');
          return false;
        }
      }
      console.error('Error switching chain:', switchError);
      toast.error('Failed to switch to BNB Smart Chain');
      return false;
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Check if we're on the correct chain
      if (Number(network.chainId) !== TARGET_CHAIN_ID) {
        const switched = await switchToTargetChain();
        if (!switched) {
          setIsConnecting(false);
          return;
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setChainId(TARGET_CHAIN_ID);
      setBalance(ethers.formatEther(balance));
      setIsConnected(true);

      // Store connection in localStorage
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', address);

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance(null);

    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');

    toast.info('Wallet disconnected');
  };

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = Number(chainId);
        setChainId(newChainId);
        
        if (newChainId !== TARGET_CHAIN_ID && isConnected) {
          toast.warning('Please switch back to BNB Smart Chain for full functionality');
        }
        
        checkConnection();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isConnected]);

  // Check for existing connection on mount
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true') {
      checkConnection();
    }
  }, []);

  // Update balance periodically
  useEffect(() => {
    if (isConnected && provider && address) {
      const updateBalance = async () => {
        try {
          const newBalance = await provider.getBalance(address);
          setBalance(ethers.formatEther(newBalance));
        } catch (error) {
          console.error('Error updating balance:', error);
        }
      };

      // Update balance every 30 seconds
      const interval = setInterval(updateBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, provider, address]);

  const switchToBNBChain = async (): Promise<boolean> => {
    try {
      await web3Service.initialize();
      const result = await web3Service.switchToBNBChain();
      if (result) {
        toast.success('Switched to BNB Smart Chain');
      }
      return result;
    } catch (error) {
      console.error('Failed to switch to BNB Chain:', error);
      toast.error('Failed to switch to BNB Smart Chain');
      return false;
    }
  };

  const refreshBalance = async (): Promise<void> => {
    if (!provider || !address) return;

    try {
      // Update BNB balance
      const newBalance = await provider.getBalance(address);
      setBalance(ethers.formatEther(newBalance));

      // Update ORX balance if contract available
      try {
        const newOrxBalance = await web3Service.getORXBalance(address);
        setOrxBalance(newOrxBalance);
      } catch (error) {
        console.warn('ORX token not available:', error);
        setOrxBalance('0');
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  const value: WalletContextType = {
    isConnected,
    address,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    isConnecting,
    chainId,
    balance,
    orxBalance,
    switchToBNBChain,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}