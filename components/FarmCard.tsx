'use client';

import { Farm } from '@/lib/types';
import { MapPin, Leaf, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface FarmCardProps {
  farm: Farm;
}

export default function FarmCard({ farm }: FarmCardProps) {
  const availabilityPercentage = Math.round((farm.availablePlots / farm.totalPlots) * 100);

  return (
    <Link href={`/farms/${farm.id}`}>
      <div className="card group cursor-pointer">
        <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl bg-gradient-to-br from-primary-100 to-primary-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-24 w-24 text-primary-300" />
          </div>
          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-medium text-primary-700">
            {availabilityPercentage}% Available
          </div>
        </div>

        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{farm.name}</h3>

        <div className="flex items-center text-neutral-600 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{farm.location}</span>
        </div>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{farm.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center space-x-1">
            <Leaf className="h-4 w-4 text-primary-600" />
            <span className="text-sm text-neutral-600">{farm.availablePlots} plots</span>
          </div>

          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">{farm.sustainabilityScore}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}