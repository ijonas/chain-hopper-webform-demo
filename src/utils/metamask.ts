
import { toast } from "@/components/ui/use-toast";

export enum ConnectionState {
  NOT_CONNECTED = "Not Connected",
  ETHEREUM = "Connected to Ethereum",
  CORE_DAO = "Connected to CoreDAO",
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const NETWORKS = {
  ETHEREUM: {
    chainId: "0x1", // 1 in hex
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  CORE_DAO: {
    chainId: "0x45c", // 1116 in hex
    chainName: "CoreDAO",
    nativeCurrency: {
      name: "CORE",
      symbol: "CORE",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.coredao.org"],
    blockExplorerUrls: ["https://scan.coredao.org"],
  },
};

export async function connectWallet(): Promise<string | null> {
  if (!window.ethereum) {
    toast({
      title: "MetaMask not found",
      description: "Please install MetaMask extension",
      variant: "destructive",
    });
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: "eth_requestAccounts" 
    });
    
    if (accounts.length > 0) {
      const chainId = await window.ethereum.request({ 
        method: "eth_chainId" 
      });
      
      return chainId;
    }
    return null;
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    toast({
      title: "Connection Error",
      description: "Failed to connect to MetaMask",
      variant: "destructive",
    });
    return null;
  }
}

export async function switchNetwork(networkConfig: NetworkConfig): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkConfig.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [networkConfig],
        });
        return true;
      } catch (addError) {
        console.error("Error adding network:", addError);
        return false;
      }
    }
    console.error("Error switching network:", switchError);
    return false;
  }
}

export function getConnectionState(chainId: string | null): ConnectionState {
  if (!chainId) return ConnectionState.NOT_CONNECTED;
  if (chainId === NETWORKS.ETHEREUM.chainId) return ConnectionState.ETHEREUM;
  if (chainId === NETWORKS.CORE_DAO.chainId) return ConnectionState.CORE_DAO;
  return ConnectionState.NOT_CONNECTED;
}

// Extend Window interface to include ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}
