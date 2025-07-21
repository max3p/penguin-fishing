// src/phaser/types/FishTypes.ts

export interface FishData {
    id: string
    x: number
    y: number
    width: number
    height: number
    speed: number
    direction: number // -1 for left, 1 for right
    spawned: boolean
}

export interface FishGenerationSettings {
    density: number // Fish per 100 pixels of depth
    minSize: number // Minimum fish size
    maxSize: number // Maximum fish size
    minSpeed: number // Minimum swimming speed
    maxSpeed: number // Maximum swimming speed
    spawnPadding: number // Padding from screen edges
    despawnDistance: number // How far off-screen before despawning
}