export interface Farm {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  image: string;
  totalPlots: number;
  availablePlots: number;
  sustainabilityScore: number;
}

export interface Plant {
  id: string;
  farmId: string;
  farmName: string;
  type: string;
  name: string;
  image: string;
  totalValue: number; // Total XRP needed
  minInvestment: number; // Minimum XRP
  soldPercentage: number; // 0-100
  availablePercentage: number;
  weeklyYieldEstimate: number; // XRP per week
  harvestDate: string;
  growthStage: 'seedling' | 'growing' | 'mature' | 'harvest';
  description: string;
  impactMetrics: {
    co2Saved: number; // kg
    waterSaved: number; // liters
    localFoodProduced: number; // kg
  };
}

export interface Investment {
  id: string;
  userId: string;
  plantId: string;
  nftTokenId: string;
  ownershipPercentage: number;
  purchasePrice: number; // XRP
  purchaseDate: string;
  status: 'active' | 'harvested';
  totalYieldsReceived: number; // XRP
}

export interface YieldDistribution {
  id: string;
  plantId: string;
  nftTokenId: string;
  amount: number; // XRP
  distributionDate: string;
  harvestCycle: number;
}

export interface User {
  walletAddress: string;
  joinedDate: string;
  totalInvested: number; // XRP
  totalYieldsReceived: number; // XRP
  plantsOwned: number;
  impactScore: number;
}

// New Container interface for fractional ownership
export interface Container {
  id: string;
  name: string;
  farmId: string;
  farmName: string;
  cropType: string;
  expectedYield: string;
  totalShares: number;
  availableShares: number;
  pricePerShare: number; // XRP
  image: string;
  description: string;
  harvestDate: string;
  growthStage: 'growing' | 'mature' | 'harvest';
  impactMetrics: {
    waterSavedPerShare: number; // liters
    co2AvoidedPerShare: number; // kg
    localFoodPerShare: number; // kg
  };
  estimatedRevenuePerShare: number; // XRP
  currentProduction: string;
}

// User's NFT holdings
export interface UserNFT {
  tokenId: string;
  containerId: string;
  containerName: string;
  cropType: string;
  sharesOwned: number;
  purchasePrice: number; // XRP
  purchaseDate: string;
  currentValue: number; // XRP
  totalEarnings: number; // XRP
  impactCredits: {
    waterSaved: number;
    co2Avoided: number;
    localFoodProduced: number;
  };
}

// Impact Credits (fungible tokens)
export interface ImpactCredits {
  userId: string;
  totalWaterCredits: number;
  totalCO2Credits: number;
  totalFoodCredits: number;
  lastUpdated: string;
}