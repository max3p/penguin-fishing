// src/phaser/managers/FishManager.ts
import Phaser from 'phaser'
import { Fish } from '../entities/Fish'
import type { FishData, FishGenerationSettings, FishSpawnRule } from '../types/FishTypes'
import { DEFAULT_FISH_SETTINGS } from '../config/FishSettings'
import { FISH_SPECIES } from '../config/FishSpecies'
import type { FishSpecies } from '../config/FishSpecies'
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
        const actualStartDepth = Math.max(startDepth, this.generatedDepth)
        const depthRange = endDepth - actualStartDepth
        console.log(`Generating fish from ${actualStartDepth} to ${endDepth} (depth range: ${depthRange})`)

        if (depthRange <= 0) return

        // Calculate number of fish to generate based on density
        const fishCount = Math.floor((depthRange / 100) * this.settings.density)
        console.log(`Calculated fish count: ${fishCount} for depth range ${depthRange}`)

        for (let i = 0; i < fishCount; i++) {
            this.createRandomFish(actualStartDepth, endDepth)
        }

        this.generatedDepth = Math.max(this.generatedDepth, endDepth)
        console.log(`Updated generated depth to ${this.generatedDepth}`)
    }

    private createRandomFish(minDepth: number, maxDepth: number): void {
        // Convert depth pixels to meters for species selection
        const minDepthMeters = (minDepth - GAME_CONSTANTS.WATER_LEVEL) / 10
        const maxDepthMeters = (maxDepth - GAME_CONSTANTS.WATER_LEVEL) / 10
        
        // Find eligible species for this depth range
        const eligibleSpecies = this.getEligibleSpecies(minDepthMeters, maxDepthMeters)
        
        if (eligibleSpecies.length === 0) {
            return // No fish can spawn in this depth range
        }

        // Select a species based on spawn rules
        const selectedRule = this.selectSpeciesByChance(eligibleSpecies)
        if (!selectedRule) return

        const species = FISH_SPECIES[selectedRule.speciesId.toUpperCase()]
        if (!species) return

        // Generate random depth within both the generation range AND species depth range
        const spawnMinDepth = Math.max(minDepth, GAME_CONSTANTS.WATER_LEVEL + selectedRule.minDepth * 10)
        const spawnMaxDepth = Math.min(maxDepth, GAME_CONSTANTS.WATER_LEVEL + selectedRule.maxDepth * 10)
        
        if (spawnMinDepth >= spawnMaxDepth) return

        // Create fish with species-specific attributes
        const size = Phaser.Math.FloatBetween(species.minSize, species.maxSize)
        const speed = Phaser.Math.FloatBetween(species.minSpeed, species.maxSpeed)
        
        // Add some variation to weight and value based on size
        const sizeMultiplier = size / ((species.minSize + species.maxSize) / 2)
        const weightVariation = Phaser.Math.FloatBetween(0.8, 1.2)
        const valueVariation = Phaser.Math.FloatBetween(0.9, 1.1)

        const fishData: FishData = {
            id: `fish_${this.fishIdCounter++}`,
            species: species,
            x: this.getRandomSpawnX(),
            y: Phaser.Math.FloatBetween(spawnMinDepth, spawnMaxDepth),
            width: size,
            height: size * Phaser.Math.FloatBetween(0.3, 0.6), // Calculate height based on width
            speed: speed,
            direction: Math.random() > 0.5 ? 1 : -1,
            spawned: true,
            actualWeight: species.weight * sizeMultiplier * weightVariation,
            actualValue: species.value * sizeMultiplier * valueVariation
        }

        // Create and store the fish
        const fish = new Fish(this.scene, fishData)
        this.fish.set(fishData.id, fish)

        console.log(`Spawned ${species.name} at (${fishData.x}, ${fishData.y}) with size ${size} and speed ${speed}`)
    }

    private getEligibleSpecies(minDepthMeters: number, maxDepthMeters: number): FishSpawnRule[] {
        return this.settings.spawnRules.filter(rule => {
            // Check if this depth range overlaps with the species' depth range
            return !(maxDepthMeters < rule.minDepth || minDepthMeters > rule.maxDepth)
        })
    }

    private selectSpeciesByChance(eligibleSpecies: FishSpawnRule[]): FishSpawnRule | null {
        // First, check if any species should spawn based on their spawn chance
        for (const rule of eligibleSpecies) {
            if (Math.random() < rule.spawnChance) {
                return rule
            }
        }
        
        // If no species "won" the spawn chance, try a fallback with reduced chances
        const fallbackChance = 0.1 // 10% chance to spawn something anyway
        if (Math.random() < fallbackChance && eligibleSpecies.length > 0) {
            return eligibleSpecies[Math.floor(Math.random() * eligibleSpecies.length)]
        }
        
        return null
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

    // Get fish count by species (for debugging/stats)
    getFishCountBySpecies(): Record<string, number> {
        const counts: Record<string, number> = {}
        this.fish.forEach(fish => {
            const speciesName = fish.getSpecies().name
            counts[speciesName] = (counts[speciesName] || 0) + 1
        })
        return counts
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