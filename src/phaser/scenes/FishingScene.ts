// src/phaser/scenes/FishingScene.ts

import Phaser from "phaser";
import { RockManager } from "../managers/RockManager";
import { WaterManager } from "../managers/WaterManager";
import { HookManager } from "../managers/HookManager";
import { UIManager } from "../managers/UIManager";
import { AreaSettings } from "../config/AreaSettings";
import { GAME_CONSTANTS } from "../config/GameConstants";
import { FishManager } from "../managers/FishManager";
import { FishAreaSettings } from "../config/FishSettings";
import boatSpriteUrl from '../../assets/sprites/max-idle.png';
import codSwimmingSpriteUrl from '../../assets/sprites/cod-swimming.png';

interface CaughtFish {
  species: string
  weight: number
  value: number
  totalValue: number
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
    // Pass fishing results data to the VillageScene via game data
    if (this.caughtFish.length > 0) {
      (this.game as any).fishingResults = {
        fishCaught: this.totalFishCaught,
        totalValue: this.totalValue,
        caughtFish: this.caughtFish
      }
      console.log('Passing fishing results:', (this.game as any).fishingResults)
    }
    
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
    const settings = AreaSettings.SHALLOW_WATERS;

    this.waterManager = new WaterManager(this, settings);
    this.rockManager = new RockManager(this, settings);
    this.hookManager = new HookManager(this);
    this.fishManager = new FishManager(this, FishAreaSettings.SHALLOW_WATERS);
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
    
    // Add the fish caught event listener
    this.events.on("fishCaught", this.onFishCaught, this);
    
    // Add keyboard shortcut to return to village
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToVillage()
    })
    
    this.eventListenersSet = true;
  }

  private onFishCaught(fishInfo: any): void {
    console.log('Fish caught event triggered:', fishInfo.name);
    
    // Check if this fish is already in the caught fish array to prevent duplicates
    const fishAlreadyCaught = this.caughtFish.some(fish => 
      fish.species === fishInfo.name && 
      Math.abs(fish.weight - fishInfo.weight) < 0.1
    );
    
    if (fishAlreadyCaught) {
      console.log('Fish already caught, skipping duplicate:', fishInfo.name);
      return;
    }
    
    this.totalFishCaught++;
    this.totalValue += fishInfo.value;
    this.bucketWeight += fishInfo.weight;

    // Store caught fish data for the results modal
    this.caughtFish.push({
      species: fishInfo.name,
      weight: fishInfo.weight,
      value: fishInfo.value,
      totalValue: fishInfo.value
    })

    console.log('Total fish caught:', this.totalFishCaught, 'Total value:', this.totalValue);
    console.log('Caught fish array length:', this.caughtFish.length);

    this.uiManager.showFishCaught(fishInfo);
  }

  private generateInitialRocks(): void {
    this.rockManager.generateRocks(
      GAME_CONSTANTS.WATER_LEVEL,
      GAME_CONSTANTS.WATER_LEVEL + 1200
    );
    this.fishManager.generateFish(
      GAME_CONSTANTS.WATER_LEVEL,
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
      this.fishManager.generateFish(currentDepth, currentDepth + 1200);
    }

    if (this.rockManager.checkGenerationNeeded(this.cameras.main)) {
      const currentDepth = this.rockManager.getGeneratedDepth();
      this.rockManager.generateRocks(currentDepth, currentDepth + 1200);
    }

    this.rockManager.drawRocks();
  }

  setRockSettings(settings: any): void {
    this.rockManager.updateSettings(settings);
    this.waterManager.updateSettings(settings);
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
    this.rockManager?.destroy();
    this.waterManager?.destroy();
    this.hookManager?.destroy();
    this.uiManager?.destroy();
    this.fishManager?.destroy();
  }
}
