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
    const roadScale = isPortrait ? (height - roadY) / 352 : 1;
    const roadHeight = isPortrait ? (height - roadY + 8) : 352;

    // Detect if high-res panoramic image (740-750px tall)
    const tex = scene.textures.get(selectedLocationTexture);
    const srcImg = tex && tex.getSourceImage() ? tex.getSourceImage() : null;
    const texHeight = (srcImg && (srcImg as any).height) ? (srcImg as any).height : 743;
    this.isPanorama700 = texHeight >= 600;

    const isCustomLocation = selectedLocationTexture.startsWith('bg_location_');

    if (this.isPanorama700) {
      // For high-res panoramas (~745px high), scale dynamically so ground baseline (texGroundY ≈ 710)
      // aligns seamlessly with the top curb of the road without gaps or repetition
      const targetHeight = roadY + 24;
      const texGroundY = 710;
      this.panoramaScale = isPortrait ? Math.max(0.72, targetHeight / texGroundY) : 0.82;
      this.housesTile = scene.add.tileSprite(0, 0, width, targetHeight, selectedLocationTexture).setOrigin(0, 0);
      this.housesTile.tileScaleX = this.panoramaScale;
      this.housesTile.tileScaleY = this.panoramaScale;

      const neededTexH = targetHeight / this.panoramaScale;
      this.housesTile.tilePositionY = Math.max(0, texGroundY - neededTexH);
    } else if (isCustomLocation) {
      // For Joburg skyline (height 432)
      const targetHeight = roadY + 24;
      const texGroundY = 415;
      this.panoramaScale = isPortrait ? Math.max(0.95, targetHeight / texGroundY) : 1.05;
      this.housesTile = scene.add.tileSprite(0, 0, width, targetHeight, selectedLocationTexture).setOrigin(0, 0);
      this.housesTile.tileScaleX = this.panoramaScale;
      this.housesTile.tileScaleY = this.panoramaScale;

      const neededTexH = targetHeight / this.panoramaScale;
      this.housesTile.tilePositionY = Math.max(0, texGroundY - neededTexH);
    } else {
      const locHeight = Math.min(260, roadY + 24);
      const locY = isPortrait ? roadY - locHeight + 24 : 170;
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

    const cloudY = isPortrait ? 90 : 30;
    const cloudHeight = isPortrait ? 130 : 160;

    this.cloudsTile = scene.add.tileSprite(0, cloudY, width, cloudHeight, cloudKey).setOrigin(0, 0);
    this.cloudsTile.setDepth(2);
    // Hide retro pixel clouds over realistic location panoramas so landmarks are pristine and unobstructed
    this.cloudsTile.setVisible(!this.isPanorama700 && !isCustomLocation);

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
    const roadScale = isPortrait ? (this.scene.scale.height - roadY) / 352 : 1;
    // Base placed on top of the pavement surface (well above curb lip and asphalt road)
    return roadY + 20 * roadScale;
  }

  private spawnInitialCurbBanners(width: number, _locationKey: string) {
    const bannerKey = this.scene.textures.exists('prop_curb_banner_parties') ? 'prop_curb_banner_parties' : (this.scene.textures.exists('prop_curb_banner_pa') ? 'prop_curb_banner_pa' : null);
    if (!bannerKey) return;
    const isPortrait = this.scene.scale.height > this.scene.scale.width;
    const spacing = isPortrait ? 420 : 520;
    
    // Spawn multi-party election lampposts at regular intervals across and ahead of the curb
    const startX = isPortrait ? width * 0.45 : width * 0.55;
    for (let x = startX; x <= width + spacing * 2; x += spacing) {
      this.createCurbBanner(x, bannerKey);
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

  private drawSandyVerge(_width: number, _height: number, _isPortrait: boolean) {
    // New road asset natively includes high-fidelity sandy verge with grass and pebbles along the bottom edge
    if (this.sandyVerge) {
      this.sandyVerge.destroy();
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
    const roadScale = isPortrait ? (h - roadY) / 352 : 1;
    const roadHeight = isPortrait ? (h - roadY + 8) : 352;

    this.skyImage.setDisplaySize(width, h);
    this.cloudsTile.setSize(width, this.cloudsTile.height);
    if (this.isPanorama700) {
      const targetHeight = roadY + 24;
      const texGroundY = 710;
      this.panoramaScale = isPortrait ? Math.max(0.72, targetHeight / texGroundY) : 0.82;
      this.housesTile.setSize(width, targetHeight);
      this.housesTile.y = 0;
      this.housesTile.tileScaleX = this.panoramaScale;
      this.housesTile.tileScaleY = this.panoramaScale;
      const neededTexH = targetHeight / this.panoramaScale;
      this.housesTile.tilePositionY = Math.max(0, texGroundY - neededTexH);
    } else if (this.housesTile.texture.key.startsWith('bg_location_')) {
      const targetHeight = roadY + 24;
      const texGroundY = 415;
      this.panoramaScale = isPortrait ? Math.max(0.95, targetHeight / texGroundY) : 1.05;
      this.housesTile.setSize(width, targetHeight);
      this.housesTile.y = 0;
      this.housesTile.tileScaleX = this.panoramaScale;
      this.housesTile.tileScaleY = this.panoramaScale;
      const neededTexH = targetHeight / this.panoramaScale;
      this.housesTile.tilePositionY = Math.max(0, texGroundY - neededTexH);
    } else {
      const locHeight = Math.min(260, roadY + 24);
      this.housesTile.setSize(width, locHeight);
      this.housesTile.y = isPortrait ? roadY - locHeight + 24 : 0;
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
    const moveDist = speed * dt;
    
    // 1. Natural cloud drift in the blue sky + gentle runner movement parallax
    this.cloudsTile.tilePositionX += (12 + speed * 0.05) * dt;

    // 2. Slower parallax for houses and mountains (~0.25x runner speed)
    const panoramaSpeedFactor = this.isPanorama700 ? (speed * 0.25) / Math.max(0.1, this.panoramaScale) : speed * 0.25;
    this.housesTile.tilePositionX += panoramaSpeedFactor * dt;

    // 3. Road & Pavement scrolling right to left (1.0x foreground runner speed)
    const roadSpeedFactor = speed / Math.max(0.1, this.roadTile.tileScaleX);
    this.roadTile.tilePositionX += roadSpeedFactor * dt;

    // 4. Poles (election banner poles) scroll right to left, wrapping seamlessly
    if (this.curbBanners.length > 0) {
      const isPortrait = this.scene.scale.height > this.scene.scale.width;
      const spacing = isPortrait ? 420 : 520;
      for (const banner of this.curbBanners) {
        banner.x -= moveDist;
      }
      for (const banner of this.curbBanners) {
        if (banner.x < -120) {
          const maxX = Math.max(this.scene.scale.width, ...this.curbBanners.map(b => b.x));
          banner.x = maxX + spacing;
        }
      }
    }

    // 5. Streetlights scroll right to left if active, wrapping seamlessly
    if (this.streetlights.length > 0) {
      for (const lamp of this.streetlights) {
        lamp.x -= moveDist;
      }
      for (const lamp of this.streetlights) {
        if (lamp.x < -120) {
          const maxLampX = Math.max(this.scene.scale.width, ...this.streetlights.map(l => l.x));
          lamp.x = maxLampX + 380;
        }
      }
    }
  }
}
