// src/phaser/managers/WaterManager.ts
import Phaser from 'phaser'
import type { RockGenerationSettings } from '../types/GameTypes'
import { GAME_CONSTANTS } from '../config/GameConstants'
import { MathUtils } from '../utils/MathUtils'

export class WaterManager {
    private scene: Phaser.Scene
    private waterSurface: Phaser.GameObjects.Graphics
    private waterBackground: Phaser.GameObjects.Image | null = null
    private skyBackground: Phaser.GameObjects.Rectangle
    private settings: RockGenerationSettings

    constructor(scene: Phaser.Scene, settings: RockGenerationSettings) {
        this.scene = scene
        this.settings = settings
        this.waterSurface = scene.add.graphics()
        this.skyBackground = scene.add.rectangle(400, -500, 800, 1000, 0x87CEEB)
        this.skyBackground.setOrigin(0.5, 1)
        this.skyBackground.y = GAME_CONSTANTS.WATER_LEVEL

        this.createWaterGradient()
    }

    private createWaterGradient(): void {
        if (this.waterBackground) {
            this.waterBackground.destroy()
        }

        if (this.scene.textures.exists('waterGradient')) {
            this.scene.textures.remove('waterGradient')
        }

        const gradientDepthPixels = this.settings.gradientDepth
        const gradientHeight = Math.max(8000, gradientDepthPixels + 2000)

        const canvas = this.scene.textures.createCanvas('waterGradient', 800, gradientHeight)
        if (!canvas) return

        const context = canvas.getContext()
        if (!context) return

        const gradient = context.createLinearGradient(0, 0, 0, gradientDepthPixels)
        const startColor = MathUtils.hexToCSS(this.settings.gradientStartColor)
        const endColor = MathUtils.hexToCSS(this.settings.gradientEndColor)

        gradient.addColorStop(0, startColor)
        gradient.addColorStop(1, endColor)

        context.fillStyle = gradient
        context.fillRect(0, 0, 800, gradientDepthPixels)

        context.fillStyle = endColor
        context.fillRect(0, gradientDepthPixels, 800, gradientHeight - gradientDepthPixels)

        canvas.refresh()

        this.waterBackground = this.scene.add.image(400, GAME_CONSTANTS.WATER_LEVEL, 'waterGradient')
        this.waterBackground.setOrigin(0.5, 0)
    }

    updateSettings(settings: Partial<RockGenerationSettings>): void {
        this.settings = { ...this.settings, ...settings }
        this.createWaterGradient()
    }

    reset(): void {
        this.waterSurface.clear()
        if (this.scene.textures.exists('waterGradient')) {
            this.scene.textures.remove('waterGradient')
        }
    }

    destroy(): void {
        this.waterSurface.destroy()
        if (this.waterBackground) {
            this.waterBackground.destroy()
        }
        this.skyBackground.destroy()
    }
}