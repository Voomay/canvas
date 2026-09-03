import Phaser from 'phaser';

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private skyImage: Phaser.GameObjects.Image;
  private cloudsTile: Phaser.GameObjects.TileSprite;
  private housesTile: Phaser.GameObjects.TileSprite;
  private roadTile: Phaser.GameObjects.TileSprite;
  private streetlights: Phaser.GameObjects.Sprite[] = [];

  constructor(scene: Phaser.Scene, locationKey: 'capetown' | 'joburg' = 'capetown') {
    this.scene = scene;

    const width = this.scene.scale.width;

    // 1. Fixed Sky Gradient Fallback
    this.skyImage = scene.add.image(0, 0, 'bg_sky').setOrigin(0, 0);
    this.skyImage.setDisplaySize(width, 720);
    this.skyImage.setDepth(0);

    // 2. Select Location Artwork (Cape Town / Hanover Park vs Johannesburg)
    let selectedLocationTexture = 'bg_location_capetown';
    if (locationKey === 'joburg' && scene.textures.exists('bg_location_joburg')) {
      selectedLocationTexture = 'bg_location_joburg';
    } else if (scene.textures.exists('bg_location_capetown')) {
      selectedLocationTexture = 'bg_location_capetown';
    } else if (scene.textures.exists('real_bg_houses')) {
      selectedLocationTexture = 'real_bg_houses';
    } else {
      selectedLocationTexture = 'bg_houses';
    }

    // 3. Location Panorama Layer (Spans from y=0 down to y=432, meeting the road at y=428)
    const isCustomLocation = selectedLocationTexture.startsWith('bg_location_');
    const locY = isCustomLocation ? 0 : 170;
    const locHeight = isCustomLocation ? 432 : 260;

    this.housesTile = scene.add.tileSprite(0, locY, width, locHeight, selectedLocationTexture).setOrigin(0, 0);
    this.housesTile.setDepth(1);

    // 4. Clouds Layer in the Sky (TileSprite)
    // Sits directly in the open blue sky above the mountain & city skyline
    let cloudKey = 'bg_clouds_sky';
    if (scene.textures.exists('bg_clouds_sky')) {
      cloudKey = 'bg_clouds_sky';
    } else if (scene.textures.exists('real_bg_clouds')) {
      cloudKey = 'real_bg_clouds';
    } else {
      cloudKey = 'bg_clouds';
    }

    const cloudY = isCustomLocation ? 15 : 30;
    const cloudHeight = isCustomLocation ? 120 : 200;

    this.cloudsTile = scene.add.tileSprite(0, cloudY, width, cloudHeight, cloudKey).setOrigin(0, 0);
    this.cloudsTile.setDepth(2);

    // 5. Streetlights (Only spawn if custom artwork does not already feature poles/lamps)
    if (!isCustomLocation && !scene.textures.exists('real_bg_houses')) {
      this.spawnInitialStreetlights(width);
    }

    // 6. Road & Pavement Layer (TileSprite in foreground where candidate runs)
    const roadKey = scene.textures.exists('real_bg_road') ? 'real_bg_road' : 'bg_road';
    this.roadTile = scene.add.tileSprite(0, 428, width, 292, roadKey).setOrigin(0, 0);
    this.roadTile.setDepth(3);
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

  public resize(width: number) {
    this.skyImage.setDisplaySize(width, 720);
    this.cloudsTile.setSize(width, this.cloudsTile.height);
    this.housesTile.setSize(width, this.housesTile.height);
    this.roadTile.setSize(width, 292);
  }

  public update(speed: number, delta: number) {
    const dt = delta / 1000;
    
    // Natural cloud drift in the blue sky + gentle runner movement parallax
    this.cloudsTile.tilePositionX += (18 + speed * 0.08) * dt;

    // Location artwork moves at ~0.35x runner speed
    this.housesTile.tilePositionX += (speed * 0.35) * dt;

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

    // Road & Pavement moves at full 1.0x runner speed
    this.roadTile.tilePositionX += speed * dt;
  }
}
