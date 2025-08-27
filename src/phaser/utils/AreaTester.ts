// src/phaser/utils/AreaTester.ts

import { AreaSettings, CURRENT_TEST_AREA, getCurrentAreaSettings, getAvailableAreas } from '../config/AreaSettings';

/**
 * Utility class for testing and managing different fishing areas
 */
export class AreaTester {
    
    /**
     * Get information about all available areas
     */
    static getAllAreasInfo(): void {
        console.log('=== Available Fishing Areas ===');
        const areas = getAvailableAreas();
        
        areas.forEach(area => {
            console.log(`\n📍 ${area.name} (${area.id})`);
            console.log(`   Description: ${area.description}`);
            console.log(`   Fish Density: ${(area.fishDensity * 100).toFixed(0)}%`);
            console.log(`   Depth Limit: ${area.rockSettings.depthLimit}m`);
            console.log(`   Seed: ${area.seed}`);
        });
    }
    
    /**
     * Show current area information
     */
    static showCurrentArea(): void {
        const currentArea = getCurrentAreaSettings();
        console.log('\n=== Current Area ===');
        console.log(`📍 ${currentArea.name} (${currentArea.id})`);
        console.log(`   Description: ${currentArea.description}`);
        console.log(`   CURRENT_TEST_AREA constant: ${CURRENT_TEST_AREA}`);
    }
    
    /**
     * Show how to switch areas
     */
    static showAreaSwitchingInstructions(): void {
        console.log('\n=== How to Switch Areas ===');
        console.log('1. Open src/phaser/config/AreaSettings.ts');
        console.log('2. Change the CURRENT_TEST_AREA constant to one of these values:');
        
        Object.keys(AreaSettings).forEach(areaId => {
            const area = AreaSettings[areaId];
            console.log(`   - ${areaId}: ${area.name}`);
        });
        
        console.log('\n3. Save the file and refresh the game');
        console.log('4. The new area will be automatically loaded');
    }
    
    /**
     * Compare two areas side by side
     */
    static compareAreas(areaId1: string, areaId2: string): void {
        const area1 = AreaSettings[areaId1];
        const area2 = AreaSettings[areaId2];
        
        if (!area1 || !area2) {
            console.error('One or both areas not found');
            return;
        }
        
        console.log(`\n=== Comparing ${area1.name} vs ${area2.name} ===`);
        console.log(`Fish Density: ${(area1.fishDensity * 100).toFixed(0)}% vs ${(area2.fishDensity * 100).toFixed(0)}%`);
        console.log(`Depth Limit: ${area1.rockSettings.depthLimit}m vs ${area2.rockSettings.depthLimit}m`);
        console.log(`Seed: ${area1.seed} vs ${area2.seed}`);
    }
}

// Export for use in console
if (typeof window !== 'undefined') {
    (window as any).AreaTester = AreaTester;
}
