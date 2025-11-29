'use client';

import { Plant } from '@/lib/types';
import { Droplets, Leaf, TrendingUp, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

interface PlantCardProps {
  plant: Plant;
}

export default function PlantCard({ plant }: PlantCardProps) {
  const getGrowthStageColor = (stage: string) => {
    switch (stage) {
      case 'seedling': return 'bg-yellow-100 text-yellow-700';
      case 'growing': return 'bg-blue-100 text-blue-700';
      case 'mature': return 'bg-primary-100 text-primary-700';
      case 'harvest': return 'bg-orange-100 text-orange-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <Link href={`/plants/${plant.id}`}>
      <div className="card group cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{plant.name}</h3>
            <div className="flex items-center text-neutral-600 text-sm mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{plant.farmName}</span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGrowthStageColor(plant.growthStage)}`}>
            {plant.growthStage}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Investment Range</span>
            <span className="text-sm font-semibold text-neutral-900">
              {plant.minInvestment} - {plant.totalValue} XRP
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Weekly Yield</span>
            <span className="text-sm font-semibold text-primary-600">
              ~{plant.weeklyYieldEstimate} XRP
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Available</span>
            <span className="text-sm font-semibold text-neutral-900">
              {plant.availablePercentage}%
            </span>
          </div>

          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${plant.soldPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Leaf className="h-4 w-4 text-primary-600" />
            </div>
            <div className="text-xs text-neutral-600">CO₂</div>
            <div className="text-xs font-semibold">{plant.impactMetrics.co2Saved}kg</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Droplets className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xs text-neutral-600">Water</div>
            <div className="text-xs font-semibold">{plant.impactMetrics.waterSaved}L</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-xs text-neutral-600">Harvest</div>
            <div className="text-xs font-semibold">
              {new Date(plant.harvestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}