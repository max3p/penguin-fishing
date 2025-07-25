// src/phaser/config/AreaSettings.ts

import type { RockGenerationSettings } from "../types/GameTypes"

export const AreaSettings = {
    // Actyally used
    SHALLOW_WATERS: {
        density: 1,
        roughness: 0.1,
        minWidth: 90,
        maxWidth: 110,
        seed: 12345,
        gradientStartColor: 0x4eabc7,
        gradientEndColor: 0x111724,
        gradientDepth: 400
    } as RockGenerationSettings,

    // Just an example
    DEEP_CAVERNS: {
        density: 4,
        roughness: 0.8,
        minWidth: 40,
        maxWidth: 100,
        seed: 54321,
        gradientStartColor: 0x2E5984,
        gradientEndColor: 0x0F1419,
        gradientDepth: 1000
    } as RockGenerationSettings,

    // Just an example
    NARROW_CANYON: {
        density: 5,
        roughness: 0.9,
        minWidth: 20,
        maxWidth: 60,
        seed: 99999,
        gradientStartColor: 0x3A5F8A,
        gradientEndColor: 0x1C2938,
        gradientDepth: 1200
    } as RockGenerationSettings
}