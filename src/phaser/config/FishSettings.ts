// src/phaser/config/FishSettings.ts

import type { FishGenerationSettings } from '../types/FishTypes'

export const DEFAULT_FISH_SETTINGS: FishGenerationSettings = {
    density: 2, // 2 fish per 100 pixels of depth
    minSize: 30,
    maxSize: 50,
    minSpeed: 20,
    maxSpeed: 80,
    spawnPadding: 100,
    despawnDistance: 200
}

export const FishAreaSettings = {
    SHALLOW_WATERS: {
        density: 2,
        minSize: 30,
        maxSize: 50,
        minSpeed: 15,
        maxSpeed: 60,
        despawnDistance: 200
    } as FishGenerationSettings,

    DEEP_CAVERNS: {
        density: 1.5,
        minSize: 30,
        maxSize: 50,
        minSpeed: 10,
        maxSpeed: 40,
        despawnDistance: 250
    } as FishGenerationSettings,

    NARROW_CANYON: {
        density: 2.5,
        minSize: 30,
        maxSize: 50,
        minSpeed: 25,
        maxSpeed: 100,
        despawnDistance: 180
    } as FishGenerationSettings
}