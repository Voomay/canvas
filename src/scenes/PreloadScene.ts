import Phaser from 'phaser';
import { PlaceholderGenerator } from '../systems/PlaceholderGenerator';
import { RUN_FRAME_COUNT, PARTY_RUN_FRAME_COUNTS } from '../config/constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  public preload() {
    const { width, height } = this.scale;

    // Loading Screen Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0c1524, 1);
    bg.fillRect(0, 0, width, height);

    const isPortrait = height > width;
    const targetLogoW = isPortrait ? Math.min(width * 0.72, 290) : 260;
    const logoY = isPortrait ? height / 2 - 110 : height / 2 - 95;

    let logoDisplayH = 180;
    // Official Canvassing SA Logo (Preserving 100% natural un-distorted aspect ratio)
    if (this.textures.exists('logo_canvassing_sa')) {
      const logo = this.add.image(width / 2, logoY, 'logo_canvassing_sa');
      const scale = targetLogoW / logo.width;
      logo.setScale(scale);
      logoDisplayH = logo.height * scale;
    }

    const subY = logoY + logoDisplayH / 2 + (isPortrait ? 26 : 22);
    this.add.text(width / 2, subY, 'Join your political party canvassing around South Africa', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '16px' : '17px',
      color: '#f8fafc',
      fontStyle: '700'
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, subY + 30, 'Loading South African Neighbourhood...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14.5px',
      color: '#94a3b8',
      fontStyle: '600'
    }).setOrigin(0.5, 0.5);

    // Loading bar container
    const barW = Math.min(width - 48, 380);
    const barH = 16;
    const barX = width / 2 - barW / 2;
    const barY = subY + 58;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a2638, 1);
    barBg.fillRoundedRect(barX, barY, barW, barH, 7);

    const barFill = this.add.graphics();

    this.load.on('progress', (value: number) => {
      barFill.clear();
      barFill.fillStyle(0x27ae60, 1);
      barFill.fillRoundedRect(barX, barY, Math.max(10, barW * value), barH, 7);
    });

    // 1. Load Backgrounds & Locations (Ultra High-Res Cape Town & Joburg Locations)
    this.load.image('bg_location_hanover_park', 'assets/backgrounds/locations/hanover_park.png');
    this.load.image('bg_location_capetown', 'assets/backgrounds/locations/hanover_park.png');
    this.load.image('bg_location_campsbay', 'assets/backgrounds/locations/campsbay.png');
    this.load.image('bg_location_khayelitsha', 'assets/backgrounds/locations/khayelitsha.png');
    this.load.image('bg_location_mitchells_plain', 'assets/backgrounds/locations/mitchells_plain.png');
    this.load.image('bg_location_joburg', 'assets/backgrounds/locations/joburg.png');
    this.load.image('bg_clouds_sky', 'assets/backgrounds/clouds/clouds_sky.png');
    this.load.image('real_bg_houses', 'assets/backgrounds/houses/suburb_houses.png');
    this.load.image('real_bg_road', 'assets/roads/clean/pavement_road.png');
    this.load.image('prop_curb_banner_parties', 'assets/decorations/lamp_pole_party_banners.png');
    this.load.image('prop_curb_banner_pa', 'assets/decorations/lamp_pole_party_banners.png');

    // Party Selection Transparent Card Artworks (DA, ANC, PA)
    this.load.image('card_anc', 'assets/ui/card_anc.png');
    this.load.image('card_da', 'assets/ui/card_da.png');
    this.load.image('card_pa', 'assets/ui/card_pa.png');

    // Luxury Vehicles for Camps Bay (Yellow Lambo, Red Ferrari, Blue SUV)
    this.load.image('vehicle_car_lambo', 'assets/vehicles/car_yellow_lambo.png');
    this.load.image('vehicle_car_ferrari', 'assets/vehicles/car_red_ferrari.png');
    this.load.image('vehicle_car_suv', 'assets/vehicles/car_blue_suv.png');

    // 1b. Load Stumbling Blocks / Obstacles (Authentic PNG artwork) - high priority
    this.load.image('obs_brokenDrain', 'assets/obstacles/broken_drain.png');
    this.load.image('obs_potholeWater', 'assets/obstacles/pothole_water.png');
    this.load.image('obs_potholeSmall', 'assets/obstacles/pothole_small.png');
    this.load.image('obs_openManhole', 'assets/obstacles/open_manhole.png');

    // 2. Load Player Sprite Frames for DA, ANC, PA
    const parties: Array<'da' | 'anc' | 'pa'> = ['da', 'anc', 'pa'];
    parties.forEach(p => {
      this.load.image(`player_${p}_idle`, `assets/players/${p}/${p}_idle.png`);
      const count = PARTY_RUN_FRAME_COUNTS[p] || RUN_FRAME_COUNT;
      for (let i = 0; i < count; i++) {
        this.load.image(`player_${p}_run_${i}`, `assets/players/${p}/${p}_run_${i}.png`);
      }
      this.load.image(`player_${p}_jump`, `assets/players/${p}/${p}_jump.png`);
      this.load.image(`player_${p}_hit`, `assets/players/${p}/${p}_hit.png`);
      this.load.image(`player_${p}_talk`, `assets/players/${p}/${p}_talk.png`);
    });

    // 3. Load Residents 1 through 17 (Idle, Happy, Doubtful, Frustrated)
    for (let i = 1; i <= 17; i++) {
      this.load.image(`resident_${i}`, `assets/residents/idle/resident_${i}.png`);
      this.load.image(`resident_${i}_happy`, `assets/residents/happy/resident_${i}_happy.png`);
      this.load.image(`resident_${i}_doubtful`, `assets/residents/doubtful/resident_${i}_doubtful.png`);
      this.load.image(`resident_${i}_frustrated`, `assets/residents/frustrated/resident_${i}_frustrated.png`);
    }

    // 4. Load Minibus Taxi Spritesheet for Cape Town / Hanover Park
    this.load.spritesheet('vehicle_taxi_minibus', 'assets/vehicles/taxi_minibus.png', {
      frameWidth: 380,
      frameHeight: 230
    });

    // Anti-Freeze Watchdog Timer: Safety net in case of network stall (15 seconds)
    const watchdogTimer = setTimeout(() => {
      if (!this.hasAdvanced) {
        console.warn('[PreloadScene] Watchdog timer triggered - advancing to MainMenuScene');
        this.advanceToMainMenu();
      }
    }, 15000);

    this.load.on('loaderror', (file: any) => {
      console.error('[PreloadScene] Asset failed to load:', file?.key, file?.src);
    });

    this.load.once('complete', () => {
      clearTimeout(watchdogTimer);
      this.advanceToMainMenu();
    });

    // Tap or Click to skip loading screen immediately
    this.input.once('pointerdown', () => {
      clearTimeout(watchdogTimer);
      this.advanceToMainMenu();
    });
  }

  private hasAdvanced: boolean = false;

  public create() {
    this.advanceToMainMenu();
  }

  private advanceToMainMenu() {
    if (this.hasAdvanced) return;
    this.hasAdvanced = true;

    // Generate fallback textures only for items without PNGs (obstacles, UI icons, etc.)
    try {
      PlaceholderGenerator.generateAll(this);
    } catch (e) {
      console.warn('[PreloadScene] PlaceholderGenerator warning:', e);
    }

    // Register Minibus Taxi Animation safely
    if (this.textures.exists('vehicle_taxi_minibus') && !this.anims.exists('taxi_minibus_anim')) {
      try {
        this.anims.create({
          key: 'taxi_minibus_anim',
          frames: this.anims.generateFrameNumbers('vehicle_taxi_minibus', { start: 0, end: 50 }),
          frameRate: 16,
          repeat: -1
        });
      } catch (err) {
        console.warn('[PreloadScene] taxi_minibus_anim warning:', err);
      }
    }

    try {
      this.scene.start('MainMenuScene');
    } catch (err) {
      console.error('[PreloadScene] Error starting MainMenuScene:', err);
    }
  }
}
