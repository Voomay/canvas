export interface StreetLevel {
  id: number;
  name: string;
  shortName: string;
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
  obstaclePool: ('potholeSmall' | 'potholeWater' | 'openManhole')[];
  allowedComplaintCategories: string[];
}

export const STREETS: StreetLevel[] = [
  {
    id: 1,
    name: 'Ward 1: Hanover Park',
    shortName: 'Hanover Park',
    suburb: 'Hanover Park, Cape Town',
    locationKey: 'hanover_park',
    theme: 'Table Mountain & Community Flats',
    description: '20-second sprint through Hanover Park! Secure at least 10 votes to win this Ward election.',
    durationSeconds: 20,
    targetVotes: 10,
    targetDistance: 99999,
    obstacleSpawnRateMin: 7000,
    obstacleSpawnRateMax: 10000,
    residentSpawnRateMin: 2400,
    residentSpawnRateMax: 3800,
    obstaclePool: ['potholeWater', 'potholeSmall', 'openManhole'],
    allowedComplaintCategories: [
      'hanover_court_sewage',
      'hanover_flats_paint',
      'hanover_meter_deductions',
      'hanover_gang_ceasefire',
      'hanover_clinic_queue',
      'cape_palestine_solidarity',
      'cape_gangsterism_extortion',
      'cape_backyard_dwellers',
      'cape_spaza_inspections'
    ]
  },
  {
    id: 2,
    name: 'Ward 2: Mitchells Plain Town Centre',
    shortName: 'Mitchells Plain',
    suburb: 'Town Centre & Promenade, Mitchells Plain',
    locationKey: 'mitchells_plain',
    theme: 'Town Centre Shops & Transport Hub',
    description: 'Canvassing outside Shoprite, Checkers & the vibrant Town Centre! Secure at least 12 votes to win this Ward election.',
    durationSeconds: 20,
    targetVotes: 12,
    targetDistance: 99999,
    obstacleSpawnRateMin: 6500,
    obstacleSpawnRateMax: 9500,
    residentSpawnRateMin: 2000,
    residentSpawnRateMax: 3200,
    obstaclePool: ['potholeWater', 'potholeSmall', 'openManhole'],
    allowedComplaintCategories: [
      'mitchells_plain_town_centre',
      'mitchells_plain_train_line',
      'mitchells_plain_streetlights',
      'mitchells_plain_backyarders',
      'mitchells_plain_potholes',
      'cape_palestine_solidarity',
      'cape_gangsterism_extortion',
      'cape_backyard_dwellers',
      'cape_spaza_inspections'
    ]
  },
  {
    id: 3,
    name: 'Ward 3: Khayelitsha',
    shortName: 'Khayelitsha',
    suburb: 'Lookout Hill & Site C, Khayelitsha',
    locationKey: 'khayelitsha',
    theme: 'Lookout Hill & High Energy Rallies',
    description: 'Rally between colorful homes under Table Mountain’s skyline! Secure at least 15 votes to win this Ward election.',
    durationSeconds: 20,
    targetVotes: 15,
    targetDistance: 99999,
    obstacleSpawnRateMin: 6500,
    obstacleSpawnRateMax: 9500,
    residentSpawnRateMin: 2000,
    residentSpawnRateMax: 3400,
    obstaclePool: ['potholeWater', 'potholeSmall', 'openManhole'],
    allowedComplaintCategories: [
      'khayelitsha_communal_taps',
      'khayelitsha_illegal_connections',
      'khayelitsha_sanitation',
      'khayelitsha_emergency_escort',
      'khayelitsha_shack_fires',
      'cape_gangsterism_extortion',
      'cape_spaza_inspections',
      'cape_backyard_dwellers'
    ]
  },
  {
    id: 4,
    name: 'Ward 4: Camps Bay & Clifton',
    shortName: 'Camps Bay',
    suburb: 'Victoria Road & Beach Promenade, Camps Bay',
    locationKey: 'campsbay',
    theme: 'Sunset Strip & Atlantic Seaboard',
    description: 'Canvassing along the Atlantic Seaboard! High rates, luxury supercars & beach shortages. 18 votes to win this Ward election!',
    durationSeconds: 20,
    targetVotes: 18,
    targetDistance: 99999,
    // Camps Bay roads are rapidly serviced by the municipality - obstacles are very rare
    obstacleSpawnRateMin: 14000,
    obstacleSpawnRateMax: 22000,
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
    name: 'Ward 5: Johannesburg (National Finale)',
    shortName: 'Joburg',
    suburb: 'Freedom Square & Johannesburg Towers',
    locationKey: 'joburg',
    theme: 'Election Eve Grand Finale',
    description: 'Final national showdown beneath city high-rises! Full turnout across South Africa. 20 votes to win!',
    durationSeconds: 20,
    targetVotes: 20,
    targetDistance: 99999,
    obstacleSpawnRateMin: 6000,
    obstacleSpawnRateMax: 9000,
    residentSpawnRateMin: 1600,
    residentSpawnRateMax: 2800,
    obstaclePool: ['potholeSmall', 'potholeWater', 'openManhole'],
    allowedComplaintCategories: [
      'joburg_city_power',
      'joburg_joburg_water',
      'joburg_potholes',
      'joburg_billing_crisis'
    ]
  }
];
