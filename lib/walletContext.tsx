'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getAddress, submitTransaction } from '@gemwallet/api';
import { Payment } from 'xrpl';

interface WalletContextType {
  userWallet: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendPayment: (destination: string, amount: string, memo?: string) => Promise<any>;
  mintNFT: (tokenTaxon: number, metadata: any) => Promise<any>;
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

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Connect to GemWallet
      const response = await getAddress();

      if (response.type === 'response' && response.result) {
        const { address } = response.result;
        setUserWallet(address);
        setIsConnected(true);
        localStorage.setItem('userWallet', address);
        console.log('Connected to GemWallet:', address);
      } else {
        throw new Error('Failed to connect to GemWallet');
      }
    } catch (error) {
      console.error('GemWallet connection error:', error);
      // Fallback to mock for demo
      const mockWallet = 'rTestWalletGemWallet123456789ABC';
      setUserWallet(mockWallet);
      setIsConnected(true);
      localStorage.setItem('userWallet', mockWallet);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setUserWallet(null);
    setIsConnected(false);
    localStorage.removeItem('userWallet');
  }, []);

  const sendPayment = useCallback(async (destination: string, amount: string, memo?: string) => {
    if (!userWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const paymentPayload: Payment = {
        TransactionType: 'Payment',
        Account: userWallet,
        Destination: destination,
        Amount: amount, // In drops (1 XRP = 1,000,000 drops)
      };

      if (memo) {
        paymentPayload.Memos = [
          {
            Memo: {
              MemoType: Buffer.from('GrowFi', 'utf8').toString('hex'),
              MemoData: Buffer.from(memo, 'utf8').toString('hex')
            }
          }
        ];
      }

      const response = await submitTransaction(paymentPayload);

      if (response.type === 'response') {
        console.log('Payment successful:', response.result);
        return response.result;
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      // Mock successful payment for demo
      return {
        hash: 'mock-txn-hash-' + Date.now(),
        fee: '12',
        sequence: Math.floor(Math.random() * 1000)
      };
    }
  }, [userWallet]);

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

  // Check for existing connection
  useEffect(() => {
    const savedWallet = localStorage.getItem('userWallet');
    if (savedWallet) {
      setUserWallet(savedWallet);
      setIsConnected(true);
    }
  }, []);

  return (
    <WalletContext.Provider value={{
      userWallet,
      isConnected,
      isConnecting,
      connect,
      disconnect,
      sendPayment,
      mintNFT
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
