// src/phaser/managers/WaterManager.ts
import Phaser from 'phaser'
import type { FishingArea } from '../types/GameTypes'
import { GAME_CONSTANTS } from '../config/GameConstants'

export class WaterManager {
    private scene: Phaser.Scene
    private waterSurface: Phaser.GameObjects.Graphics
    private waterBackground: Phaser.GameObjects.Rectangle | null = null
    private depthFilter: Phaser.GameObjects.Rectangle | null = null
    private skyBackground: Phaser.GameObjects.Rectangle
    private areaSettings: FishingArea

    constructor(scene: Phaser.Scene, areaSettings: FishingArea) {
        this.scene = scene
        this.areaSettings = areaSettings
        this.waterSurface = scene.add.graphics()
        this.skyBackground = scene.add.rectangle(400, -500, 800, 1000, areaSettings.skyColor)
        this.skyBackground.setOrigin(0.5, 1)
        this.skyBackground.y = GAME_CONSTANTS.WATER_LEVEL

        this.createWaterBackground()
    }

    private createWaterBackground(): void {
        // Create a simple solid water background that extends far down
        this.waterBackground = this.scene.add.rectangle(400, GAME_CONSTANTS.WATER_LEVEL, 800, 50000, this.areaSettings.waterColor)
        this.waterBackground.setOrigin(0.5, 0)
        this.waterBackground.setDepth(0) // Background layer
        
        // Create a depth filter that gets darker with depth
        this.depthFilter = this.scene.add.rectangle(400, GAME_CONSTANTS.WATER_LEVEL, 800, 50000, 0x000000)
        this.depthFilter.setOrigin(0.5, 0)
        this.depthFilter.setAlpha(0) // Start transparent
        this.depthFilter.setDepth(50) // Above background, below game objects
    }

    // Update the depth filter based on current hook depth
    updateDepthFilter(hookDepth: number): void {
        if (!this.depthFilter) return
        
        // Calculate darkness based on depth
        // At 0m: alpha = 0 (no darkness)
        // At 500m: alpha = 0.9 (90% darkness)
        // Note: hookDepth is in pixels, so 500m = 5000 pixels
        const maxDepthPixels = 5000 // 500 meters in pixels (500 * 10)
        const maxAlpha = 0.9 // maximum darkness (90%)
        
        const depthProgress = Math.min(hookDepth / maxDepthPixels, 1)
        const alpha = depthProgress * maxAlpha
        
        this.depthFilter.setAlpha(alpha)
    }

    updateAreaSettings(areaSettings: FishingArea): void {
        this.areaSettings = areaSettings
        
        // Update sky color
        this.skyBackground.setFillStyle(areaSettings.skyColor)
        
        // Recreate water background with new color
        this.createWaterBackground()
    }

    reset(): void {
        this.waterSurface.clear()
        if (this.waterBackground) {
            this.waterBackground.destroy()
        }
        if (this.depthFilter) {
            this.depthFilter.destroy()
        }
    }

    destroy(): void {
        this.waterSurface.destroy()
        if (this.waterBackground) {
            this.waterBackground.destroy()
        }
        if (this.depthFilter) {
            this.depthFilter.destroy()
        }
        this.skyBackground.destroy()
    }
}