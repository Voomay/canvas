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
  private stressIndicator?: Phaser.GameObjects.Text;
  private isBurnedOut: boolean = false;
  public isSprinting: boolean = false;
  private ghostTrailTimer: number = 0;

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

    // Floating stress droplets indicator (visible when mental health < 30%)
    this.stressIndicator = scene.add.text(x + 20, y - 180, '💦', {
      fontSize: '22px'
    }).setOrigin(0.5, 0.5).setDepth(8).setVisible(false);

    scene.tweens.add({
      targets: this.stressIndicator,
      y: y - 195,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.setPlayerState('IDLE');
  }

  public setPlayerState(newState: PlayerState) {
    if (this.playerState === newState) return;
    this.playerState = newState;

    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (newState) {
      case 'IDLE':
        this.setTexture(`player_${this.partyId}_idle`);
        if (body) {
          body.setVelocity(0, 0);
          body.allowGravity = true;
        }
        break;

      case 'RUNNING':
        if (body) {
          body.allowGravity = true;
        }
        this.setTexture(`player_${this.partyId}_run_0`);
        break;

      case 'JUMPING':
        this.setTexture(`player_${this.partyId}_jump`);
        this.soundFX.playJump();
        if (body) {
          body.allowGravity = true;
          body.setVelocityY(JUMP_VELOCITY);
        }
        break;

      case 'STOPPING':
        this.setTexture(`player_${this.partyId}_idle`);
        if (body) {
          body.setVelocityX(0);
          body.allowGravity = true;
        }
        break;

      case 'TALKING':
        this.setTexture(`player_${this.partyId}_talk`);
        if (body) {
          body.setVelocity(0, 0);
          body.allowGravity = false;
        }
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
        if (body) {
          body.allowGravity = true;
        }
        this.setPlayerState('RUNNING');
        break;
    }
  }

  public updateMentalHealthVisuals(mentalHealth: number) {
    if (this.stressIndicator) {
      const isStressed = mentalHealth < 30;
      this.stressIndicator.setVisible(isStressed);
    }
  }

  public triggerBurnout(onRecovered: () => void) {
    if (this.isBurnedOut) return;
    this.isBurnedOut = true;

    this.setPlayerState('STOPPING');
    this.setTexture(`player_${this.partyId}_hit`);
    this.setTint(0xff9977);

    // Speech bubble for exhaustion
    const bubble = this.scene.add.text(this.x, this.y - 180, '😮‍💨 Exhausted! Taking a breath...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#0c1524',
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    }).setOrigin(0.5, 0.5).setDepth(150);

    this.scene.time.delayedCall(1600, () => {
      if (bubble.active) {
        bubble.setText('💪 Second Wind! Keep pushing!');
        bubble.setColor('#44dd66');
      }
    });

    this.scene.time.delayedCall(2400, () => {
      if (bubble.active) bubble.destroy();
      this.clearTint();
      this.isBurnedOut = false;
      this.setPlayerState('RUNNING_AGAIN');
      onRecovered();
    });
  }

  public jump() {
    if (this.isBurnedOut) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.playerState === 'RUNNING' && body && body.blocked.down) {
      this.setPlayerState('JUMPING');
    }
  }

  public onHitObstacle(): boolean {
    if (this.isBurnedOut || this.hitInvulnerable || this.playerState === 'HIT' || this.playerState === 'TALKING' || this.playerState === 'STOPPING') {
      return false;
    }
    this.setPlayerState('HIT');
    return true;
  }

  public update(_time: number, delta: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Synchronize stress droplet position with candidate
    if (this.stressIndicator && this.stressIndicator.visible) {
      this.stressIndicator.x = this.x + 22;
      this.stressIndicator.y = this.y - 170;
    }

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
    if (this.playerState === 'RUNNING' && !this.isBurnedOut) {
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

    // Dynamic runner ghost trail when jumping or sprinting
    if (!this.isBurnedOut && (this.playerState === 'JUMPING' || (this.playerState === 'RUNNING' && this.isSprinting))) {
      this.ghostTrailTimer += delta;
      if (this.ghostTrailTimer >= 110) {
        this.ghostTrailTimer = 0;
        this.spawnGhostTrail();
      }
    }
  }

  private spawnGhostTrail() {
    if (!this.scene || !this.visible) return;

    const ghost = this.scene.add.sprite(this.x, this.y, this.texture.key, this.frame.name);
    ghost.setOrigin(this.originX, this.originY);
    ghost.setScale(this.scaleX, this.scaleY);
    ghost.setDepth(this.depth - 0.1);
    ghost.setAlpha(0.45);

    // Tint ghost by party color
    let tint = 0x38bdf8;
    if (this.partyId === 'anc') tint = 0xfcb813;
    else if (this.partyId === 'pa') tint = 0x4ea81e;
    ghost.setTint(tint);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: this.scaleX * 0.96,
      scaleY: this.scaleY * 0.96,
      duration: 280,
      ease: 'Quad.easeOut',
      onComplete: () => {
        ghost.destroy();
      }
    });
  }

  public destroy(fromScene?: boolean) {
    if (this.stressIndicator) {
      this.stressIndicator.destroy();
      this.stressIndicator = undefined;
    }
    super.destroy(fromScene);
  }
}
