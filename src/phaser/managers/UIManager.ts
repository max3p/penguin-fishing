// src/phaser/managers/UIManager.ts
import Phaser from 'phaser'
import type { HookState } from '../types/GameTypes'

export class UIManager {
    private scene: Phaser.Scene
    private depthText!: Phaser.GameObjects.Text
    private instructionText!: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.createUI()
    }

    private createUI(): void {
        this.instructionText = this.scene.add.text(400, 30,
            'Click to Cast Hook | Click Again to Reel In',
            {
                fontSize: '14px',
                color: '#000000',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setScrollFactor(0)

        this.depthText = this.scene.add.text(50, 50,
            'Depth: 0m',
            {
                fontSize: '16px',
                color: '#000000',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: { x: 10, y: 5 }
            }
        ).setScrollFactor(0)

        const backButton = this.scene.add.text(650, 50, 'Back to Village', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 5 }
        }).setInteractive().setScrollFactor(0)

        backButton.on('pointerdown', () => {
            this.scene.scene.start('VillageScene')
        })
    }

    updateDepth(depth: number): void {
        const depthMeters = Math.floor(depth / 10)
        this.depthText.setText(`Depth: ${depthMeters}m`)
    }

    updateInstructions(state: HookState): void {
        const instructions = {
            ready: 'Click to Cast Hook',
            casting: 'Casting...',
            falling: 'Move Mouse to Guide Hook | Click to Reel In',
            reeling: 'Reeling In...'
        }
        this.instructionText.setText(instructions[state])
    }

    destroy(): void {
        this.depthText.destroy()
        this.instructionText.destroy()
    }
}