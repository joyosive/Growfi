'use client';

import { useWallet } from '@/lib/walletContext';
import { Leaf, Wallet, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { userWallet, isConnected, isConnecting, connect, disconnect } = useWallet();

  const formatWallet = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnectWallet = async (e: React.MouseEvent) => {
    // Prevent event bubbling that might interfere with wallet popup
    e.preventDefault();
    e.stopPropagation();

    try {
      await connect();
    } catch (error) {
      console.error('Wallet connection failed:', error);
      // Don't show additional alerts as the wallet context handles them
    }
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">GrowFI</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/farms" className="text-neutral-600 hover:text-primary-600 font-medium">
              Farms
            </Link>
            <Link href="/marketplace" className="text-neutral-600 hover:text-primary-600 font-medium">
              Marketplace
            </Link>
            {isConnected && (
              <Link href="/portfolio" className="text-neutral-600 hover:text-primary-600 font-medium">
                Portfolio
              </Link>
            )}
            <Link href="/leaderboard" className="text-neutral-600 hover:text-primary-600 font-medium">
              Leaderboard
            </Link>

            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <span>{formatWallet(userWallet!)}</span>
                </div>
                <button
                  onClick={disconnect}
                  className="text-neutral-600 hover:text-red-600 p-2"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet className="h-5 w-5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}