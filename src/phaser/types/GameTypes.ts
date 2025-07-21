// src/phaser/types/GameTypes.ts

export interface RockGenerationSettings {
    density: number
    roughness: number
    minWidth: number
    maxWidth: number
    seed: number
    gradientStartColor: number
    gradientEndColor: number
    gradientDepth: number
}

export type HookState = 'ready' | 'casting' | 'falling' | 'reeling'

export interface GameConstants {
    WATER_LEVEL: number
    HOOK_FALL_SPEED: number
    HOOK_MOVE_SPEED: number
    CAST_DURATION: number
    SEGMENT_HEIGHT: number
    EASE_DISTANCE: number
    BUCKET_MAX_WEIGHT: number
}