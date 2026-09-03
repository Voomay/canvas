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
}

export class ScoreManager {
  private static instance: ScoreManager;

  public votes: number = INITIAL_VALUES.votes;
  public trust: number = INITIAL_VALUES.trust;
  public totalTimeRemaining: number = INITIAL_VALUES.timeSeconds;
  public currentStreetIndex: number = 1;
  public totalStreets: number = INITIAL_VALUES.streetCount;

  // Area-specific tracking
  public currentAreaObstaclesCleared: number = 0;
  public currentAreaObstaclesHit: number = 0;
  public currentAreaResidentsApproached: number = 0;
  public totalCampaignVotes: number = 0;

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
    negativeReactions: 0
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
  }

  public resetGame() {
    this.votes = INITIAL_VALUES.votes;
    this.trust = INITIAL_VALUES.trust;
    this.totalTimeRemaining = INITIAL_VALUES.timeSeconds;
    this.currentStreetIndex = 1;
    this.currentAreaObstaclesCleared = 0;
    this.currentAreaObstaclesHit = 0;
    this.currentAreaResidentsApproached = 0;
    this.totalCampaignVotes = 0;
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
      negativeReactions: 0
    };
  }

  public addVotes(amount: number) {
    this.votes = Math.max(0, this.votes + amount);
    this.totalCampaignVotes = Math.max(0, this.totalCampaignVotes + amount);
  }

  public modifyTrust(amount: number) {
    this.trust = Math.min(100, Math.max(0, this.trust + amount));
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
  }

  public recordObstacleCleared() {
    this.stats.obstaclesCleared++;
    this.currentAreaObstaclesCleared++;
    this.modifyTrust(3);
  }

  public getRating(): { title: string; subtitle: string; badgeEmoji: string } {
    const { promisesMade, blamesGiven, honestyGiven } = this.stats;
    const totalVotesEarned = this.totalCampaignVotes > 0 ? this.totalCampaignVotes : this.votes;

    if (this.trust >= 75 && totalVotesEarned >= 15) {
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
