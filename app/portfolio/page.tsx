'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/lib/walletContext';
import {
  TrendingUp,
  Leaf,
  DollarSign,
  Calendar,
  ExternalLink,
  Sprout,
  TreePine,
  Flower,
  Activity,
  ChevronRight,
  Droplets,
  Sun,
  Timer
} from 'lucide-react';
import Link from 'next/link';

// Plant growth stages for visualization
const GROWTH_STAGES = [
  { name: 'Seeding', icon: '🌱', day: 0, description: 'Initial planting' },
  { name: 'Sprouting', icon: '🌿', day: 7, description: 'First leaves appear' },
  { name: 'Growing', icon: '🍃', day: 14, description: 'Rapid growth phase' },
  { name: 'Maturing', icon: '🌾', day: 21, description: 'Approaching harvest' },
  { name: 'Harvest', icon: '🥬', day: 28, description: 'Ready for harvest' },
];

const PortfolioPage = () => {
  const { userWallet, isConnected } = useWallet();
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'growth'>('overview');

  useEffect(() => {
    if (isConnected && userWallet) {
      // Load portfolio data from localStorage
      const plotOwnership = JSON.parse(localStorage.getItem('plotOwnership') || '{}');
      const transactions = Object.values(plotOwnership);

      // Calculate portfolio metrics
      const totalInvestment = transactions.reduce((sum: number, tx: any) => sum + (tx.priceXRP || 0), 0);
      const estimatedYield = transactions.reduce((sum: number, tx: any) => {
        const yieldValue = parseFloat(tx.estimatedYield?.replace('kg', '') || '0');
        return sum + yieldValue;
      }, 0);

      // Group by farm
      const farmGroups: { [key: string]: any[] } = {};
      transactions.forEach((tx: any) => {
        if (!farmGroups[tx.farmName]) {
          farmGroups[tx.farmName] = [];
        }
        farmGroups[tx.farmName].push(tx);
      });

      setPortfolioData({
        transactions,
        totalInvestment,
        estimatedYield,
        farmGroups,
        totalPlots: transactions.length
      });
    }
  }, [isConnected, userWallet]);

  // Calculate days since purchase for growth stage
  const getDaysElapsed = (purchaseDate: string) => {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - purchase.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCurrentStage = (purchaseDate: string) => {
    const days = getDaysElapsed(purchaseDate);
    for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
      if (days >= GROWTH_STAGES[i].day) {
        return { ...GROWTH_STAGES[i], progress: Math.min(100, (days / 28) * 100) };
      }
    }
    return { ...GROWTH_STAGES[0], progress: 0 };
  };

  // Realistic yield data for chart based on actual investments
  const generateYieldData = () => {
    if (!portfolioData || portfolioData.totalInvestment === 0) {
      return [
        { week: 'Week 1', yield: 0, revenue: 0, growth: 0, plant: '🌱' },
        { week: 'Week 2', yield: 0.5, revenue: 0, growth: 20, plant: '🌿' },
        { week: 'Week 3', yield: 1.2, revenue: 0, growth: 50, plant: '🍃' },
        { week: 'Week 4', yield: 2.0, revenue: 0, growth: 80, plant: '🥬' },
      ];
    }

    const weeklyYield = portfolioData.totalInvestment * 0.065; // 6.5% weekly yield
    const baseYield = portfolioData.estimatedYield || 2.5; // Base yield per plant
    return [
      { week: 'Week 1', yield: 0, revenue: 0, growth: 15, plant: '🌱' },
      { week: 'Week 2', yield: (baseYield * 0.35), revenue: weeklyYield, growth: 35, plant: '🌿' },
      { week: 'Week 3', yield: (baseYield * 0.70), revenue: weeklyYield * 2, growth: 70, plant: '🍃' },
      { week: 'Week 4', yield: (baseYield * 0.95), revenue: weeklyYield * 3, growth: 95, plant: '🥬' },
    ];
  };

  const yieldData = generateYieldData();

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
          <Leaf className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Investment Portfolio</h2>
          <p className="text-neutral-600 mb-8">Connect your wallet to view your GrowFi investments</p>
          <Link href="/farms" className="btn-primary inline-flex items-center gap-2">
            Start Investing <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!portfolioData || portfolioData.transactions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
          <Sprout className="h-20 w-20 text-blue-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">No Investments Yet</h2>
          <p className="text-neutral-600 mb-8">Start your sustainable farming journey today!</p>
          <Link href="/farms" className="btn-primary inline-flex items-center gap-2">
            Browse Farms <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Investment Portfolio</h1>
        <p className="text-neutral-600">Track your sustainable farming investments and yields</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+12.5%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{portfolioData.totalInvestment.toFixed(1)} XRP</h3>
          <p className="text-sm text-neutral-600 mt-1">Total Investment</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-blue-600 font-medium">Weekly</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{(portfolioData.totalInvestment * 0.065).toFixed(1)} XRP</h3>
          <p className="text-sm text-neutral-600 mt-1">Est. Weekly Yield</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Leaf className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-purple-600 font-medium">{portfolioData.totalPlots} plots</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{portfolioData.estimatedYield.toFixed(1)} kg</h3>
          <p className="text-sm text-neutral-600 mt-1">Monthly Harvest</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm text-orange-600 font-medium">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900">{Object.keys(portfolioData.farmGroups).length}</h3>
          <p className="text-sm text-neutral-600 mt-1">Active Farms</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200 mb-8">
        <div className="border-b border-neutral-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'growth'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Growth Tracking
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              {/* Yield Chart */}
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="animate-pulse">🌱</span>
                Yield Performance
              </h3>
              <div className="bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 rounded-xl p-6 mb-6 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="animate-bounce absolute top-2 left-4 text-2xl">💧</div>
                  <div className="animate-pulse absolute top-4 right-8 text-xl">☀️</div>
                  <div className="animate-bounce absolute bottom-4 left-8 text-lg delay-300">🌿</div>
                  <div className="animate-pulse absolute bottom-2 right-4 text-xl delay-500">🍃</div>
                </div>

                <div className="relative z-10">
                  <div className="grid grid-cols-4 gap-6">
                    {yieldData.map((data, index) => (
                      <div key={data.week} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                        <div className="text-sm text-neutral-600 mb-3 font-medium">{data.week}</div>

                        {/* Plant visualization */}
                        <div className="mb-3">
                          <div className="text-4xl animate-pulse" style={{animationDelay: `${index * 200}ms`}}>
                            {data.plant}
                          </div>
                        </div>

                        {/* Animated bar chart */}
                        <div className="h-28 bg-white rounded-lg flex items-end justify-center p-2 shadow-sm relative overflow-hidden">
                          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-200 to-green-200 animate-pulse"></div>
                          <div
                            className="w-full bg-gradient-to-t from-green-500 via-green-400 to-green-300 rounded-t-lg transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{
                              height: `${Math.max(20, data.growth)}%`,
                              animationDelay: `${index * 300}ms`
                            }}
                          >
                            {/* Water level animation */}
                            <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-blue-400 to-blue-300 opacity-60 animate-pulse"></div>
                            {/* Growth sparkles */}
                            {data.growth > 50 && (
                              <div className="absolute top-1 right-1 text-yellow-300 text-xs animate-ping">✨</div>
                            )}
                          </div>
                        </div>

                        {/* Growth progress indicator */}
                        <div className="mt-3 mb-2">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${data.growth}%`,
                                animationDelay: `${index * 200}ms`
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-green-600 font-medium mt-1">{data.growth}% grown</div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm font-semibold text-neutral-900">{data.yield.toFixed(1)} kg</p>
                          <p className="text-xs text-green-600 font-medium">{data.revenue.toFixed(1)} XRP</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Farm Distribution */}
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Farm Distribution</h3>
              <div className="space-y-3">
                {Object.entries(portfolioData.farmGroups).map(([farmName, plots]: [string, any]) => (
                  <div key={farmName} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Leaf className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{farmName}</p>
                        <p className="text-sm text-neutral-600">{plots.length} plots</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">
                        {plots.reduce((sum: number, p: any) => sum + p.priceXRP, 0).toFixed(1)} XRP
                      </p>
                      <p className="text-sm text-green-600">Active</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                Transaction & Growth Tracking
              </h3>
              {portfolioData.transactions.map((tx: any, index: number) => {
                const farmIcons: { [key: string]: string } = {
                  'Fresh City Farms': '🥬',
                  'Black Creek Community Farm': '🌿',
                  'Toronto Urban Growers': '🌱',
                  'Riverdale Farm': '🏞️',
                  'FoodShare Toronto': '🍃'
                };
                const currentStage = getCurrentStage(tx.purchaseDate);
                return (
                  <div key={index} className="border border-neutral-200 rounded-lg p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-300 hover:shadow-md group relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center relative">
                            <span className="text-xl animate-pulse">{farmIcons[tx.farmName] || '🌱'}</span>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{tx.plotId} - {tx.cropType}</p>
                            <p className="text-sm text-neutral-600 font-medium">{tx.farmName.replace(/^- /, '')}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                {currentStage.name} {currentStage.icon}
                              </span>
                              <span className="text-xs text-neutral-500 flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                Day {getDaysElapsed(tx.purchaseDate)}/28
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900">{tx.priceXRP} XRP</p>
                          <p className="text-sm text-neutral-600">{tx.mptSymbol} Token</p>
                          <div className="mt-1">
                            <div className="text-xs text-green-600 font-medium">+{(tx.priceXRP * 0.065).toFixed(2)} XRP/week</div>
                          </div>
                        </div>
                      </div>

                      {/* Growth progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-neutral-600 mb-1">
                          <span>Growth Progress</span>
                          <span>{currentStage.progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out relative"
                            style={{width: `${currentStage.progress}%`}}
                          >
                            <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {/* Water level indicator */}
                      <div className="mb-3">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-blue-500 animate-bounce" />
                            <span className="text-neutral-600">Water: 85%</span>
                            <div className="w-8 h-1 bg-blue-200 rounded overflow-hidden">
                              <div className="h-full bg-blue-500 animate-pulse" style={{width: '85%'}}></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sun className="h-3 w-3 text-yellow-500 animate-pulse" />
                            <span className="text-neutral-600">Light: Optimal</span>
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(tx.purchaseDate).toLocaleDateString()}
                        </span>
                        <a
                          href="https://testnet.xrpl.org/transactions/4A8D98A1A89965BA122740C1279BEF59D9EBE5F33D999A5578827CAB10A53E78"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 hover:text-blue-700 transition-colors"
                        >
                          View Transaction <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'growth' && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Plant Growth Stages</h3>
              <div className="space-y-6">
                {portfolioData.transactions.map((tx: any, index: number) => {
                  const stage = getCurrentStage(tx.purchaseDate);
                  return (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-semibold text-neutral-900">{tx.plotId} - {tx.cropType}</h4>
                          <p className="text-sm text-neutral-600">{tx.farmName.replace(/^- /, '')}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl mb-1">{stage.icon}</div>
                          <p className="text-sm font-medium text-green-600">{stage.name}</p>
                        </div>
                      </div>

                      {/* Growth Stage Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-neutral-600 mb-2">
                          <span>Growth Progress</span>
                          <span>{stage.progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 bg-white rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                            style={{ width: `${stage.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stage Steps */}
                      <div className="flex justify-between items-center">
                        {GROWTH_STAGES.map((s, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                                getDaysElapsed(tx.purchaseDate) >= s.day
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white border-2 border-neutral-300'
                              }`}
                            >
                              {getDaysElapsed(tx.purchaseDate) >= s.day ? '✓' : idx + 1}
                            </div>
                            <span className="text-xs text-neutral-600 mt-1">{s.icon}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-between items-center text-sm">
                        <span className="text-neutral-600">
                          Day {getDaysElapsed(tx.purchaseDate)} of 28
                        </span>
                        <span className="text-green-600 font-medium">
                          Est. yield: {tx.estimatedYield}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment vs Sales Analytics */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Investment Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-600 mb-2">Investment vs Projected Returns</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Investment</span>
                <span className="font-semibold">{portfolioData.totalInvestment.toFixed(1)} XRP</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Projected (4 weeks)</span>
                <span className="font-semibold text-green-600">
                  {(portfolioData.totalInvestment * 1.26).toFixed(1)} XRP
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '126%' }}></div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-600 mb-2">ROI Projection</p>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">26%</p>
                <p className="text-sm text-neutral-600 mt-1">Monthly ROI</p>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Weekly Yield</span>
                  <span className="font-medium">6.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Annual Projection</span>
                  <span className="font-medium text-green-600">312%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;