import Phaser from 'phaser';
import { SoundFX } from '../systems/SoundFX';
import { JUMP_VELOCITY, RUN_FRAME_COUNT, PARTY_RUN_FRAME_COUNTS, RUN_FRAME_DURATION } from '../config/constants';

export type PlayerState = 
  | 'IDLE' 
  | 'RUNNING' 
  | 'JUMPING' 
  | 'STOPPING' 
  | 'TALKING' 
  | 'HIT' 
  | 'RUNNING_AGAIN';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public playerState: PlayerState = 'IDLE';
  public partyId: 'da' | 'anc' | 'pa' = 'da';
  
  private runAnimTimer: number = 0;
  private currentFrameIdx: number = 0;
  private soundFX: SoundFX;
  private hitInvulnerable: boolean = false;
  private hitTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, partyId: 'da' | 'anc' | 'pa') {
    super(scene, x, y, `player_${partyId}_idle`);
    this.partyId = partyId;
    this.soundFX = SoundFX.getInstance();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(7);
    this.setOrigin(0.5, 1);
    this.setCollideWorldBounds(true);
    
    // Scale candidate player slightly taller/bigger for mobile readability
    const isPortrait = scene.scale.height > scene.scale.width;
    const playerScale = isPortrait ? 1.15 : 1.05;
    this.setScale(playerScale);

    // Physics body adjustments (for 144x200 sprite frame, origin 0.5, 1)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(44, 160);
      body.setOffset(48, 40);
    }

    this.setPlayerState('IDLE');
  }

  public setPlayerState(newState: PlayerState) {
    if (this.playerState === newState) return;
    this.playerState = newState;

    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (newState) {
      case 'IDLE':
        this.setTexture(`player_${this.partyId}_idle`);
        if (body) body.setVelocity(0, 0);
        break;

      case 'RUNNING':
        this.setTexture(`player_${this.partyId}_run_0`);
        break;

      case 'JUMPING':
        this.setTexture(`player_${this.partyId}_jump`);
        this.soundFX.playJump();
        if (body) {
          body.setVelocityY(JUMP_VELOCITY);
        }
        break;

      case 'STOPPING':
        this.setTexture(`player_${this.partyId}_idle`);
        if (body) body.setVelocityX(0);
        break;

      case 'TALKING':
        this.setTexture(`player_${this.partyId}_talk`);
        if (body) body.setVelocity(0, 0);
        break;

      case 'HIT':
        this.setTexture(`player_${this.partyId}_hit`);
        this.soundFX.playHit();
        this.hitInvulnerable = true;
        this.hitTimer = 0.8; // 800ms hit state
        // Camera micro shake
        this.scene.cameras.main.shake(200, 0.008);
        // Red flash tint
        this.setTint(0xff5555);
        break;

      case 'RUNNING_AGAIN':
        this.clearTint();
        this.hitInvulnerable = false;
        this.setPlayerState('RUNNING');
        break;
    }
  }

  public jump() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.playerState === 'RUNNING' && body && body.blocked.down) {
      this.setPlayerState('JUMPING');
    }
  }

  public onHitObstacle(): boolean {
    if (this.hitInvulnerable || this.playerState === 'HIT' || this.playerState === 'TALKING' || this.playerState === 'STOPPING') {
      return false;
    }
    this.setPlayerState('HIT');
    return true;
  }

  public update(_time: number, delta: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Check ground collision for jumping
    if (this.playerState === 'JUMPING' && body && body.blocked.down) {
      this.setPlayerState('RUNNING');
    }

    // Handle HIT recovery
    if (this.playerState === 'HIT') {
      this.hitTimer -= delta / 1000;
      if (this.hitTimer <= 0) {
        this.setPlayerState('RUNNING_AGAIN');
      }
    }

    // Run animation frames (exact party cycle count at 30-33 FPS)
    if (this.playerState === 'RUNNING') {
      this.runAnimTimer += delta;
      if (this.runAnimTimer >= RUN_FRAME_DURATION) {
        this.runAnimTimer = 0;
        const frameCount = PARTY_RUN_FRAME_COUNTS[this.partyId] || RUN_FRAME_COUNT;
        this.currentFrameIdx = (this.currentFrameIdx + 1) % frameCount;
        this.setTexture(`player_${this.partyId}_run_${this.currentFrameIdx}`);
        
        // Soft footstep sound synchronized with left foot (0) and right foot (midpoint) strikes
        if (this.currentFrameIdx === 0 || this.currentFrameIdx === Math.floor(frameCount / 2)) {
          this.soundFX.playFootstep();
        }
      }
    }
  }
}
