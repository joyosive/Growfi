import { Farm, Plant, Container } from './types';

export const torontoFarms: Farm[] = [
  {
    id: 'farm-1',
    name: 'Fresh City Farms',
    location: 'Downsview',
    address: '2 Disco Rd, Etobicoke, ON',
    description: 'Leading urban farm specializing in organic vegetables and herbs for local communities.',
    image: '/farms-pictures/lettuce_farm.jpeg',
    totalPlots: 150,
    availablePlots: 45,
    sustainabilityScore: 92
  },
  {
    id: 'farm-2',
    name: 'Black Creek Community Farm',
    location: 'North York',
    address: '4929 Jane St, North York, ON',
    description: 'Community-focused farm growing diverse produce with educational programs.',
    image: '/farms-pictures/brocolli_farm.jpeg',
    totalPlots: 80,
    availablePlots: 22,
    sustainabilityScore: 88
  },
  {
    id: 'farm-3',
    name: 'Toronto Urban Growers',
    location: 'Scarborough',
    address: '155 Bonis Ave, Scarborough, ON',
    description: 'Rooftop greenhouse operation with year-round production capabilities.',
    image: '/farms-pictures/microgreens-farm.jpeg',
    totalPlots: 200,
    availablePlots: 67,
    sustainabilityScore: 95
  },
  {
    id: 'farm-4',
    name: 'Riverdale Farm',
    location: 'Cabbagetown',
    address: '201 Winchester St, Toronto, ON',
    description: 'Historic farm site with modern sustainable growing practices.',
    image: '/farms-pictures/spincah_farm.jpeg',
    totalPlots: 60,
    availablePlots: 18,
    sustainabilityScore: 85
  },
  {
    id: 'farm-5',
    name: 'FoodShare Toronto',
    location: 'Davenport',
    address: '90 Croatia St, Toronto, ON',
    description: 'Non-profit urban agriculture focused on food security and education.',
    image: '/farms-pictures/strawberry-farm.webp',
    totalPlots: 120,
    availablePlots: 38,
    sustainabilityScore: 90
  }
];

export const availablePlants: Plant[] = [
  // Fresh City Farms
  {
    id: 'plant-1',
    farmId: 'farm-1',
    farmName: 'Fresh City Farms',
    type: 'vegetable',
    name: 'Heirloom Tomatoes',
    image: '/farms-pictures/tomato_farm.webp',
    totalValue: 100,
    minInvestment: 10,
    soldPercentage: 65,
    availablePercentage: 35,
    weeklyYieldEstimate: 5,
    harvestDate: '2024-03-15',
    growthStage: 'growing',
    description: 'Premium heirloom tomatoes with exceptional flavor, grown using organic methods.',
    impactMetrics: {
      co2Saved: 12.5,
      waterSaved: 250,
      localFoodProduced: 15
    }
  },
  {
    id: 'plant-2',
    farmId: 'farm-1',
    farmName: 'Fresh City Farms',
    type: 'leafy',
    name: 'Organic Lettuce Mix',
    image: '/plants/lettuce.jpg',
    totalValue: 50,
    minInvestment: 5,
    soldPercentage: 40,
    availablePercentage: 60,
    weeklyYieldEstimate: 3,
    harvestDate: '2024-02-20',
    growthStage: 'mature',
    description: 'Mixed variety lettuce including romaine, buttercrunch, and oak leaf.',
    impactMetrics: {
      co2Saved: 8.2,
      waterSaved: 180,
      localFoodProduced: 10
    }
  },

  // Black Creek Community Farm
  {
    id: 'plant-3',
    farmId: 'farm-2',
    farmName: 'Black Creek Community Farm',
    type: 'vegetable',
    name: 'Bell Peppers',
    image: '/plants/peppers.jpg',
    totalValue: 80,
    minInvestment: 8,
    soldPercentage: 55,
    availablePercentage: 45,
    weeklyYieldEstimate: 4,
    harvestDate: '2024-03-25',
    growthStage: 'growing',
    description: 'Colorful bell peppers - red, yellow, and green varieties.',
    impactMetrics: {
      co2Saved: 10.5,
      waterSaved: 220,
      localFoodProduced: 12
    }
  },
  {
    id: 'plant-4',
    farmId: 'farm-2',
    farmName: 'Black Creek Community Farm',
    type: 'herb',
    name: 'Fresh Herb Bundle',
    image: '/plants/herbs.jpg',
    totalValue: 30,
    minInvestment: 3,
    soldPercentage: 70,
    availablePercentage: 30,
    weeklyYieldEstimate: 2,
    harvestDate: '2024-02-15',
    growthStage: 'mature',
    description: 'Basil, cilantro, parsley, and mint grown organically.',
    impactMetrics: {
      co2Saved: 5.3,
      waterSaved: 120,
      localFoodProduced: 5
    }
  },

  // Toronto Urban Growers
  {
    id: 'plant-5',
    farmId: 'farm-3',
    farmName: 'Toronto Urban Growers',
    type: 'vegetable',
    name: 'Greenhouse Cucumbers',
    image: '/plants/cucumbers.jpg',
    totalValue: 60,
    minInvestment: 6,
    soldPercentage: 25,
    availablePercentage: 75,
    weeklyYieldEstimate: 3.5,
    harvestDate: '2024-03-10',
    growthStage: 'growing',
    description: 'Long English cucumbers grown in controlled greenhouse environment.',
    impactMetrics: {
      co2Saved: 9.8,
      waterSaved: 200,
      localFoodProduced: 18
    }
  },
  {
    id: 'plant-6',
    farmId: 'farm-3',
    farmName: 'Toronto Urban Growers',
    type: 'leafy',
    name: 'Baby Spinach',
    image: '/plants/spinach.jpg',
    totalValue: 40,
    minInvestment: 4,
    soldPercentage: 80,
    availablePercentage: 20,
    weeklyYieldEstimate: 2.5,
    harvestDate: '2024-02-10',
    growthStage: 'harvest',
    description: 'Tender baby spinach leaves, perfect for salads and cooking.',
    impactMetrics: {
      co2Saved: 6.5,
      waterSaved: 150,
      localFoodProduced: 8
    }
  },

  // Riverdale Farm
  {
    id: 'plant-7',
    farmId: 'farm-4',
    farmName: 'Riverdale Farm',
    type: 'vegetable',
    name: 'Heritage Carrots',
    image: '/plants/carrots.jpg',
    totalValue: 45,
    minInvestment: 4.5,
    soldPercentage: 50,
    availablePercentage: 50,
    weeklyYieldEstimate: 2.8,
    harvestDate: '2024-03-30',
    growthStage: 'growing',
    description: 'Rainbow heritage carrots in purple, orange, and yellow varieties.',
    impactMetrics: {
      co2Saved: 7.2,
      waterSaved: 160,
      localFoodProduced: 14
    }
  },

  // FoodShare Toronto
  {
    id: 'plant-8',
    farmId: 'farm-5',
    farmName: 'FoodShare Toronto',
    type: 'vegetable',
    name: 'Community Kale',
    image: '/plants/kale.jpg',
    totalValue: 35,
    minInvestment: 3.5,
    soldPercentage: 60,
    availablePercentage: 40,
    weeklyYieldEstimate: 2.2,
    harvestDate: '2024-02-25',
    growthStage: 'mature',
    description: 'Nutrient-rich curly kale grown for community food programs.',
    impactMetrics: {
      co2Saved: 5.8,
      waterSaved: 140,
      localFoodProduced: 9
    }
  },
  {
    id: 'plant-9',
    farmId: 'farm-5',
    farmName: 'FoodShare Toronto',
    type: 'vegetable',
    name: 'Swiss Chard',
    image: '/plants/chard.jpg',
    totalValue: 38,
    minInvestment: 3.8,
    soldPercentage: 45,
    availablePercentage: 55,
    weeklyYieldEstimate: 2.4,
    harvestDate: '2024-02-28',
    growthStage: 'mature',
    description: 'Colorful Swiss chard with vibrant stems and nutritious leaves.',
    impactMetrics: {
      co2Saved: 6.1,
      waterSaved: 145,
      localFoodProduced: 7
    }
  }
];

// New Container-based fractional ownership data for hackathon
export const availableContainers: Container[] = [
  {
    id: 'container-001',
    name: 'Hydroponic Cabbage Container #001',
    farmId: 'farm-1',
    farmName: 'Fresh City Farms',
    cropType: 'Cabbage',
    expectedYield: '10kg',
    totalShares: 1000,
    availableShares: 350,
    pricePerShare: 0.5, // XRP
    image: '/containers/cabbage-container.jpg',
    description: 'High-yield hydroponic cabbage container with automated nutrient delivery system.',
    harvestDate: '2025-01-15',
    growthStage: 'growing',
    impactMetrics: {
      waterSavedPerShare: 12, // liters
      co2AvoidedPerShare: 1.2, // kg
      localFoodPerShare: 0.01 // kg
    },
    estimatedRevenuePerShare: 0.1, // XRP
    currentProduction: '2kg this week'
  },
  {
    id: 'container-002',
    name: 'Hydroponic Lettuce Container #002',
    farmId: 'farm-1',
    farmName: 'Fresh City Farms',
    cropType: 'Lettuce',
    expectedYield: '5kg',
    totalShares: 500,
    availableShares: 200,
    pricePerShare: 0.5,
    image: '/containers/lettuce-container.jpg',
    description: 'Premium lettuce varieties grown in controlled hydroponic environment.',
    harvestDate: '2024-12-20',
    growthStage: 'mature',
    impactMetrics: {
      waterSavedPerShare: 8,
      co2AvoidedPerShare: 0.8,
      localFoodPerShare: 0.01
    },
    estimatedRevenuePerShare: 0.08,
    currentProduction: '1.5kg this week'
  },
  {
    id: 'container-003',
    name: 'Hydroponic Tomato Container #003',
    farmId: 'farm-2',
    farmName: 'Black Creek Community Farm',
    cropType: 'Tomatoes',
    expectedYield: '5kg',
    totalShares: 500,
    availableShares: 125,
    pricePerShare: 0.5,
    image: '/containers/tomato-container.jpg',
    description: 'Heirloom tomato varieties producing premium quality fruit.',
    harvestDate: '2025-01-30',
    growthStage: 'growing',
    impactMetrics: {
      waterSavedPerShare: 15,
      co2AvoidedPerShare: 1.5,
      localFoodPerShare: 0.01
    },
    estimatedRevenuePerShare: 0.12,
    currentProduction: '0.8kg this week'
  },
  {
    id: 'container-004',
    name: 'Hydroponic Basil Container #004',
    farmId: 'farm-3',
    farmName: 'Toronto Urban Growers',
    cropType: 'Basil',
    expectedYield: '3kg',
    totalShares: 300,
    availableShares: 90,
    pricePerShare: 0.5,
    image: '/containers/basil-container.jpg',
    description: 'Organic basil grown for local restaurants and markets.',
    harvestDate: '2024-12-15',
    growthStage: 'harvest',
    impactMetrics: {
      waterSavedPerShare: 10,
      co2AvoidedPerShare: 1.0,
      localFoodPerShare: 0.01
    },
    estimatedRevenuePerShare: 0.15,
    currentProduction: '2kg this week'
  },
  {
    id: 'container-005',
    name: 'Hydroponic Spinach Container #005',
    farmId: 'farm-4',
    farmName: 'Riverdale Farm',
    cropType: 'Spinach',
    expectedYield: '4kg',
    totalShares: 400,
    availableShares: 160,
    pricePerShare: 0.5,
    image: '/containers/spinach-container.jpg',
    description: 'Baby spinach leaves perfect for salads and smoothies.',
    harvestDate: '2024-12-25',
    growthStage: 'mature',
    impactMetrics: {
      waterSavedPerShare: 9,
      co2AvoidedPerShare: 0.9,
      localFoodPerShare: 0.01
    },
    estimatedRevenuePerShare: 0.09,
    currentProduction: '1.2kg this week'
  },
  {
    id: 'container-006',
    name: 'Hydroponic Kale Container #006',
    farmId: 'farm-5',
    farmName: 'FoodShare Toronto',
    cropType: 'Kale',
    expectedYield: '6kg',
    totalShares: 600,
    availableShares: 240,
    pricePerShare: 0.5,
    image: '/containers/kale-container.jpg',
    description: 'Nutrient-dense kale for community food programs.',
    harvestDate: '2025-01-10',
    growthStage: 'growing',
    impactMetrics: {
      waterSavedPerShare: 11,
      co2AvoidedPerShare: 1.1,
      localFoodPerShare: 0.01
    },
    estimatedRevenuePerShare: 0.07,
    currentProduction: '1.8kg this week'
  }
];