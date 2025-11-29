'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/lib/walletContext';
import { availablePlants } from '@/lib/mockData';
import {
  Leaf, TrendingUp, Wallet, Calendar, Award,
  ArrowUpRight, ArrowDownRight, Clock, Droplets
} from 'lucide-react';
import Link from 'next/link';

const PortfolioPage = () => {
  const { userWallet, isConnected } = useWallet();
  const [portfolio, setPortfolio] = useState<any>({
    investments: [],
    totalInvested: 0,
    totalYieldsReceived: 0,
    weeklyYieldEstimate: 0,
    impactMetrics: { co2Saved: 0, waterSaved: 0, foodProduced: 0 }
  });

  useEffect(() => {
    // Simulate fetching user's portfolio (in real app, this would be API call)
    if (isConnected && userWallet) {
      const mockInvestments = [
        {
          id: 'inv-1',
          plant: availablePlants[0],
          ownershipPercentage: 25,
          purchasePrice: 25,
          purchaseDate: '2024-01-15',
          totalYieldsReceived: 12.5,
          lastYieldDate: '2024-02-05',
          nftId: 'NFT-001'
        },
        {
          id: 'inv-2',
          plant: availablePlants[2],
          ownershipPercentage: 15,
          purchasePrice: 12,
          purchaseDate: '2024-01-20',
          totalYieldsReceived: 8.4,
          lastYieldDate: '2024-02-05',
          nftId: 'NFT-002'
        },
        {
          id: 'inv-3',
          plant: availablePlants[4],
          ownershipPercentage: 30,
          purchasePrice: 18,
          purchaseDate: '2024-01-25',
          totalYieldsReceived: 10.5,
          lastYieldDate: '2024-02-05',
          nftId: 'NFT-003'
        }
      ];

      const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.purchasePrice, 0);
      const totalYields = mockInvestments.reduce((sum, inv) => sum + inv.totalYieldsReceived, 0);
      const weeklyEstimate = mockInvestments.reduce((sum, inv) =>
        sum + (inv.plant.weeklyYieldEstimate * inv.ownershipPercentage / 100), 0
      );

      const impactMetrics = mockInvestments.reduce((acc, inv) => ({
        co2Saved: acc.co2Saved + (inv.plant.impactMetrics.co2Saved * inv.ownershipPercentage / 100),
        waterSaved: acc.waterSaved + (inv.plant.impactMetrics.waterSaved * inv.ownershipPercentage / 100),
        foodProduced: acc.foodProduced + (inv.plant.impactMetrics.localFoodProduced * inv.ownershipPercentage / 100)
      }), { co2Saved: 0, waterSaved: 0, foodProduced: 0 });

      setPortfolio({
        investments: mockInvestments,
        totalInvested,
        totalYieldsReceived: totalYields,
        weeklyYieldEstimate: weeklyEstimate,
        impactMetrics
      });
    }
  }, [isConnected, userWallet]);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Connect Your Wallet</h2>
          <p className="text-neutral-600">Please connect your Xumm wallet to view your portfolio</p>
        </div>
      </div>
    );
  }

  const roi = portfolio.totalInvested > 0
    ? ((portfolio.totalYieldsReceived / portfolio.totalInvested) * 100).toFixed(1)
    : '0';

  const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        {change && (
          <div className={`flex items-center text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-neutral-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Your Portfolio</h1>
        <p className="text-neutral-600">Track your investments and yields</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Wallet}
          label="Total Invested"
          value={`${portfolio.totalInvested} XRP`}
          color="bg-primary-100 text-primary-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Yields Received"
          value={`${portfolio.totalYieldsReceived.toFixed(2)} XRP`}
          change={5.2}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={Clock}
          label="Weekly Yield Est."
          value={`${portfolio.weeklyYieldEstimate.toFixed(2)} XRP`}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={Award}
          label="Total ROI"
          value={`${roi}%`}
          change={2.1}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Environmental Impact */}
      <div className="bg-primary-50 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-primary-900 mb-4">Your Environmental Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <Leaf className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-neutral-900">{portfolio.impactMetrics.co2Saved.toFixed(1)}</p>
            <p className="text-sm text-neutral-600">kg CO₂ Saved</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-neutral-900">{Math.round(portfolio.impactMetrics.waterSaved)}</p>
            <p className="text-sm text-neutral-600">Liters Water Saved</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-neutral-900">{portfolio.impactMetrics.foodProduced.toFixed(1)}</p>
            <p className="text-sm text-neutral-600">kg Food Produced</p>
          </div>
        </div>
      </div>

      {/* Active Investments */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Active Investments</h2>
        <div className="space-y-4">
          {portfolio.investments.map((investment: any) => (
            <div key={investment.id} className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        {investment.plant.name}
                      </h3>
                      <p className="text-neutral-600 text-sm">{investment.plant.farmName}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {investment.ownershipPercentage}% Ownership
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Invested</p>
                      <p className="font-semibold text-neutral-900">{investment.purchasePrice} XRP</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Yields Received</p>
                      <p className="font-semibold text-primary-600">{investment.totalYieldsReceived} XRP</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Weekly Est.</p>
                      <p className="font-semibold text-neutral-900">
                        {(investment.plant.weeklyYieldEstimate * investment.ownershipPercentage / 100).toFixed(2)} XRP
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Purchase Date</p>
                      <p className="font-semibold text-neutral-900">
                        {new Date(investment.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">NFT ID</p>
                      <p className="font-mono text-sm text-primary-600">{investment.nftId}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-4">
                    <Link
                      href={`/plants/${investment.plant.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Plant Details →
                    </Link>
                    <span className="text-neutral-400">|</span>
                    <span className="text-sm text-neutral-600">
                      Last yield: {new Date(investment.lastYieldDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {portfolio.investments.length === 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Leaf className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Investments Yet</h3>
          <p className="text-neutral-600 mb-6">Start investing in urban farms to see your portfolio here</p>
          <Link href="/marketplace" className="btn-primary inline-flex items-center">
            Browse Plants <ArrowUpRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;