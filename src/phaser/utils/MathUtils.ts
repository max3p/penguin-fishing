// src/phaser/utils/MathUtils.ts

export class MathUtils {
    static seededRandom(seed: number): number {
        const x = Math.sin(seed) * 10000
        return x - Math.floor(x)
    }

    static hexToCSS(hex: number): string {
        return `#${hex.toString(16).padStart(6, '0')}`
    }
}