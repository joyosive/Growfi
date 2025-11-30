'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getAddress, getNetwork, getBalance, requestPayment, isInstalled } from '@gemwallet/api';
import { Payment } from 'xrpl';

interface WalletContextType {
  userWallet: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  network: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendPayment: (destination: string, amount: string, memo?: string) => Promise<any>;
  mintNFT: (tokenTaxon: number, metadata: any) => Promise<any>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

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

  const connect = useCallback(async () => {
    // If already connected, don't need to reconnect
    if (isConnected && userWallet) {
      console.log('Wallet already connected:', userWallet);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Check if in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      console.log('Attempting to connect to GemWallet...');

      // Connect to GemWallet directly - let the API handle detection
      const response = await getAddress();

      if (response.type === 'response' && response.result) {
        const { address } = response.result;
        console.log('Connected to GemWallet:', address);

        // Get network and balance sequentially to avoid race conditions
        try {
          const networkResult = await getNetwork();
          const balanceResult = await getBalance(address);

          const networkValue = networkResult.type === 'response' ? networkResult.result?.network || 'testnet' : 'testnet';
          const balanceValue = balanceResult.type === 'response' ? balanceResult.result?.balance || '0' : '0';

          setNetwork(networkValue);
          setBalance(balanceValue);
        } catch (err) {
          console.warn('Could not fetch network/balance:', err);
          setNetwork('testnet');
          setBalance('0');
        }

        setUserWallet(address);
        setIsConnected(true);
        setError(null); // Clear any previous errors
        localStorage.setItem('userWallet', address);
        console.log('Wallet connected successfully');
      } else {
        const errorMessage = response.type === 'reject' && response.result?.error
          ? response.result.error
          : 'Connection was rejected or failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('GemWallet connection error:', error);

      let errorMessage = 'Failed to connect wallet';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Check if this is a "GemWallet not found" error
      if (error?.message?.includes('GemWallet needs to be installed') ||
          error?.message?.includes('Please check if GemWallet is installed') ||
          error?.message?.includes('gemwallet is not defined') ||
          error?.code === 'GEMWALLET_NOT_FOUND') {
        errorMessage = 'GemWallet extension not found. Please install GemWallet from: https://gemwallet.app';
      } else if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        errorMessage = 'Connection was rejected by user';
      } else if (errorMessage === 'Failed to connect wallet') {
        // Generic error, might be extension not installed
        errorMessage = 'Unable to connect to GemWallet. Please ensure the extension is installed and enabled.';
      }

      setError(errorMessage);
      setIsConnected(false);
      setUserWallet(null);
      localStorage.removeItem('userWallet');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, userWallet]);

  const disconnect = useCallback(() => {
    setUserWallet(null);
    setIsConnected(false);
    setBalance(null);
    setNetwork(null);
    setError(null);
    localStorage.removeItem('userWallet');
    console.log('Wallet disconnected');
  }, []);

  const refreshBalance = useCallback(async () => {
    if (isConnected && userWallet) {
      try {
        console.log('Refreshing balance...');
        const balanceResult = await getBalance(userWallet);
        const balanceValue = balanceResult.type === 'response' ? balanceResult.result?.balance || '0' : '0';
        setBalance(balanceValue);
        console.log('Balance updated:', balanceValue);
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  }, [isConnected, userWallet]);

  const sendPayment = useCallback(async (destination: string, amount: string, memo?: string) => {
    if (!userWallet || !isConnected) {
      throw new Error('Wallet not connected');
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

        // Refresh balance after payment
        setTimeout(() => refreshBalance(), 1000);

        return {
          success: true,
          hash: response.result.hash,
          txHash: response.result.hash, // Add both for compatibility
          ...response.result
        };
      } else {
        const errorMsg = response.type === 'reject' && response.result?.error
          ? response.result.error
          : 'Payment was rejected or failed';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }, [userWallet, isConnected, refreshBalance]);

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
      console.log('Restoring wallet connection:', savedWallet);
      setUserWallet(savedWallet);
      setIsConnected(true);
      setNetwork('testnet'); // Set default network
      setBalance('0'); // Set default balance

      // Try to refresh balance and network info in background
      const refreshWalletData = async () => {
        try {
          const networkResult = await getNetwork();
          const balanceResult = await getBalance(savedWallet);

          if (networkResult.type === 'response') {
            setNetwork(networkResult.result?.network || 'testnet');
          }

          if (balanceResult.type === 'response') {
            setBalance(balanceResult.result?.balance || '0');
          }
        } catch (error) {
          console.warn('Could not refresh wallet data on restore:', error);
          // Keep the wallet connected even if balance/network refresh fails
        }
      };

      // Refresh data in background without blocking UI
      refreshWalletData();
    }
  }, []);

  return (
    <WalletContext.Provider value={{
      userWallet,
      isConnected,
      isConnecting,
      balance,
      network,
      error,
      connect,
      disconnect,
      sendPayment,
      mintNFT,
      refreshBalance
    }}>
      {children}
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
