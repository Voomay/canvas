import Phaser from 'phaser';
import { getDynamicRoadY } from '../config/constants';

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private skyImage: Phaser.GameObjects.Image;
  private cloudsTile: Phaser.GameObjects.TileSprite;
  private housesTile: Phaser.GameObjects.TileSprite;
  private roadTile: Phaser.GameObjects.TileSprite;
  private sandyVerge?: Phaser.GameObjects.Graphics;
  private streetlights: Phaser.GameObjects.Sprite[] = [];
  private curbBanners: Phaser.GameObjects.Sprite[] = [];
  private totalBannersSpawned: number = 0;

  private isPanorama700: boolean = false;
  private panoramaScale: number = 1;

  constructor(scene: Phaser.Scene, locationKey: string = 'capetown') {
    this.scene = scene;

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const isPortrait = height > width;

    // 1. Fixed Sky Gradient
    this.skyImage = scene.add.image(0, 0, 'bg_sky').setOrigin(0, 0);
    this.skyImage.setDisplaySize(width, height);
    this.skyImage.setDepth(0);

    // 2. Select Location Artwork (Cape Town / Hanover Park vs Camps Bay vs Khayelitsha vs Mitchells Plain vs Joburg)
    let selectedLocationTexture = 'bg_location_capetown';
    if ((locationKey === 'campsbay' || locationKey === 'camps_bay') && scene.textures.exists('bg_location_campsbay')) {
      selectedLocationTexture = 'bg_location_campsbay';
    } else if (locationKey === 'khayelitsha' && scene.textures.exists('bg_location_khayelitsha')) {
      selectedLocationTexture = 'bg_location_khayelitsha';
    } else if (locationKey === 'mitchells_plain' && scene.textures.exists('bg_location_mitchells_plain')) {
      selectedLocationTexture = 'bg_location_mitchells_plain';
    } else if (locationKey === 'joburg' && scene.textures.exists('bg_location_joburg')) {
      selectedLocationTexture = 'bg_location_joburg';
    } else if (scene.textures.exists('bg_location_hanover_park')) {
      selectedLocationTexture = 'bg_location_hanover_park';
    } else if (scene.textures.exists('bg_location_capetown')) {
      selectedLocationTexture = 'bg_location_capetown';
    } else if (scene.textures.exists('real_bg_houses')) {
      selectedLocationTexture = 'real_bg_houses';
    } else {
      selectedLocationTexture = 'bg_houses';
    }

    // 3. Road & Panorama positioning
    const roadY = getDynamicRoadY(height, width);
    const roadScale = isPortrait ? (height - roadY) / 292 : 1;
    const roadHeight = isPortrait ? (height - roadY + 8) : 292;

    // Detect if high-res panoramic image (740-750px tall)
    const tex = scene.textures.get(selectedLocationTexture);
    const srcImg = tex && tex.getSourceImage() ? tex.getSourceImage() : null;
    const texHeight = (srcImg && (srcImg as any).height) ? (srcImg as any).height : 743;
    this.isPanorama700 = texHeight >= 600;

    const isCustomLocation = selectedLocationTexture.startsWith('bg_location_');

    if (this.isPanorama700) {
      // Scale so panorama curb line (y ≈ 670) aligns seamlessly with roadY
      this.panoramaScale = (roadY + 16) / 670;
      this.housesTile = scene.add.tileSprite(0, 0, width, roadY + 24, selectedLocationTexture).setOrigin(0, 0);
      this.housesTile.tileScaleX = this.panoramaScale;
      this.housesTile.tileScaleY = this.panoramaScale;
    } else {
      const locHeight = isCustomLocation ? 432 : 260;
      const locY = isPortrait ? roadY - locHeight + 28 : (isCustomLocation ? 0 : 170);
      this.housesTile = scene.add.tileSprite(0, locY, width, locHeight, selectedLocationTexture).setOrigin(0, 0);
    }
    this.housesTile.setDepth(1);

    // 4. Clouds Layer in the Sky (TileSprite)
    let cloudKey = 'bg_clouds_sky';
    if (scene.textures.exists('bg_clouds_sky')) {
      cloudKey = 'bg_clouds_sky';
    } else if (scene.textures.exists('real_bg_clouds')) {
      cloudKey = 'real_bg_clouds';
    } else {
      cloudKey = 'bg_clouds';
    }

    // Bring clouds lower down so they are beautifully visible across the blue sky below the top HUD badges
    const cloudY = isPortrait ? 90 : (isCustomLocation ? 15 : 30);
    const cloudHeight = isPortrait ? 130 : (isCustomLocation ? 120 : 200);

    this.cloudsTile = scene.add.tileSprite(0, cloudY, width, cloudHeight, cloudKey).setOrigin(0, 0);
    this.cloudsTile.setDepth(2);

    // 5. Streetlights (Only spawn if custom artwork does not already feature poles/lamps)
    if (!isCustomLocation && !scene.textures.exists('real_bg_houses')) {
      this.spawnInitialStreetlights(width);
    }

    // 6. Road & Pavement Layer (TileSprite in foreground where candidate runs)
    const roadKey = scene.textures.exists('real_bg_road') ? 'real_bg_road' : 'bg_road';
    this.roadTile = scene.add.tileSprite(0, roadY, width, roadHeight, roadKey).setOrigin(0, 0);
    this.roadTile.tileScaleX = roadScale;
    this.roadTile.tileScaleY = roadScale;
    this.roadTile.setDepth(3);

    // 7. Curbside Election Banners on the sidewalk curb
    this.spawnInitialCurbBanners(width, locationKey);

    // 8. Sandy Roadside Verge with grass tufts at the very bottom (as in sample screenshot)
    this.drawSandyVerge(width, height, isPortrait);
  }

  private getPavementY(): number {
    const isPortrait = this.scene.scale.height > this.scene.scale.width;
    const roadY = getDynamicRoadY(this.scene.scale.height, this.scene.scale.width);
    const roadScale = isPortrait ? (this.scene.scale.height - roadY) / 292 : 1;
    // Base placed on top of the pavement surface (well above curb lip and asphalt road)
    return roadY + 16 * roadScale;
  }

  private spawnInitialCurbBanners(width: number, _locationKey: string) {
    const bannerKey = this.scene.textures.exists('prop_curb_banner_parties') ? 'prop_curb_banner_parties' : (this.scene.textures.exists('prop_curb_banner_pa') ? 'prop_curb_banner_pa' : null);
    if (!bannerKey) return;
    const isPortrait = this.scene.scale.height > this.scene.scale.width;
    
    // Spawn initial multi-party lampposts on the sidewalk curb
    if (isPortrait) {
      this.createCurbBanner(width * 0.75, bannerKey);
    } else {
      this.createCurbBanner(width * 0.42, bannerKey);
      this.createCurbBanner(width * 0.88, bannerKey);
    }
  }

  private createCurbBanner(x: number, key: string = 'prop_curb_banner_parties'): Phaser.GameObjects.Sprite | null {
    const bannerKey = this.scene.textures.exists(key) ? key : (this.scene.textures.exists('prop_curb_banner_pa') ? 'prop_curb_banner_pa' : null);
    if (!bannerKey) return null;
    const pavementY = this.getPavementY();
    const banner = this.scene.add.sprite(x, pavementY, bannerKey);
    banner.setOrigin(0.5, 1);
    banner.setDisplaySize(72, 288);
    banner.setDepth(4); // Behind residents (6) & player (7), on top of pavement (3)

    // Gentle breeze sway
    this.scene.tweens.add({
      targets: banner,
      angle: { from: -0.8, to: 0.8 },
      duration: Phaser.Math.Between(2000, 2600),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.totalBannersSpawned++;
    this.curbBanners.push(banner);
    return banner;
  }

  private drawSandyVerge(width: number, height: number, isPortrait: boolean) {
    if (this.sandyVerge) {
      this.sandyVerge.destroy();
    }

    this.sandyVerge = this.scene.add.graphics();
    this.sandyVerge.setDepth(4);

    const vergeHeight = isPortrait ? 38 : 36;
    const vergeY = height - vergeHeight;

    // Sandy soil base
    this.sandyVerge.fillStyle(0x8a6a3b, 1);
    this.sandyVerge.fillRect(0, vergeY, width, vergeHeight);

    // Top curb lip / gravel line
    this.sandyVerge.lineStyle(2, 0x5a4524, 1);
    this.sandyVerge.lineBetween(0, vergeY, width, vergeY);

    // Subtle grass tufts along roadside
    const seedStep = isPortrait ? 60 : 90;
    for (let x = 15; x < width; x += seedStep) {
      // Grass blades
      this.sandyVerge.lineStyle(3, 0x4a7c29, 0.9);
      this.sandyVerge.lineBetween(x, vergeY + 6, x - 4, vergeY - 8);
      this.sandyVerge.lineBetween(x, vergeY + 6, x + 2, vergeY - 10);
      this.sandyVerge.lineBetween(x, vergeY + 6, x + 7, vergeY - 6);

      // Small roadside pebble
      this.sandyVerge.fillStyle(0x4a3c28, 0.8);
      this.sandyVerge.fillCircle(x + 24, vergeY + 12, 3);
    }
  }

  private spawnInitialStreetlights(width: number) {
    for (let x = 200; x < width + 200; x += 380) {
      this.createStreetlight(x);
    }
  }

  private createStreetlight(x: number) {
    const lamp = this.scene.add.sprite(x, 430, 'obj_streetlight');
    lamp.setOrigin(0.5, 1);
    lamp.setDepth(4);
    this.streetlights.push(lamp);
  }

  public resize(width: number, height?: number) {
    const h = height ?? this.scene.scale.height;
    const isPortrait = h > width;
    const roadY = getDynamicRoadY(h, width);
    const roadScale = isPortrait ? (h - roadY) / 292 : 1;
    const roadHeight = isPortrait ? (h - roadY + 8) : 292;

    this.skyImage.setDisplaySize(width, h);
    this.cloudsTile.setSize(width, this.cloudsTile.height);
    if (this.isPanorama700) {
      this.panoramaScale = (roadY + 16) / 670;
      this.housesTile.setSize(width, roadY + 24);
      this.housesTile.y = 0;
      this.housesTile.tileScaleX = this.panoramaScale;
      this.housesTile.tileScaleY = this.panoramaScale;
    } else {
      this.housesTile.setSize(width, this.housesTile.height);
      this.housesTile.y = isPortrait ? roadY - this.housesTile.height + 28 : 0;
    }
    this.roadTile.setSize(width, roadHeight);
    this.roadTile.y = roadY;
    this.roadTile.tileScaleX = roadScale;
    this.roadTile.tileScaleY = roadScale;

    const newPavementY = this.getPavementY();
    this.curbBanners.forEach(b => {
      b.y = newPavementY;
    });

    this.drawSandyVerge(width, h, isPortrait);
  }

  public update(speed: number, delta: number) {
    const dt = delta / 1000;
    
    // Natural cloud drift in the blue sky + gentle runner movement parallax
    this.cloudsTile.tilePositionX += (18 + speed * 0.08) * dt;

    // Location artwork moves at ~0.35x runner speed (calibrated with texture scale)
    const panoramaSpeedFactor = this.isPanorama700 ? (speed * 0.35) / Math.max(0.1, this.panoramaScale) : speed * 0.35;
    this.housesTile.tilePositionX += panoramaSpeedFactor * dt;

    // Streetlights (if spawned) move with houses/pavement
    if (this.streetlights.length > 0) {
      const lightMove = (speed * 0.7) * dt;
      for (let i = this.streetlights.length - 1; i >= 0; i--) {
        const lamp = this.streetlights[i];
        lamp.x -= lightMove;
        if (lamp.x < -100) {
          lamp.destroy();
          this.streetlights.splice(i, 1);
        }
      }

      // Spawn new streetlights on the right
      const rightmostX = Math.max(...this.streetlights.map(l => l.x));
      if (rightmostX < this.scene.scale.width) {
        this.createStreetlight(rightmostX + Phaser.Math.Between(340, 420));
      }
    }

    // Curb Banners move with the pavement/road (1.0x runner speed)
    if (this.curbBanners.length > 0) {
      const bannerMove = speed * dt;
      for (let i = this.curbBanners.length - 1; i >= 0; i--) {
        const banner = this.curbBanners[i];
        banner.x -= bannerMove;
        if (banner.x < -120) {
          banner.destroy();
          this.curbBanners.splice(i, 1);
        }
      }

      // Spawn subsequent curb lampposts periodically along the route
      const rightmostX = this.curbBanners.length > 0 ? Math.max(...this.curbBanners.map(b => b.x)) : -999;
      if (rightmostX < this.scene.scale.width + 400) {
        this.createCurbBanner(Math.max(this.scene.scale.width + 100, rightmostX + Phaser.Math.Between(850, 1300)));
      }
    }

    // Road & Pavement moves at full 1.0x runner speed
    this.roadTile.tilePositionX += speed * dt;
  }
}
