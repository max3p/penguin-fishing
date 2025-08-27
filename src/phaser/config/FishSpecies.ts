// src/phaser/config/FishSpecies.ts

export interface FishSpecies {
    id: string
    name: string
    minSize: number // pixels
    maxSize: number // pixels
    minSpeed: number 
    maxSpeed: number 
    value: number // gold per kg
    color: number // hex color
}

export const FISH_SPECIES: Record<string, FishSpecies> = {
    ATLANTIC_COD: {
        id: 'atlantic_cod',
        name: 'Atlantic Cod',
        minSize: 40,
        maxSize: 80,
        minSpeed: 15,
        maxSpeed: 35,
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
        value: 100,
        color: 0x191970, // Midnight blue
    }
}