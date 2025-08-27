// src/phaser/config/AreaSettings.ts

import type { FishingArea, RockGenerationSettings } from "../types/GameTypes"

// ============================================================================
// TESTING: Change this constant to switch between different areas for testing
// ============================================================================
export const CURRENT_TEST_AREA = 'SHALLOW_WATERS' 
// ============================================================================

// Rock generation settings for each area
const RockSettings: Record<string, RockGenerationSettings> = {
    SHALLOW_WATERS: {
        density: 1,
        roughness: 0.1,
        minWidth: 90,
        maxWidth: 110,
        seed: 12345,
        gradientStartColor: 0x4eabc7,
        depthLimit: 1000
    },
    
    DEEP_CAVERNS: {
        density: 4,
        roughness: 0.8,
        minWidth: 40,
        maxWidth: 100,
        seed: 54321,
        gradientStartColor: 0x2E5984,
        depthLimit: 2000
    },
    
    NARROW_CANYON: {
        density: 5,
        roughness: 0.9,
        minWidth: 20,
        maxWidth: 60,
        seed: 99999,
        gradientStartColor: 0x3A5F8A,
        depthLimit: 1500
    },
    
    CORAL_REEF: {
        density: 2,
        roughness: 0.3,
        minWidth: 60,
        maxWidth: 120,
        seed: 77777,
        gradientStartColor: 0x00CED1,
        depthLimit: 800
    },
    
    ABYSSAL_TRENCH: {
        density: 6,
        roughness: 1.0,
        minWidth: 10,
        maxWidth: 50,
        seed: 66666,
        gradientStartColor: 0x191970,
        depthLimit: 3000
    }
}

// Complete area configurations
export const AreaSettings: Record<string, FishingArea> = {
    SHALLOW_WATERS: {
        id: 'SHALLOW_WATERS',
        name: 'Shallow Waters',
        description: 'A peaceful coastal area perfect for beginners. Clear waters and gentle currents.',
        
        // Visual characteristics
        skyColor: 0x87CEEB,
        waterColor: 0x4eabc7,
        rockColor: 0x8B7355,
        rockOutlineColor: 0x654321,
        
        // Rock generation
        rockSettings: RockSettings.SHALLOW_WATERS,
        
        // Fish settings
        fishDensity: 0.8,
        
        // Procedural generation
        seed: 12345
    },
    
    DEEP_CAVERNS: {
        id: 'DEEP_CAVERNS',
        name: 'Deep Caverns',
        description: 'Mysterious underwater caves with rare fish and challenging terrain.',
        
        // Visual characteristics
        skyColor: 0x2F4F4F,
        waterColor: 0x2E5984,
        rockColor: 0x696969,
        rockOutlineColor: 0x2F4F4F,
        
        // Rock generation
        rockSettings: RockSettings.DEEP_CAVERNS,
        
        // Fish settings
        fishDensity: 0.6,
        
        // Procedural generation
        seed: 54321
    },
    
    NARROW_CANYON: {
        id: 'NARROW_CANYON',
        name: 'Narrow Canyon',
        description: 'A tight underwater passage with fast currents and elusive fish.',
        
        // Visual characteristics
        skyColor: 0x4682B4,
        waterColor: 0x3A5F8A,
        rockColor: 0x708090,
        rockOutlineColor: 0x556B6B,
        
        // Rock generation
        rockSettings: RockSettings.NARROW_CANYON,
        
        // Fish settings
        fishDensity: 0.4,
        
        // Procedural generation
        seed: 99999
    },
    
    CORAL_REEF: {
        id: 'CORAL_REEF',
        name: 'Coral Reef',
        description: 'A vibrant tropical reef teeming with colorful fish and exotic species.',
        
        // Visual characteristics
        skyColor: 0x00BFFF,
        waterColor: 0x00CED1,
        rockColor: 0xFF6347,
        rockOutlineColor: 0xDC143C,
        
        // Rock generation
        rockSettings: RockSettings.CORAL_REEF,
        
        // Fish settings
        fishDensity: 1.0,
        
        // Procedural generation
        seed: 77777
    },
    
    ABYSSAL_TRENCH: {
        id: 'ABYSSAL_TRENCH',
        name: 'Abyssal Trench',
        description: 'The deepest, darkest depths where legendary creatures lurk.',
        
        // Visual characteristics
        skyColor: 0x000080,
        waterColor: 0x191970,
        rockColor: 0x000000,
        rockOutlineColor: 0x1C1C1C,
        
        // Rock generation
        rockSettings: RockSettings.ABYSSAL_TRENCH,
        
        // Fish settings
        fishDensity: 0.2,
        
        // Procedural generation
        seed: 66666
    }
}

// Helper function to get current area settings
export function getCurrentAreaSettings(): FishingArea {
    return AreaSettings[CURRENT_TEST_AREA] || AreaSettings.SHALLOW_WATERS
}

// Helper function to get rock settings for current area
export function getCurrentRockSettings(): RockGenerationSettings {
    return getCurrentAreaSettings().rockSettings
}

// Helper function to get all available areas
export function getAvailableAreas(): FishingArea[] {
    return Object.values(AreaSettings)
}