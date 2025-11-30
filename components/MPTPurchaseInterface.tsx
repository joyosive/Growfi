'use client';

import React, { useState } from 'react';
import { useWallet } from '@/lib/walletContext';
import { Wallet, AlertTriangle, CheckCircle, ExternalLink, Loader } from 'lucide-react';

interface MPTPurchaseInterfaceProps {
  farmName: string;
  farmId: string;
}

// Farm to MPT token mapping
const FARM_MPT_MAPPING: { [key: string]: { tokenId: string; symbol: string; name: string } } = {
  'farm-1': {
    tokenId: process.env.NEXT_PUBLIC_FRSH_TOKEN_ID || 'FBBC02625D50DA9B36BC3F112814493FFF6F8B4EF95A710E06AA6ACF49E655CB',
    symbol: 'FRSH',
    name: 'Fresh City Farms Token'
  },
  'farm-2': {
    tokenId: process.env.NEXT_PUBLIC_CREEK_TOKEN_ID || '4BFDE23483A14EF72965B0C4538BCAB637021583E14791630F9447FE5AEF9142',
    symbol: 'CREEK',
    name: 'Black Creek Community Token'
  },
  'farm-3': {
    tokenId: process.env.NEXT_PUBLIC_GROW_TOKEN_ID || '3E3AFA6F6C2A58B6145ABF8AC77EE7E43E7E7240F350B703891D99C6B8841DDA',
    symbol: 'GROW',
    name: 'Toronto Urban Growers Token'
  },
  'farm-4': {
    tokenId: process.env.NEXT_PUBLIC_RIVER_TOKEN_ID || '72B238CCCBD4C5BBB2C2E4005A35E2C341028ACA6B03AF109E9DEAFF0407C0FE',
    symbol: 'RIVER',
    name: 'Riverdale Farm Token'
  },
  'farm-5': {
    tokenId: process.env.NEXT_PUBLIC_SHARE_TOKEN_ID || '1376534AC46D45F0AC993B7CE4CD0AAFAE3E117E2EB26A29DBBEA681A7121B94',
    symbol: 'SHARE',
    name: 'FoodShare Toronto Token'
  },
};

const MPTPurchaseInterface: React.FC<MPTPurchaseInterfaceProps> = ({ farmName, farmId }) => {
  const { userWallet, isConnected, balance } = useWallet();
  const [purchaseAmount, setPurchaseAmount] = useState<number>(10);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [authorizationResult, setAuthorizationResult] = useState<any>(null);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const farmToken = FARM_MPT_MAPPING[farmId];

  if (!farmToken) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">MPT Not Available</span>
        </div>
        <p className="text-red-700 mt-2">This farm doesn't have an associated MPT token yet.</p>
      </div>
    );
  }

  const handleAuthorizeUser = async () => {
    if (!userWallet) return;

    setIsAuthorizing(true);
    setError(null);

    try {
      const response = await fetch('/api/mpt/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userWallet,
          mptTokenId: farmToken.tokenId
        })
      });

      const result = await response.json();

      if (result.success) {
        setAuthorizationResult(result);
        console.log('Authorization successful:', result);
      } else {
        setError(result.error || 'Authorization failed');
      }
    } catch (error) {
      console.error('Authorization error:', error);
      setError('Failed to authorize user. Please try again.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handlePurchaseMPT = async () => {
    if (!userWallet || !authorizationResult) return;

    setIsPurchasing(true);
    setError(null);

    try {
      // Simulate XRP payment hash (in real implementation, this would come from actual XRP payment)
      const mockXrpTxHash = `XRP${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/mpt/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userWallet,
          mptTokenId: farmToken.tokenId,
          amount: purchaseAmount.toString(),
          farmName,
          plotDetails: `${purchaseAmount} plots`,
          xrpPaymentHash: mockXrpTxHash
        })
      });

      const result = await response.json();

      if (result.success) {
        setPurchaseResult(result);
        console.log('Purchase successful:', result);
      } else {
        setError(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Failed to complete purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">
          🪙 Purchase {farmToken.symbol} Tokens
        </h3>
        <p className="text-neutral-600">
          Buy Multi-Purpose Tokens representing ownership in {farmName}
        </p>
      </div>

      {/* Token Information */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
        <h4 className="font-semibold text-neutral-900 mb-4">Token Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-neutral-600">Symbol</span>
            <div className="font-mono font-bold text-lg text-blue-600">{farmToken.symbol}</div>
          </div>
          <div>
            <span className="text-sm text-neutral-600">Token Name</span>
            <div className="font-medium text-neutral-900">{farmToken.name}</div>
          </div>
          <div className="md:col-span-2">
            <span className="text-sm text-neutral-600">Token ID</span>
            <div className="font-mono text-xs text-neutral-700 bg-white rounded p-2 mt-1 break-all">
              {farmToken.tokenId}
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Status */}
      {isConnected && userWallet ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Wallet Connected</span>
          </div>
          <p className="text-sm text-green-700">
            Address: <span className="font-mono">{userWallet}</span>
          </p>
          <p className="text-sm text-green-700">
            Balance: {balance} XRP
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 text-yellow-600">
            <Wallet className="h-5 w-5" />
            <span className="font-medium">Please connect your wallet to continue</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}

      {/* Purchase Amount Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Number of Tokens to Purchase
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={purchaseAmount}
          onChange={(e) => setPurchaseAmount(Number(e.target.value))}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter amount"
        />
        <p className="text-sm text-neutral-600 mt-2">
          Cost: {purchaseAmount * 10} XRP (10 XRP per token)
        </p>
      </div>

      {/* Step 1: Authorization */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            authorizationResult ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {authorizationResult ? '✓' : '1'}
          </div>
          <span className="font-medium text-neutral-900">Authorize Token Holding</span>
        </div>

        {authorizationResult ? (
          <div className="ml-11 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Authorization Complete</span>
            </div>
            <a
              href={authorizationResult.explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View Transaction <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <div className="ml-11">
            <button
              onClick={handleAuthorizeUser}
              disabled={!isConnected || isAuthorizing}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {isAuthorizing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Authorizing...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Authorize Token Holding
                </>
              )}
            </button>
            <p className="text-sm text-neutral-600 mt-2">
              This allows you to receive and hold {farmToken.symbol} tokens
            </p>
          </div>
        )}
      </div>

      {/* Step 2: Purchase */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            purchaseResult ? 'bg-green-500 text-white' :
            authorizationResult ? 'bg-blue-500 text-white' : 'bg-neutral-300 text-neutral-500'
          }`}>
            {purchaseResult ? '✓' : '2'}
          </div>
          <span className="font-medium text-neutral-900">Purchase MPT Tokens</span>
        </div>

        {purchaseResult ? (
          <div className="ml-11 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Purchase Complete!</span>
            </div>
            <p className="text-sm text-green-700 mb-2">
              Received {purchaseResult.amount} {farmToken.symbol} tokens
            </p>
            <a
              href={purchaseResult.explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View Transaction <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <div className="ml-11">
            <button
              onClick={handlePurchaseMPT}
              disabled={!authorizationResult || isPurchasing}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {isPurchasing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing Purchase...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Purchase {purchaseAmount} {farmToken.symbol} Tokens
                </>
              )}
            </button>
            <p className="text-sm text-neutral-600 mt-2">
              Total cost: {purchaseAmount * 10} XRP
            </p>
          </div>
        )}
      </div>

      {/* Issuer Information */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <h4 className="font-medium text-neutral-900 mb-2">Token Issuer</h4>
        <p className="text-sm text-neutral-600">
          Issuer: <span className="font-mono text-xs">rBWTUHDH2GAqQtHfNJZd4CaCs5fxppwRaH</span>
        </p>
        <a
          href="https://testnet.xrpl.org/accounts/rBWTUHDH2GAqQtHfNJZd4CaCs5fxppwRaH"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
        >
          View Issuer on Explorer <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default MPTPurchaseInterface;