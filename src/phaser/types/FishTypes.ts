// src/phaser/types/FishTypes.ts

import type { FishSpecies } from '../config/FishSpecies'

export interface FishData {
    id: string
    species: FishSpecies
    x: number
    y: number
    width: number
    height: number
    speed: number
    direction: number // -1 for left, 1 for right
    spawned: boolean
    actualWeight: number // actual weight of this specific fish instance
    actualValue: number // actual value of this specific fish instance
}

export interface FishSpawnRule {
    speciesId: string
    minDepth: number // in meters
    maxDepth: number // in meters
    spawnChance: number // 0-1, probability this fish will spawn when conditions are met
}

export interface FishGenerationSettings {
    density: number // Fish per 100 pixels of depth
    spawnPadding: number // Padding from screen edges
    spawnRules: FishSpawnRule[] // Which fish spawn at which depths
}