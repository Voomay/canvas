import { ComplaintData, ResponseType, getComplaintReaction } from '../data/complaints';
import { PersonalityType, PERSONALITIES } from '../data/personalities';

export interface DialogueOutcome {
  responseType: ResponseType;
  outcome: 'positive' | 'doubtful' | 'negative';
  reactionText: string;
  voteGained: number;
  trustChange: number;
  personality: PersonalityType;
  consecutivePromisesCount: number;
}

export class DialogueSystem {
  private recentPromiseCount: number = 0;

  public evaluateResponse(
    complaint: ComplaintData,
    responseType: ResponseType,
    personalityType: PersonalityType,
    partyId: 'da' | 'anc' | 'pa'
  ): DialogueOutcome {
    const personality = PERSONALITIES[personalityType];
    let positiveRate = 0.5;
    let doubtfulRate = 0.3;
    let baseTrustChange = 0;
    let maxVoteReward = 1;

    // Apply response modifiers from personality
    if (responseType === 'promise') {
      this.recentPromiseCount++;
      // Consecutive promise fatigue: -7% per recent promise after the 1st
      const fatiguePenalty = Math.max(0, (this.recentPromiseCount - 1) * 0.07);
      positiveRate = Math.max(0.2, personality.promiseMod.positiveRate - fatiguePenalty);
      doubtfulRate = personality.promiseMod.doubtfulRate + (fatiguePenalty * 0.5);
      baseTrustChange = personality.promiseMod.trustChange;

      // Party trait: DA gets small promise credibility bonus
      if (partyId === 'da') {
        positiveRate = Math.min(0.95, positiveRate + 0.05);
      }
    } else {
      // Non-promise resets promise fatigue
      this.recentPromiseCount = Math.max(0, this.recentPromiseCount - 1);

      if (responseType === 'blame') {
        // Partisans love blaming opposition; sceptical/frustrated citizens hate buck-passing
        if (personalityType === 'Loyal') {
          positiveRate = 0.75;
          doubtfulRate = 0.15;
          baseTrustChange = 3;
        } else if (personalityType === 'Sceptical' || personalityType === 'Frustrated') {
          positiveRate = 0.20;
          doubtfulRate = 0.30;
          baseTrustChange = -4;
        } else {
          positiveRate = personality.blameMod.positiveRate;
          doubtfulRate = personality.blameMod.doubtfulRate;
          baseTrustChange = personality.blameMod.trustChange;
        }

        // Party trait: ANC resilience bonus
        if (partyId === 'anc') {
          positiveRate = Math.min(0.9, positiveRate + 0.05);
        }
      } else if (responseType === 'honesty') {
        positiveRate = personality.honestyMod.positiveRate;
        doubtfulRate = personality.honestyMod.doubtfulRate;
        baseTrustChange = personality.honestyMod.trustChange;

        // Party trait: PA honesty swagger bonus
        if (partyId === 'pa') {
          positiveRate = Math.min(0.95, positiveRate + 0.08);
          baseTrustChange += 2;
        }
      } else if (responseType === 'lie') {
        // High Risk / High Reward!
        // Hopeful/Undecided personalities fall for it (+2 votes!)
        // Sceptical/Frustrated personalities smell the lie and call you out!
        maxVoteReward = 2;
        if (personalityType === 'Hopeful' || personalityType === 'Undecided') {
          positiveRate = 0.72;
          doubtfulRate = 0.18;
          baseTrustChange = 5;
        } else if (personalityType === 'Sceptical' || personalityType === 'Frustrated') {
          // Sharp citizens smell the lie immediately!
          positiveRate = 0.10;
          doubtfulRate = 0.18;
          baseTrustChange = -7;
        } else {
          positiveRate = 0.35;
          doubtfulRate = 0.35;
          baseTrustChange = -2;
        }
      }
    }

    // Roll random outcome
    const roll = Math.random();
    let outcome: 'positive' | 'doubtful' | 'negative' = 'negative';
    let voteGained = 0;
    let trustChange = baseTrustChange;

    if (roll < positiveRate) {
      outcome = 'positive';
      voteGained = maxVoteReward;
      // Votes directly boost trust (+6% to +9%)
      trustChange = Math.max(6, baseTrustChange + (voteGained * 5));
    } else if (roll < positiveRate + doubtfulRate) {
      outcome = 'doubtful';
      // 30% chance for a doubtful resident to still give a sympathetic vote
      voteGained = Math.random() < 0.3 ? 1 : 0;
      trustChange = voteGained > 0 ? 3 : Math.floor(baseTrustChange * 0.5);
    } else {
      outcome = 'negative';
      voteGained = 0;
      trustChange = responseType === 'lie' ? -10 : Math.min(-3, baseTrustChange - 4);
    }

    // Extract reaction text
    const reactionText = getComplaintReaction(complaint, responseType, outcome, partyId);

    return {
      responseType,
      outcome,
      reactionText,
      voteGained,
      trustChange,
      personality: personalityType,
      consecutivePromisesCount: this.recentPromiseCount
    };
  }

  public resetFatigue() {
    this.recentPromiseCount = 0;
  }
}
