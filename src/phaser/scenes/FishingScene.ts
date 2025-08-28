// src/phaser/scenes/FishingScene.ts

import Phaser from "phaser";
import { RockManager } from "../managers/RockManager";
import { WaterManager } from "../managers/WaterManager";
import { HookManager } from "../managers/HookManager";
import { UIManager } from "../managers/UIManager";
import { getCurrentAreaSettings, getCurrentRockSettings, AreaSettings } from "../config/AreaSettings";
import { GAME_CONSTANTS } from "../config/GameConstants";
import { FishManager } from "../managers/FishManager";
import { FishAreaSettings } from "../config/FishSettings";
import boatSpriteUrl from '../../assets/sprites/max-idle.png';
import codSwimmingSpriteUrl from '../../assets/sprites/cod-swimming.png';
import { phaserReduxBridge } from '../../store/phaserBridge';

interface CaughtFish {
  species: string
  weight: number
  value: number
  totalValue: number
  id: string
}

export default class FishingScene extends Phaser.Scene {
  private rockManager!: RockManager;
  private waterManager!: WaterManager;
  private hookManager!: HookManager;
  private uiManager!: UIManager;
  private fishManager!: FishManager;
  private bucketWeight = 0;

  private totalFishCaught = 0;
  private totalValue = 0;
  private caughtFish: CaughtFish[] = [];
  private eventListenersSet = false;

  constructor() {
    super("FishingScene");
  }

  preload(): void {
    this.load.spritesheet("boat_idle", boatSpriteUrl, {
      frameWidth: 128,
      frameHeight: 128,
    });
    
    this.load.spritesheet("cod_swimming", codSwimmingSpriteUrl, {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create(): void {
    this.resetScene();
    this.createAnimations();
    this.initializeManagers();
    this.setupCamera();
    this.generateInitialRocks();
    this.setupEventListeners();
    
    // Add return to village button
    this.createReturnButton();
  }

  private resetScene(): void {
    this.tweens.killAll();

    if (this.textures.exists("waterGradient")) {
      this.textures.remove("waterGradient");
    }

    this.cameras.main.stopFollow();
    this.cameras.main.scrollX = 0;
    this.cameras.main.scrollY = 0;

    this.totalFishCaught = 0;
    this.totalValue = 0;
    this.bucketWeight = 0;
    this.caughtFish = [];
    this.eventListenersSet = false;
    
    // Reset hook manager bucket weight
    if (this.hookManager) {
      this.hookManager.updateBucketWeight(0);
    }
  }

  private createReturnButton(): void {
    const returnBtn = this.add.text(700, 50, '🏠 Village', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#4A90E2',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(100)

    returnBtn.on('pointerover', () => {
      returnBtn.setBackgroundColor('#5BA0F2')
    })
    
    returnBtn.on('pointerout', () => {
      returnBtn.setBackgroundColor('#4A90E2')
    })
    
    returnBtn.on('pointerdown', () => {
      this.returnToVillage()
    })
  }

  private returnToVillage(): void {
    // Pass fishing results data to Redux store
    if (this.caughtFish.length > 0) {
      phaserReduxBridge.setFishingResults({
        fishCaught: this.totalFishCaught,
        totalValue: this.totalValue,
        caughtFish: this.caughtFish
      })
      console.log('Passing fishing results to Redux:', {
        fishCaught: this.totalFishCaught,
        totalValue: this.totalValue,
        caughtFish: this.caughtFish
      })
    }
    
    // Set current scene in Redux
    phaserReduxBridge.setCurrentScene('VillageScene')
    
    this.scene.start('VillageScene')
  }

  private createAnimations(): void {
    this.anims.create({
      key: "boat-idle",
      frames: this.anims.generateFrameNumbers("boat_idle", {
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: "cod-swimming",
      frames: this.anims.generateFrameNumbers("cod_swimming", {
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }

  private initializeManagers(): void {
    const currentArea = getCurrentAreaSettings();

    this.waterManager = new WaterManager(this, currentArea);
    this.rockManager = new RockManager(this, currentArea);
    this.hookManager = new HookManager(this, currentArea);
    
    // Use fish settings for the current area
    const fishSettings = FishAreaSettings[currentArea.id as keyof typeof FishAreaSettings];
    if (fishSettings) {
      this.fishManager = new FishManager(this, fishSettings);
    } else {
      console.warn('No fish settings found for area:', currentArea.id, '- using SHALLOW_WATERS as fallback');
      this.fishManager = new FishManager(this, FishAreaSettings.SHALLOW_WATERS);
    }
    
    this.fishManager.setHookManager(this.hookManager);
    this.uiManager = new UIManager(this);
  }

  private setupCamera(): void {
    // Center the camera to show the full game world (100-700 on X axis)
    // Game world is 600px wide, camera is 800px wide, so center at 400
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.setFollowOffset(0, 0);
    this.cameras.main.setDeadzone(0, 100);
  }

  private setupEventListeners(): void {
    // Only set up event listeners once to prevent duplicates
    if (this.eventListenersSet) {
      return;
    }
    
    // Remove any existing listeners to prevent duplicates
    this.events.off("fishCaught", this.onFishCaught, this);
    this.events.off("bucketFull", this.onBucketFull, this);
    
    // Add the fish caught event listener
    this.events.on("fishCaught", this.onFishCaught, this);
    
    // Add the bucket full event listener
    this.events.on("bucketFull", this.onBucketFull, this);
    
    // Add keyboard shortcut to return to village
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToVillage()
    })
    
    this.eventListenersSet = true;
  }

  private onFishCaught(fishInfo: any): void {
    console.log('Fish caught event triggered:', fishInfo.name);
    
    // Compute integer gold for this fish at catch time
    const fishGold = Math.round(fishInfo.value);
    
    // Add a unique identifier to prevent actual duplicates (UI-only)
    const fishId = `${fishInfo.name}_${Date.now()}_${Math.random()}`;
    
    this.totalFishCaught++;
    this.totalValue += fishGold;
    this.bucketWeight += fishInfo.weight;

    // Update the hook manager's bucket weight
    this.hookManager.updateBucketWeight(this.bucketWeight);

    // Store caught fish data for the results modal (values as integers)
    this.caughtFish.push({
      species: fishInfo.name,
      weight: fishInfo.weight,
      value: fishGold,
      totalValue: fishGold,
      id: fishId
    })

    console.log('Total fish caught:', this.totalFishCaught, 'Total value:', this.totalValue);
    console.log('Caught fish array length:', this.caughtFish.length);

    // Show UI notification (will round internally as well)
    this.uiManager.showFishCaught({ ...fishInfo, value: fishGold });
  }

  private onBucketFull(): void {
    this.showBucketFullNotification();
  }

  private showBucketFullNotification(): void {
    // Create a notification that the bucket is full
    const notification = this.add.text(400, 250, 'Bucket is Full!', {
      fontSize: '24px',
      color: '#FF0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    const message = this.add.text(400, 290, 'Return to Frostbite Bay to sell your fish!', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    // Auto-hide the notification after 4 seconds
    this.time.delayedCall(4000, () => {
      notification.destroy();
      message.destroy();
    });
  }

  private generateInitialRocks(): void {
    this.rockManager.generateRocks(
      GAME_CONSTANTS.WATER_LEVEL,
      GAME_CONSTANTS.WATER_LEVEL + 1200
    );
    
    // Start fish generation from a depth where fish can actually spawn
    // Fish settings start at 10m = 100 pixels, so start from 100 pixels below water level
    const fishStartDepth = GAME_CONSTANTS.WATER_LEVEL + 100;
    this.fishManager.generateFish(
      fishStartDepth,
      GAME_CONSTANTS.WATER_LEVEL + 1200
    );
  }

  update(): void {
    this.hookManager.update();
    
    // Update camera to follow hook Y position while keeping X locked at 0
    const hookY = this.hookManager.getHook().y;
    this.cameras.main.setScroll(0, hookY - this.cameras.main.height / 2);
    
    this.uiManager.updateDepth(this.hookManager.getDepth());
    this.uiManager.updateInstructions(this.hookManager.getState());
    this.uiManager.updateBucket(
      this.bucketWeight,
      GAME_CONSTANTS.BUCKET_MAX_WEIGHT
    );
    this.fishManager.update();

    if (
      this.fishManager.checkGenerationNeeded(
        this.cameras.main.scrollY + this.cameras.main.height
      )
    ) {
      const currentDepth = this.fishManager.getGeneratedDepth();
      // Ensure we generate fish from the current depth to maintain continuous spawning
      this.fishManager.generateFish(currentDepth, currentDepth + 1200);
    }

    if (this.rockManager.checkGenerationNeeded(this.cameras.main)) {
      const currentDepth = this.rockManager.getGeneratedDepth();
      this.rockManager.generateRocks(currentDepth, currentDepth + 1200);
    }

    this.rockManager.drawRocks();

    // Update water manager to keep tiles in sync with camera
    this.waterManager.updateDepthFilter(this.hookManager.getDepth());
  }

  setRockSettings(settings: any): void {
    // This method is deprecated - use updateAreaSettings instead
    console.warn('setRockSettings is deprecated. Use updateAreaSettings instead.');
  }

  updateAreaSettings(areaId: string): void {
    const newArea = AreaSettings[areaId];
    
    if (newArea) {
      this.rockManager.updateAreaSettings(newArea);
      this.waterManager.updateAreaSettings(newArea);
      this.hookManager.updateAreaSettings(newArea);
      
      // Update fish manager with new area settings
      const fishSettings = FishAreaSettings[newArea.id as keyof typeof FishAreaSettings];
      if (fishSettings) {
        this.fishManager.updateSettings(fishSettings);
      } else {
        console.warn('No fish settings found for new area:', newArea.id);
      }
      
      // Regenerate rocks and fish with new settings
      this.rockManager.reset();
      this.fishManager.reset();
      this.generateInitialRocks();
    } else {
      console.error(`Area ${areaId} not found`);
    }
  }

  getFishingStats() {
    return {
      fishCaught: this.totalFishCaught,
      totalValue: this.totalValue,
      fishBySpecies: this.fishManager.getFishCountBySpecies(),
    };
  }

  destroy(): void {
    this.events.off("fishCaught", this.onFishCaught, this);
    this.events.off("bucketFull", this.onBucketFull, this);
    this.rockManager?.destroy();
    this.waterManager?.destroy();
    this.hookManager?.destroy();
    this.uiManager?.destroy();
    this.fishManager?.destroy();
  }
}
