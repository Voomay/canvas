export interface StreetLevel {
  id: number;
  name: string;
  suburb: string;
  locationKey: 'capetown' | 'joburg' | 'campsbay' | 'khayelitsha' | 'mitchells_plain' | 'hanover_park';
  theme: string;
  description: string;
  durationSeconds: number;
  targetVotes: number;
  targetDistance: number;
  obstacleSpawnRateMin: number; // ms
  obstacleSpawnRateMax: number; // ms
  residentSpawnRateMin: number; // ms
  residentSpawnRateMax: number; // ms
  obstaclePool: ('potholeSmall' | 'potholeWater' | 'brokenDrain' | 'openManhole')[];
  allowedComplaintCategories: string[];
}

export const STREETS: StreetLevel[] = [
  {
    id: 1,
    name: 'Area 1: Hanover Park',
    suburb: 'Hanover Park, Cape Town',
    locationKey: 'hanover_park',
    theme: 'Table Mountain & Community Flats',
    description: '30-second sprint through Hanover Park! Secure at least 10 votes to win this Area election.',
    durationSeconds: 30,
    targetVotes: 10,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2600,
    obstacleSpawnRateMax: 4200,
    residentSpawnRateMin: 2400,
    residentSpawnRateMax: 3800,
    obstaclePool: ['brokenDrain', 'potholeWater', 'potholeSmall', 'openManhole'],
    allowedComplaintCategories: [
      'hanover_court_sewage',
      'hanover_flats_paint',
      'hanover_meter_deductions',
      'hanover_gang_ceasefire',
      'hanover_clinic_queue'
    ]
  },
  {
    id: 2,
    name: 'Area 2: Mitchells Plain Town Centre',
    suburb: 'Town Centre & Promenade, Mitchells Plain',
    locationKey: 'mitchells_plain',
    theme: 'Town Centre Shops & Transport Hub',
    description: 'Canvassing outside Shoprite, Checkers & the vibrant Town Centre! Secure at least 12 votes.',
    durationSeconds: 30,
    targetVotes: 12,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2400,
    obstacleSpawnRateMax: 3800,
    residentSpawnRateMin: 2000,
    residentSpawnRateMax: 3200,
    obstaclePool: ['brokenDrain', 'potholeWater', 'potholeSmall', 'openManhole'],
    allowedComplaintCategories: [
      'mitchells_plain_town_centre',
      'mitchells_plain_train_line',
      'mitchells_plain_streetlights',
      'mitchells_plain_backyarders',
      'mitchells_plain_potholes'
    ]
  },
  {
    id: 3,
    name: 'Area 3: Khayelitsha',
    suburb: 'Lookout Hill & Site C, Khayelitsha',
    locationKey: 'khayelitsha',
    theme: 'Lookout Hill & High Energy Rallies',
    description: 'Rally between colorful homes under Table Mountain’s skyline! Secure at least 15 votes to win.',
    durationSeconds: 30,
    targetVotes: 15,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2400,
    obstacleSpawnRateMax: 3800,
    residentSpawnRateMin: 2000,
    residentSpawnRateMax: 3400,
    obstaclePool: ['potholeWater', 'brokenDrain', 'potholeSmall', 'openManhole'],
    allowedComplaintCategories: [
      'khayelitsha_communal_taps',
      'khayelitsha_illegal_connections',
      'khayelitsha_sanitation',
      'khayelitsha_emergency_escort',
      'khayelitsha_shack_fires'
    ]
  },
  {
    id: 4,
    name: 'Area 4: Camps Bay & Clifton',
    suburb: 'Victoria Road & Beach Promenade, Camps Bay',
    locationKey: 'campsbay',
    theme: 'Sunset Strip & Atlantic Seaboard',
    description: 'Canvassing along the Atlantic Seaboard! High rates, luxury supercars & beach shortages. 18 votes to win!',
    durationSeconds: 30,
    targetVotes: 18,
    targetDistance: 99999,
    // Camps Bay roads are rapidly serviced by the municipality - obstacles are very rare
    obstacleSpawnRateMin: 8000,
    obstacleSpawnRateMax: 14000,
    residentSpawnRateMin: 1800,
    residentSpawnRateMax: 3200,
    // Camps Bay has no messy rubbish/manhole hazards - only occasional small potholes
    obstaclePool: ['potholeSmall'],
    allowedComplaintCategories: [
      'campsbay_noise',
      'campsbay_rates',
      'campsbay_zoning',
      'campsbay_shortages',
      'campsbay_solar',
      'campsbay_filming'
    ]
  },
  {
    id: 5,
    name: 'Area 5: National Grand Finale',
    suburb: 'Freedom Square & Johannesburg Towers',
    locationKey: 'joburg',
    theme: 'Election Eve Grand Finale',
    description: 'Final national showdown beneath city high-rises! Full turnout across South Africa. 20 votes to win!',
    durationSeconds: 30,
    targetVotes: 20,
    targetDistance: 99999,
    obstacleSpawnRateMin: 2000,
    obstacleSpawnRateMax: 3400,
    residentSpawnRateMin: 1600,
    residentSpawnRateMax: 2800,
    obstaclePool: ['potholeSmall', 'potholeWater', 'brokenDrain', 'openManhole'],
    allowedComplaintCategories: [
      'joburg_city_power',
      'joburg_joburg_water',
      'joburg_potholes',
      'joburg_billing_crisis'
    ]
  }
];
