'use client';

import React, { useState, useMemo } from 'react';
import { availablePlants, torontoFarms } from '@/lib/mockData';
import PlantCard from '@/components/PlantCard';
import { Search, Filter, Leaf, TrendingUp } from 'lucide-react';

const MarketplacePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('yield');

  const filteredAndSortedPlants = useMemo(() => {
    let filtered = availablePlants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(plant =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.farmName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Farm filter
    if (selectedFarm !== 'all') {
      filtered = filtered.filter(plant => plant.farmId === selectedFarm);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(plant => plant.type === selectedType);
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'yield':
          return b.weeklyYieldEstimate - a.weeklyYieldEstimate;
        case 'price-low':
          return a.minInvestment - b.minInvestment;
        case 'price-high':
          return b.minInvestment - a.minInvestment;
        case 'availability':
          return b.availablePercentage - a.availablePercentage;
        default:
          return 0;
      }
    });
  }, [searchTerm, selectedFarm, selectedType, sortBy]);

  const stats = {
    totalPlants: availablePlants.length,
    avgYield: (availablePlants.reduce((sum, p) => sum + p.weeklyYieldEstimate, 0) / availablePlants.length).toFixed(1),
    minInvestment: Math.min(...availablePlants.map(p => p.minInvestment)),
    totalValue: availablePlants.reduce((sum, p) => sum + p.totalValue, 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Plant Marketplace</h1>
        <p className="text-neutral-600">Invest in fractional ownership of urban farm plants</p>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Leaf className="h-4 w-4 text-primary-600" />
              <p className="text-sm text-neutral-600">Available Plants</p>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalPlants}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary-600" />
              <p className="text-sm text-neutral-600">Avg. Weekly Yield</p>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stats.avgYield} XRP</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-1">Min. Investment</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.minInvestment} XRP</p>
          </div>
          <div>
            <p className="text-sm text-neutral-600 mb-1">Total Market Value</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalValue.toLocaleString()} XRP</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Farm Filter */}
          <select
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Farms</option>
            {torontoFarms.map(farm => (
              <option key={farm.id} value={farm.id}>{farm.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="vegetable">Vegetables</option>
            <option value="leafy">Leafy Greens</option>
            <option value="herb">Herbs</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="yield">Highest Yield</option>
            <option value="price-low">Lowest Price</option>
            <option value="price-high">Highest Price</option>
            <option value="availability">Most Available</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {filteredAndSortedPlants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Leaf className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600">No plants found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;