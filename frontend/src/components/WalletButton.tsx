import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, Copy, ExternalLink, LogOut, User, ChevronDown } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';

interface WalletButtonProps {
  className?: string;
  variant?: 'default' | 'mobile';
}

const WalletButton: React.FC<WalletButtonProps> = ({ className = '', variant = 'default' }) => {
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting, chainId, balance } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const openInExplorer = () => {
    if (address) {
      const explorerUrl = chainId === 56 
        ? `https://bscscan.com/address/${address}`
        : `https://testnet.bscscan.com/address/${address}`;
      window.open(explorerUrl, '_blank');
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`gap-2 bg-gradient-gold hover:shadow-glow-primary transition-all relative overflow-hidden group ${className}`}
        size={variant === 'mobile' ? 'default' : 'default'}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <Wallet className="w-4 h-4 relative z-10" />
        <span className="relative z-10 text-primary-foreground font-medium">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </Button>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className="space-y-2">
        <div className="bg-card/50 border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {formatAddress(address!)}
              </p>
              <p className="text-xs text-muted-foreground">
                {balance && `${formatBalance(balance)} BNB`}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="w-full justify-start gap-2 h-8"
            >
              <Copy className="w-3 h-3" />
              Copy Address
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openInExplorer}
              className="w-full justify-start gap-2 h-8"
            >
              <ExternalLink className="w-3 h-3" />
              View on Explorer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={disconnectWallet}
              className="w-full justify-start gap-2 h-8 text-destructive hover:text-destructive"
            >
              <LogOut className="w-3 h-3" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 bg-card/50 border-primary/20 hover:bg-card/70 transition-all ${className}`}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center">
            <Wallet className="w-3 h-3 text-primary-foreground" />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs text-muted-foreground leading-none">
              {balance && `${formatBalance(balance)} BNB`}
            </span>
            <span className="text-sm font-medium text-foreground leading-none mt-0.5 truncate">
              {formatAddress(address!)}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">Wallet Connected</p>
          <p className="text-xs text-muted-foreground truncate">{address}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.location.href = '/profile'} className="gap-2">
          <User className="w-4 h-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyAddress} className="gap-2">
          <Copy className="w-4 h-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openInExplorer} className="gap-2">
          <ExternalLink className="w-4 h-4" />
          View on BSCScan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={disconnectWallet}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;