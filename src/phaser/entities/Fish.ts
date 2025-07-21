// src/phaser/entities/Fish.ts

import Phaser from 'phaser'
import type { FishData } from '../types/FishTypes'
import { GAME_CONSTANTS } from '../config/GameConstants'

export class Fish {
    private scene: Phaser.Scene
    private sprite: Phaser.GameObjects.Rectangle
    private data: FishData
    private baseY: number // Original Y position for vertical bobbing

    constructor(scene: Phaser.Scene, fishData: FishData) {
        this.scene = scene
        this.data = fishData
        this.baseY = fishData.y

        // Create fish sprite (grey rectangle for now)
        this.sprite = scene.add.rectangle(
            fishData.x,
            fishData.y,
            fishData.width,
            fishData.height,
            0x808080
        )
        this.sprite.setOrigin(0.5)
    }

    update(deltaTime: number, cameraY: number): void {
        // Move horizontally
        this.data.x += this.data.speed * this.data.direction * deltaTime

        // Add subtle vertical bobbing motion
        const time = this.scene.time.now * 0.001
        const bobAmplitude = 2
        const bobFrequency = 0.5 + (this.data.speed / 100)
        const bobOffset = Math.sin(time * bobFrequency + this.data.id.charCodeAt(0)) * bobAmplitude

        this.data.y = this.baseY + bobOffset

        // Update sprite position
        this.sprite.setPosition(this.data.x, this.data.y)

        // Reverse direction when hitting rock boundaries (same as rocks: 100-700)
        if (this.data.direction > 0 && this.data.x > 700) {
            this.data.direction = -1
        } else if (this.data.direction < 0 && this.data.x < 100) {
            this.data.direction = 1
        }
    }

    // Check if fish should be despawned (too far from camera)
    shouldDespawn(cameraY: number, despawnDistance: number): boolean {
        const cameraTop = cameraY - despawnDistance
        const cameraBottom = cameraY + 600 + despawnDistance

        return this.data.y < cameraTop || this.data.y > cameraBottom
    }

    // Get collision bounds for future fish catching
    getBounds(): Phaser.Geom.Rectangle {
        return this.sprite.getBounds()
    }

    // Get fish data
    getData(): FishData {
        return this.data
    }

    // Get sprite for advanced operations
    getSprite(): Phaser.GameObjects.Rectangle {
        return this.sprite
    }

    // Destroy the fish
    destroy(): void {
        this.sprite.destroy()
    }
}