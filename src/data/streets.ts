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
    name: 'Street 1: Hanover Park',
    suburb: 'Hanover Park, Cape Town',
    locationKey: 'capetown',
    theme: 'Table Mountain Trail',
    description: 'Fresh canvassing in Hanover Park with Table Mountain on the horizon. Watch out for potholes!',
    durationSeconds: 35,
    targetDistance: 11000,
    obstacleSpawnRateMin: 2800,
    obstacleSpawnRateMax: 4500,
    residentSpawnRateMin: 5500,
    residentSpawnRateMax: 8000,
    obstaclePool: ['potholeSmall', 'potholeLarge', 'fallenPoster'],
    allowedComplaintCategories: ['roads', 'promises', 'jobs']
  },
  {
    id: 2,
    name: 'Street 2: Johannesburg',
    suburb: 'Central & Soweto, Johannesburg',
    locationKey: 'joburg',
    theme: 'City of Gold & Broken Cables',
    description: 'Canvassing beneath the iconic Hillbrow and Ponte towers. Mind the uneven pavements and open drains!',
    durationSeconds: 35,
    targetDistance: 11000,
    obstacleSpawnRateMin: 2500,
    obstacleSpawnRateMax: 4200,
    residentSpawnRateMin: 5000,
    residentSpawnRateMax: 7500,
    obstaclePool: ['brokenDrain', 'potholeLarge', 'fallenPoster'],
    allowedComplaintCategories: ['streetlights', 'safety', 'promises']
  },
  {
    id: 3,
    name: 'Street 3: Hanover Park East',
    suburb: 'Hanover Park East, Cape Town',
    locationKey: 'capetown',
    theme: 'Water & Pipe Pressure',
    description: 'Water pressure drops and leaking pipes bubble up along the Hanover Park avenue.',
    durationSeconds: 40,
    targetDistance: 12500,
    obstacleSpawnRateMin: 2400,
    obstacleSpawnRateMax: 4000,
    residentSpawnRateMin: 4800,
    residentSpawnRateMax: 7000,
    obstaclePool: ['potholeWater', 'leakingPipe', 'openManhole'],
    allowedComplaintCategories: ['water', 'health', 'housing']
  },
  {
    id: 4,
    name: 'Street 4: Johannesburg Mining Belt',
    suburb: 'Gold Reef & Central, Johannesburg',
    locationKey: 'joburg',
    theme: 'Rubbish & Electricity Load',
    description: 'Canvassing between the golden mine dumps and city high-rises. Black bags and transformers test patience.',
    durationSeconds: 40,
    targetDistance: 12500,
    obstacleSpawnRateMin: 2200,
    obstacleSpawnRateMax: 3800,
    residentSpawnRateMin: 4500,
    residentSpawnRateMax: 6800,
    obstaclePool: ['rubbishBag', 'openManhole', 'potholeLarge', 'leakingPipe'],
    allowedComplaintCategories: ['rubbish', 'electricity', 'roads']
  },
  {
    id: 5,
    name: 'Street 5: National Grand Finale',
    suburb: 'Freedom Square, Cape Town & Johannesburg',
    locationKey: 'capetown',
    theme: 'Mixed Community Grand Finale',
    description: 'Election eve! Full community turnout across South Africa with all hazards and passionate debates.',
    durationSeconds: 45,
    targetDistance: 14000,
    obstacleSpawnRateMin: 2000,
    obstacleSpawnRateMax: 3500,
    residentSpawnRateMin: 4000,
    residentSpawnRateMax: 6500,
    obstaclePool: ['potholeSmall', 'potholeLarge', 'potholeWater', 'rubbishBag', 'brokenDrain', 'openManhole', 'leakingPipe', 'fallenPoster'],
    allowedComplaintCategories: ['roads', 'streetlights', 'water', 'rubbish', 'electricity', 'housing', 'safety', 'health', 'jobs', 'promises']
  }
];
