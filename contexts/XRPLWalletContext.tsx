'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getAddress, getNetwork, getBalance, requestPayment } from '@gemwallet/api';

// Types for XRPL wallet integration
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  network: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface XRPLWalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendPayment: (destination: string, amount: string, memo?: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  refreshBalance: () => Promise<void>;
}

const XRPLWalletContext = createContext<XRPLWalletContextType | undefined>(undefined);

interface XRPLWalletProviderProps {
  children: ReactNode;
}

export const XRPLWalletProvider: React.FC<XRPLWalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    network: null,
    isLoading: false,
    error: null,
  });

  const connectWallet = useCallback(async () => {
    setWallet(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      console.log('Connecting to GemWallet...');

      // Check if window is available (browser environment)
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      // Check if GemWallet is installed and available
      if (!window.hasOwnProperty('gemWallet') && !(window as any).gemWallet) {
        throw new Error('GemWallet extension not found. Please install GemWallet from: https://gemwallet.app');
      }

      // Add a small delay to ensure extension is loaded
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Requesting wallet address...');

      // Connect to GemWallet
      const response = await getAddress();

      if (response.type === 'response' && response.result) {
        const { address } = response.result;
        console.log('Connected to GemWallet:', address);

        // Get network and balance sequentially to avoid race conditions
        const networkResult = await getNetwork();
        const balanceResult = await getBalance(address);

        const network = networkResult.type === 'response' ? networkResult.result?.network || 'testnet' : 'testnet';
        const balance = balanceResult.type === 'response' ? balanceResult.result?.balance || '0' : '0';

        setWallet({
          isConnected: true,
          address,
          balance,
          network,
          isLoading: false,
          error: null,
        });

        localStorage.setItem('gemwallet_address', address);
        console.log('Wallet connected successfully');
      } else {
        const errorMessage = response.type === 'reject' && response.result?.error
          ? response.result.error
          : 'Connection was rejected or failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('GemWallet connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';

      setWallet(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: errorMessage,
      }));

      // Don't re-throw the error to prevent uncaught promise rejection
      // The error is already captured in the wallet state
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      network: null,
      isLoading: false,
      error: null,
    });
    localStorage.removeItem('gemwallet_address');
    console.log('Wallet disconnected');
  }, []);

  const sendPayment = useCallback(async (destination: string, amount: string, memo?: string) => {
    if (!wallet.address || !wallet.isConnected) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    try {
      const paymentRequest = {
        amount,
        destination,
        ...(memo && {
          memos: [{
            memo: {
              memoData: Buffer.from(memo, 'utf8').toString('hex').toUpperCase(),
              memoType: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase(),
            }
          }]
        })
      };

      console.log('Sending payment:', paymentRequest);
      const response = await requestPayment(paymentRequest);

      if (response.type === 'response' && response.result) {
        console.log('Payment successful:', response.result);

        // Refresh balance after successful payment
        setTimeout(() => refreshBalance(), 1000);

        return {
          success: true,
          txHash: response.result.hash,
        };
      } else {
        const errorMsg = response.type === 'reject' && response.result?.error
          ? response.result.error
          : 'Payment was rejected or failed';

        return {
          success: false,
          error: errorMsg,
        };
      }
    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }, [wallet.address, wallet.isConnected]);

  const refreshBalance = useCallback(async () => {
    if (wallet.isConnected && wallet.address) {
      try {
        console.log('Refreshing balance...');
        const balanceResult = await getBalance(wallet.address);
        const balance = balanceResult.type === 'response' ? balanceResult.result?.balance || '0' : '0';

        setWallet(prev => ({ ...prev, balance }));
        console.log('Balance updated:', balance);
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  }, [wallet.isConnected, wallet.address]);

  // Check for existing connection
  useEffect(() => {
    const savedAddress = localStorage.getItem('gemwallet_address');
    if (savedAddress) {
      // Don't auto-connect, just show as disconnected
      setWallet(prev => ({
        ...prev,
        isLoading: false,
      }));
    } else {
      setWallet(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  const contextValue: XRPLWalletContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    sendPayment,
    refreshBalance,
  };

  return (
    <XRPLWalletContext.Provider value={contextValue}>
      {children}
    </XRPLWalletContext.Provider>
  );
};

// Custom hook to use the XRPL wallet context
export const useXRPLWallet = (): XRPLWalletContextType => {
  const context = useContext(XRPLWalletContext);
  if (context === undefined) {
    throw new Error('useXRPLWallet must be used within an XRPLWalletProvider');
  }
  return context;
};