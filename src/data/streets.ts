export interface StreetLevel {
  id: number;
  name: string;
  suburb: string;
  locationKey: 'capetown' | 'joburg';
  theme: string;
  description: string;
  durationSeconds: number;
  targetVotes: number;
  targetDistance: number;
  obstacleSpawnRateMin: number; // ms
  obstacleSpawnRateMax: number; // ms
  residentSpawnRateMin: number; // ms
  residentSpawnRateMax: number; // ms
  obstaclePool: ('potholeSmall' | 'potholeLarge' | 'potholeWater' | 'rubbishBag' | 'brokenDrain' | 'openManhole' | 'leakingPipe' | 'fallenPoster')[];
  allowedComplaintCategories: string[];
}

export const STREETS: StreetLevel[] = [
  {
    id: 1,
    name: 'Area 1: Hanover Park',
    suburb: 'Hanover Park, Cape Town',
    locationKey: 'capetown',
    theme: 'Table Mountain Trail',
    description: '30-second sprint in Hanover Park! Secure at least 10 votes to win this Area election.',
    durationSeconds: 30,
    targetVotes: 10,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2600,
    obstacleSpawnRateMax: 4200,
    residentSpawnRateMin: 2400,
    residentSpawnRateMax: 3800,
    obstaclePool: ['brokenDrain', 'potholeWater', 'potholeSmall', 'openManhole'],
    allowedComplaintCategories: ['roads', 'socialmedia', 'promises', 'jobs', 'housing', 'water']
  },
  {
    id: 2,
    name: 'Area 2: Johannesburg Central',
    suburb: 'Central & Hillbrow, Johannesburg',
    locationKey: 'joburg',
    theme: 'City of Gold & Social Feuds',
    description: 'Canvassing beneath the iconic towers! Secure at least 15 votes in 30s to win this Area election.',
    durationSeconds: 30,
    targetVotes: 15,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2400,
    obstacleSpawnRateMax: 3800,
    residentSpawnRateMin: 2000,
    residentSpawnRateMax: 3200,
    obstaclePool: ['brokenDrain', 'potholeWater', 'potholeSmall', 'openManhole'],
    allowedComplaintCategories: ['streetlights', 'socialmedia', 'safety', 'promises', 'electricity']
  },
  {
    id: 3,
    name: 'Area 3: Hanover Park East',
    suburb: 'Hanover Park East, Cape Town',
    locationKey: 'capetown',
    theme: 'Water & Influencer Wars',
    description: 'Water pressure drops and questions heat up! Secure at least 15 votes in 30s to win this Area.',
    durationSeconds: 30,
    targetVotes: 15,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2400,
    obstacleSpawnRateMax: 3800,
    residentSpawnRateMin: 2000,
    residentSpawnRateMax: 3400,
    obstaclePool: ['potholeWater', 'leakingPipe', 'openManhole'],
    allowedComplaintCategories: ['water', 'socialmedia', 'health', 'housing', 'roads']
  },
  {
    id: 4,
    name: 'Area 4: Johannesburg Mining Belt',
    suburb: 'Gold Reef & Central, Johannesburg',
    locationKey: 'joburg',
    theme: 'Rubbish & Coalition Drama',
    description: 'Sprint between mine dumps and high-rises. Secure at least 18 votes in 30s to win this Area!',
    durationSeconds: 30,
    targetVotes: 18,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2200,
    obstacleSpawnRateMax: 3600,
    residentSpawnRateMin: 1800,
    residentSpawnRateMax: 3200,
    obstaclePool: ['rubbishBag', 'openManhole', 'potholeLarge', 'leakingPipe'],
    allowedComplaintCategories: ['rubbish', 'socialmedia', 'electricity', 'roads', 'jobs']
  },
  {
    id: 5,
    name: 'Area 5: National Grand Finale',
    suburb: 'Freedom Square, Cape Town & Johannesburg',
    locationKey: 'capetown',
    theme: 'Election Eve Grand Finale',
    description: 'Final by-election sprint! Full community turnout across South Africa. 20 votes to win the Area!',
    durationSeconds: 30,
    targetVotes: 20,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2000,
    obstacleSpawnRateMax: 3400,
    residentSpawnRateMin: 1600,
    residentSpawnRateMax: 2800,
    obstaclePool: ['potholeSmall', 'potholeLarge', 'potholeWater', 'rubbishBag', 'brokenDrain', 'openManhole', 'leakingPipe', 'fallenPoster'],
    allowedComplaintCategories: ['roads', 'socialmedia', 'streetlights', 'water', 'rubbish', 'electricity', 'housing', 'safety', 'health', 'jobs', 'promises']
  }
];
