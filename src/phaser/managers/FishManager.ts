// src/phaser/managers/FishManager.ts
import Phaser from 'phaser'
import { Fish } from '../entities/Fish'
import type { FishData, FishGenerationSettings } from '../types/FishTypes'
import { DEFAULT_FISH_SETTINGS } from '../config/FishSettings'
import { GAME_CONSTANTS } from '../config/GameConstants'

export class FishManager {
    private scene: Phaser.Scene
    private fish: Map<string, Fish> = new Map()
    private settings: FishGenerationSettings
    private generatedDepth = 0
    private fishIdCounter = 0

    constructor(scene: Phaser.Scene, settings: FishGenerationSettings = DEFAULT_FISH_SETTINGS) {
        this.scene = scene
        this.settings = settings
    }

    // Generate fish for a depth range
    generateFish(startDepth: number, endDepth: number): void {
        const actualStartDepth = startDepth
        const depthRange = endDepth - actualStartDepth

        if (depthRange <= 0) return

        // Calculate number of fish to generate based on density
        const fishCount = Math.floor((depthRange / 100) * this.settings.density)

        for (let i = 0; i < fishCount; i++) {
            this.createRandomFish(actualStartDepth, endDepth)
        }

        this.generatedDepth = Math.max(this.generatedDepth, endDepth)
    }

    private createRandomFish(minDepth: number, maxDepth: number): void {
        const fishData: FishData = {
            id: `fish_${this.fishIdCounter++}`,
            x: this.getRandomSpawnX(),
            y: Phaser.Math.FloatBetween(minDepth, maxDepth),
            width: Phaser.Math.FloatBetween(this.settings.minSize, this.settings.maxSize),
            height: 0, // Will be calculated based on width
            speed: Phaser.Math.FloatBetween(this.settings.minSpeed, this.settings.maxSpeed),
            direction: Math.random() > 0.5 ? 1 : -1,
            spawned: true
        }

        // Calculate height based on width (fish are typically 2:1 or 3:1 ratio)
        fishData.height = fishData.width * Phaser.Math.FloatBetween(0.3, 0.6)

        // Create and store the fish
        const fish = new Fish(this.scene, fishData)
        this.fish.set(fishData.id, fish)
    }

    private getRandomSpawnX(): number {
        // Spawn fish within the same boundaries as rocks (100-700)
        return Phaser.Math.FloatBetween(100, 700)
    }

    update(cameraY: number): void {
        const deltaTime = this.scene.game.loop.delta / 1000

        // Update all fish
        this.fish.forEach((fish, id) => {
            fish.update(deltaTime, cameraY)

            // Check if fish should be despawned
            if (fish.shouldDespawn(cameraY, this.settings.despawnDistance)) {
                fish.destroy()
                this.fish.delete(id)
            }
        })
    }

    // Check if more fish need to be generated
    checkGenerationNeeded(cameraBottom: number): boolean {
        const generationBuffer = 400
        return cameraBottom + generationBuffer > this.generatedDepth
    }

    getGeneratedDepth(): number {
        return this.generatedDepth
    }

    // Get all fish (for collision detection, etc.)
    getAllFish(): Map<string, Fish> {
        return this.fish
    }

    // Get fish count for debugging
    getFishCount(): number {
        return this.fish.size
    }

    // Update fish generation settings
    updateSettings(settings: Partial<FishGenerationSettings>): void {
        this.settings = { ...this.settings, ...settings }
    }

    // Reset fish manager
    reset(): void {
        // Destroy all existing fish
        this.fish.forEach(fish => fish.destroy())
        this.fish.clear()

        // Reset generation tracking
        this.generatedDepth = 0
        this.fishIdCounter = 0
    }

    // Cleanup
    destroy(): void {
        this.reset()
    }
}