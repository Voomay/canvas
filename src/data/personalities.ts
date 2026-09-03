export type PersonalityType = 
  | 'Hopeful' 
  | 'Sceptical' 
  | 'Loyal' 
  | 'Frustrated' 
  | 'Undecided' 
  | 'Humour-loving';

export interface PersonalityDefinition {
  type: PersonalityType;
  description: string;
  // Probability multipliers or modifiers for each response type:
  promiseMod: {
    positiveRate: number; // base probability of positive reaction
    doubtfulRate: number;
    trustChange: number;
  };
  blameMod: {
    positiveRate: number;
    doubtfulRate: number;
    trustChange: number;
  };
  honestyMod: {
    positiveRate: number;
    doubtfulRate: number;
    trustChange: number;
  };
  ignoreTrustPenalty: number;
}

export const PERSONALITIES: Record<PersonalityType, PersonalityDefinition> = {
  'Hopeful': {
    type: 'Hopeful',
    description: 'Believes in positive change and gives candidates a fair chance.',
    promiseMod: { positiveRate: 0.85, doubtfulRate: 0.15, trustChange: 6 },
    blameMod: { positiveRate: 0.40, doubtfulRate: 0.40, trustChange: 0 },
    honestyMod: { positiveRate: 0.70, doubtfulRate: 0.25, trustChange: 8 },
    ignoreTrustPenalty: -3
  },
  'Sceptical': {
    type: 'Sceptical',
    description: 'Has heard every manifesto promise twice before. Prefers straight facts.',
    promiseMod: { positiveRate: 0.45, doubtfulRate: 0.40, trustChange: 2 },
    blameMod: { positiveRate: 0.20, doubtfulRate: 0.45, trustChange: -4 },
    honestyMod: { positiveRate: 0.80, doubtfulRate: 0.15, trustChange: 10 },
    ignoreTrustPenalty: -4
  },
  'Loyal': {
    type: 'Loyal',
    description: 'Enjoys strong party pride and loves hearing energetic debate.',
    promiseMod: { positiveRate: 0.75, doubtfulRate: 0.20, trustChange: 5 },
    blameMod: { positiveRate: 0.70, doubtfulRate: 0.20, trustChange: 4 },
    honestyMod: { positiveRate: 0.55, doubtfulRate: 0.35, trustChange: 5 },
    ignoreTrustPenalty: -5
  },
  'Frustrated': {
    type: 'Frustrated',
    description: 'Tired of empty words and potholes. Demands real accountability.',
    promiseMod: { positiveRate: 0.40, doubtfulRate: 0.35, trustChange: 1 },
    blameMod: { positiveRate: 0.15, doubtfulRate: 0.35, trustChange: -6 },
    honestyMod: { positiveRate: 0.75, doubtfulRate: 0.20, trustChange: 12 },
    ignoreTrustPenalty: -6
  },
  'Undecided': {
    type: 'Undecided',
    description: 'Weighing all options carefully before marking their ballot.',
    promiseMod: { positiveRate: 0.65, doubtfulRate: 0.25, trustChange: 4 },
    blameMod: { positiveRate: 0.35, doubtfulRate: 0.40, trustChange: -2 },
    honestyMod: { positiveRate: 0.70, doubtfulRate: 0.25, trustChange: 8 },
    ignoreTrustPenalty: -3
  },
  'Humour-loving': {
    type: 'Humour-loving',
    description: 'Appreciates good vibes, laughter, and politicians who do not take themselves too seriously.',
    promiseMod: { positiveRate: 0.50, doubtfulRate: 0.35, trustChange: 3 },
    blameMod: { positiveRate: 0.45, doubtfulRate: 0.35, trustChange: 0 },
    honestyMod: { positiveRate: 0.90, doubtfulRate: 0.10, trustChange: 14 },
    ignoreTrustPenalty: -2
  }
};

export const ALL_PERSONALITIES: PersonalityType[] = [
  'Hopeful',
  'Sceptical',
  'Loyal',
  'Frustrated',
  'Undecided',
  'Humour-loving'
];
