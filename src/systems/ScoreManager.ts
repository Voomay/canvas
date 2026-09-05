import { INITIAL_VALUES } from '../config/constants';

export interface GameStats {
  residentsApproached: number;
  residentsIgnored: number;
  promisesMade: number;
  blamesGiven: number;
  honestyGiven: number;
  liesTold: number;
  obstaclesHit: number;
  obstaclesCleared: number;
  positiveReactions: number;
  doubtfulReactions: number;
  negativeReactions: number;
  rudeEncounters: number;
  cheerfulEncounters: number;
  insultsReceived: number;
  moraleBoosts: number;
  burnoutsSuffered: number;
}

export class ScoreManager {
  private static instance: ScoreManager;

  public votes: number = INITIAL_VALUES.votes;
  public trust: number = INITIAL_VALUES.trust;
  public mentalHealth: number = 100; // 0 to 100%
  public totalTimeRemaining: number = INITIAL_VALUES.timeSeconds;
  public currentStreetIndex: number = 1;
  public totalStreets: number = INITIAL_VALUES.streetCount;

  // Area-specific tracking
  public currentAreaObstaclesCleared: number = 0;
  public currentAreaObstaclesHit: number = 0;
  public currentAreaResidentsApproached: number = 0;
  public totalCampaignVotes: number = 0;

  // First-encounter tutorial flags
  public hasSeenObstacleTutorial: boolean = false;
  public hasSeenResidentTutorial: boolean = false;

  public stats: GameStats = {
    residentsApproached: 0,
    residentsIgnored: 0,
    promisesMade: 0,
    blamesGiven: 0,
    honestyGiven: 0,
    liesTold: 0,
    obstaclesHit: 0,
    obstaclesCleared: 0,
    positiveReactions: 0,
    doubtfulReactions: 0,
    negativeReactions: 0,
    rudeEncounters: 0,
    cheerfulEncounters: 0,
    insultsReceived: 0,
    moraleBoosts: 0,
    burnoutsSuffered: 0
  };

  private constructor() {}

  public static getInstance(): ScoreManager {
    if (!ScoreManager.instance) {
      ScoreManager.instance = new ScoreManager();
    }
    return ScoreManager.instance;
  }

  public startNewArea(streetIndex: number) {
    this.currentStreetIndex = streetIndex;
    this.votes = 0;
    this.currentAreaObstaclesCleared = 0;
    this.currentAreaObstaclesHit = 0;
    this.currentAreaResidentsApproached = 0;
    // Area break refreshes candidate morale!
    this.mentalHealth = Math.min(100, Math.max(70, this.mentalHealth + 30));
  }

  public resetGame() {
    this.votes = INITIAL_VALUES.votes;
    this.trust = INITIAL_VALUES.trust;
    this.mentalHealth = 100;
    this.totalTimeRemaining = INITIAL_VALUES.timeSeconds;
    this.currentStreetIndex = 1;
    this.currentAreaObstaclesCleared = 0;
    this.currentAreaObstaclesHit = 0;
    this.currentAreaResidentsApproached = 0;
    this.totalCampaignVotes = 0;
    this.hasSeenObstacleTutorial = false;
    this.hasSeenResidentTutorial = false;
    this.stats = {
      residentsApproached: 0,
      residentsIgnored: 0,
      promisesMade: 0,
      blamesGiven: 0,
      honestyGiven: 0,
      liesTold: 0,
      obstaclesHit: 0,
      obstaclesCleared: 0,
      positiveReactions: 0,
      doubtfulReactions: 0,
      negativeReactions: 0,
      rudeEncounters: 0,
      cheerfulEncounters: 0,
      insultsReceived: 0,
      moraleBoosts: 0,
      burnoutsSuffered: 0
    };
  }

  public addVotes(amount: number) {
    this.votes = Math.max(0, this.votes + amount);
    this.totalCampaignVotes = Math.max(0, this.totalCampaignVotes + amount);
  }

  public modifyTrust(amount: number) {
    this.trust = Math.min(100, Math.max(0, this.trust + amount));
  }

  public modifyMentalHealth(amount: number): { prev: number; current: number; delta: number } {
    const prev = this.mentalHealth;
    this.mentalHealth = Math.min(100, Math.max(0, this.mentalHealth + amount));
    const delta = this.mentalHealth - prev;

    if (amount < 0 && amount <= -8) {
      this.stats.insultsReceived++;
    } else if (amount > 0 && amount >= 5) {
      this.stats.moraleBoosts++;
    }

    return { prev, current: this.mentalHealth, delta };
  }

  public getMentalHealthStatus(): { label: string; emoji: string; color: string } {
    if (this.mentalHealth >= 80) {
      return { label: 'Energized', emoji: '😃', color: '#44dd66' };
    } else if (this.mentalHealth >= 50) {
      return { label: 'Steady', emoji: '🙂', color: '#fcb813' };
    } else if (this.mentalHealth >= 25) {
      return { label: 'Stressed', emoji: '😰', color: '#f97316' };
    } else {
      return { label: 'Burnout Alert', emoji: '🤯', color: '#ef4444' };
    }
  }

  public recordEncounter(
    responseType: 'promise' | 'blame' | 'honesty' | 'lie' | 'ignored',
    outcome?: 'positive' | 'doubtful' | 'negative'
  ) {
    if (responseType === 'ignored') {
      this.stats.residentsIgnored++;
    } else {
      this.stats.residentsApproached++;
      this.currentAreaResidentsApproached++;
      if (responseType === 'promise') this.stats.promisesMade++;
      if (responseType === 'blame') this.stats.blamesGiven++;
      if (responseType === 'honesty') this.stats.honestyGiven++;
      if (responseType === 'lie') this.stats.liesTold++;

      if (outcome === 'positive') this.stats.positiveReactions++;
      if (outcome === 'doubtful') this.stats.doubtfulReactions++;
      if (outcome === 'negative') this.stats.negativeReactions++;
    }
  }

  public recordObstacleHit() {
    this.stats.obstaclesHit++;
    this.currentAreaObstaclesHit++;
    this.modifyTrust(-3);
    this.modifyMentalHealth(-4);
  }

  public recordObstacleCleared() {
    this.stats.obstaclesCleared++;
    this.currentAreaObstaclesCleared++;
    this.modifyTrust(3);
    this.modifyMentalHealth(2);
  }

  public getRating(): { title: string; subtitle: string; badgeEmoji: string } {
    const { promisesMade, blamesGiven, honestyGiven, insultsReceived, burnoutsSuffered } = this.stats;
    const totalVotesEarned = this.totalCampaignVotes > 0 ? this.totalCampaignVotes : this.votes;

    if (this.trust >= 75 && totalVotesEarned >= 15 && this.mentalHealth >= 65) {
      return {
        title: 'Community Favourite & Resilient Hero',
        subtitle: 'The neighbourhood loves your energy! You stayed positive and won hearts and minds.',
        badgeEmoji: '🌟'
      };
    }

    if (insultsReceived >= 4 && this.mentalHealth >= 50) {
      return {
        title: 'Tough as Nails Canvasser',
        subtitle: 'You weathered door-slams, sharp stoep insults, and cynical voters without losing your stride!',
        badgeEmoji: '🛡️'
      };
    }

    if (burnoutsSuffered >= 2) {
      return {
        title: 'Exhausted Comrade',
        subtitle: 'Running door-to-door pushed your nerves to the absolute limit! Time for a warm rooibos break.',
        badgeEmoji: '☕'
      };
    }

    if (promisesMade >= 7 && promisesMade > honestyGiven && promisesMade > blamesGiven) {
      return {
        title: 'Professional Promiser',
        subtitle: 'You promised a tar truck, new streetlights, and a clinic on every corner! Can you deliver?',
        badgeEmoji: '📜'
      };
    }

    if (blamesGiven >= 5 && blamesGiven > honestyGiven) {
      return {
        title: 'Blame Game Champion',
        subtitle: 'Finger-pointing is your Olympic sport! Master of the coalition debate.',
        badgeEmoji: '👉'
      };
    }

    if (honestyGiven >= 5) {
      return {
        title: 'Unexpectedly Honest',
        subtitle: 'Voters were shocked to hear an honest answer. They appreciated the refreshing laughs!',
        badgeEmoji: '😂'
      };
    }

    if (this.trust < 40 || this.votes < 8) {
      return {
        title: 'Back to the Drawing Board',
        subtitle: 'Too many potholes and rude doors tripped you up. Time to rethink the manifesto!',
        badgeEmoji: '🚧'
      };
    }

    return {
      title: 'Resilient Canvasser',
      subtitle: 'A steady, balanced campaign run through the streets of South Africa.',
      badgeEmoji: '🗳️'
    };
  }
}
