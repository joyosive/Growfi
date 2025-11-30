'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { torontoFarms, availablePlants } from '@/lib/mockData';
import PlantCard from '@/components/PlantCard';
import FarmPlotSelector from '@/components/FarmPlotSelector';
import MPTPurchaseInterface from '@/components/MPTPurchaseInterface';
import { MapPin, Leaf, ArrowLeft, Grid, List, Coins } from 'lucide-react';
import Link from 'next/link';

const FarmDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const farmId = params.id as string;
  const [viewMode, setViewMode] = useState<'plots' | 'plants' | 'mpt'>('mpt');

  const farm = torontoFarms.find(f => f.id === farmId);
  const farmPlants = availablePlants.filter(p => p.farmId === farmId);

  if (!farm) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Farm not found</h1>
          <p className="text-neutral-600 mb-6">The farm you're looking for doesn't exist.</p>
          <Link href="/farms" className="btn-primary">
            Back to Farms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/farms"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all farms
      </Link>

      {/* Farm Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              {farm.name}
            </h1>
            <div className="flex items-center text-neutral-600 mb-6">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-lg">{farm.address}</span>
            </div>
            <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
              {farm.description}
            </p>

            <div className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b border-neutral-100">
                <span className="text-neutral-600 text-lg">Total Plots</span>
                <span className="font-semibold text-neutral-900 text-xl">{farm.totalPlots}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-neutral-100">
                <span className="text-neutral-600 text-lg">Available Plots</span>
                <span className="font-semibold text-primary-600 text-xl">{farm.availablePlots}</span>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-neutral-600 text-lg">Sustainability Score</span>
                <div className="flex items-center">
                  <div className="w-40 bg-neutral-200 rounded-full h-3 mr-4">
                    <div
                      className="bg-primary-600 h-3 rounded-full"
                      style={{ width: `${farm.sustainabilityScore}%` }}
                    />
                  </div>
                  <span className="font-semibold text-primary-600 text-xl">
                    {farm.sustainabilityScore}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-80 lg:h-auto rounded-xl overflow-hidden">
            <img
              src={farm.image}
              alt={farm.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">
          Investment Options
        </h2>
        <div className="flex bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('mpt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'mpt'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Coins className="h-4 w-4" />
            Buy MPT Tokens
          </button>
          <button
            onClick={() => setViewMode('plots')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'plots'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Grid className="h-4 w-4" />
            Plot Selection
          </button>
          <button
            onClick={() => setViewMode('plants')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'plants'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <List className="h-4 w-4" />
            Plant Packages
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'mpt' ? (
        <MPTPurchaseInterface farmName={farm.name} farmId={farmId} />
      ) : viewMode === 'plots' ? (
        <FarmPlotSelector
          farmName={farm.name}
          farmId={farmId}
          totalPlots={farm.totalPlots}
          availablePlots={farm.availablePlots}
          onPlotSelect={(plots) => {
            console.log('Selected plots:', plots);
            // Handle plot selection - could navigate to checkout
          }}
        />
      ) : (
        <div>
          {farmPlants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmPlants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-neutral-50 rounded-xl">
              <Leaf className="h-16 w-16 text-neutral-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">No plant packages available</h3>
              <p className="text-neutral-600">
                This farm doesn't have any plant packages available for investment at the moment.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmDetailPage;