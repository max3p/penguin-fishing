// src/phaser/config/FishSettings.ts

import type { FishGenerationSettings } from '../types/FishTypes'

export const DEFAULT_FISH_SETTINGS: FishGenerationSettings = {
    density: 2, // 2 fish per 100 pixels of depth
    spawnPadding: 100,
    spawnRules: [] // No default spawn rules
}

export const FishAreaSettings = {
    SHALLOW_WATERS: {
        density: 1.2,
        spawnRules: [
            {
                speciesId: 'herring',
                minDepth: 10,
                maxDepth: 200,
                spawnChance: 0.6
            },
            {
                speciesId: 'atlantic_cod',
                minDepth: 20,
                maxDepth: 300,
                spawnChance: 0.4
            },
            {
                speciesId: 'whiting',
                minDepth: 50,
                maxDepth: 400,
                spawnChance: 0.5
            },
            {
                speciesId: 'mackerel',
                minDepth: 30,
                maxDepth: 350,
                spawnChance: 0.3
            },
            {
                speciesId: 'haddock',
                minDepth: 100,
                maxDepth: 500,
                spawnChance: 0.3
            },
            {
                speciesId: 'flounder',
                minDepth: 80,
                maxDepth: 450,
                spawnChance: 0.2
            }
        ]
    } as FishGenerationSettings,

    DEEP_CAVERNS: {
        density: 1.0,
        spawnRules: [
            {
                speciesId: 'herring',
                minDepth: 10,
                maxDepth: 150,
                spawnChance: 0.4
            },
            {
                speciesId: 'mackerel',
                minDepth: 20,
                maxDepth: 200,
                spawnChance: 0.3
            },
            {
                speciesId: 'pollock',
                minDepth: 100,
                maxDepth: 600,
                spawnChance: 0.4
            },
            {
                speciesId: 'haddock',
                minDepth: 150,
                maxDepth: 700,
                spawnChance: 0.3
            },
            {
                speciesId: 'sole',
                minDepth: 200,
                maxDepth: 800,
                spawnChance: 0.25
            },
            {
                speciesId: 'bass',
                minDepth: 300,
                maxDepth: 900,
                spawnChance: 0.2
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
        density: 0.8,
        spawnRules: [
            {
                speciesId: 'herring',
                minDepth: 10,
                maxDepth: 100,
                spawnChance: 0.3
            },
            {
                speciesId: 'mackerel',
                minDepth: 20,
                maxDepth: 150,
                spawnChance: 0.25
            },
            {
                speciesId: 'pollock',
                minDepth: 100,
                maxDepth: 400,
                spawnChance: 0.3
            },
            {
                speciesId: 'bass',
                minDepth: 200,
                maxDepth: 800,
                spawnChance: 0.2
            },
            {
                speciesId: 'sole',
                minDepth: 300,
                maxDepth: 700,
                spawnChance: 0.2
            },
            {
                speciesId: 'tuna',
                minDepth: 500,
                maxDepth: 1200,
                spawnChance: 0.1
            }
        ]
    } as FishGenerationSettings,

    CORAL_REEF: {
        density: 1,
        spawnRules: [
            {
                speciesId: 'mackerel',
                minDepth: 20,
                maxDepth: 200,
                spawnChance: 0.4
            },
            {
                speciesId: 'herring',
                minDepth: 10,
                maxDepth: 150,
                spawnChance: 0.5
            },
            {
                speciesId: 'bass',
                minDepth: 100,
                maxDepth: 400,
                spawnChance: 0.3
            },
            {
                speciesId: 'flounder',
                minDepth: 50,
                maxDepth: 300,
                spawnChance: 0.25
            },
            {
                speciesId: 'whiting',
                minDepth: 30,
                maxDepth: 250,
                spawnChance: 0.35
            }
        ]
    } as FishGenerationSettings,

    ABYSSAL_TRENCH: {
        density: 0.6,
        spawnRules: [
            {
                speciesId: 'herring',
                minDepth: 10,
                maxDepth: 80,
                spawnChance: 0.2
            },
            {
                speciesId: 'mackerel',
                minDepth: 20,
                maxDepth: 120,
                spawnChance: 0.15
            },
            {
                speciesId: 'pollock',
                minDepth: 100,
                maxDepth: 300,
                spawnChance: 0.2
            },
            {
                speciesId: 'haddock',
                minDepth: 200,
                maxDepth: 500,
                spawnChance: 0.25
            },
            {
                speciesId: 'sole',
                minDepth: 300,
                maxDepth: 800,
                spawnChance: 0.2
            },
            {
                speciesId: 'bass',
                minDepth: 400,
                maxDepth: 1200,
                spawnChance: 0.15
            },
            {
                speciesId: 'tuna',
                minDepth: 800,
                maxDepth: 2000,
                spawnChance: 0.1
            }
        ]
    } as FishGenerationSettings
}