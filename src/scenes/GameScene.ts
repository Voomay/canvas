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
import { PauseModal } from './PauseModal';
import { STREETS, StreetLevel } from '../data/streets';
import { PARTIES } from '../data/parties';
import { ResponseType } from '../data/complaints';
import { SoundFX } from '../systems/SoundFX';
import { 
  PLAYER_X_RATIO, 
  RUN_SPEED_BASE, 
  RUN_SPEED_SPRINT,
  RUN_SPEED_SLOW,
  getDynamicGroundY,
  getCurbsideTaxiY
} from '../config/constants';

export class GameScene extends Phaser.Scene {
  private partyId: 'da' | 'anc' | 'pa' = 'da';
  private player!: Player;
  private parallaxBg!: ParallaxBackground;
  private hud!: HUD;
  private dialogueSystem!: DialogueSystem;
  private scoreManager!: ScoreManager;
  private currentStreet!: StreetLevel;

  private enableObstacles: boolean = true; // Stumbling blocks enabled with jump & trust mechanics
  private obstacles: Obstacle[] = [];
  private residents: Resident[] = [];

  // Curbside Minibus Taxi (Cape Town / Hanover Park)
  private curbsideTaxi: Phaser.GameObjects.Sprite | null = null;
  private nextCurbsideVehicleTimer: number = 0;
  
  private currentSpeed: number = RUN_SPEED_BASE;
  private targetSpeed: number = RUN_SPEED_BASE;
  private isSprinting: boolean = false;
  private streetDistanceCovered: number = 0;
  private streetTimer: number = 0;

  private nextObstacleTime: number = 0;
  private nextResidentTime: number = 0;

  private activeResidentInEncounter: Resident | null = null;
  private encounterChoiceBanner: Phaser.GameObjects.Container | null = null;
  private residentAdvanceBeacon: Phaser.GameObjects.Container | null = null;
  private advanceBeaconDistanceText: Phaser.GameObjects.Text | null = null;
  private isEncounterPaused: boolean = false;
  private isGamePaused: boolean = false;
  private pauseModal: PauseModal | null = null;

  // Pacing & Urgency State
  private hasShownLowTimeWarning: boolean = false;
  private residentsSpawnedInWard: number = 0;

  // Mobile interaction state machine
  private mobileInteractionState: 'RUNNING' | 'RESIDENT_DETECTED' | 'ACTION_CHOICE' | 'APPROACHING_RESIDENT' | 'TALKING' | 'CHOOSING_RESPONSE' | 'SHOWING_RESULT' = 'RUNNING';
  private encounterChoiceBannerAnimating: boolean = false;
  private hasStartedRunning: boolean = true;
  private obstacleTutorialContainer: Phaser.GameObjects.Container | null = null;
  private residentTutorialContainer: Phaser.GameObjects.Container | null = null;
  private ghostGuideArcContainer: Phaser.GameObjects.Container | null = null;

  // Desktop Controls
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private keyW?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;
  private shiftKey?: Phaser.Input.Keyboard.Key;
  private keyE?: Phaser.Input.Keyboard.Key;
  private keyR?: Phaser.Input.Keyboard.Key;
  private keyP?: Phaser.Input.Keyboard.Key;
  private escKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('GameScene');
  }

  public init(data: { partyId: 'da' | 'anc' | 'pa' }) {
    this.partyId = data.partyId || 'da';
    this.scoreManager = ScoreManager.getInstance();
    this.currentStreet = STREETS[this.scoreManager.currentStreetIndex - 1] || STREETS[0];
    this.scoreManager.totalTimeRemaining = this.currentStreet.durationSeconds;
    this.scoreManager.startNewArea(this.scoreManager.currentStreetIndex);
  }

  private getGroundY(): number {
    return getDynamicGroundY(this.scale.height, this.scale.width);
  }

  public create() {
    this.dialogueSystem = new DialogueSystem();
    this.hasStartedRunning = true;
    this.currentSpeed = RUN_SPEED_BASE;
    this.targetSpeed = RUN_SPEED_BASE;
    this.streetDistanceCovered = 0;
    this.streetTimer = this.currentStreet.durationSeconds;
    this.isEncounterPaused = false;
    this.isGamePaused = false;
    this.pauseModal = null;
    this.activeResidentInEncounter = null;
    this.residentAdvanceBeacon = null;
    this.advanceBeaconDistanceText = null;
    this.obstacleTutorialContainer = null;
    this.residentTutorialContainer = null;
    this.ghostGuideArcContainer = null;
    this.obstacles = [];
    this.residents = [];
    this.curbsideTaxi = null;
    this.nextCurbsideVehicleTimer = 0;
    this.hasShownLowTimeWarning = false;
    this.residentsSpawnedInWard = 0;
    this.nextObstacleTime = 5500; // Open clear running road before first pothole
    this.nextResidentTime = 1600; // Early first voter encounter to get the campaign rolling quickly!

    // 1. Create Parallax Background (Cape Town / Hanover Park vs Johannesburg)
    this.parallaxBg = new ParallaxBackground(this, this.currentStreet.locationKey);

    // 2. Setup Invisible Ground physics collider (solid platform across full width)
    const currentGroundY = this.getGroundY();
    const ground = this.add.rectangle(this.scale.width / 2, currentGroundY + 150, this.scale.width * 3, 300, 0x000000, 0);
    this.physics.add.existing(ground, true);

    // 3. Create Player Character (starts running down the street immediately!)
    const isPortrait = this.scale.height > this.scale.width;
    const playerX = isPortrait ? 95 : Math.min(380, this.scale.width * PLAYER_X_RATIO);
    this.player = new Player(this, playerX, currentGroundY, this.partyId);
    this.player.setPlayerState('RUNNING');
    this.physics.add.collider(this.player, ground);

    // 4. Create HUD Overlay
    this.hud = new HUD(this);

    // Setup Curbside Minibus Taxi / Luxury Sports Cars (Hanover Park, Mitchells Plain, Khayelitsha & Camps Bay)
    const loc = this.currentStreet.locationKey;
    if (loc === 'capetown' || loc === 'hanover_park' || loc === 'campsbay' || loc === 'mitchells_plain' || loc === 'khayelitsha') {
      const initialTaxiX = isPortrait ? this.scale.width * 0.70 : this.scale.width * 0.75;
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
        const isPort = gameSize.height > gameSize.width;
        this.curbsideTaxi.y = this.getCurbsideY();
        this.curbsideTaxi.setScale(isPort ? 0.84 : 1.05);
      }
    });

    // 6. Setup Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
      this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
      this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      this.keyP.on('down', () => this.togglePause());
      this.escKey.on('down', () => this.togglePause());
    }

    // Listen for Pause & Exit Menu events from HUD
    this.events.on('pause-game', () => this.pauseGame());
    this.events.on('exit-to-menu', () => {
      SoundFX.getInstance().stopBGM(true);
      this.scene.start('MainMenuScene');
    });

    this.events.on('shutdown', () => {
      SoundFX.getInstance().stopBGM(true);
    });

    // Mobile / Touch Controls (Tap to Jump, Hold to Sprint)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver?: Phaser.GameObjects.GameObject[]) => {
      if (this.isGamePaused || this.isEncounterPaused) return;
      // Do not trigger jump/sprint if tapping on an interactive element (button, zone, HUD, modal, etc.)
      if (currentlyOver && currentlyOver.length > 0) return;
      // Do not trigger jump/sprint if in an encounter choice or dialogue interaction
      if (this.mobileInteractionState !== 'RUNNING') return;
      if (this.encounterChoiceBanner || this.encounterChoiceBannerAnimating) return;
      // If tapping in bottom action banner region during pending encounter, ignore
      if (this.activeResidentInEncounter && pointer.y > this.scale.height - 200) return;

      this.player.jump();
      this.isSprinting = true;
    });

    this.input.on('pointerup', () => {
      this.isSprinting = false;
    });

    this.input.on('gameout', () => {
      this.isSprinting = false;
    });

    // Start BGM and show quick non-blocking area start toast
    SoundFX.getInstance().playBGM();
    this.showAreaStartNotification();
  }

  public update(time: number, delta: number) {
    if (this.isGamePaused || this.isEncounterPaused) return;

    // Check Jump Input (Space, Up Arrow, or W key)
    if (
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) ||
      (this.cursors?.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      (this.keyW && Phaser.Input.Keyboard.JustDown(this.keyW))
    ) {
      if (this.mobileInteractionState === 'RUNNING' && !this.encounterChoiceBanner && !this.encounterChoiceBannerAnimating) {
        this.player.jump();
      }
    }

    // Check keyboard sprint (Shift or Right arrow)
    const isKeySprinting = Boolean(
      (this.shiftKey && this.shiftKey.isDown) ||
      (this.cursors?.right && this.cursors.right.isDown)
    );

    // Apply Sprint Speed vs Base Running Speed
    const sprintingNow = Boolean(this.isSprinting || isKeySprinting);
    this.player.isSprinting = sprintingNow;
    if (sprintingNow) {
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

    // Update Distance & Timers (20-second sprint per Area)
    const deltaSeconds = delta / 1000;
    this.streetDistanceCovered += this.currentSpeed * deltaSeconds;
    this.streetTimer -= deltaSeconds;
    this.scoreManager.totalTimeRemaining = Math.max(0, this.streetTimer);

    this.hud.updateValues();

    // 7-Second Low-Time Urgency Warning Alert
    if (this.streetTimer <= 7 && this.streetTimer > 0 && !this.hasShownLowTimeWarning) {
      this.hasShownLowTimeWarning = true;
      this.hud.showLowTimeUrgencyWarning();
    }

    // Check Street Completion
    if (this.streetDistanceCovered >= this.currentStreet.targetDistance || this.streetTimer <= 0) {
      this.completeCurrentStreet();
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
    // 1. Obstacle Spawning - Active across all areas and cities (Cape Town & Joburg)
    const canSpawnObstacles = this.enableObstacles && 
                              !this.isEncounterPaused && 
                              !this.activeResidentInEncounter && 
                              this.hasStartedRunning;

    if (canSpawnObstacles) {
      this.nextObstacleTime -= delta;
      if (this.nextObstacleTime <= 0) {
        const spawnX = this.scale.width + 120;
        
        // Prevent obstacle from spawning directly on top of or near a resident or another obstacle
        // Generous spacing: at least 450px clearance from residents, and 850px clearance from any active obstacle
        const residentNearby = this.residents.some(r => r.active && Math.abs(r.x - spawnX) < 450);
        const obstacleNearby = this.obstacles.some(o => o.active && Math.abs(o.x - spawnX) < 850);

        if (!residentNearby && !obstacleNearby) {
          this.spawnObstacle();
          const minRate = this.currentStreet.obstacleSpawnRateMin || 7000;
          const maxRate = this.currentStreet.obstacleSpawnRateMax || 10000;
          this.nextObstacleTime = Phaser.Math.Between(minRate, maxRate);
        } else {
          // If ground is not clear, wait before retrying so obstacles never cluster
          this.nextObstacleTime = Phaser.Math.Between(3000, 4500);
        }
      }
    }

    // 2. Resident Spawning
    this.nextResidentTime -= delta;
    if (this.nextResidentTime <= 0 && !this.activeResidentInEncounter) {
      const isPortrait = this.scale.height > this.scale.width;
      const spawnX = this.scale.width + (isPortrait ? 380 : 440);
      const residentNearby = this.residents.some(r => r.active && Math.abs(r.x - spawnX) < 520);

      if (!residentNearby) {
        this.spawnResident();
        this.residentsSpawnedInWard++;

        // Pacing variety: 1 or 2 early near voters, then extended running corridors!
        if (this.residentsSpawnedInWard === 1) {
          // Second resident arrives relatively soon
          this.nextResidentTime = Phaser.Math.Between(2600, 3400);
        } else {
          // Extended running stretches between voters
          this.nextResidentTime = Phaser.Math.Between(5500, 7500);
        }
      } else {
        this.nextResidentTime = Phaser.Math.Between(2200, 3200);
      }
    }
  }

  private getCurbsideY(): number {
    return getCurbsideTaxiY(this.scale.height, this.scale.width);
  }

  private spawnCurbsideTaxi(initialX?: number) {
    const loc = this.currentStreet.locationKey;
    const isCampsBay = loc === 'campsbay';
    const hasCurbsideVehicles = loc === 'capetown' || loc === 'hanover_park' || loc === 'campsbay' || loc === 'mitchells_plain' || loc === 'khayelitsha';

    if (!hasCurbsideVehicles) {
      return;
    }

    const isPortrait = this.scale.height > this.scale.width;
    const defaultX = isPortrait ? this.scale.width * 0.45 : this.scale.width * 0.50;
    const spawnX = initialX !== undefined ? initialX : defaultX;
    const curbsideY = this.getCurbsideY();

    // Clear any obstacles around the vehicle's spawn point with generous clearance (550px buffer)
    this.clearObstaclesBetween(spawnX - 550, spawnX + 550);

    if (isCampsBay) {
      // Luxury sports cars along Camps Bay beach road (Yellow Lambo, Red Ferrari, Blue SUV)
      const luxuryCars = ['vehicle_car_lambo', 'vehicle_car_ferrari', 'vehicle_car_suv'];
      const chosenCar = Phaser.Utils.Array.GetRandom(luxuryCars);
      if (!this.textures.exists(chosenCar)) return;

      const car = this.add.sprite(spawnX, curbsideY, chosenCar);
      car.setOrigin(0.5, 1);
      car.setDepth(4); // Behind residents (6) & player (7), above road (3)
      if (chosenCar === 'vehicle_car_suv') {
        car.setScale(isPortrait ? 0.68 : 0.82);
      } else {
        car.setScale(isPortrait ? 0.70 : 0.85);
      }

      // Make interactive: click/tap plays authentic supercar rev sound & bounce
      car.setInteractive({ useHandCursor: true });
      car.on('pointerdown', () => {
        SoundFX.getInstance().playSportsCarRev();
        this.tweens.add({
          targets: car,
          scaleY: car.scaleY * 1.08,
          scaleX: car.scaleX * 0.96,
          duration: 90,
          yoyo: true,
          ease: 'Quad.easeInOut'
        });
      });

      this.curbsideTaxi = car;
    } else if (this.textures.exists('vehicle_taxi_minibus')) {
      this.curbsideTaxi = this.add.sprite(spawnX, curbsideY, 'vehicle_taxi_minibus');
      this.curbsideTaxi.setOrigin(0.5, 1);
      this.curbsideTaxi.setDepth(4); // Behind residents (6) & player (7), above road (3)
      this.curbsideTaxi.setScale(isPortrait ? 0.84 : 1.05);
      this.curbsideTaxi.play('taxi_minibus_anim');

      // Make interactive: click/tap plays authentic taxi horn ("pip-pip!")
      this.curbsideTaxi.setInteractive({ useHandCursor: true });
      this.curbsideTaxi.on('pointerdown', () => {
        SoundFX.getInstance().playTaxiHorn();
        if (this.curbsideTaxi) {
          this.tweens.add({
            targets: this.curbsideTaxi,
            scaleY: (isPortrait ? 0.92 : 1.15) * 1.05,
            scaleX: (isPortrait ? 0.92 : 1.15) * 0.98,
            duration: 90,
            yoyo: true,
            ease: 'Quad.easeInOut'
          });
        }
      });
    }
  }

  private updateCurbsideTaxi(deltaSeconds: number) {
    if (this.curbsideTaxi && this.curbsideTaxi.active) {
      this.curbsideTaxi.x -= this.currentSpeed * deltaSeconds;

      if (this.curbsideTaxi.x < -300) {
        this.curbsideTaxi.destroy();
        this.curbsideTaxi = null;
        this.nextCurbsideVehicleTimer = Phaser.Math.Between(10000, 18000);
      }
    } else if (this.hasStartedRunning && !this.isEncounterPaused && !this.activeResidentInEncounter) {
      const loc = this.currentStreet.locationKey;
      const hasCurbsideVehicles = loc === 'capetown' || loc === 'hanover_park' || loc === 'campsbay' || loc === 'mitchells_plain' || loc === 'khayelitsha';
      if (hasCurbsideVehicles) {
        this.nextCurbsideVehicleTimer -= deltaSeconds * 1000;
        if (this.nextCurbsideVehicleTimer <= 0) {
          const spawnX = this.scale.width + Phaser.Math.Between(300, 550);
          this.spawnCurbsideTaxi(spawnX);
        }
      }
    }
  }

  private spawnObstacle() {
    const pool = this.currentStreet.obstaclePool.filter(t => (t as string) !== 'brokenDrain');
    if (pool.length === 0) return;
    const type = pool[Phaser.Math.Between(0, pool.length - 1)] as ObstacleType;
    const spawnX = this.scale.width + 100;
    const spawnY = this.getGroundY();

    const obstacle = new Obstacle(this, spawnX, spawnY, type);
    this.obstacles.push(obstacle);
  }

  private spawnResident() {
    const isPortrait = this.scale.height > this.scale.width;
    const spawnX = this.scale.width + (isPortrait ? 380 : 440);
    const spawnY = this.getGroundY();

    const resident = new Resident(this, spawnX, spawnY, this.currentStreet.allowedComplaintCategories, this.partyId, this.currentStreet.locationKey);
    resident.setDepth(6);
    this.residents.push(resident);
    this.clearObstaclesBetween(spawnX - 350, spawnX + 350);
  }

  private clearObstaclesBetween(minX: number, maxX: number) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.x >= minX && obs.x <= maxX) {
        obs.destroy();
        this.obstacles.splice(i, 1);
      }
    }
  }

  private updateObstacles(delta: number) {
    const playerX = this.player.x;
    const groundY = this.getGroundY();
    const isPortrait = this.scale.height > this.scale.width;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (!obs.active) {
        this.obstacles.splice(i, 1);
        continue;
      }
      obs.updateMovement(this.currentSpeed, delta);

      // Check jumping over vs stumbling
      if (!obs.isResolved && obs.active) {
        // First-time obstacle tutorial halt with jump trajectory ghost guide arc
        if (!this.scoreManager.hasSeenObstacleTutorial && !this.isGamePaused && !this.isEncounterPaused && this.hasStartedRunning) {
          const distToObs = obs.x - playerX;
          if (distToObs > 150 && distToObs < (isPortrait ? 260 : 340)) {
            this.triggerFirstObstacleTutorial(obs);
            return;
          }
        }

        const dx = obs.x - playerX;
        
        // When obstacle enters player's interaction window (-25 to +45)
        if (dx >= -25 && dx <= 45) {
          const isAirborne = (this.player.playerState === 'JUMPING' && this.player.y < groundY - 20) || (this.player.y < groundY - 32);
          
          if (isAirborne) {
            // Player successfully jumped over it -> FIXED! (+5s bonus)
            obs.resolveCleared();
            this.scoreManager.recordObstacleCleared();
            this.hud.updateValues();
            this.player.updateMentalHealthVisuals(this.scoreManager.mentalHealth);
            SoundFX.getInstance().playObstacleFixed();
            this.addTimeBonus(5, '✨ FIXED! +5s ⏱️');
            // Ensure generous spacing before the next obstacle spawns
            this.nextObstacleTime = Math.max(this.nextObstacleTime, 6000);
          } else if (this.player.y >= groundY - 20 && this.player.playerState !== 'JUMPING') {
            // Player on ground collided with it -> IGNORED & STUMBLED! (-2s penalty)
            obs.resolveStumbled();
            const wasHit = this.player.onHitObstacle();
            if (wasHit) {
              this.scoreManager.recordObstacleHit();
              this.hud.updateValues();
              this.player.updateMentalHealthVisuals(this.scoreManager.mentalHealth);
              this.hud.triggerMentalHealthFlash(-4, '⚠️ -4% Morale: Tripped on hazard!');
              this.addTimeBonus(-2, '⚠️ HIT! -2s ⏱️');
              // Ensure player has recovery space before another obstacle spawns
              this.nextObstacleTime = Math.max(this.nextObstacleTime, 5000);

              if (this.scoreManager.mentalHealth <= 0) {
                this.triggerBurnoutRecovery();
              }

              // Temporarily slow running speed
              this.targetSpeed = RUN_SPEED_SLOW;
              this.time.delayedCall(800, () => {
                if (this.currentSpeed > 0) {
                  this.targetSpeed = RUN_SPEED_BASE;
                }
              });
            }
          }
        }
      }
    }
  }

  private updateResidents(delta: number) {
    const playerX = this.player.x;
    const isPortrait = this.scale.height > this.scale.width;
    const screenRightEdgeDist = this.scale.width - playerX;
    const beaconMaxDist = screenRightEdgeDist + (isPortrait ? 550 : 700);
    const advanceChoiceDist = isPortrait ? 480 : 420;

    for (let i = this.residents.length - 1; i >= 0; i--) {
      const resident = this.residents[i];
      if (!resident.active) {
        this.residents.splice(i, 1);
        continue;
      }

      resident.updateMovement(this.currentSpeed, delta);
      const distance = resident.x - playerX;

      // 1. First-time resident tutorial halt (desktop only; mobile portrait directly presents the clean TALK / RUN action bar)
      if (!isPortrait && !this.scoreManager.hasSeenResidentTutorial && !this.isGamePaused && !this.isEncounterPaused && this.hasStartedRunning && !resident.hasEncountered) {
        if (distance > 180 && distance < 440) {
          this.triggerFirstResidentTutorial(resident);
          return;
        }
      }

      // 2. Advance warning when resident is approaching down the street
      if (!resident.hasEncountered && distance > advanceChoiceDist && distance < beaconMaxDist && !this.activeResidentInEncounter) {
        this.showResidentAdvanceBeacon(resident, distance);
      }

      // 3. Early Interaction Choice Banner: appears well before reaching resident!
      if (!resident.hasEncountered && distance <= advanceChoiceDist && distance > -30 && !this.activeResidentInEncounter) {
        this.hideResidentAdvanceBeacon();
        resident.isApproaching = true;
        this.activeResidentInEncounter = resident;
        resident.triggerAlertSound();
        this.showEncounterChoiceBanner(resident);
        // Controlled approach glide giving the player ample time (2-3s) to decide
        this.targetSpeed = Math.min(this.targetSpeed, isPortrait ? 260 : 120);
      }

      // 4. Passed without stopping -> Ignored!
      if (!resident.hasEncountered && distance < -30) {
        this.hideResidentAdvanceBeacon();
        this.hideEncounterChoiceBanner();
        resident.hasEncountered = true;
        this.handleResidentPassed(resident);
      }
    }

    // If no resident is in advance range and no encounter is active, hide beacon
    const hasUpcoming = this.residents.some(r => !r.hasEncountered && (r.x - playerX) > advanceChoiceDist && (r.x - playerX) < beaconMaxDist);
    if (!hasUpcoming && this.residentAdvanceBeacon && !this.activeResidentInEncounter) {
      this.hideResidentAdvanceBeacon();
    }
  }

  private showAreaStartNotification() {
    const { width, height } = this.scale;
    const isPortrait = height > width;
    const toastY = isPortrait ? 180 : 120;
    const banner = this.add.container(width / 2, toastY);
    banner.setDepth(150);

    const w = Math.min(width - 40, 420);
    const h = 58;

    const bg = this.add.graphics();
    bg.fillStyle(0x0c1524, 0.92);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(2, 0xfcb813, 0.9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const targetVotes = this.currentStreet.targetVotes || 10;
    const title = this.add.text(0, -10, `🏃 ${this.currentStreet.name.toUpperCase()}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '15px' : '17px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const sub = this.add.text(0, 12, `Target: Win ${targetVotes} Votes • Tap / Space to Jump!`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '12px',
      color: '#e2e8f0',
      fontStyle: '600'
    }).setOrigin(0.5, 0.5);

    banner.add([bg, title, sub]);

    banner.setScale(0.85);
    banner.setAlpha(0);
    this.tweens.add({
      targets: banner,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1600, () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            y: toastY - 20,
            duration: 250,
            ease: 'Power2.easeIn',
            onComplete: () => banner.destroy()
          });
        });
      }
    });
  }

  private showEncounterChoiceBanner(resident: Resident) {
    if (this.encounterChoiceBanner) {
      this.encounterChoiceBanner.destroy();
    }
    if (this.encounterChoiceBannerAnimating) return;
    // Prevent opening action choice panel if another interaction is already active
    if (this.mobileInteractionState !== 'RUNNING' && this.mobileInteractionState !== 'RESIDENT_DETECTED' && this.mobileInteractionState !== 'ACTION_CHOICE') return;

    const { width, height } = this.scale;
    const isPortrait = height > width;
    this.mobileInteractionState = 'ACTION_CHOICE';

    if (isPortrait) {
      // ═══════ MOBILE: Slide-up Action Bar at bottom (Talk or Run - Matches Image 1) ═══════
      const bannerW = Math.min(width - 20, 480);
      const bannerH = 180;
      const bannerFinalY = height - bannerH / 2 - 14;
      const bannerStartY = height + bannerH;

      const banner = this.add.container(width / 2, bannerStartY);
      banner.setDepth(140);

      // Panel background with rounded corners & shadow
      const bg = this.add.graphics();
      // Drop shadow
      bg.fillStyle(0x000000, 0.45);
      bg.fillRoundedRect(-bannerW / 2 + 3, -bannerH / 2 + 5, bannerW, bannerH, 20);
      // Dark navy container body
      bg.fillStyle(0x0c1524, 0.98);
      bg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 20);
      bg.lineStyle(1.5, 0x1e293b, 1);
      bg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 20);

      // Person icon on left
      const personIcon = this.add.text(-bannerW / 2 + 22, -bannerH / 2 + 32, '👤', {
        fontSize: '28px',
        color: '#22c55e'
      }).setOrigin(0, 0.5);

      // Title & subtitle next to person icon (Bolder & Bigger)
      const title = this.add.text(-bannerW / 2 + 60, -bannerH / 2 + 24, 'Resident wants to talk!', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '19px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0, 0.5);

      const subtitle = this.add.text(-bannerW / 2 + 60, -bannerH / 2 + 45, 'Stop and chat or keep running.', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13.5px',
        color: '#94a3b8',
        fontStyle: '600'
      }).setOrigin(0, 0.5);

      // Two large side-by-side buttons with generous padding
      const btnGap = 12;
      const btnW = (bannerW - 32 - btnGap) / 2;
      const btnH = 76;
      const btnY = bannerH / 2 - btnH / 2 - 16;
      const leftX = -(btnW + btnGap) / 2;
      const rightX = (btnW + btnGap) / 2;

      // 💬 TALK Button (Bolder, Bigger, Vibrant Green)
      const talkContainer = this.add.container(leftX, btnY);
      const talkBg = this.add.graphics();
      talkBg.fillStyle(0x16a34a, 1);
      talkBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 16);
      talkBg.lineStyle(2, 0x22c55e, 0.95);
      talkBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 16);

      const talkEmoji = this.add.text(0, -14, '💬', {
        fontSize: '26px'
      }).setOrigin(0.5, 0.5);

      const talkLabel = this.add.text(0, 16, 'TALK', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '21px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      talkContainer.add([talkBg, talkEmoji, talkLabel]);

      const talkZone = this.add.zone(leftX, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      talkZone.on('pointerdown', () => {
        this.isSprinting = false;
        this.tweens.add({
          targets: talkContainer,
          scaleX: 0.95,
          scaleY: 0.95,
          duration: 60,
          yoyo: true
        });
        this.triggerStopAndListen(resident);
      });

      // 🏃 RUN Button (Bolder, Bigger, Vibrant Orange)
      const runContainer = this.add.container(rightX, btnY);
      const runBg = this.add.graphics();
      runBg.fillStyle(0xea580c, 1);
      runBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 16);
      runBg.lineStyle(2, 0xf97316, 0.95);
      runBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 16);

      const runEmoji = this.add.text(0, -14, '🏃', {
        fontSize: '26px'
      }).setOrigin(0.5, 0.5);

      const runLabel = this.add.text(0, 16, 'RUN', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '21px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      runContainer.add([runBg, runEmoji, runLabel]);

      const runZone = this.add.zone(rightX, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      runZone.on('pointerdown', () => {
        this.isSprinting = false;
        this.tweens.add({
          targets: runContainer,
          scaleX: 0.95,
          scaleY: 0.95,
          duration: 60,
          yoyo: true
        });
        this.triggerKeepRunning(resident);
      });

      banner.add([bg, personIcon, title, subtitle, talkContainer, talkZone, runContainer, runZone]);

      // Slide-up entrance animation from bottom
      this.encounterChoiceBannerAnimating = true;
      this.tweens.add({
        targets: banner,
        y: bannerFinalY,
        duration: 250,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.encounterChoiceBannerAnimating = false;
        }
      });

      this.encounterChoiceBanner = banner;
    } else {
      // ═══════ DESKTOP: Existing top-center banner layout (unchanged) ═══════
      const bannerY = 140;
      const banner = this.add.container(width / 2, bannerY);
      banner.setDepth(140);

      const bannerW = 540;
      const bannerH = 108;
      const bg = this.add.graphics();
      bg.fillStyle(0x0c1524, 0.96);
      bg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 16);
      bg.lineStyle(2.5, 0xfcb813, 1);
      bg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 16);

      const title = this.add.text(0, -bannerH / 2 + 20, '👤 RESIDENT WANTS TO TALK!', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '18px',
        color: '#fcb813',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const btnW = 235;
      const btnH = 46;
      const btnY = 25;
      const colOffset = 127;

      const stopBtnBg = this.add.graphics();
      stopBtnBg.fillStyle(0x16a34a, 1);
      stopBtnBg.fillRoundedRect(-colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
      stopBtnBg.lineStyle(2, 0x4ade80, 0.95);
      stopBtnBg.strokeRoundedRect(-colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

      const stopTxt = this.add.text(-colOffset, btnY, '🗣️ TALK TO RESIDENT [E]', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const stopZone = this.add.zone(-colOffset, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      stopZone.on('pointerdown', () => this.triggerStopAndListen(resident));

      const runBtnBg = this.add.graphics();
      runBtnBg.fillStyle(0x1e293b, 1);
      runBtnBg.fillRoundedRect(colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
      runBtnBg.lineStyle(2, 0xef4444, 0.9);
      runBtnBg.strokeRoundedRect(colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

      const runTxt = this.add.text(colOffset, btnY, '🏃 IGNORE [R]', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#f87171',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const runZone = this.add.zone(colOffset, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      runZone.on('pointerdown', () => this.triggerKeepRunning(resident));

      banner.add([bg, title, stopBtnBg, stopTxt, stopZone, runBtnBg, runTxt, runZone]);

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

    this.hud.setResidentAlertVisible(true);
  }

  private hideEncounterChoiceBanner(animated: boolean = false) {
    if (this.encounterChoiceBanner) {
      const isPortrait = this.scale.height > this.scale.width;
      if (animated && isPortrait && !this.encounterChoiceBannerAnimating) {
        // Mobile: slide down and destroy
        this.encounterChoiceBannerAnimating = true;
        const targetY = this.scale.height + 180;
        this.tweens.add({
          targets: this.encounterChoiceBanner,
          y: targetY,
          duration: 200,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            if (this.encounterChoiceBanner) {
              this.encounterChoiceBanner.destroy();
              this.encounterChoiceBanner = null;
            }
            this.encounterChoiceBannerAnimating = false;
          }
        });
      } else {
        this.encounterChoiceBanner.destroy();
        this.encounterChoiceBanner = null;
      }
    }
    this.hideResidentAdvanceBeacon();
    this.hud.setResidentAlertVisible(false);
  }

  private showResidentAdvanceBeacon(_resident: Resident, distance: number) {
    const isPortrait = this.scale.height > this.scale.width;
    const meters = Math.max(5, Math.round(distance / 12));

    if (this.residentAdvanceBeacon && this.advanceBeaconDistanceText) {
      this.advanceBeaconDistanceText.setText(`👤 VOTER AHEAD! ➔ ${meters}m`);
      return;
    }

    const beaconX = this.scale.width - (isPortrait ? 88 : 110);
    const beaconY = isPortrait ? this.getGroundY() - 195 : 380;
    const beacon = this.add.container(beaconX, beaconY);
    beacon.setDepth(130);

    const w = isPortrait ? 156 : 178;
    const h = 32;

    const bg = this.add.graphics();
    bg.fillStyle(0x0c1524, 0.94);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(2, 0xfcb813, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);

    const txt = this.add.text(0, 0, `👤 VOTER AHEAD! ➔ ${meters}m`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '12px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    beacon.add([bg, txt]);

    // Pulsing animation
    this.tweens.add({
      targets: beacon,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 320,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.residentAdvanceBeacon = beacon;
    this.advanceBeaconDistanceText = txt;
    this.hud.setResidentAlertVisible(true);
  }

  private hideResidentAdvanceBeacon() {
    if (this.residentAdvanceBeacon) {
      this.residentAdvanceBeacon.destroy();
      this.residentAdvanceBeacon = null;
      this.advanceBeaconDistanceText = null;
    }
  }

  private triggerStopAndListen(resident: Resident) {
    if (this.mobileInteractionState === 'CHOOSING_RESPONSE' || this.mobileInteractionState === 'SHOWING_RESULT' || this.mobileInteractionState === 'APPROACHING_RESIDENT') return;

    this.hideEncounterChoiceBanner(true);
    this.hideResidentAdvanceBeacon();
    resident.hideAlert();
    resident.hideAngrySpeechBubble();
    resident.hasEncountered = true;
    this.activeResidentInEncounter = resident;

    const { width, height } = this.scale;
    const isPortrait = height > width;

    if (isPortrait) {
      // ═══════ MOBILE: Candidate immediately STOPS to talk (strictly grounded, zero jumping) ═══════
      const normalGroundY = this.getGroundY();
      this.isEncounterPaused = true;
      this.isSprinting = false;
      this.currentSpeed = 0;
      this.targetSpeed = 0;

      // Cancel any upward jump momentum and ground candidate firmly
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(0, 0);
        body.setAcceleration(0, 0);
        body.allowGravity = false;
      }
      this.player.y = normalGroundY;
      this.player.setPlayerState('TALKING');
      SoundFX.getInstance().duckBGM(0.08);

      // Conversational placement: Player stops right where they are!
      // Resident smoothly steps into conversational distance (148px gap, zero sprite overlap)
      const targetResidentX = Math.round(Phaser.Math.Clamp(this.player.x + 148, this.player.x + 110, width - 60));

      // Ease resident into conversational distance in front of candidate
      this.tweens.add({
        targets: resident,
        x: targetResidentX,
        y: normalGroundY,
        duration: 220,
        ease: 'Power2.easeOut'
      });

      this.mobileInteractionState = 'CHOOSING_RESPONSE';

      // Speech bubble sits comfortably above resident's head with tail pointed at resident
      const charH = 200 * 1.30;
      const charHeadY = normalGroundY - charH;
      const textLen = resident.complaint.complaintText.length;
      const bubbleH = textLen > 85 ? 106 : (textLen > 55 ? 94 : 84);
      let targetBubbleY = Math.max(bubbleH / 2 + 65, Math.min(charHeadY - bubbleH / 2 - 10, height * 0.28));

      // Launch DialogueModal right here with characters on the road!
      const dialogueModal = new DialogueModal(this, {
        complaint: resident.complaint,
        partyId: this.partyId,
        residentX: targetResidentX,
        targetBubbleY: targetBubbleY,
        onChoiceSelected: (choice: ResponseType) => {
          this.mobileInteractionState = 'SHOWING_RESULT';
          dialogueModal.destroyModal();
          this.handleResponseChosen(resident, choice);
        },
        onCancel: () => {
          dialogueModal.destroyModal();
          this.triggerKeepRunning(resident);
        }
      });
    } else {
      // ═══════ DESKTOP (unchanged) ═══════
      this.isEncounterPaused = true;
      this.currentSpeed = 0;
      this.targetSpeed = 0;
      this.player.setPlayerState('TALKING');
      SoundFX.getInstance().duckBGM(0.08);

      const residentTargetX = this.player.x + 150;
      this.tweens.add({
        targets: resident,
        x: residentTargetX,
        duration: 250,
        ease: 'Power2.easeOut'
      });

      this.time.delayedCall(150, () => {
        this.mobileInteractionState = 'CHOOSING_RESPONSE';
        const dialogueModal = new DialogueModal(this, {
          complaint: resident.complaint,
          partyId: this.partyId,
          residentX: resident.x,
          onChoiceSelected: (choice: ResponseType) => {
            this.mobileInteractionState = 'SHOWING_RESULT';
            dialogueModal.destroyModal();
            this.handleResponseChosen(resident, choice);
          },
          onCancel: () => {
            dialogueModal.destroyModal();
            this.triggerKeepRunning(resident);
          }
        });
      });
    }
  }

  private triggerKeepRunning(resident: Resident) {
    const isPortrait = this.scale.height > this.scale.width;
    const normalPlayerX = isPortrait ? 95 : Math.min(380, this.scale.width * PLAYER_X_RATIO);
    const normalGroundY = this.getGroundY();

    this.hideEncounterChoiceBanner(true);
    resident.hasEncountered = true;
    this.isEncounterPaused = false;
    this.targetSpeed = RUN_SPEED_BASE;
    this.currentSpeed = RUN_SPEED_BASE;
    this.player.setPlayerState('RUNNING_AGAIN');
    this.mobileInteractionState = 'RUNNING';
    SoundFX.getInstance().unduckBGM();
    this.handleResidentPassed(resident);

    this.player.y = normalGroundY;
    if (resident && resident.active) resident.y = normalGroundY;

    if (Math.abs(this.player.x - normalPlayerX) > 5) {
      this.tweens.add({
        targets: this.player,
        x: normalPlayerX,
        duration: 400,
        ease: 'Cubic.easeOut'
      });
    }

    // Mobile: show "You kept running..." toast
    if (isPortrait) {
      const toastW = 220;
      const toastH = 42;
      const toastY = this.scale.height - 100;
      const toast = this.add.container(this.scale.width / 2, toastY);
      toast.setDepth(155);

      const toastBg = this.add.graphics();
      toastBg.fillStyle(0x0c1524, 0.92);
      toastBg.fillRoundedRect(-toastW / 2, -toastH / 2, toastW, toastH, 10);
      toastBg.lineStyle(1.5, 0x94a3b8, 0.6);
      toastBg.strokeRoundedRect(-toastW / 2, -toastH / 2, toastW, toastH, 10);

      const toastTxt = this.add.text(0, 0, '🏃 You kept running...', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14px',
        color: '#94a3b8',
        fontStyle: '700'
      }).setOrigin(0.5, 0.5);

      toast.add([toastBg, toastTxt]);
      toast.setAlpha(0);

      this.tweens.add({
        targets: toast,
        alpha: 1,
        duration: 200,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: toast,
            alpha: 0,
            y: toastY - 20,
            delay: 1000,
            duration: 400,
            ease: 'Sine.easeIn',
            onComplete: () => toast.destroy()
          });
        }
      });
    }
  }

  private handleResidentPassed(resident: Resident) {
    resident.hideAlert();
    if (this.activeResidentInEncounter === resident) {
      this.activeResidentInEncounter = null;
    }
    this.hideEncounterChoiceBanner();
    this.isEncounterPaused = false;
    this.targetSpeed = RUN_SPEED_BASE;
    this.mobileInteractionState = 'RUNNING';

    // Resident speaks out in anger overhead
    resident.showAngrySpeechBubble();

    // Frustration penalty for ignoring
    this.scoreManager.recordEncounter('ignored');
    this.scoreManager.modifyTrust(-3);
    this.scoreManager.modifyMentalHealth(-3);
    this.hud.updateValues();
    this.player.updateMentalHealthVisuals(this.scoreManager.mentalHealth);
    this.hud.triggerMentalHealthFlash(-3, '😤 Resident Ignored: -3% Morale');

    // Floating ignored warning (clamped horizontally so it never clips off-screen)
    const isPortrait = this.scale.height > this.scale.width;
    const warnY = isPortrait ? resident.y - 120 : resident.y - 100;
    const warnX = Phaser.Math.Clamp(resident.x, 150, this.scale.width - 150);
    const warn = this.add.text(warnX, warnY, '😤 Resident Ignored! -3% Trust • -3% Morale', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ff4444',
      fontStyle: '900',
      backgroundColor: '#0c1524',
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5, 0.5).setDepth(150);

    this.tweens.add({
      targets: warn,
      y: warnY - 25,
      alpha: { from: 1, to: 0 },
      delay: 1500,
      duration: 700,
      onComplete: () => warn.destroy()
    });

    if (this.scoreManager.mentalHealth <= 0) {
      this.triggerBurnoutRecovery();
    }
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
    this.scoreManager.modifyMentalHealth(outcome.mentalHealthChange);
    this.scoreManager.recordEncounter(choice, outcome.outcome);

    if (resident.personality === 'Rude') {
      this.scoreManager.stats.rudeEncounters++;
    } else if (resident.personality === 'Cheerful') {
      this.scoreManager.stats.cheerfulEncounters++;
    }

    this.hud.updateValues();
    this.player.updateMentalHealthVisuals(this.scoreManager.mentalHealth);
    if (outcome.mentalHealthChange !== 0) {
      this.hud.triggerMentalHealthFlash(outcome.mentalHealthChange, outcome.mentalHealthReason);
    }

    const targetVotes = this.currentStreet.targetVotes || 10;
    const isTargetWon = this.scoreManager.votes >= targetVotes;

    if (outcome.voteGained > 0) {
      if (isTargetWon) {
        this.addTimeBonus(5, `🏆 TARGET WON! ${this.scoreManager.votes}/${targetVotes} VOTES!`);
      } else {
        this.addTimeBonus(5, '🗳️ VOTE WON! +5s ⏱️');
      }
    }

    // Display Reaction Modal
    new ReactionModal(this, outcome, () => {
      if (isTargetWon) {
        // Party hit the target votes (10 in Area 1, 12 in Area 2)! Transition to Area Complete Scene!
        this.completeCurrentStreet();
      } else {
        this.resumeRunningAfterEncounter(resident);
      }
    });
  }

  private triggerBurnoutRecovery() {
    this.targetSpeed = 0;
    this.currentSpeed = 0;
    this.scoreManager.stats.burnoutsSuffered++;
    this.player.triggerBurnout(() => {
      this.scoreManager.mentalHealth = 25;
      this.hud.updateValues();
      this.player.updateMentalHealthVisuals(25);
      this.hud.triggerMentalHealthFlash(25, '💪 Second Wind! +25% Morale');
      this.targetSpeed = RUN_SPEED_BASE;
    });
  }

  private resumeRunningAfterEncounter(resident?: Resident) {
    const res = resident || this.activeResidentInEncounter;
    const normalGroundY = this.getGroundY();
    const isPortrait = this.scale.height > this.scale.width;
    const normalPlayerX = isPortrait ? 95 : Math.min(380, this.scale.width * PLAYER_X_RATIO);

    // Immediately unpause and start running forward with full momentum
    this.isEncounterPaused = false;
    this.activeResidentInEncounter = null;
    this.mobileInteractionState = 'RUNNING';
    this.player.setPlayerState('RUNNING_AGAIN');
    this.targetSpeed = RUN_SPEED_BASE;
    this.currentSpeed = RUN_SPEED_BASE;
    SoundFX.getInstance().unduckBGM();

    // Firmly on the road (no vertical hopping or dropping)
    this.player.y = normalGroundY;
    if (res && res.active) {
      res.y = normalGroundY;
    }

    // While runner accelerates down the street, smoothly ease X back to the running lane
    if (Math.abs(this.player.x - normalPlayerX) > 5) {
      this.tweens.add({
        targets: this.player,
        x: normalPlayerX,
        duration: 380,
        ease: 'Cubic.easeOut'
      });
    }

    // If mental health dropped to 0 from the encounter, trigger brief burnout recovery!
    if (this.scoreManager.mentalHealth <= 0) {
      this.triggerBurnoutRecovery();
      return;
    }
  }

  public addTimeBonus(seconds: number, toastText?: string) {
    this.streetTimer = Math.max(0, this.streetTimer + seconds);
    this.scoreManager.totalTimeRemaining = this.streetTimer;
    this.hud.updateValues();

    if (this.hud) {
      this.hud.triggerTimeFlash(seconds > 0 ? 'gain' : 'loss');
    }

    if (toastText) {
      const isPositive = seconds > 0;
      const isPortrait = this.scale.height > this.scale.width;
      const toastY = isPortrait ? 82 : 88;
      const toast = this.add.text(this.scale.width / 2, toastY, toastText, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isPortrait ? '14px' : '16px',
        color: isPositive ? '#44dd66' : '#ff4444',
        fontStyle: '900',
        backgroundColor: '#0c1524',
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setOrigin(0.5, 0.5).setDepth(160);

      this.tweens.add({
        targets: toast,
        y: toastY - 25,
        alpha: 0,
        duration: 1100,
        ease: 'Power2.easeOut',
        onComplete: () => toast.destroy()
      });
    }
  }

  private completeCurrentStreet() {
    SoundFX.getInstance().stopBGM(true);
    this.scene.start('StreetCompleteScene', { partyId: this.partyId });
  }

  public pauseGame() {
    if (this.isGamePaused) return;
    this.isGamePaused = true;
    this.physics.world.pause();

    this.pauseModal = new PauseModal(this, {
      currentStreet: this.currentStreet,
      partyId: this.partyId,
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartArea(),
      onMainMenu: () => {
        SoundFX.getInstance().stopBGM(true);
        this.scene.start('MainMenuScene');
      }
    });
  }

  public resumeGame() {
    if (!this.isGamePaused) return;
    this.isGamePaused = false;
    this.pauseModal = null;
    this.physics.world.resume();
  }

  public togglePause() {
    if (this.isGamePaused) {
      if (this.pauseModal) {
        this.pauseModal.destroy();
      }
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  public restartArea() {
    this.isGamePaused = false;
    this.pauseModal = null;
    this.physics.world.resume();
    this.scoreManager.startNewArea(this.scoreManager.currentStreetIndex);
    this.scene.restart({ partyId: this.partyId });
  }

  private triggerFirstObstacleTutorial(obs: Obstacle) {
    if (this.obstacleTutorialContainer) return;
    this.isEncounterPaused = true;
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.player.setPlayerState('IDLE');
    SoundFX.getInstance().duckBGM(0.1);

    const { width, height } = this.scale;
    const isPortrait = height > width;
    const groundY = this.getGroundY();
    const party = PARTIES[this.partyId];

    // 1. Ghost Jump Guide Arc (Trajectory curve over obstacle)
    const arcContainer = this.add.container(0, 0);
    arcContainer.setDepth(135);

    const arcGraphics = this.add.graphics();
    arcContainer.add(arcGraphics);

    const startX = this.player.x;
    const startY = groundY - 25;
    const apexX = (this.player.x + obs.x) / 2 + 10;
    const apexY = groundY - 145;
    const endX = obs.x + 95;
    const endY = groundY - 25;

    // Draw glowing curved trajectory
    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(startX, startY),
      new Phaser.Math.Vector2(apexX, apexY - 35),
      new Phaser.Math.Vector2(endX, endY)
    );

    // Draw glowing dots along curve
    const points = curve.getPoints(24);
    arcGraphics.lineStyle(3, 0x38bdf8, 0.75);
    curve.draw(arcGraphics);

    points.forEach((p, idx) => {
      if (idx % 2 === 0) {
        arcGraphics.fillStyle(0xfcb813, 0.9);
        arcGraphics.fillCircle(p.x, p.y, 4);
      }
    });

    // Floating trajectory banner pill
    const arcLabelBg = this.add.graphics();
    arcLabelBg.fillStyle(0x0c1524, 0.92);
    arcLabelBg.fillRoundedRect(apexX - 85, apexY - 45, 170, 26, 13);
    arcLabelBg.lineStyle(1.5, 0x38bdf8, 0.9);
    arcLabelBg.strokeRoundedRect(apexX - 85, apexY - 45, 170, 26, 13);

    const arcLabelTxt = this.add.text(apexX, apexY - 32, '🦘 JUMP ARC: +5s BONUS ⏱️', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#38bdf8',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    arcContainer.add([arcLabelBg, arcLabelTxt]);

    // Animated glowing ghost runner indicator following the curve
    const ghostBead = this.add.circle(startX, startY, 8, 0x38bdf8);
    ghostBead.setStrokeStyle(2, 0xffffff, 1);
    arcContainer.add(ghostBead);

    const animProgress = { t: 0 };
    const beadTween = this.tweens.add({
      targets: animProgress,
      t: 1,
      duration: 1100,
      repeat: -1,
      ease: 'Quad.easeInOut',
      onUpdate: () => {
        const pt = curve.getPoint(animProgress.t);
        ghostBead.setPosition(pt.x, pt.y);
      }
    });

    this.ghostGuideArcContainer = arcContainer;

    if (isPortrait) {
      // ═══════ MOBILE: Bottom slide-up sheet ═══════
      const safeBottom = 32;
      const tutW = Math.min(width - 16, 500);
      const tutH = 310;
      const tutFinalY = height - safeBottom - tutH / 2;
      const tutStartY = height + tutH;

      const modal = this.add.container(width / 2, tutStartY);
      modal.setDepth(170);

      const bg = this.add.graphics();
      bg.fillStyle(0x0c1524, 0.98);
      bg.fillRoundedRect(-tutW / 2, -tutH / 2, tutW, tutH, { tl: 20, tr: 20, bl: 12, br: 12 });
      bg.lineStyle(2.5, 0xfcb813, 1);
      bg.strokeRoundedRect(-tutW / 2, -tutH / 2, tutW, tutH, { tl: 20, tr: 20, bl: 12, br: 12 });

      // Drag handle indicator pill
      const handlePill = this.add.graphics();
      handlePill.fillStyle(0x4a5568, 0.6);
      handlePill.fillRoundedRect(-20, -tutH / 2 + 8, 40, 4, 2);

      const title = this.add.text(0, -tutH / 2 + 32, '🚧 COMMUNITY HAZARD AHEAD!', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '18px',
        color: '#fcb813',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const subtitle = this.add.text(0, -tutH / 2 + 56, `WARD 1: FIXING HAZARDS FOR ${party.name.toUpperCase()}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#94a3b8',
        fontStyle: '800'
      }).setOrigin(0.5, 0.5);

      const desc = this.add.text(0, -tutH / 2 + 120,
        `A road pothole is blocking your route!\n\n` +
        `✨ JUMP OVER TO FIX IT: Grants +5s EXTRA TIME ⏱️ to help you win votes for ${party.name}!\n` +
        `⚠️ STUMBLING: Tripping loses -2s and drains morale.`,
        {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '13px',
          color: '#e2e8f0',
          fontStyle: '600',
          align: 'center',
          lineSpacing: 4,
          wordWrap: { width: tutW - 36 }
        }
      ).setOrigin(0.5, 0.5);

      const btnW = tutW - 32;
      const btnH = 58;
      const btnY = tutH / 2 - btnH / 2 - 18;

      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x16a34a, 1);
      btnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
      btnBg.lineStyle(2, 0x4ade80, 1);
      btnBg.strokeRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 14);

      const btnTxt = this.add.text(0, btnY, '🦘 GOT IT! JUMP OVER (+5s ⏱️)', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const dismissMobileObstacleTutorial = () => {
        if (!this.obstacleTutorialContainer) return;
        window.removeEventListener('keydown', onKeyDown);
        beadTween.stop();
        if (this.ghostGuideArcContainer) {
          this.tweens.add({
            targets: this.ghostGuideArcContainer,
            alpha: 0,
            duration: 250,
            onComplete: () => {
              this.ghostGuideArcContainer?.destroy();
              this.ghostGuideArcContainer = null;
            }
          });
        }

        this.tweens.add({
          targets: modal,
          y: height + tutH,
          duration: 200,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            modal.destroy();
            this.obstacleTutorialContainer = null;
            if (obs && obs.active) {
              obs.x = this.player.x + 115;
            }
            this.scoreManager.hasSeenObstacleTutorial = true;
            this.isEncounterPaused = false;
            this.targetSpeed = RUN_SPEED_BASE;
            this.currentSpeed = RUN_SPEED_BASE;
            this.player.setPlayerState('JUMPING');
            SoundFX.getInstance().unduckBGM();
            this.player.jump();
          }
        });
      };

      const btnZone = this.add.zone(0, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      btnZone.once('pointerdown', dismissMobileObstacleTutorial);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') {
          dismissMobileObstacleTutorial();
        }
      };
      window.addEventListener('keydown', onKeyDown);

      modal.add([bg, handlePill, title, subtitle, desc, btnBg, btnTxt, btnZone]);

      this.tweens.add({
        targets: modal,
        y: tutFinalY,
        duration: 280,
        ease: 'Cubic.easeOut'
      });

      this.obstacleTutorialContainer = modal;
    } else {
      // ═══════ DESKTOP: Existing center modal (unchanged) ═══════
      const tutW = Math.min(width - 24, 500);
      const tutH = 265;
      const tutY = 190;

      const modal = this.add.container(width / 2, tutY);
      modal.setDepth(170);

      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.65);
      bg.fillRoundedRect(-tutW / 2 + 6, -tutH / 2 + 8, tutW, tutH, 18);
      bg.fillStyle(0x0c1524, 0.97);
      bg.fillRoundedRect(-tutW / 2, -tutH / 2, tutW, tutH, 18);
      bg.lineStyle(2.5, 0xfcb813, 1);
      bg.strokeRoundedRect(-tutW / 2, -tutH / 2, tutW, tutH, 18);

      const title = this.add.text(0, -tutH / 2 + 28, '🚧 COMMUNITY HAZARD AHEAD!', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '22px',
        color: '#fcb813',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const subtitle = this.add.text(0, -tutH / 2 + 54, `WARD 1: FIXING THE WARD FOR ${party.name.toUpperCase()}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#94a3b8',
        fontStyle: '800'
      }).setOrigin(0.5, 0.5);

      const desc = this.add.text(0, -tutH / 2 + 120, 
        `A road pothole is blocking your campaign route!\n\n` +
        `✨ JUMP OVER TO FIX IT: Grants +5s EXTRA TIME ⏱️ to help you secure the ${this.currentStreet.targetVotes || 10} votes needed to win this ward!\n` +
        `⚠️ STUMBLING: Tripping loses -2s and drains your mental morale.`,
        {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '13.5px',
          color: '#e2e8f0',
          fontStyle: '600',
          align: 'center',
          lineSpacing: 4,
          wordWrap: { width: tutW - 40 }
        }
      ).setOrigin(0.5, 0.5);

      const btnW = Math.min(340, tutW - 40);
      const btnH = 46;
      const btnY = tutH / 2 - 32;

      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x16a34a, 1);
      btnBg.fillRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 12);
      btnBg.lineStyle(2, 0x4ade80, 1);
      btnBg.strokeRoundedRect(-btnW / 2, btnY - btnH / 2, btnW, btnH, 12);

      const btnTxt = this.add.text(0, btnY, '🦘 GOT IT! JUMP OVER [SPACE / TAP]', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const dismissObstacleTutorial = () => {
        if (!this.obstacleTutorialContainer) return;
        window.removeEventListener('keydown', onKeyDown);
        beadTween.stop();
        if (this.ghostGuideArcContainer) {
          this.tweens.add({
            targets: this.ghostGuideArcContainer,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              this.ghostGuideArcContainer?.destroy();
              this.ghostGuideArcContainer = null;
            }
          });
        }

        this.tweens.add({
          targets: modal,
          scaleX: 0.9,
          scaleY: 0.9,
          alpha: 0,
          duration: 160,
          onComplete: () => {
            modal.destroy();
            this.obstacleTutorialContainer = null;
            if (obs && obs.active) {
              obs.x = this.player.x + 115;
            }
            this.scoreManager.hasSeenObstacleTutorial = true;
            this.isEncounterPaused = false;
            this.targetSpeed = RUN_SPEED_BASE;
            this.currentSpeed = RUN_SPEED_BASE;
            this.player.setPlayerState('JUMPING');
            SoundFX.getInstance().unduckBGM();
            this.player.jump();
          }
        });
      };

      const btnZone = this.add.zone(0, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      btnZone.once('pointerdown', dismissObstacleTutorial);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') {
          dismissObstacleTutorial();
        }
      };
      window.addEventListener('keydown', onKeyDown);

      modal.add([bg, title, subtitle, desc, btnBg, btnTxt, btnZone]);
      modal.setScale(0.92);
      this.tweens.add({
        targets: modal,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });

      this.obstacleTutorialContainer = modal;
    }
  }

  private triggerFirstResidentTutorial(res: Resident) {
    if (this.residentTutorialContainer) return;
    this.isEncounterPaused = true;
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.player.setPlayerState('IDLE');
    SoundFX.getInstance().duckBGM(0.1);

    const { width, height } = this.scale;
    const isPortrait = height > width;
    const party = PARTIES[this.partyId];

    if (isPortrait) {
      // ═══════ MOBILE: Bottom slide-up tutorial panel ═══════
      const safeBottom = 32;
      const tutW = Math.min(width - 16, 500);
      const tutH = 340;
      const tutFinalY = height - safeBottom - tutH / 2;
      const tutStartY = height + tutH;

      const modal = this.add.container(width / 2, tutStartY);
      modal.setDepth(170);

      const bg = this.add.graphics();
      bg.fillStyle(0x0c1524, 0.97);
      bg.fillRoundedRect(-tutW / 2, -tutH / 2, tutW, tutH, { tl: 20, tr: 20, bl: 12, br: 12 });
      bg.lineStyle(2.5, 0x38bdf8, 1);
      bg.strokeRoundedRect(-tutW / 2, -tutH / 2, tutW, tutH, { tl: 20, tr: 20, bl: 12, br: 12 });

      // Drag handle
      const handlePill = this.add.graphics();
      handlePill.fillStyle(0x4a5568, 0.6);
      handlePill.fillRoundedRect(-20, -tutH / 2 + 8, 40, 4, 2);

      const title = this.add.text(0, -tutH / 2 + 32, '🗣️ ENGAGE THE VOTER!', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '19px',
        color: '#38bdf8',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const subtitle = this.add.text(0, -tutH / 2 + 56, `WINNING VOTES FOR ${party.name.toUpperCase()}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#94a3b8',
        fontStyle: '800'
      }).setOrigin(0.5, 0.5);

      const desc = this.add.text(0, -tutH / 2 + 125,
        `A local resident has a community grievance!\n\n` +
        `🤝 TALK: Hear their concern. Answer wisely to gain their VOTE and boost Trust for ${party.name}!\n` +
        `🏃 IGNORE: Running past will anger them, reducing Trust and draining morale.`,
        {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '13px',
          color: '#e2e8f0',
          fontStyle: '600',
          align: 'center',
          lineSpacing: 4,
          wordWrap: { width: tutW - 40 }
        }
      ).setOrigin(0.5, 0.5);

      // Large mobile buttons
      const btnGap = 10;
      const btnW = (tutW - 32 - btnGap) / 2;
      const btnH = 62;
      const btnY = tutH / 2 - btnH / 2 - 20;
      const leftX = -(btnW + btnGap) / 2;
      const rightX = (btnW + btnGap) / 2;

      const talkBg = this.add.graphics();
      talkBg.fillStyle(0x16a34a, 1);
      talkBg.fillRoundedRect(leftX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
      talkBg.lineStyle(2, 0x4ade80, 1);
      talkBg.strokeRoundedRect(leftX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);

      const talkEmoji = this.add.text(leftX, btnY - 10, '💬', { fontSize: '20px' }).setOrigin(0.5, 0.5);
      const talkTxt = this.add.text(leftX, btnY + 12, 'TALK', {
        fontFamily: 'Outfit, sans-serif', fontSize: '16px', color: '#ffffff', fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const ignoreBg = this.add.graphics();
      ignoreBg.fillStyle(0x1e293b, 1);
      ignoreBg.fillRoundedRect(rightX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
      ignoreBg.lineStyle(2, 0xef4444, 0.85);
      ignoreBg.strokeRoundedRect(rightX - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);

      const ignoreEmoji = this.add.text(rightX, btnY - 10, '🏃', { fontSize: '20px' }).setOrigin(0.5, 0.5);
      const ignoreTxt = this.add.text(rightX, btnY + 12, 'IGNORE', {
        fontFamily: 'Outfit, sans-serif', fontSize: '16px', color: '#f87171', fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const dismissAndTalk = () => {
        if (!this.residentTutorialContainer) return;
        window.removeEventListener('keydown', onResidentKeyDown);
        this.tweens.add({
          targets: modal,
          y: height + tutH,
          duration: 200,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            modal.destroy();
            this.residentTutorialContainer = null;
            this.scoreManager.hasSeenResidentTutorial = true;
            this.triggerStopAndListen(res);
          }
        });
      };

      const dismissAndIgnore = () => {
        if (!this.residentTutorialContainer) return;
        window.removeEventListener('keydown', onResidentKeyDown);
        this.tweens.add({
          targets: modal,
          y: height + tutH,
          duration: 200,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            modal.destroy();
            this.residentTutorialContainer = null;
            this.scoreManager.hasSeenResidentTutorial = true;
            this.isEncounterPaused = false;
            this.targetSpeed = RUN_SPEED_BASE;
            this.player.setPlayerState('RUNNING_AGAIN');
            SoundFX.getInstance().unduckBGM();
            this.handleResidentPassed(res);
          }
        });
      };

      const talkZone = this.add.zone(leftX, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      talkZone.once('pointerdown', dismissAndTalk);

      const ignoreZone = this.add.zone(rightX, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      ignoreZone.once('pointerdown', dismissAndIgnore);

      const onResidentKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'KeyE' || e.code === 'Enter') dismissAndTalk();
        else if (e.code === 'KeyR' || e.code === 'ArrowRight') dismissAndIgnore();
      };
      window.addEventListener('keydown', onResidentKeyDown);

      modal.add([bg, handlePill, title, subtitle, desc, talkBg, talkEmoji, talkTxt, talkZone, ignoreBg, ignoreEmoji, ignoreTxt, ignoreZone]);

      // Slide-up entrance
      this.tweens.add({
        targets: modal,
        y: tutFinalY,
        duration: 280,
        ease: 'Cubic.easeOut'
      });

      this.residentTutorialContainer = modal;
    } else {
      // ═══════ DESKTOP: Existing center modal (unchanged) ═══════
      const tutW = Math.min(width - 24, 510);
      const tutH = 275;
      const tutY = 190;

      const modal = this.add.container(width / 2, tutY);
      modal.setDepth(170);

      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.65);
      bg.fillRoundedRect(-tutW / 2 + 6, -tutH / 2 + 8, tutW, tutH, 18);
      bg.fillStyle(0x0c1524, 0.97);
      bg.fillRoundedRect(-tutW / 2, -tutH / 2, tutW, tutH, 18);
      bg.lineStyle(2.5, 0x38bdf8, 1);
      bg.strokeRoundedRect(-tutW / 2, -tutH / 2, tutW, tutH, 18);

      const title = this.add.text(0, -tutH / 2 + 28, '🗣️ CANVASSING: ENGAGE THE VOTER!', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '21px',
        color: '#38bdf8',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const subtitle = this.add.text(0, -tutH / 2 + 54, `WARD 1: WINNING VOTER SUPPORT FOR ${party.name.toUpperCase()}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#94a3b8',
        fontStyle: '800'
      }).setOrigin(0.5, 0.5);

      const desc = this.add.text(0, -tutH / 2 + 118,
        `A local resident has a community grievance!\n\n` +
        `🤝 TALK TO RESIDENT: Hear what they are saying. Answer wisely to gain their VOTE and boost Trust for ${party.name} to win this ward!\n` +
        `🏃 IGNORE: Running past will anger the resident, reducing Trust and draining your mental morale.`,
        {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '13.5px',
          color: '#e2e8f0',
          fontStyle: '600',
          align: 'center',
          lineSpacing: 4,
          wordWrap: { width: tutW - 40 }
        }
      ).setOrigin(0.5, 0.5);

      const btnW = 225;
      const btnH = 46;
      const btnY = tutH / 2 - 32;
      const colOffset = 122;

      const talkBg = this.add.graphics();
      talkBg.fillStyle(0x16a34a, 1);
      talkBg.fillRoundedRect(-colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
      talkBg.lineStyle(2, 0x4ade80, 1);
      talkBg.strokeRoundedRect(-colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

      const talkTxt = this.add.text(-colOffset, btnY, '🗣️ TALK [E]', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const ignoreBg = this.add.graphics();
      ignoreBg.fillStyle(0x1e293b, 1);
      ignoreBg.fillRoundedRect(colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);
      ignoreBg.lineStyle(2, 0xef4444, 0.85);
      ignoreBg.strokeRoundedRect(colOffset - btnW / 2, btnY - btnH / 2, btnW, btnH, 10);

      const ignoreTxt = this.add.text(colOffset, btnY, '🏃 IGNORE [R]', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#f87171',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const dismissAndTalk = () => {
        if (!this.residentTutorialContainer) return;
        window.removeEventListener('keydown', onResidentKeyDown);
        modal.destroy();
        this.residentTutorialContainer = null;
        this.scoreManager.hasSeenResidentTutorial = true;
        this.triggerStopAndListen(res);
      };

      const dismissAndIgnore = () => {
        if (!this.residentTutorialContainer) return;
        window.removeEventListener('keydown', onResidentKeyDown);
        modal.destroy();
        this.residentTutorialContainer = null;
        this.scoreManager.hasSeenResidentTutorial = true;
        this.isEncounterPaused = false;
        this.targetSpeed = RUN_SPEED_BASE;
        this.player.setPlayerState('RUNNING_AGAIN');
        SoundFX.getInstance().unduckBGM();
        this.handleResidentPassed(res);
      };

      const talkZone = this.add.zone(-colOffset, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      talkZone.once('pointerdown', dismissAndTalk);

      const ignoreZone = this.add.zone(colOffset, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
      ignoreZone.once('pointerdown', dismissAndIgnore);

      const onResidentKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'KeyE' || e.code === 'Enter') dismissAndTalk();
        else if (e.code === 'KeyR' || e.code === 'ArrowRight') dismissAndIgnore();
      };
      window.addEventListener('keydown', onResidentKeyDown);

      modal.add([bg, title, subtitle, desc, talkBg, talkTxt, talkZone, ignoreBg, ignoreTxt, ignoreZone]);
      modal.setScale(0.92);
      this.tweens.add({
        targets: modal,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });

      this.residentTutorialContainer = modal;
    }
  }
}
