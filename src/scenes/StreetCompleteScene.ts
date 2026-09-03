import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';
import { STREETS } from '../data/streets';
import { PARTIES } from '../data/parties';
import { Button } from '../ui/Button';
import { SoundFX } from '../systems/SoundFX';
import { ShareModal } from '../ui/ShareModal';
import { AdvertiseModal } from '../ui/AdvertiseModal';

export class StreetCompleteScene extends Phaser.Scene {
  private partyId: 'da' | 'anc' | 'pa' = 'da';

  constructor() {
    super('StreetCompleteScene');
  }

  public init(data: { partyId: 'da' | 'anc' | 'pa' }) {
    this.partyId = data.partyId || 'da';
  }

  public create() {
    const { width, height } = this.scale;
    const scoreManager = ScoreManager.getInstance();
    const completedStreetIndex = scoreManager.currentStreetIndex;
    const currentStreetData = STREETS[completedStreetIndex - 1];

    SoundFX.getInstance().playStreetVictory();

    // Background
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height);
    let bgKey = 'bg_location_capetown';
    if (currentStreetData?.locationKey === 'campsbay' && this.textures.exists('bg_location_campsbay')) {
      bgKey = 'bg_location_campsbay';
    } else if (currentStreetData?.locationKey === 'khayelitsha' && this.textures.exists('bg_location_khayelitsha')) {
      bgKey = 'bg_location_khayelitsha';
    } else if (currentStreetData?.locationKey === 'mitchells_plain' && this.textures.exists('bg_location_mitchells_plain')) {
      bgKey = 'bg_location_mitchells_plain';
    } else if (currentStreetData?.locationKey === 'joburg' && this.textures.exists('bg_location_joburg')) {
      bgKey = 'bg_location_joburg';
    } else if (this.textures.exists('bg_location_capetown')) {
      bgKey = 'bg_location_capetown';
    }

    const cloudKey = this.textures.exists('bg_clouds_sky') ? 'bg_clouds_sky' : 'bg_clouds';
    const roadKey = this.textures.exists('real_bg_road') ? 'real_bg_road' : 'bg_road';
    
    const bgScale = 444 / 670;
    const bgTile = this.add.tileSprite(0, 0, width, 444, bgKey).setOrigin(0, 0);
    bgTile.tileScaleX = bgScale;
    bgTile.tileScaleY = bgScale;

    this.add.tileSprite(0, 15, width, 120, cloudKey).setOrigin(0, 0);
    this.add.tileSprite(0, 428, width, 292, roadKey).setOrigin(0, 0);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x0c1524, 0.88);
    overlay.fillRect(0, 0, width, height);

    const targetVotes = currentStreetData?.targetVotes || 10;
    const isWardWon = scoreManager.votes >= targetVotes;
    const isPortrait = height > width;
    const cw = isPortrait ? Math.min(width - 24, 424) : Math.min(840, width - 40);
    const ch = isPortrait ? Math.min(height - 24, 550) : 510;

    // Summary Card
    const card = this.add.graphics();
    card.fillStyle(0x131f30, 0.96);
    card.fillRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2, cw, ch, 20);
    card.lineStyle(3, 0xfcb813, 1);
    card.strokeRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2, cw, ch, 20);

    if (isWardWon) {
      SoundFX.getInstance().playStreetVictory();
    } else {
      SoundFX.getInstance().playVoteNegative();
    }

    // Header & Badge
    const headerTitle = isWardWon ? `🎉 SELECTED FOR AREA ${completedStreetIndex}!` : `❌ AREA ${completedStreetIndex} NOT WON`;
    const headerColor = isWardWon ? '#2ecc71' : '#ff5555';
    const subMsg = isWardWon
      ? `🏆 VICTORY! You secured ${scoreManager.votes}/${targetVotes} votes in 30s and won this Area election!`
      : `⚠️ You got ${scoreManager.votes}/${targetVotes} votes. You needed at least ${targetVotes} votes in 30s to win this Area!`;

    const topOffset = height / 2 - ch / 2;

    this.add.text(width / 2, topOffset + (isPortrait ? 34 : 44), headerTitle, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '21px' : '34px',
      color: headerColor,
      fontStyle: '900',
      stroke: '#080d14',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, topOffset + (isPortrait ? 66 : 82), currentStreetData.suburb, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '15px' : '19px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, topOffset + (isPortrait ? 98 : 118), subMsg, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '12px' : '14.5px',
      color: isWardWon ? '#86efac' : '#fca5a5',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: cw - 36 }
    }).setOrigin(0.5, 0.5);

    // 6 Stats Grid (3 cols x 2 rows in landscape, 2 cols x 3 rows in portrait)
    const statItems = [
      { label: 'Area Votes Secured', val: `${scoreManager.votes} / ${targetVotes} 🗳️`, color: isWardWon ? '#44dd66' : '#ff7777' },
      { label: 'Infrastructure Restored', val: `${scoreManager.currentAreaObstaclesCleared} Fixed 🛠️`, color: '#38bdf8' },
      { label: 'Community Trust', val: `${Math.round(scoreManager.trust)}% 🤝`, color: '#fcb813' },
      { label: 'Residents Approached', val: `${scoreManager.currentAreaResidentsApproached} 🗣️`, color: '#ffffff' },
      { label: 'Hazards Stumbled', val: `${scoreManager.currentAreaObstaclesHit} 💥`, color: scoreManager.currentAreaObstaclesHit > 0 ? '#ff7777' : '#44dd66' },
      { label: 'Area Status', val: isWardWon ? 'ELECTED! 🏆' : 'DEFEATED ❌', color: isWardWon ? '#44dd66' : '#ff5555' }
    ];

    if (isPortrait) {
      const statBoxW = (cw - 36) / 2;
      const statBoxH = 50;
      const colGap = statBoxW / 2 + 4;
      const startGridY = topOffset + 148;

      statItems.forEach((st, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const sx = col === 0 ? width / 2 - colGap : width / 2 + colGap;
        const sy = startGridY + row * (statBoxH + 8);

        const statBg = this.add.graphics();
        statBg.fillStyle(0x0c1524, 0.9);
        statBg.fillRoundedRect(sx - statBoxW / 2, sy - statBoxH / 2, statBoxW, statBoxH, 10);
        statBg.lineStyle(2, 0x1f3c6e, 1);
        statBg.strokeRoundedRect(sx - statBoxW / 2, sy - statBoxH / 2, statBoxW, statBoxH, 10);

        this.add.text(sx, sy - 9, st.label, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '11px',
          color: '#cbd5e1',
          fontStyle: '700'
        }).setOrigin(0.5, 0.5);

        this.add.text(sx, sy + 11, st.val, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '16px',
          color: st.color,
          fontStyle: '900'
        }).setOrigin(0.5, 0.5);
      });
    } else {
      const statBoxW = 244;
      const statBoxH = 62;
      const colOffsets = [-260, 0, 260];
      const startGridY = topOffset + 175;

      statItems.forEach((st, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const sx = width / 2 + colOffsets[col];
        const sy = startGridY + row * (statBoxH + 12);

        const statBg = this.add.graphics();
        statBg.fillStyle(0x0c1524, 0.9);
        statBg.fillRoundedRect(sx - statBoxW / 2, sy - statBoxH / 2, statBoxW, statBoxH, 10);
        statBg.lineStyle(2, 0x1f3c6e, 1);
        statBg.strokeRoundedRect(sx - statBoxW / 2, sy - statBoxH / 2, statBoxW, statBoxH, 10);

        this.add.text(sx, sy - 11, st.label, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12.5px',
          color: '#cbd5e1',
          fontStyle: '700'
        }).setOrigin(0.5, 0.5);

        this.add.text(sx, sy + 13, st.val, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '20px',
          color: st.color,
          fontStyle: '900'
        }).setOrigin(0.5, 0.5);
      });
    }

    // Buttons: Win vs Retry Loop
    const hasMoreStreets = completedStreetIndex < scoreManager.totalStreets;
    const btnY = topOffset + (isPortrait ? 354 : 368);
    const party = PARTIES[this.partyId] || PARTIES.da;

    const openShareModal = () => {
      ShareModal.open({
        partyName: party.name,
        partyFullName: party.fullName,
        partyId: this.partyId,
        wardName: currentStreetData.name,
        suburb: currentStreetData.suburb,
        votesSecured: scoreManager.votes,
        targetVotes: targetVotes,
        trustPercent: scoreManager.trust,
        obstaclesCleared: scoreManager.currentAreaObstaclesCleared,
        residentsApproached: scoreManager.currentAreaResidentsApproached,
        areaIndex: completedStreetIndex
      });
    };

    if (isWardWon) {
      const btnText = hasMoreStreets 
        ? `PROCEED TO NEXT AREA ➔` 
        : 'VIEW FINAL RESULTS ➔';

      if (isPortrait) {
        new Button(this, width / 2, btnY, btnText, () => {
          if (hasMoreStreets) {
            scoreManager.currentStreetIndex++;
            this.scene.start('GameScene', { partyId: this.partyId });
          } else {
            this.scene.start('ResultsScene', { partyId: this.partyId });
          }
        }, {
          width: cw - 32,
          height: 46,
          bgColor: 0x1f9137,
          hoverColor: 0x27ab42,
          fontSize: '15px'
        });

        new Button(this, width / 2, btnY + 52, '📤 SHARE WARD VICTORY 🔗', openShareModal, {
          width: cw - 32,
          height: 44,
          bgColor: 0x005ba6,
          hoverColor: 0x1a75c2,
          fontSize: '14px'
        });
      } else {
        const halfBtnW = Math.min(360, (cw - 48) / 2);
        new Button(this, width / 2 - halfBtnW / 2 - 8, btnY, btnText, () => {
          if (hasMoreStreets) {
            scoreManager.currentStreetIndex++;
            this.scene.start('GameScene', { partyId: this.partyId });
          } else {
            this.scene.start('ResultsScene', { partyId: this.partyId });
          }
        }, {
          width: halfBtnW,
          height: 54,
          bgColor: 0x1f9137,
          hoverColor: 0x27ab42,
          fontSize: '18px'
        });

        new Button(this, width / 2 + halfBtnW / 2 + 8, btnY, '📤 SHARE WARD VICTORY 🔗', openShareModal, {
          width: halfBtnW,
          height: 54,
          bgColor: 0x005ba6,
          hoverColor: 0x1a75c2,
          fontSize: '18px'
        });
      }
    } else {
      const btnW = isPortrait ? (cw - 36) / 2 : 300;
      const btnH = isPortrait ? 48 : 58;
      const btnColOffset = isPortrait ? btnW / 2 + 4 : 160;

      // High-Urgency Retry Button
      new Button(this, width / 2 - btnColOffset, btnY, isPortrait ? 'RETRY AREA ↺' : '⚡ RETRY AREA (30s) ↺', () => {
        this.scene.start('GameScene', { partyId: this.partyId });
      }, {
        width: btnW,
        height: btnH,
        bgColor: 0xdb580a,
        hoverColor: 0xf06a1a,
        fontSize: isPortrait ? '13px' : '19px'
      });

      // Continue button anyway
      new Button(this, width / 2 + btnColOffset, btnY, isPortrait ? 'CONTINUE ➔' : 'CONTINUE ANYWAY ➔', () => {
        if (hasMoreStreets) {
          scoreManager.currentStreetIndex++;
          this.scene.start('GameScene', { partyId: this.partyId });
        } else {
          this.scene.start('ResultsScene', { partyId: this.partyId });
        }
      }, {
        width: btnW,
        height: btnH,
        bgColor: 0x1f3c6e,
        hoverColor: 0x2b5294,
        fontSize: isPortrait ? '13px' : '17px'
      });
    }

    // "Advertise with Us" Link / Button at bottom of card
    const adY = topOffset + ch - (isPortrait ? 22 : 26);
    const adText = this.add.text(width / 2, adY, '📢 Want your brand on in-game minibus taxis & billboards? Advertise With Us ➔', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '13px',
      color: '#fcb813',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    adText.setInteractive({ useHandCursor: true });
    adText.on('pointerover', () => adText.setColor('#ffffff'));
    adText.on('pointerout', () => adText.setColor('#fcb813'));
    adText.on('pointerdown', () => {
      AdvertiseModal.open();
    });
  }
}
