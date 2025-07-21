// src/phaser/config/FishSettings.ts

import type { FishGenerationSettings } from '../types/FishTypes'

export const DEFAULT_FISH_SETTINGS: FishGenerationSettings = {
    density: 2, // 2 fish per 100 pixels of depth
    spawnPadding: 100,
    spawnRules: [] // No default spawn rules
}

export const FishAreaSettings = {
    SHALLOW_WATERS: {
        density: 1,
        spawnRules: [
            {
                speciesId: 'atlantic_cod',
                minDepth: 0,
                maxDepth: 200,
                spawnChance: 0.4
            },
            {
                speciesId: 'haddock',
                minDepth: 100,
                maxDepth: 500,
                spawnChance: 0.3
            },
            {
                speciesId: 'whiting',
                minDepth: 50,
                maxDepth: 300,
                spawnChance: 0.5
            },
            {
                speciesId: 'herring',
                minDepth: 0,
                maxDepth: 150,
                spawnChance: 0.6
            },
            {
                speciesId: 'mackerel',
                minDepth: 20,
                maxDepth: 250,
                spawnChance: 0.3
            },
            {
                speciesId: 'flounder',
                minDepth: 80,
                maxDepth: 400,
                spawnChance: 0.2
            }
        ]
    } as FishGenerationSettings,

    DEEP_CAVERNS: {
        density: 1,
        spawnRules: [
            {
                speciesId: 'pollock',
                minDepth: 300,
                maxDepth: 800,
                spawnChance: 0.4
            },
            {
                speciesId: 'haddock',
                minDepth: 200,
                maxDepth: 700,
                spawnChance: 0.3
            },
            {
                speciesId: 'sole',
                minDepth: 400,
                maxDepth: 900,
                spawnChance: 0.15
            },
            {
                speciesId: 'bass',
                minDepth: 350,
                maxDepth: 800,
                spawnChance: 0.1
            },
            {
                speciesId: 'flounder',
                minDepth: 250,
                maxDepth: 750,
                spawnChance: 0.25
            }
        ]
    } as FishGenerationSettings,

    NARROW_CANYON: {
        density: 1,
        spawnRules: [
            {
                speciesId: 'bass',
                minDepth: 600,
                maxDepth: 1200,
                spawnChance: 0.2
            },
            {
                speciesId: 'tuna',
                minDepth: 800,
                maxDepth: 1500,
                spawnChance: 0.05
            },
            {
                speciesId: 'pollock',
                minDepth: 500,
                maxDepth: 1000,
                spawnChance: 0.3
            },
            {
                speciesId: 'sole',
                minDepth: 700,
                maxDepth: 1300,
                spawnChance: 0.1
            },
            {
                speciesId: 'mackerel',
                minDepth: 600,
                maxDepth: 1100,
                spawnChance: 0.25
            }
        ]
    } as FishGenerationSettings
}