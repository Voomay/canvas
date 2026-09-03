import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Obstacle, ObstacleType } from '../entities/Obstacle';
import { Resident } from '../entities/Resident';
import { ParallaxBackground } from '../systems/ParallaxBackground';
import { DialogueSystem } from '../systems/DialogueSystem';
import { ScoreManager } from '../systems/ScoreManager';
import { HUD } from '../ui/HUD';
import { DialogueModal } from './DialogueModal';
import { ReactionModal } from './ReactionModal';
import { STREETS, StreetLevel } from '../data/streets';
import { ResponseType } from '../data/complaints';
import { 
  PLAYER_X_RATIO, 
  GROUND_Y, 
  RUN_SPEED_BASE, 
  RUN_SPEED_SLOW 
} from '../config/constants';

export class GameScene extends Phaser.Scene {
  private partyId: 'da' | 'anc' | 'pa' = 'da';
  private player!: Player;
  private parallaxBg!: ParallaxBackground;
  private hud!: HUD;
  private dialogueSystem!: DialogueSystem;
  private scoreManager!: ScoreManager;
  private currentStreet!: StreetLevel;

  private enableObstacles: boolean = false; // Road obstacles disabled for now per user request
  private obstacles: Obstacle[] = [];
  private residents: Resident[] = [];
  
  private currentSpeed: number = RUN_SPEED_BASE;
  private targetSpeed: number = RUN_SPEED_BASE;
  private streetDistanceCovered: number = 0;
  private streetTimer: number = 0;

  private nextObstacleTime: number = 0;
  private nextResidentTime: number = 0;

  private activeResidentInEncounter: Resident | null = null;
  private encounterChoiceBanner: Phaser.GameObjects.Container | null = null;
  private isEncounterPaused: boolean = false;
  private hasStartedRunning: boolean = false;
  private startBanner: Phaser.GameObjects.Container | null = null;

  // Desktop Controls
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;
  private keyE?: Phaser.Input.Keyboard.Key;
  private keyR?: Phaser.Input.Keyboard.Key;
  private escKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('GameScene');
  }

  public init(data: { partyId: 'da' | 'anc' | 'pa' }) {
    this.partyId = data.partyId || 'da';
    this.scoreManager = ScoreManager.getInstance();
    this.currentStreet = STREETS[this.scoreManager.currentStreetIndex - 1] || STREETS[0];
  }

  public create() {
    this.dialogueSystem = new DialogueSystem();
    this.hasStartedRunning = false;
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.streetDistanceCovered = 0;
    this.streetTimer = this.currentStreet.durationSeconds;
    this.isEncounterPaused = false;
    this.activeResidentInEncounter = null;
    this.startBanner = null;
    this.obstacles = [];
    this.residents = [];

    // 1. Create Parallax Background (Cape Town / Hanover Park vs Johannesburg)
    this.parallaxBg = new ParallaxBackground(this, this.currentStreet.locationKey);

    // 2. Setup Invisible Ground physics collider (solid platform across full width)
    const ground = this.add.rectangle(this.scale.width / 2, GROUND_Y + 150, this.scale.width * 3, 300, 0x000000, 0);
    this.physics.add.existing(ground, true);

    // 3. Create Player Character (starts standing in IDLE pose)
    const playerX = Math.min(380, this.scale.width * PLAYER_X_RATIO);
    this.player = new Player(this, playerX, GROUND_Y, this.partyId);
    this.player.setPlayerState('IDLE');
    this.physics.add.collider(this.player, ground);

    // 4. Create HUD Overlay
    this.hud = new HUD(this);

    // 5. Setup Spawners
    this.nextResidentTime = Phaser.Math.Between(this.currentStreet.residentSpawnRateMin, this.currentStreet.residentSpawnRateMax);

    // Listen for resize
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.parallaxBg.resize(gameSize.width);
      if (ground && ground.body) {
        ground.x = gameSize.width / 2;
        ground.width = gameSize.width * 3;
      }
    });

    // 6. Setup Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
      this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      this.escKey.on('down', () => {
        this.scene.start('MainMenuScene');
      });
    }

    // Listen for Exit Menu event from HUD
    this.events.on('exit-to-menu', () => {
      this.scene.start('MainMenuScene');
    });

    // Touch / Mobile Tap Controls
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // If hasn't started running yet, tap starts running!
      if (!this.hasStartedRunning) {
        this.startCanvassing();
        return;
      }

      // If running and tapping screen (and not in dialogue / encounters)
      if (!this.isEncounterPaused && pointer.y > 180 && pointer.y < 600) {
        this.player.jump();
      }
    });

    this.events.on('player-jump', () => {
      if (!this.hasStartedRunning) {
        this.startCanvassing();
        return;
      }
      if (!this.isEncounterPaused) {
        this.player.jump();
      }
    });

    // Display initial Standing Ready Banner
    this.createStartBanner();
  }

  public update(time: number, delta: number) {
    if (this.isEncounterPaused) return;

    // If haven't started running yet, check inputs to start
    if (!this.hasStartedRunning) {
      if (
        (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) ||
        (this.cursors?.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
        (this.cursors?.right && Phaser.Input.Keyboard.JustDown(this.cursors.right)) ||
        (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey))
      ) {
        this.startCanvassing();
      }
      return;
    }

    // Handle Keyboard Jump
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey!) || Phaser.Input.Keyboard.JustDown(this.cursors!.up!)) {
      this.player.jump();
    }

    // Handle Speed Transition
    this.currentSpeed = Phaser.Math.Linear(this.currentSpeed, this.targetSpeed, 0.08);

    // Update Player
    this.player.update(time, delta);

    // Update Parallax Background
    this.parallaxBg.update(this.currentSpeed, delta);

    // Update Distance & Timers
    const deltaSeconds = delta / 1000;
    this.streetDistanceCovered += this.currentSpeed * deltaSeconds;
    this.streetTimer -= deltaSeconds;
    this.scoreManager.totalTimeRemaining -= deltaSeconds;

    this.hud.updateValues();

    // Check Street or Game Completion
    if (this.streetDistanceCovered >= this.currentStreet.targetDistance || this.streetTimer <= 0) {
      this.completeCurrentStreet();
      return;
    }

    if (this.scoreManager.totalTimeRemaining <= 0) {
      this.finishGame();
      return;
    }

    // Update Obstacles Movement & Collision (disabled when enableObstacles is false)
    if (this.enableObstacles) {
      this.updateObstacles(delta);
    }

    // Update Residents Movement & Approach
    this.updateResidents(delta);

    // Handle Timed Spawners
    this.handleSpawning(delta);

    // Check Encounter Keys
    if (this.activeResidentInEncounter) {
      if (Phaser.Input.Keyboard.JustDown(this.enterKey!) || Phaser.Input.Keyboard.JustDown(this.keyE!)) {
        this.triggerStopAndListen(this.activeResidentInEncounter);
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors!.right!) || Phaser.Input.Keyboard.JustDown(this.keyR!)) {
        this.triggerKeepRunning(this.activeResidentInEncounter);
      }
    }
  }

  private handleSpawning(delta: number) {
    // 1. Obstacle Spawning - Disabled for now per user request
    if (this.enableObstacles) {
      this.nextObstacleTime -= delta;
      if (this.nextObstacleTime <= 0) {
        this.spawnObstacle();
        this.nextObstacleTime = Phaser.Math.Between(
          this.currentStreet.obstacleSpawnRateMin,
          this.currentStreet.obstacleSpawnRateMax
        );
      }
    }

    // 2. Resident Spawning
    this.nextResidentTime -= delta;
    if (this.nextResidentTime <= 0 && !this.activeResidentInEncounter) {
      this.spawnResident();
      this.nextResidentTime = Phaser.Math.Between(
        this.currentStreet.residentSpawnRateMin,
        this.currentStreet.residentSpawnRateMax
      );
    }
  }

  private spawnObstacle() {
    const pool = this.currentStreet.obstaclePool;
    const type = pool[Phaser.Math.Between(0, pool.length - 1)] as ObstacleType;
    const spawnX = this.scale.width + 80;
    const spawnY = GROUND_Y;

    const obstacle = new Obstacle(this, spawnX, spawnY, type);
    this.obstacles.push(obstacle);

    // Physics overlap check with player
    this.physics.add.overlap(this.player, obstacle, () => {
      if (!obstacle.hasHit) {
        const wasHit = this.player.onHitObstacle();
        if (wasHit) {
          obstacle.hasHit = true;
          this.scoreManager.recordObstacleHit();
          this.hud.updateValues();

          // Temporarily slow running speed
          this.targetSpeed = RUN_SPEED_SLOW;
          this.time.delayedCall(800, () => {
            this.targetSpeed = RUN_SPEED_BASE;
          });
        }
      }
    });
  }

  private spawnResident() {
    const spawnX = this.scale.width + 100;
    const spawnY = GROUND_Y; // Same ground level as runner on sidewalk

    const resident = new Resident(this, spawnX, spawnY, this.currentStreet.allowedComplaintCategories, this.partyId);
    resident.setDepth(6);
    this.residents.push(resident);
  }

  private updateObstacles(delta: number) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (!obs.active) {
        this.obstacles.splice(i, 1);
        continue;
      }
      obs.updateMovement(this.currentSpeed, delta);
    }
  }

  private updateResidents(delta: number) {
    const playerX = this.player.x;

    for (let i = this.residents.length - 1; i >= 0; i--) {
      const resident = this.residents[i];
      if (!resident.active) {
        this.residents.splice(i, 1);
        continue;
      }

      resident.updateMovement(this.currentSpeed, delta);

      // Approaching detection (between 120 and 420px ahead)
      const distance = resident.x - playerX;

      if (!resident.hasEncountered && distance > 120 && distance < 420 && !this.activeResidentInEncounter) {
        resident.isApproaching = true;
        this.activeResidentInEncounter = resident;
        resident.triggerAlertSound();
        this.showEncounterChoiceBanner(resident);
      }

      // Passed without stopping -> Ignored!
      if (!resident.hasEncountered && distance < -40) {
        resident.hasEncountered = true;
        this.handleResidentPassed(resident);
      }
    }
  }

  private createStartBanner() {
    const { width } = this.scale;
    const banner = this.add.container(width / 2, 260);
    banner.setDepth(150);

    const w = 490;
    const h = 175;

    const bg = this.add.graphics();
    bg.fillStyle(0x0c1524, 0.96);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    bg.lineStyle(3, 0xfcb813, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);

    const title = this.add.text(0, -42, '👟 READY TO CANVASS!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '26px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const subtitle = this.add.text(0, -10, 'Tap screen or press [SPACE] to start running', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#e2e8f0',
      fontStyle: '600'
    }).setOrigin(0.5, 0.5);

    // Green action button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x1f9137, 1);
    btnBg.fillRoundedRect(-140, 18, 280, 46, 12);
    btnBg.lineStyle(2, 0xffffff, 0.9);
    btnBg.strokeRoundedRect(-140, 18, 280, 46, 12);

    const btnTxt = this.add.text(0, 41, '🏃 START RUNNING ➔', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const btnZone = this.add.zone(0, 41, 280, 46).setInteractive({ useHandCursor: true });
    btnZone.on('pointerdown', () => this.startCanvassing());

    banner.add([bg, title, subtitle, btnBg, btnTxt, btnZone]);

    // Entrance pop
    banner.setScale(0.9);
    this.tweens.add({
      targets: banner,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 220,
      ease: 'Back.easeOut'
    });

    this.startBanner = banner;

    // Natural auto-start after 1.8 seconds if user has not clicked
    this.time.delayedCall(1800, () => {
      if (!this.hasStartedRunning) {
        this.startCanvassing();
      }
    });
  }

  private startCanvassing() {
    if (this.hasStartedRunning) return;
    this.hasStartedRunning = true;

    if (this.startBanner) {
      this.tweens.add({
        targets: this.startBanner,
        alpha: 0,
        y: this.startBanner.y - 25,
        duration: 250,
        onComplete: () => {
          this.startBanner?.destroy();
          this.startBanner = null;
        }
      });
    }

    this.player.setPlayerState('RUNNING');
    this.targetSpeed = RUN_SPEED_BASE;
  }

  private showEncounterChoiceBanner(resident: Resident) {
    if (this.encounterChoiceBanner) {
      this.encounterChoiceBanner.destroy();
    }

    const banner = this.add.container(this.scale.width / 2, 140);
    banner.setDepth(140);

    const bg = this.add.graphics();
    bg.fillStyle(0x0c1524, 0.96);
    bg.fillRoundedRect(-270, -55, 540, 110, 18);
    bg.lineStyle(3, 0xfcb813, 1);
    bg.strokeRoundedRect(-270, -55, 540, 110, 18);

    const title = this.add.text(0, -28, '🗣️ RESIDENT WANTS TO TALK!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    // Stop & Talk Button (Large & touch-friendly)
    const stopBtnBg = this.add.graphics();
    stopBtnBg.fillStyle(0x1f9137, 1);
    stopBtnBg.fillRoundedRect(-245, 2, 235, 46, 12);
    stopBtnBg.lineStyle(2, 0xffffff, 0.9);
    stopBtnBg.strokeRoundedRect(-245, 2, 235, 46, 12);

    const stopTxt = this.add.text(-127, 25, '✋ STOP & TALK [E]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const stopZone = this.add.zone(-127, 25, 235, 46).setInteractive({ useHandCursor: true });
    stopZone.on('pointerdown', () => this.triggerStopAndListen(resident));

    // Keep Running Button (Large & touch-friendly)
    const runBtnBg = this.add.graphics();
    runBtnBg.fillStyle(0xdb580a, 1);
    runBtnBg.fillRoundedRect(10, 2, 235, 46, 12);
    runBtnBg.lineStyle(2, 0x111111, 1);
    runBtnBg.strokeRoundedRect(10, 2, 235, 46, 12);

    const runTxt = this.add.text(127, 25, '🏃 KEEP RUNNING [➔]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const runZone = this.add.zone(127, 25, 235, 46).setInteractive({ useHandCursor: true });
    runZone.on('pointerdown', () => this.triggerKeepRunning(resident));

    banner.add([bg, title, stopBtnBg, stopTxt, stopZone, runBtnBg, runTxt, runZone]);

    // Entrance pop
    banner.setScale(0.9);
    this.tweens.add({
      targets: banner,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 180,
      ease: 'Back.easeOut'
    });

    this.encounterChoiceBanner = banner;
  }

  private hideEncounterChoiceBanner() {
    if (this.encounterChoiceBanner) {
      this.encounterChoiceBanner.destroy();
      this.encounterChoiceBanner = null;
    }
  }

  private triggerStopAndListen(resident: Resident) {
    if (this.isEncounterPaused) return;

    this.isEncounterPaused = true;
    this.hideEncounterChoiceBanner();
    resident.hideAlert();
    resident.hasEncountered = true;

    // Halt movement and enter Talking state
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.player.setPlayerState('TALKING');

    // Smoothly position resident facing representative (around x = 520)
    this.tweens.add({
      targets: resident,
      x: this.player.x + 150,
      duration: 250,
      ease: 'Power2.easeOut'
    });

    // Launch Dialogue Modal
    const dialogueModal = new DialogueModal(this, {
      complaint: resident.complaint,
      partyId: this.partyId,
      onChoiceSelected: (choice: ResponseType) => {
        dialogueModal.destroyModal();
        this.handleResponseChosen(resident, choice);
      }
    });
  }

  private triggerKeepRunning(resident: Resident) {
    this.hideEncounterChoiceBanner();
    resident.hasEncountered = true;
    this.handleResidentPassed(resident);
  }

  private handleResidentPassed(resident: Resident) {
    resident.hideAlert();
    if (this.activeResidentInEncounter === resident) {
      this.activeResidentInEncounter = null;
    }
    this.hideEncounterChoiceBanner();

    // Frustration penalty for ignoring
    resident.setReactionPose('negative');
    this.scoreManager.recordEncounter('ignored');
    this.scoreManager.modifyTrust(-3);
    this.hud.updateValues();

    // Floating ignored warning
    const warn = this.add.text(resident.x, resident.y - 100, 'Ignored! -3% Trust 🏃', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ff6b6b',
      fontStyle: 'bold',
      backgroundColor: '#0c1524',
      padding: { left: 6, right: 6, top: 2, bottom: 2 }
    }).setOrigin(0.5, 0.5).setDepth(150);

    this.tweens.add({
      targets: warn,
      y: warn.y - 35,
      alpha: 0,
      duration: 1000,
      onComplete: () => warn.destroy()
    });
  }

  private handleResponseChosen(resident: Resident, choice: ResponseType) {
    const outcome = this.dialogueSystem.evaluateResponse(
      resident.complaint,
      choice,
      resident.personality,
      this.partyId
    );

    // Switch resident sprite to their specific emotional reaction pose!
    resident.setReactionPose(outcome.outcome);

    // Apply scoring updates
    this.scoreManager.addVotes(outcome.voteGained);
    this.scoreManager.modifyTrust(outcome.trustChange);
    this.scoreManager.recordEncounter(choice, outcome.outcome);
    this.hud.updateValues();

    // Display Reaction Modal
    new ReactionModal(this, outcome, () => {
      this.resumeRunningAfterEncounter();
    });
  }

  private resumeRunningAfterEncounter() {
    this.isEncounterPaused = false;
    this.activeResidentInEncounter = null;
    this.player.setPlayerState('RUNNING_AGAIN');
    this.targetSpeed = RUN_SPEED_BASE;
  }

  private completeCurrentStreet() {
    this.scene.start('StreetCompleteScene', { partyId: this.partyId });
  }

  private finishGame() {
    this.scene.start('ResultsScene', { partyId: this.partyId });
  }
}
