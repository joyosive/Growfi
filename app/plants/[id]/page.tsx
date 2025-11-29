'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { availablePlants } from '@/lib/mockData';
import PurchaseModal from '@/components/PurchaseModal';
import { useWallet } from '@/lib/walletContext';
import {
  Leaf, MapPin, Calendar, Droplets, TrendingUp,
  Users, ArrowLeft, Wallet, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const PlantDetailPage = () => {
  const params = useParams();
  const { isConnected, connect } = useWallet();
  const [plant, setPlant] = useState<any>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [nftDetails, setNftDetails] = useState<any>(null);

  useEffect(() => {
    const foundPlant = availablePlants.find(p => p.id === params.id);
    setPlant(foundPlant);
  }, [params.id]);

  const handlePurchaseSuccess = (txHash: string, percentage: number) => {
    setPurchaseSuccess(true);
    setNftDetails({
      txHash,
      percentage,
      nftId: `NFT-${Date.now()}`
    });

    // Update plant availability (in real app, this would be backend)
    if (plant) {
      const updatedPlant = {
        ...plant,
        availablePercentage: plant.availablePercentage - percentage,
        soldPercentage: plant.soldPercentage + percentage
      };
      setPlant(updatedPlant);
    }
  };

  if (!plant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-neutral-600">Plant not found</p>
        </div>
      </div>
    );
  }

  const ProgressBar = ({ label, value, max }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/marketplace" className="inline-flex items-center text-neutral-600 hover:text-primary-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>

        {/* Success Banner */}
        {purchaseSuccess && nftDetails && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-8 w-8 text-primary-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary-900 mb-2">
                  Purchase Successful!
                </h3>
                <p className="text-primary-700 mb-3">
                  You now own {nftDetails.percentage}% of this {plant.name}. Your NFT has been minted and sent to your wallet.
                </p>
                <div className="bg-white rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">NFT ID:</span>
                    <span className="font-mono text-primary-600">{nftDetails.nftId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Transaction:</span>
                    <span className="font-mono text-primary-600">{nftDetails.txHash.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 mb-2">{plant.name}</h1>
                  <div className="flex items-center text-neutral-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{plant.farmName}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  plant.growthStage === 'harvest' ? 'bg-orange-100 text-orange-700' :
                  plant.growthStage === 'mature' ? 'bg-primary-100 text-primary-700' :
                  plant.growthStage === 'growing' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {plant.growthStage}
                </span>
              </div>
              <p className="text-neutral-600">{plant.description}</p>
            </div>

            {/* Investment Details */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Investment Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Plant Value</p>
                  <p className="text-2xl font-bold text-neutral-900">{plant.totalValue} XRP</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Min. Investment</p>
                  <p className="text-2xl font-bold text-neutral-900">{plant.minInvestment} XRP</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Weekly Yield Est.</p>
                  <p className="text-2xl font-bold text-primary-600">{plant.weeklyYieldEstimate} XRP</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Harvest Date</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {new Date(plant.harvestDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <ProgressBar label="Ownership Sold" value={plant.soldPercentage} max={100} />
                <ProgressBar label="Available for Purchase" value={plant.availablePercentage} max={100} />
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-primary-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">Environmental Impact</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <Leaf className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">{plant.impactMetrics.co2Saved}</p>
                  <p className="text-sm text-neutral-600">kg CO₂ Saved</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">{plant.impactMetrics.waterSaved}</p>
                  <p className="text-sm text-neutral-600">Liters Water Saved</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-neutral-900">{plant.impactMetrics.localFoodProduced}</p>
                  <p className="text-sm text-neutral-600">kg Food Produced</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Purchase Ownership</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Available</span>
                  <span className="font-semibold text-neutral-900">{plant.availablePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Price Range</span>
                  <span className="font-semibold text-neutral-900">
                    {plant.minInvestment} - {(plant.totalValue * plant.availablePercentage / 100).toFixed(2)} XRP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Est. Annual ROI</span>
                  <span className="font-semibold text-primary-600">
                    {((plant.weeklyYieldEstimate * 52 / plant.totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {isConnected ? (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={plant.availablePercentage === 0}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {plant.availablePercentage === 0 ? 'Sold Out' : 'Buy Fractional Ownership'}
                </button>
              ) : (
                <button
                  onClick={connect}
                  className="w-full btn-secondary inline-flex items-center justify-center"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet to Invest
                </button>
              )}

              <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-neutral-900 mb-1">Yield Distribution</p>
                    <p className="text-neutral-600">
                      Yields are distributed weekly every Monday directly to your XRP wallet based on your ownership percentage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        plant={plant}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </>
  );
};

export default PlantDetailPage;