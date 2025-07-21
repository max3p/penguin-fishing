// src/phaser/config/FishSpecies.ts

export interface FishSpecies {
    id: string
    name: string
    minSize: number
    maxSize: number
    minSpeed: number
    maxSpeed: number
    weight: number // base weight in kg
    value: number // base value in gold
    color: number // hex color for rendering
}

export const FISH_SPECIES: Record<string, FishSpecies> = {
    ATLANTIC_COD: {
        id: 'atlantic_cod',
        name: 'Atlantic Cod',
        minSize: 40,
        maxSize: 80,
        minSpeed: 15,
        maxSpeed: 35,
        weight: 2.5,
        value: 15,
        color: 0x8B7355, // Brown-grey
    },
    
    HADDOCK: {
        id: 'haddock',
        name: 'Haddock',
        minSize: 30,
        maxSize: 60,
        minSpeed: 20,
        maxSpeed: 40,
        weight: 1.8,
        value: 12,
        color: 0x696969, // Dim grey
    },
    
    POLLOCK: {
        id: 'pollock',
        name: 'Pollock',
        minSize: 35,
        maxSize: 70,
        minSpeed: 25,
        maxSpeed: 50,
        weight: 2.0,
        value: 10,
        color: 0x2F4F4F, // Dark slate grey
    },
    
    WHITING: {
        id: 'whiting',
        name: 'Whiting',
        minSize: 25,
        maxSize: 45,
        minSpeed: 30,
        maxSpeed: 60,
        weight: 1.2,
        value: 8,
        color: 0xF5F5DC, // Beige
    },
    
    MACKEREL: {
        id: 'mackerel',
        name: 'Mackerel',
        minSize: 28,
        maxSize: 50,
        minSpeed: 40,
        maxSpeed: 80,
        weight: 1.5,
        value: 18,
        color: 0x4682B4, // Steel blue
    },
    
    HERRING: {
        id: 'herring',
        name: 'Herring',
        minSize: 20,
        maxSize: 35,
        minSpeed: 35,
        maxSpeed: 70,
        weight: 0.8,
        value: 5,
        color: 0xC0C0C0, // Silver
    },
    
    FLOUNDER: {
        id: 'flounder',
        name: 'Flounder',
        minSize: 30,
        maxSize: 55,
        minSpeed: 10,
        maxSpeed: 25,
        weight: 1.4,
        value: 20,
        color: 0x8B4513, // Saddle brown
    },
    
    SOLE: {
        id: 'sole',
        name: 'Sole',
        minSize: 25,
        maxSize: 40,
        minSpeed: 8,
        maxSpeed: 20,
        weight: 1.0,
        value: 25,
        color: 0xD2691E, // Chocolate
    },
    
    BASS: {
        id: 'bass',
        name: 'Sea Bass',
        minSize: 50,
        maxSize: 100,
        minSpeed: 20,
        maxSpeed: 45,
        weight: 4.0,
        value: 30,
        color: 0x2E8B57, // Sea green
    },
    
    TUNA: {
        id: 'tuna',
        name: 'Bluefin Tuna',
        minSize: 80,
        maxSize: 150,
        minSpeed: 50,
        maxSpeed: 120,
        weight: 25.0,
        value: 100,
        color: 0x191970, // Midnight blue
    }
}