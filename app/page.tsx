'use client';

import { useState, useEffect } from 'react';
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
          </div>
        </div>
      </section>
    </div>
  );
}