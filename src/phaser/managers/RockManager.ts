// src/phaser/managers/RockManager.ts

import Phaser from 'phaser'
import type { RockGenerationSettings, FishingArea } from '../types/GameTypes'
import { GAME_CONSTANTS } from '../config/GameConstants'
import { MathUtils } from '../utils/MathUtils'

export class RockManager {
    private rockGraphics: Phaser.GameObjects.Graphics
    private rockSettings: RockGenerationSettings
    private areaSettings: FishingArea
    private generatedDepth = 0
    private rockPoints: { left: Phaser.Math.Vector2[], right: Phaser.Math.Vector2[] } = {
        left: [],
        right: []
    }

    constructor(scene: Phaser.Scene, areaSettings: FishingArea) {
        this.areaSettings = areaSettings
        this.rockSettings = areaSettings.rockSettings
        this.rockGraphics = scene.add.graphics()
        this.rockGraphics.setDepth(100) // Above depth filter, below UI
    }

    generateRocks(startDepth: number, endDepth: number): void {
        const actualStartDepth = Math.max(startDepth, GAME_CONSTANTS.WATER_LEVEL)

        for (let depth = actualStartDepth; depth < endDepth; depth += GAME_CONSTANTS.SEGMENT_HEIGHT) {
            const depthFromWater = depth - GAME_CONSTANTS.WATER_LEVEL
            const easeFactor = Math.min(1, depthFromWater / GAME_CONSTANTS.EASE_DISTANCE)

            const adjustedMinWidth = this.rockSettings.minWidth * easeFactor
            const adjustedMaxWidth = this.rockSettings.maxWidth * easeFactor

            // Generate left wall
            this.generateWallPoint('left', depth, adjustedMinWidth, adjustedMaxWidth, easeFactor)

            // Generate right wall
            this.generateWallPoint('right', depth, adjustedMinWidth, adjustedMaxWidth, easeFactor)
        }

        this.generatedDepth = Math.max(this.generatedDepth, endDepth)
    }

    private generateWallPoint(side: 'left' | 'right', depth: number, minWidth: number, maxWidth: number, easeFactor: number): void {
        const seedOffset = side === 'left' ? 0 : 1000
        const seed = this.rockSettings.seed + depth * 0.1 + seedOffset
        const noise = MathUtils.seededRandom(seed)
        const width = minWidth + (maxWidth - minWidth) * noise
        const roughness = (MathUtils.seededRandom(seed * 1.5) - 0.5) * this.rockSettings.roughness * 20 * easeFactor

        const x = side === 'left' ? width + roughness : 800 - width - roughness
        this.rockPoints[side].push(new Phaser.Math.Vector2(x, depth))
    }

    drawRocks(): void {
        this.rockGraphics.clear()
        
        // Use area-specific rock colors
        this.rockGraphics.fillStyle(this.areaSettings.rockColor)
        this.rockGraphics.lineStyle(2, this.areaSettings.rockOutlineColor)

        this.drawWall('left')
        this.drawWall('right')
    }

    private drawWall(side: 'left' | 'right'): void {
        const points = this.rockPoints[side].filter(point => point.y >= GAME_CONSTANTS.WATER_LEVEL)
        if (points.length < 2) return

        this.rockGraphics.beginPath()
        const edgeX = side === 'left' ? 0 : 800
        this.rockGraphics.moveTo(edgeX, points[0].y)

        points.forEach(point => this.rockGraphics.lineTo(point.x, point.y))

        const lastPoint = points[points.length - 1]
        this.rockGraphics.lineTo(edgeX, lastPoint.y)
        this.rockGraphics.lineTo(edgeX, points[0].y)

        this.rockGraphics.closePath()
        this.rockGraphics.fillPath()
        this.rockGraphics.strokePath()
    }

    checkGenerationNeeded(camera: Phaser.Cameras.Scene2D.Camera): boolean {
        const cameraBottom = camera.scrollY + camera.height
        const generationBuffer = 600
        return cameraBottom + generationBuffer > this.generatedDepth
    }

    getGeneratedDepth(): number {
        return this.generatedDepth
    }

    updateAreaSettings(areaSettings: FishingArea): void {
        this.areaSettings = areaSettings
        this.rockSettings = areaSettings.rockSettings
        this.redrawRocks()
    }

    private redrawRocks(): void {
        this.drawRocks()
    }

    reset(): void {
        this.generatedDepth = 0
        this.rockPoints = { left: [], right: [] }
        this.rockGraphics.clear()
    }

    destroy(): void {
        this.rockGraphics.destroy()
    }
}