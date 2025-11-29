'use client';

import React, { useState } from 'react';
import { torontoFarms, availablePlants } from '@/lib/mockData';
import FarmCard from '@/components/FarmCard';
import PlantCard from '@/components/PlantCard';
import { MapPin, Leaf, Users, TrendingUp, Search } from 'lucide-react';

const FarmsPage = () => {
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFarms = torontoFarms.filter(farm =>
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFarmDetails = selectedFarm ?
    torontoFarms.find(f => f.id === selectedFarm) : null;

  const farmsPlants = selectedFarm ?
    availablePlants.filter(p => p.farmId === selectedFarm) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Toronto Urban Farms</h1>
        <p className="text-neutral-600">Explore our network of sustainable urban farms</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search farms by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {!selectedFarm ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-neutral-900">{torontoFarms.length}</span>
              </div>
              <p className="text-neutral-600">Active Farms</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Leaf className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-neutral-900">
                  {torontoFarms.reduce((sum, f) => sum + f.totalPlots, 0)}
                </span>
              </div>
              <p className="text-neutral-600">Total Plots</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-neutral-900">
                  {torontoFarms.reduce((sum, f) => sum + f.availablePlots, 0)}
                </span>
              </div>
              <p className="text-neutral-600">Available Plots</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-neutral-900">
                  {Math.round(torontoFarms.reduce((sum, f) => sum + f.sustainabilityScore, 0) / torontoFarms.length)}
                </span>
              </div>
              <p className="text-neutral-600">Avg. Sustainability</p>
            </div>
          </div>

          {/* Farms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => (
              <div key={farm.id} onClick={() => setSelectedFarm(farm.id)}>
                <FarmCard farm={farm} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Selected Farm Detail */}
          <button
            onClick={() => setSelectedFarm(null)}
            className="mb-6 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to all farms
          </button>

          {selectedFarmDetails && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    {selectedFarmDetails.name}
                  </h2>
                  <div className="flex items-center text-neutral-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedFarmDetails.address}</span>
                  </div>
                  <p className="text-neutral-600 mb-6">{selectedFarmDetails.description}</p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Total Plots</span>
                      <span className="font-semibold text-neutral-900">{selectedFarmDetails.totalPlots}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Available Plots</span>
                      <span className="font-semibold text-primary-600">{selectedFarmDetails.availablePlots}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Sustainability Score</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-neutral-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${selectedFarmDetails.sustainabilityScore}%` }}
                          />
                        </div>
                        <span className="font-semibold text-primary-600">
                          {selectedFarmDetails.sustainabilityScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative h-64 lg:h-auto rounded-xl overflow-hidden">
                  <img
                    src={selectedFarmDetails.image}
                    alt={selectedFarmDetails.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Farm's Plants */}
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-6">
              Available Plants at {selectedFarmDetails?.name}
            </h3>
            {farmsPlants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farmsPlants.map((plant) => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-neutral-50 rounded-xl">
                <Leaf className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">No plants available at this farm currently</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FarmsPage;