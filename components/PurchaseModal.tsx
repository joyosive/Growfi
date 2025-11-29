'use client';

import React, { useState } from 'react';
import { Plant } from '@/lib/types';
import { useWallet } from '@/lib/walletContext';
import { X, Leaf, TrendingUp, AlertCircle } from 'lucide-react';

interface PurchaseModalProps {
  plant: Plant;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string, percentage: number) => void;
}

export default function PurchaseModal({ plant, isOpen, onClose, onSuccess }: PurchaseModalProps) {
  const { isConnected, sendPayment, userWallet } = useWallet();
  const [percentage, setPercentage] = useState(10); // Default 10% ownership
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const investmentAmount = (plant.totalValue * percentage) / 100;
  const estimatedWeeklyYield = (plant.weeklyYieldEstimate * percentage) / 100;
  const estimatedAnnualReturn = estimatedWeeklyYield * 52;
  const roi = ((estimatedAnnualReturn / investmentAmount) * 100).toFixed(1);

  const handlePurchase = async () => {
    if (!isConnected || !userWallet) {
      setError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const memo = `${plant.id}:${percentage}%`;
      // Convert XRP to drops (1 XRP = 1,000,000 drops)
      const amountInDrops = (investmentAmount * 1000000).toString();
      const result = await sendPayment('rTreasuryWalletAddress', amountInDrops, memo);

      if (result?.hash) {
        // Simulate NFT minting (in real app, this would be backend API call)
        setTimeout(() => {
          onSuccess(result.hash, percentage);
          onClose();
        }, 2000);
      } else {
        setError('Transaction was cancelled or failed');
        setIsProcessing(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Purchase Plant Fraction</h2>
            <p className="text-neutral-600 mt-1">{plant.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Ownership Percentage
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min={Math.max(1, (plant.minInvestment / plant.totalValue) * 100)}
                max={plant.availablePercentage}
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-16 text-right">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">Investment Amount</span>
              <span className="font-semibold text-neutral-900">{investmentAmount.toFixed(2)} XRP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Weekly Yield Estimate</span>
              <span className="font-semibold text-primary-600">~{estimatedWeeklyYield.toFixed(2)} XRP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Annual ROI</span>
              <span className="font-semibold text-primary-600">{roi}%</span>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Leaf className="h-5 w-5 text-primary-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary-900 mb-1">Environmental Impact</p>
                <p className="text-primary-700">
                  Your investment will save approximately {((plant.impactMetrics.co2Saved * percentage) / 100).toFixed(1)} kg of CO₂
                  and {((plant.impactMetrics.waterSaved * percentage) / 100).toFixed(0)} liters of water.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={isProcessing || !isConnected}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Buy ${percentage}% for ${investmentAmount.toFixed(2)} XRP`}
          </button>
        </div>
      </div>
    </div>
  );
}