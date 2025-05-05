
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { 
  connectWallet, 
  switchNetwork, 
  getConnectionState,
  ConnectionState,
  NETWORKS
} from "@/utils/metamask";

const WalletConnection = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.NOT_CONNECTED
  );
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize connection on load
  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: "eth_accounts" 
        });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          updateConnectionState(chainId);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setConnectionState(ConnectionState.NOT_CONNECTED);
      setAccount(null);
    } else {
      setAccount(accounts[0]);
      window.ethereum.request({ method: "eth_chainId" }).then(updateConnectionState);
    }
  };

  const handleChainChanged = (chainId: string) => {
    updateConnectionState(chainId);
  };

  const updateConnectionState = (chainId: string) => {
    setConnectionState(getConnectionState(chainId));
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const chainId = await connectWallet();
      if (chainId) {
        updateConnectionState(chainId);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDepositToken = async () => {
    const success = await switchNetwork(NETWORKS.ETHEREUM);
    if (success) {
      toast({
        title: "Deposit Received",
        description: "Your token deposit has been processed on Ethereum",
      });
    }
  };

  const handleWithdrawYield = async () => {
    const success = await switchNetwork(NETWORKS.CORE_DAO);
    if (success) {
      toast({
        title: "Yield Rewards Withdrawn",
        description: "Your yield rewards have been withdrawn from CoreDAO",
      });
    }
  };

  // Get connection status color
  const getStatusColor = (): string => {
    switch (connectionState) {
      case ConnectionState.NOT_CONNECTED:
        return "text-red-500";
      case ConnectionState.ETHEREUM:
        return "text-blue-500";
      case ConnectionState.CORE_DAO:
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  // Format address for display
  const formatAddress = (address: string | null): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <h1 className={`text-3xl font-bold ${getStatusColor()}`}>
        {connectionState}
      </h1>
      
      {account ? (
        <>
          <p className="text-gray-600">
            Connected Account: <span className="font-mono">{formatAddress(account)}</span>
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleDepositToken}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Deposit Token
            </Button>
            <Button
              onClick={handleWithdrawYield}
              className="bg-green-500 hover:bg-green-600"
            >
              Withdraw Yield Token
            </Button>
          </div>
        </>
      ) : (
        <Button 
          onClick={handleConnect} 
          className="bg-purple-500 hover:bg-purple-600"
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;
