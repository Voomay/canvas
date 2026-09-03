export interface StreetLevel {
  id: number;
  name: string;
  suburb: string;
  locationKey: 'capetown' | 'joburg';
  theme: string;
  description: string;
  durationSeconds: number;
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
    description: '30-second sprint in Hanover Park! Win at least 10 votes to be selected for this Area.',
    durationSeconds: 30,
    targetDistance: 99999,
    obstacleSpawnRateMin: 3200,
    obstacleSpawnRateMax: 5200,
    residentSpawnRateMin: 3200,
    residentSpawnRateMax: 5500,
    obstaclePool: ['potholeSmall', 'potholeLarge', 'fallenPoster'],
    allowedComplaintCategories: ['roads', 'socialmedia', 'promises', 'jobs', 'housing', 'water']
  },
  {
    id: 2,
    name: 'Area 2: Johannesburg Central',
    suburb: 'Central & Hillbrow, Johannesburg',
    locationKey: 'joburg',
    theme: 'City of Gold & Social Feuds',
    description: 'Canvassing beneath the iconic towers. Face tough questions on municipal services and coalitions!',
    durationSeconds: 30,
    targetDistance: 99999,
    obstacleSpawnRateMin: 3000,
    obstacleSpawnRateMax: 5000,
    residentSpawnRateMin: 3000,
    residentSpawnRateMax: 5600,
    obstaclePool: ['brokenDrain', 'potholeLarge', 'fallenPoster'],
    allowedComplaintCategories: ['streetlights', 'socialmedia', 'safety', 'promises', 'electricity']
  },
  {
    id: 3,
    name: 'Area 3: Hanover Park East',
    suburb: 'Hanover Park East, Cape Town',
    locationKey: 'capetown',
    theme: 'Water & Influencer Wars',
    description: 'Water pressure drops and questions about municipal tariffs and campaign promises heat up!',
    durationSeconds: 30,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2800,
    obstacleSpawnRateMax: 4800,
    residentSpawnRateMin: 3200,
    residentSpawnRateMax: 5800,
    obstaclePool: ['potholeWater', 'leakingPipe', 'openManhole'],
    allowedComplaintCategories: ['water', 'socialmedia', 'health', 'housing', 'roads']
  },
  {
    id: 4,
    name: 'Area 4: Johannesburg Mining Belt',
    suburb: 'Gold Reef & Central, Johannesburg',
    locationKey: 'joburg',
    theme: 'Rubbish & Coalition Drama',
    description: 'Sprint between mine dumps and city high-rises. Listen to community questions on services and jobs.',
    durationSeconds: 30,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2800,
    obstacleSpawnRateMax: 4600,
    residentSpawnRateMin: 3000,
    residentSpawnRateMax: 5400,
    obstaclePool: ['rubbishBag', 'openManhole', 'potholeLarge', 'leakingPipe'],
    allowedComplaintCategories: ['rubbish', 'socialmedia', 'electricity', 'roads', 'jobs']
  },
  {
    id: 5,
    name: 'Area 5: National Grand Finale',
    suburb: 'Freedom Square, Cape Town & Johannesburg',
    locationKey: 'capetown',
    theme: 'Election Eve Grand Finale',
    description: 'Final by-election sprint! Full community turnout across South Africa. 10 votes to win the Area!',
    durationSeconds: 30,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2600,
    obstacleSpawnRateMax: 4400,
    residentSpawnRateMin: 2800,
    residentSpawnRateMax: 5000,
    obstaclePool: ['potholeSmall', 'potholeLarge', 'potholeWater', 'rubbishBag', 'brokenDrain', 'openManhole', 'leakingPipe', 'fallenPoster'],
    allowedComplaintCategories: ['roads', 'socialmedia', 'streetlights', 'water', 'rubbish', 'electricity', 'housing', 'safety', 'health', 'jobs', 'promises']
  }
];
