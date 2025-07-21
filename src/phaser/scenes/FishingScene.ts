// src/phaser/scenes/FishingScene.ts

import Phaser from 'phaser'
import { RockManager } from '../managers/RockManager'
import { WaterManager } from '../managers/WaterManager'
import { HookManager } from '../managers/HookManager'
import { UIManager } from '../managers/UIManager'
import { AreaSettings } from '../config/AreaSettings'
import { GAME_CONSTANTS } from '../config/GameConstants'
import { FishManager } from '../managers/FishManager'
import { FishAreaSettings } from '../config/FishSettings'

export default class FishingScene extends Phaser.Scene {
  private rockManager!: RockManager
  private waterManager!: WaterManager
  private hookManager!: HookManager
  private uiManager!: UIManager
  private fishManager!: FishManager

  constructor() {
    super('FishingScene')
  }

  create(): void {
    this.resetScene()
    this.initializeManagers()
    this.setupCamera()
    this.generateInitialRocks()
  }

  private resetScene(): void {
    this.tweens.killAll()

    if (this.textures.exists('waterGradient')) {
      this.textures.remove('waterGradient')
    }

    this.cameras.main.stopFollow()
    this.cameras.main.scrollX = 0
    this.cameras.main.scrollY = 0
  }

  private initializeManagers(): void {
    const settings = AreaSettings.SHALLOW_WATERS

    this.waterManager = new WaterManager(this, settings)
    this.rockManager = new RockManager(this, settings)
    this.hookManager = new HookManager(this)
    this.fishManager = new FishManager(this, FishAreaSettings.SHALLOW_WATERS)
    this.uiManager = new UIManager(this)
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(this.hookManager.getHook(), false, 0, 0.1)
    this.cameras.main.setDeadzone(0, 100)
  }

  private generateInitialRocks(): void {
    this.rockManager.generateRocks(GAME_CONSTANTS.WATER_LEVEL, GAME_CONSTANTS.WATER_LEVEL + 1200)
    this.fishManager.generateFish(GAME_CONSTANTS.WATER_LEVEL, GAME_CONSTANTS.WATER_LEVEL + 1200)
  }

  update(): void {
    this.hookManager.update()
    this.uiManager.updateDepth(this.hookManager.getDepth())
    this.uiManager.updateInstructions(this.hookManager.getState())
    this.fishManager.update(this.cameras.main.scrollY)

    if (this.fishManager.checkGenerationNeeded(this.cameras.main.scrollY + this.cameras.main.height)) {
      const currentDepth = this.fishManager.getGeneratedDepth()
      this.fishManager.generateFish(currentDepth, currentDepth + 1200)
    }

    if (this.rockManager.checkGenerationNeeded(this.cameras.main)) {
      const currentDepth = this.rockManager.getGeneratedDepth()
      this.rockManager.generateRocks(currentDepth, currentDepth + 1200)
    }

    this.rockManager.drawRocks()
  }

  setRockSettings(settings: any): void {
    this.rockManager.updateSettings(settings)
    this.waterManager.updateSettings(settings)
  }

  destroy(): void {
    this.rockManager?.destroy()
    this.waterManager?.destroy()
    this.hookManager?.destroy()
    this.uiManager?.destroy()
    this.fishManager?.destroy()
  }
}