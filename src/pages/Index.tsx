
import WalletConnection from "@/components/WalletConnection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          MetaMask Demo
        </h1>
        
        <WalletConnection />
        
        <div className="mt-8 text-sm text-gray-500">
          <p className="text-center">
            Connect your wallet to interact with Ethereum and CoreDAO networks
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
