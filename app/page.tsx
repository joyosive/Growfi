'use client';

import { useState, useEffect } from 'react';
import { torontoFarms, availablePlants } from '@/lib/mockData';
import FarmCard from '@/components/FarmCard';
import PlantCard from '@/components/PlantCard';
import { useWallet } from '@/lib/walletContext';
import { Leaf, TrendingUp, Users, Droplets, ArrowRight, Wallet, BarChart3, Sprout } from 'lucide-react';
import Link from 'next/link';

const StatCard = ({ icon: Icon, value, label, color }: any) => (
  <div className="text-center">
    <div className={`inline-flex items-center justify-center w-12 h-12 ${color} rounded-lg mb-3`}>
      <Icon className="h-6 w-6" />
    </div>
    <div className="text-3xl font-bold text-neutral-900">{value}</div>
    <div className="text-neutral-600">{label}</div>
  </div>
);

const StepCard = ({ number, title, description }: any) => (
  <div className="text-center">
    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
      <span className="text-2xl font-bold text-primary-600">{number}</span>
    </div>
    <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
    <p className="text-sm text-neutral-600">{description}</p>
  </div>
);

const ImpactMetric = ({ icon: Icon, value, label }: any) => (
  <div>
    <Icon className="h-12 w-12 mx-auto mb-4" />
    <div className="text-4xl font-bold mb-2">{value}</div>
    <div className="text-primary-100">{label}</div>
  </div>
);

export default function Home() {
  const { isConnected, connect } = useWallet();
  const [featuredFarms, setFeaturedFarms] = useState(torontoFarms.slice(0, 3));
  const [featuredPlants, setFeaturedPlants] = useState(availablePlants.slice(0, 6));

  const stats = [
    { icon: Leaf, value: '5', label: 'Active Farms', color: 'bg-primary-100 text-primary-600' },
    { icon: Sprout, value: '230+', label: 'Plants Available', color: 'bg-blue-100 text-blue-600' },
    { icon: BarChart3, value: '5-8%', label: 'Weekly Yields', color: 'bg-orange-100 text-orange-600' },
    { icon: Users, value: '10 XRP', label: 'Min. Investment', color: 'bg-purple-100 text-purple-600' }
  ];

  const steps = [
    { number: 1, title: 'Connect Wallet', description: 'Login securely with your XRP wallet' },
    { number: 2, title: 'Choose Plants', description: 'Browse farms and select plants to invest in' },
    { number: 3, title: 'Buy Fractional Ownership', description: 'Purchase shares starting from 10 XRP' },
    { number: 4, title: 'Earn Monthly Yields', description: 'Receive XRP distributions from harvests' }
  ];

  const impactMetrics = [
    { icon: Leaf, value: '250+ kg', label: 'CO₂ Reduced Monthly' },
    { icon: Droplets, value: '5000+ L', label: 'Water Conserved Weekly' },
    { icon: Users, value: '100+', label: 'Local Families Fed' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-neutral-900 mb-6">
                Co-own & co-grow sustainable urban food
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Own fractional shares of real plants. Earn weekly XRP yields. Support sustainable local agriculture.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/farms" className="btn-primary inline-flex items-center">
                Browse Farms <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              {!isConnected && (
                <button onClick={connect} className="btn-secondary inline-flex items-center">
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farms */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-900">Featured Toronto Farms</h2>
            <Link href="/farms" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredFarms.map((farm) => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </div>
        </div>
      </section>

      {/* Available Plants */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-900">Available Plants</h2>
            <Link href="/marketplace" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
              View marketplace <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-8">Your Impact Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactMetrics.map((metric, index) => (
              <ImpactMetric key={index} {...metric} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}