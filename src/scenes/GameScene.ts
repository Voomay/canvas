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
import { SoundFX } from '../systems/SoundFX';
import { 
  PLAYER_X_RATIO, 
  GROUND_Y, 
  RUN_SPEED_BASE, 
  RUN_SPEED_SPRINT,
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

  // Curbside Minibus Taxi (Cape Town / Hanover Park)
  private curbsideTaxi: Phaser.GameObjects.Sprite | null = null;
  private nextTaxiSpawnDistance: number = 0;
  
  private currentSpeed: number = RUN_SPEED_BASE;
  private targetSpeed: number = RUN_SPEED_BASE;
  private isSprinting: boolean = false;
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
  private shiftKey?: Phaser.Input.Keyboard.Key;
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
    this.scoreManager.totalTimeRemaining = this.currentStreet.durationSeconds;
    this.scoreManager.votes = 0; // Each ward is a fresh 10-vote sprint!
  }

  private getGroundY(): number {
    const isPortrait = this.scale.height > this.scale.width;
    // Characters brought DOWN to the lower side of the dashed white line
    return isPortrait ? this.scale.height - 65 : GROUND_Y;
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
    this.curbsideTaxi = null;
    this.nextTaxiSpawnDistance = 2500;

    // 1. Create Parallax Background (Cape Town / Hanover Park vs Johannesburg)
    this.parallaxBg = new ParallaxBackground(this, this.currentStreet.locationKey);

    // 2. Setup Invisible Ground physics collider (solid platform across full width)
    const currentGroundY = this.getGroundY();
    const ground = this.add.rectangle(this.scale.width / 2, currentGroundY + 150, this.scale.width * 3, 300, 0x000000, 0);
    this.physics.add.existing(ground, true);

    // 3. Create Player Character (starts standing in IDLE pose)
    const isPortrait = this.scale.height > this.scale.width;
    const playerX = isPortrait ? 130 : Math.min(380, this.scale.width * PLAYER_X_RATIO);
    this.player = new Player(this, playerX, currentGroundY, this.partyId);
    this.player.setPlayerState('IDLE');
    this.physics.add.collider(this.player, ground);

    // 4. Create HUD Overlay
    this.hud = new HUD(this);

    // 5. Setup Spawners
    this.nextResidentTime = Phaser.Math.Between(this.currentStreet.residentSpawnRateMin, this.currentStreet.residentSpawnRateMax);

    // Setup Curbside Minibus Taxi (standing in the road by the curbside in Hanover Park)
    if (this.currentStreet.locationKey === 'capetown') {
      const initialTaxiX = Math.max(680, this.scale.width * 0.65);
      this.spawnCurbsideTaxi(initialTaxiX);
    }

    // Listen for resize
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.parallaxBg.resize(gameSize.width, gameSize.height);
      const newGroundY = this.getGroundY();
      if (ground && ground.body) {
        ground.x = gameSize.width / 2;
        ground.y = newGroundY + 150;
        ground.width = gameSize.width * 3;
      }
      if (this.curbsideTaxi && this.curbsideTaxi.active) {
        this.curbsideTaxi.y = this.getCurbsideY();
      }
    });

    // 6. Setup Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
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

    // Mobile / Touch Sprint Controls
    this.events.on('sprint-start', () => {
      if (!this.hasStartedRunning) {
        this.startCanvassing();
        return;
      }
      this.isSprinting = true;
    });

    this.events.on('sprint-end', () => {
      this.isSprinting = false;
    });

    // Touch / Mobile Tap Controls
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // If hasn't started running yet, tap anywhere starts running!
      if (!this.hasStartedRunning) {
        this.startCanvassing();
        return;
      }

      // If running and tapping middle screen, trigger brief speed boost
      if (!this.isEncounterPaused && pointer.y > 180 && pointer.y < 600) {
        this.isSprinting = true;
      }
    });

    this.input.on('pointerup', () => {
      this.isSprinting = false;
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

    // Check keyboard sprint (Shift, Right arrow, or Space)
    const isKeySprinting = Boolean(
      (this.shiftKey && this.shiftKey.isDown) ||
      (this.cursors?.right && this.cursors.right.isDown) ||
      (this.spaceKey && this.spaceKey.isDown)
    );

    // Apply Sprint Speed vs Base Running Speed
    if (this.isSprinting || isKeySprinting) {
      this.targetSpeed = RUN_SPEED_SPRINT;
    } else {
      this.targetSpeed = RUN_SPEED_BASE;
    }

    // Handle Speed Transition
    this.currentSpeed = Phaser.Math.Linear(this.currentSpeed, this.targetSpeed, 0.12);

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

    // Update Curbside Taxi Movement & Periodic Spawns
    this.updateCurbsideTaxi(deltaSeconds);

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

  private getCurbsideY(): number {
    const isPortrait = this.scale.height > this.scale.width;
    const roadY = isPortrait ? this.scale.height - 275 : 428;
    // Wheels grounded on road surface in the upper lane right below curb (before white line)
    return roadY + (isPortrait ? 115 : 110);
  }

  private spawnCurbsideTaxi(initialX?: number) {
    if (this.currentStreet.locationKey !== 'capetown' || !this.textures.exists('vehicle_taxi_minibus')) {
      return;
    }

    const spawnX = initialX !== undefined ? initialX : this.scale.width + 450;
    const curbsideY = this.getCurbsideY();

    this.curbsideTaxi = this.add.sprite(spawnX, curbsideY, 'vehicle_taxi_minibus');
    this.curbsideTaxi.setOrigin(0.5, 1);
    this.curbsideTaxi.setDepth(4); // Behind residents (6) & player (7), above road (3)
    this.curbsideTaxi.play('taxi_minibus_anim');

    // Make interactive: click/tap plays authentic taxi horn ("pip-pip!")
    this.curbsideTaxi.setInteractive({ useHandCursor: true });
    this.curbsideTaxi.on('pointerdown', () => {
      SoundFX.getInstance().playTaxiHorn();
      if (this.curbsideTaxi) {
        this.tweens.add({
          targets: this.curbsideTaxi,
          scaleY: 1.05,
          scaleX: 0.98,
          duration: 90,
          yoyo: true,
          ease: 'Quad.easeInOut'
        });
      }
    });
  }

  private updateCurbsideTaxi(deltaSeconds: number) {
    if (this.curbsideTaxi && this.curbsideTaxi.active) {
      this.curbsideTaxi.x -= this.currentSpeed * deltaSeconds;
      if (this.curbsideTaxi.x < -400) {
        this.curbsideTaxi.destroy();
        this.curbsideTaxi = null;
      }
    } else if (this.currentStreet.locationKey === 'capetown' && this.streetDistanceCovered >= this.nextTaxiSpawnDistance) {
      this.spawnCurbsideTaxi();
      this.nextTaxiSpawnDistance += Phaser.Math.Between(2600, 3600);
    }
  }

  private spawnObstacle() {
    const pool = this.currentStreet.obstaclePool;
    const type = pool[Phaser.Math.Between(0, pool.length - 1)] as ObstacleType;
    const spawnX = this.scale.width + 80;
    const spawnY = this.getGroundY();

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
    const spawnY = this.getGroundY(); // Same ground level as runner on sidewalk

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
    const { width, height } = this.scale;
    const isPortrait = height > width;
    const bannerY = isPortrait ? height / 2 - 40 : 260;
    const banner = this.add.container(width / 2, bannerY);
    banner.setDepth(150);

    const w = Math.min(width - 32, 490);
    const h = 175;

    const bg = this.add.graphics();
    bg.fillStyle(0x0c1524, 0.96);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    bg.lineStyle(3, 0xfcb813, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);

    const title = this.add.text(0, -42, '⚡ 30-SECOND WARD SPRINT!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '21px' : '25px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const subtitle = this.add.text(0, -10, 'Secure at least 10 votes in 30s to win this Ward!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '13px' : '15px',
      color: '#e2e8f0',
      fontStyle: '600'
    }).setOrigin(0.5, 0.5);

    // Green action button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x1f9137, 1);
    btnBg.fillRoundedRect(-140, 18, 280, 46, 12);
    btnBg.lineStyle(2, 0xffffff, 0.9);
    btnBg.strokeRoundedRect(-140, 18, 280, 46, 12);

    const btnTxt = this.add.text(0, 41, '🏃 START SPRINT ➔', {
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

    const { width, height } = this.scale;
    const isPortrait = height > width;
    const bannerY = isPortrait ? 136 : 140;
    const banner = this.add.container(width / 2, bannerY);
    banner.setDepth(140);

    const bannerW = isPortrait ? Math.min(width - 20, 424) : 540;
    const bannerH = isPortrait ? 96 : 108;
    const bg = this.add.graphics();
    bg.fillStyle(0x0c1524, 0.96);
    bg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 16);
    bg.lineStyle(2.5, 0xfcb813, 1);
    bg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 16);

    const title = this.add.text(0, -bannerH / 2 + 20, '👤 RESIDENT WANTS TO TALK!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '14px' : '17px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const btnW = isPortrait ? (bannerW - 30) / 2 : 235;
    const btnH = isPortrait ? 42 : 46;
    const btnY = isPortrait ? 14 : 25;
    const colOffset = isPortrait ? btnW / 2 + 5 : 127;

    // Stop & Talk Button (Large & touch-friendly green)
    const stopBtnBg = this.add.graphics();
    stopBtnBg.fillStyle(0x1f9137, 1);
    stopBtnBg.fillRoundedRect(-colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
    stopBtnBg.lineStyle(2, 0xffffff, 0.9);
    stopBtnBg.strokeRoundedRect(-colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

    const stopTxt = this.add.text(-colOffset, btnY, '✋ STOP & TALK [E]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '12px' : '15px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const stopZone = this.add.zone(-colOffset, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
    stopZone.on('pointerdown', () => this.triggerStopAndListen(resident));

    // Keep Running Button (Large & touch-friendly orange)
    const runBtnBg = this.add.graphics();
    runBtnBg.fillStyle(0xdb580a, 1);
    runBtnBg.fillRoundedRect(colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
    runBtnBg.lineStyle(2, 0x111111, 0.8);
    runBtnBg.strokeRoundedRect(colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

    const runTxt = this.add.text(colOffset, btnY, '🏃 KEEP RUNNING [➔]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '12px' : '15px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const runZone = this.add.zone(colOffset, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
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
    this.hud.setResidentAlertVisible(true);
  }

  private hideEncounterChoiceBanner() {
    if (this.encounterChoiceBanner) {
      this.encounterChoiceBanner.destroy();
      this.encounterChoiceBanner = null;
    }
    this.hud.setResidentAlertVisible(false);
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

    // Smoothly position resident facing representative
    const isPortrait = this.scale.height > this.scale.width;
    const residentTargetX = isPortrait ? this.player.x + 130 : this.player.x + 150;
    this.tweens.add({
      targets: resident,
      x: residentTargetX,
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

    // Generous spacing after an encounter so player has real distance to run!
    this.nextResidentTime = Phaser.Math.Between(3400, 5600);

    // Push back any upcoming resident that was queued too close during the pause
    const minDistanceAhead = this.player.x + (this.scale.height > this.scale.width ? 520 : 650);
    this.residents.forEach(res => {
      if (!res.hasEncountered && res.x < minDistanceAhead) {
        res.x = minDistanceAhead + Phaser.Math.Between(150, 400);
      }
    });
  }

  private completeCurrentStreet() {
    this.scene.start('StreetCompleteScene', { partyId: this.partyId });
  }

  private finishGame() {
    this.scene.start('ResultsScene', { partyId: this.partyId });
  }
}
