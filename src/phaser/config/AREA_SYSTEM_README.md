# Fishing Game Area System

This document describes the comprehensive area system implemented for the penguin fishing game, allowing players to fish in different locations with unique characteristics.

## Overview

The area system provides multiple fishing locations, each with distinct visual styles, gameplay mechanics, and fish populations. Areas are procedurally generated using seeds and have different difficulty levels.

## Available Areas

### 1. Shallow Waters (Easy)
- **Description**: A peaceful coastal area perfect for beginners
- **Characteristics**: Clear waters, gentle currents, wide passages
- **Fish**: Cod, Bass, Mackerel
- **Depth Limit**: 1000m
- **Required Level**: 1

### 2. Deep Caverns (Medium)
- **Description**: Mysterious underwater caves with rare fish
- **Characteristics**: Darker waters, moderate currents, narrow passages
- **Fish**: Tuna, Grouper, Snapper
- **Depth Limit**: 2000m
- **Required Level**: 5

### 3. Narrow Canyon (Hard)
- **Description**: A tight underwater passage with fast currents
- **Characteristics**: Fast currents, very narrow passages, challenging terrain
- **Fish**: Salmon, Trout, Pike
- **Depth Limit**: 1500m
- **Required Level**: 10

### 4. Coral Reef (Medium)
- **Description**: A vibrant tropical reef teeming with colorful fish
- **Characteristics**: Crystal clear waters, warm temperature, colorful rocks
- **Fish**: Parrotfish, Angelfish, Butterflyfish
- **Depth Limit**: 800m
- **Required Level**: 3

### 5. Abyssal Trench (Hard)
- **Description**: The deepest, darkest depths where legendary creatures lurk
- **Characteristics**: Very dark waters, strong currents, extremely narrow passages
- **Fish**: Anglerfish, Viperfish, Dragonfish
- **Depth Limit**: 3000m
- **Required Level**: 15

## Area Characteristics

Each area has the following properties:

### Visual Characteristics
- **Sky Color**: Background color above water
- **Water Color**: Main water color
- **Rock Color**: Color of underwater rock formations
- **Rock Outline Color**: Outline color for rock formations

### Gameplay Characteristics
- **Water Clarity**: Affects visibility and darkness at depth (0-1)
- **Current Strength**: Affects hook drift and fishing difficulty (0-1)
- **Temperature**: Cold, temperate, or warm (affects fish behavior)
- **Fish Density**: How many fish spawn in the area (0-1)
- **Fish Variety**: Types of fish available in the area

### Procedural Generation
- **Seed**: Unique number for consistent terrain generation
- **Rock Settings**: Density, roughness, width ranges, depth limits
- **Difficulty**: Easy, medium, or hard

## How to Test Different Areas

### Method 1: Change the Constant (Recommended for Testing)

1. Open `src/phaser/config/AreaSettings.ts`
2. Find the `CURRENT_TEST_AREA` constant at the top
3. Change it to one of these values:
   - `'SHALLOW_WATERS'`
   - `'DEEP_CAVERNS'`
   - `'NARROW_CANYON'`
   - `'CORAL_REEF'`
   - `'ABYSSAL_TRENCH'`
4. Save the file and refresh the game
5. The new area will be automatically loaded

### Method 2: Use the Console (For Developers)

Open the browser console and use these commands:

```javascript
// Show all available areas
AreaTester.getAllAreasInfo();

// Show current area
AreaTester.showCurrentArea();

// Show areas by difficulty
AreaTester.getAreasByDifficulty('easy');
AreaTester.getAreasByDifficulty('medium');
AreaTester.getAreasByDifficulty('hard');

// Compare two areas
AreaTester.compareAreas('SHALLOW_WATERS', 'ABYSSAL_TRENCH');

// Show switching instructions
AreaTester.showAreaSwitchingInstructions();
```

## Technical Implementation

### File Structure
- `src/phaser/config/AreaSettings.ts` - Main area configurations
- `src/phaser/types/GameTypes.ts` - Type definitions
- `src/phaser/managers/RockManager.ts` - Rock generation using area settings
- `src/phaser/managers/WaterManager.ts` - Water and sky rendering
- `src/phaser/managers/HookManager.ts` - Hook mechanics and depth limits
- `src/phaser/utils/AreaTester.ts` - Testing and debugging utilities

### Key Classes and Interfaces

#### AreaSettings Interface
```typescript
interface AreaSettings {
    id: string;
    name: string;
    description: string;
    skyColor: number;
    waterColor: number;
    rockColor: number;
    rockOutlineColor: number;
    rockSettings: RockGenerationSettings;
    fishDensity: number;
    fishVariety: string[];
    waterClarity: number;
    currentStrength: number;
    temperature: 'cold' | 'temperate' | 'warm';
    seed: number;
    difficulty: 'easy' | 'medium' | 'hard';
    requiredLevel?: number;
    requiredItems?: string[];
}
```

#### RockGenerationSettings Interface
```typescript
interface RockGenerationSettings {
    density: number;
    roughness: number;
    minWidth: number;
    maxWidth: number;
    seed: number;
    gradientStartColor: number;
    depthLimit: number;
}
```

### Manager Updates

All managers now accept `AreaSettings` instead of just rock settings:
- **RockManager**: Uses area-specific rock colors and generation parameters
- **WaterManager**: Uses area-specific sky and water colors, water clarity
- **HookManager**: Uses area-specific depth limits and current strength

## Future Enhancements

### Planned Features
1. **Area Unlocking System**: Players unlock areas by reaching required levels
2. **Area-Specific Fish**: Different fish populations and behaviors per area
3. **Weather Effects**: Dynamic weather that affects fishing conditions
4. **Area Progression**: Story-based area unlocking
5. **Multiplayer Areas**: Shared fishing spots for multiple players

### Technical Improvements
1. **Dynamic Area Switching**: In-game area selection without file editing
2. **Save System**: Remember player's unlocked areas and progress
3. **Performance Optimization**: Lazy loading of area assets
4. **Modding Support**: Easy addition of custom areas

## Troubleshooting

### Common Issues

1. **Area not changing**: Make sure you saved the file and refreshed the browser
2. **Visual glitches**: Check that all area colors are valid hex values
3. **Performance issues**: Some areas (like Abyssal Trench) are more resource-intensive

### Debug Commands

```javascript
// Check current area in console
console.log('Current area:', AreaTester.showCurrentArea());

// Verify area settings are loaded
console.log('Available areas:', Object.keys(AreaSettings));
```

## Contributing

To add a new area:

1. Add rock settings to the `RockSettings` object
2. Add complete area configuration to the `AreaSettings` object
3. Update the `CURRENT_TEST_AREA` constant to test your new area
4. Test thoroughly with different fish types and depths
5. Update this documentation

## License

This area system is part of the penguin fishing game project.
