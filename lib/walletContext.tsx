'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { WalletManager, GemWalletAdapter, XamanAdapter, CrossmarkAdapter } from 'xrpl-connect';
import { Payment } from 'xrpl';
import { X, Wallet } from 'lucide-react';

interface WalletContextType {
  userWallet: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  network: string | null;
  error: string | null;
  walletManager: WalletManager | null;
  showWalletSelector: boolean;
  availableWallets: Array<{ id: string; name: string; icon: string }>;
  connect: () => Promise<void>;
  connectWithWallet: (walletId: string) => Promise<void>;
  disconnect: () => void;
  closeWalletSelector: () => void;
  sendPayment: (destination: string, amount: string, memo?: string) => Promise<any>;
  mintNFT: (tokenTaxon: number, metadata: any) => Promise<any>;
  refreshBalance: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Wallet Selector Modal Component
const WalletSelectorModal: React.FC = () => {
  const { availableWallets, connectWithWallet, closeWalletSelector, isConnecting, error } = useWallet();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeWalletSelector}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Connect Wallet</h3>
          <button
            onClick={closeWalletSelector}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Choose your preferred wallet to connect to GrowFi
          </p>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Wallet Options */}
          <div className="space-y-3">
            {availableWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => connectWithWallet(wallet.id)}
                disabled={isConnecting}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{wallet.name}</div>
                  <div className="text-sm text-gray-600">
                    Connect using {wallet.name} extension
                  </div>
                </div>
                <Wallet className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>

          {isConnecting && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// XRP Testnet Configuration
const TESTNET_CONFIG = {
  network: 'wss://s.altnet.rippletest.net:51233',
  networkId: 1,
  faucet: 'https://faucet.altnet.rippletest.net/accounts',
  explorer: 'https://testnet.xrpl.org'
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletManager, setWalletManager] = useState<WalletManager | null>(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const availableWallets = [
    { id: 'gemwallet', name: 'GemWallet', icon: '💎' },
    { id: 'xaman', name: 'Xaman', icon: '🟣' },
    { id: 'crossmark', name: 'Crossmark', icon: '✖️' }
  ];

  const connect = useCallback(async () => {
    // If already connected, don't need to reconnect
    if (isConnected && userWallet) {
      console.log('Wallet already connected:', userWallet);
      return;
    }

    // Show wallet selector dialog
    setError(null);
    setShowWalletSelector(true);
  }, [isConnected, userWallet]);

  const closeWalletSelector = useCallback(() => {
    setShowWalletSelector(false);
  }, []);

  // Helper function to refresh balance for a given address
  const refreshBalanceForAddress = useCallback(async (address: string) => {
    try {
      if (walletManager && walletManager.account) {
        const balanceInfo = await walletManager.getBalance();
        setBalance(balanceInfo?.balance || '0');
        console.log('Balance updated:', balanceInfo?.balance);
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
      setBalance('0');
    }
  }, [walletManager]);

  const connectWithWallet = useCallback(async (walletId: string) => {
    setIsConnecting(true);
    setError(null);
    setShowWalletSelector(false);

    try {
      // Check if in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      console.log(`Initializing wallet manager for ${walletId}...`);

      // Initialize wallet manager with multiple adapters
      const manager = new WalletManager({
        adapters: [
          new GemWalletAdapter(),
          new XamanAdapter(),
          new CrossmarkAdapter()
        ],
        network: 'testnet',
        autoConnect: false
      });

      setWalletManager(manager);

      // Set up event listeners
      manager.on('connect', (account: any) => {
        console.log('Wallet connected:', account.address);
        setUserWallet(account.address);
        setIsConnected(true);
        setError(null);
        setNetwork('testnet');
        localStorage.setItem('userWallet', account.address);

        // Get initial balance
        refreshBalanceForAddress(account.address);
      });

      manager.on('disconnect', () => {
        console.log('Wallet disconnected');
        setUserWallet(null);
        setIsConnected(false);
        setBalance(null);
        setError(null);
        localStorage.removeItem('userWallet');
      });

      manager.on('error', (error: any) => {
        console.error('Wallet error:', error);
        setError(error.message || 'Wallet connection failed');
        setIsConnected(false);
        setUserWallet(null);
      });

      // Attempt to connect to specific wallet
      await manager.connect(walletId);

    } catch (error: any) {
      console.error('Wallet connection error:', error);

      let errorMessage = 'Failed to connect wallet';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Check for specific error types
      if (errorMessage.includes('No wallet found') || errorMessage.includes('not installed')) {
        errorMessage = `${walletId} wallet not found. Please install the wallet extension.`;
      } else if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        errorMessage = 'Connection was rejected by user';
      }

      setError(errorMessage);
      setIsConnected(false);
      setUserWallet(null);
      setWalletManager(null);
      localStorage.removeItem('userWallet');
      setShowWalletSelector(true); // Show selector again on error
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalanceForAddress]);

  const disconnect = useCallback(() => {
    if (walletManager) {
      walletManager.disconnect();
    }

    setUserWallet(null);
    setIsConnected(false);
    setBalance(null);
    setNetwork(null);
    setError(null);
    setWalletManager(null);
    localStorage.removeItem('userWallet');
    console.log('Wallet disconnected');
  }, [walletManager]);

  const refreshBalance = useCallback(async () => {
    if (isConnected && userWallet && walletManager) {
      await refreshBalanceForAddress(userWallet);
    }
  }, [isConnected, userWallet, walletManager, refreshBalanceForAddress]);

  const sendPayment = useCallback(async (destination: string, amount: string, memo?: string) => {
    if (!userWallet || !isConnected || !walletManager) {
      throw new Error('Wallet not connected');
    }

    try {
      const transaction = {
        TransactionType: 'Payment',
        Account: userWallet,
        Destination: destination,
        Amount: amount,
        ...(memo && {
          Memos: [{
            Memo: {
              MemoData: Buffer.from(memo, 'utf8').toString('hex').toUpperCase(),
              MemoType: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase(),
            }
          }]
        })
      };

      console.log('Sending payment:', transaction);
      const signedTransaction = await walletManager.sign(transaction);

      if (signedTransaction) {
        console.log('Payment successful:', signedTransaction);

        // Refresh balance after payment
        setTimeout(() => refreshBalance(), 1000);

        return {
          success: true,
          hash: signedTransaction.hash,
          txHash: signedTransaction.hash,
          ...signedTransaction
        };
      } else {
        throw new Error('Payment was rejected or failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }, [userWallet, isConnected, walletManager, refreshBalance]);

  const signTransaction = useCallback(async (transaction: any) => {
    if (!userWallet || !isConnected || !walletManager) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Signing transaction:', transaction);
      const signedTransaction = await walletManager.sign(transaction);

      if (signedTransaction) {
        console.log('Transaction signed successfully:', signedTransaction);
        return signedTransaction;
      } else {
        throw new Error('Transaction signing was rejected or failed');
      }
    } catch (error) {
      console.error('Transaction signing error:', error);
      throw error;
    }
  }, [userWallet, isConnected, walletManager]);

  const mintNFT = useCallback(async (tokenTaxon: number, metadata: any) => {
    if (!userWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // For demo purposes, simulate NFT minting
      const mockNFT = {
        tokenId: `NFT-${tokenTaxon}-${Date.now()}`,
        metadata,
        owner: userWallet,
        minted: new Date().toISOString()
      };

      console.log('Mock NFT minted:', mockNFT);
      return mockNFT;
    } catch (error) {
      console.error('NFT minting error:', error);
      throw error;
    }
  }, [userWallet]);

  // Check for existing connection and restore wallet state
  useEffect(() => {
    const savedWallet = localStorage.getItem('userWallet');
    if (savedWallet && savedWallet.length > 0) {
      console.log('Found saved wallet, attempting to restore connection:', savedWallet);

      // Try to restore connection without auto-connecting
      const manager = new WalletManager({
        adapters: [
          new GemWalletAdapter(),
          new XamanAdapter(),
          new CrossmarkAdapter()
        ],
        network: 'testnet',
        autoConnect: false
      });

      setWalletManager(manager);

      // Check if we can restore the session
      if (manager.isConnected && manager.account?.address === savedWallet) {
        setUserWallet(savedWallet);
        setIsConnected(true);
        setNetwork('testnet');
        refreshBalanceForAddress(savedWallet);
      } else {
        // Clear invalid saved wallet
        localStorage.removeItem('userWallet');
      }
    }
  }, [refreshBalanceForAddress]);

  return (
    <WalletContext.Provider value={{
      userWallet,
      isConnected,
      isConnecting,
      balance,
      network,
      error,
      walletManager,
      showWalletSelector,
      availableWallets,
      connect,
      connectWithWallet,
      disconnect,
      closeWalletSelector,
      sendPayment,
      mintNFT,
      refreshBalance,
      signTransaction
    }}>
      {children}
      {showWalletSelector && <WalletSelectorModal />}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
