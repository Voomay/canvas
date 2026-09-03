import { INITIAL_VALUES } from '../config/constants';

export interface GameStats {
  residentsApproached: number;
  residentsIgnored: number;
  promisesMade: number;
  blamesGiven: number;
  honestyGiven: number;
  obstaclesHit: number;
  positiveReactions: number;
  doubtfulReactions: number;
  negativeReactions: number;
}

export class ScoreManager {
  private static instance: ScoreManager;

  public votes: number = INITIAL_VALUES.votes;
  public trust: number = INITIAL_VALUES.trust;
  public totalTimeRemaining: number = INITIAL_VALUES.timeSeconds;
  public currentStreetIndex: number = 1;
  public totalStreets: number = INITIAL_VALUES.streetCount;

  public stats: GameStats = {
    residentsApproached: 0,
    residentsIgnored: 0,
    promisesMade: 0,
    blamesGiven: 0,
    honestyGiven: 0,
    obstaclesHit: 0,
    positiveReactions: 0,
    doubtfulReactions: 0,
    negativeReactions: 0
  };

  private constructor() {}

  public static getInstance(): ScoreManager {
    if (!ScoreManager.instance) {
      ScoreManager.instance = new ScoreManager();
    }
    return ScoreManager.instance;
  }

  public resetGame() {
    this.votes = INITIAL_VALUES.votes;
    this.trust = INITIAL_VALUES.trust;
    this.totalTimeRemaining = INITIAL_VALUES.timeSeconds;
    this.currentStreetIndex = 1;
    this.stats = {
      residentsApproached: 0,
      residentsIgnored: 0,
      promisesMade: 0,
      blamesGiven: 0,
      honestyGiven: 0,
      obstaclesHit: 0,
      positiveReactions: 0,
      doubtfulReactions: 0,
      negativeReactions: 0
    };
  }

  public addVotes(amount: number) {
    this.votes = Math.max(0, this.votes + amount);
  }

  public modifyTrust(amount: number) {
    this.trust = Math.min(100, Math.max(0, this.trust + amount));
  }

  public recordEncounter(
    responseType: 'promise' | 'blame' | 'honesty' | 'ignored',
    outcome?: 'positive' | 'doubtful' | 'negative'
  ) {
    if (responseType === 'ignored') {
      this.stats.residentsIgnored++;
    } else {
      this.stats.residentsApproached++;
      if (responseType === 'promise') this.stats.promisesMade++;
      if (responseType === 'blame') this.stats.blamesGiven++;
      if (responseType === 'honesty') this.stats.honestyGiven++;

      if (outcome === 'positive') this.stats.positiveReactions++;
      if (outcome === 'doubtful') this.stats.doubtfulReactions++;
      if (outcome === 'negative') this.stats.negativeReactions++;
    }
  }

  public recordObstacleHit() {
    this.stats.obstaclesHit++;
    this.modifyTrust(-3);
  }

  public getRating(): { title: string; subtitle: string; badgeEmoji: string } {
    const { promisesMade, blamesGiven, honestyGiven } = this.stats;

    if (this.trust >= 75 && this.votes >= 15) {
      return {
        title: 'Community Favourite',
        subtitle: 'The neighbourhood loves your energy and integrity! Ward councillor material.',
        badgeEmoji: '🌟'
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
        subtitle: 'Too many potholes tripped you up. Time to rethink the manifesto before the next by-election!',
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
