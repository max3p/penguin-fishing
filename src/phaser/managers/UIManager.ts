// src/phaser/managers/UIManager.ts
import Phaser from 'phaser'
import type { HookState } from '../types/GameTypes'

export class UIManager {
    private scene: Phaser.Scene
    private depthText!: Phaser.GameObjects.Text
    private instructionText!: Phaser.GameObjects.Text
    private statsText!: Phaser.GameObjects.Text
    private catchNotification!: Phaser.GameObjects.Container
    private catchNotificationTimer?: Phaser.Time.TimerEvent
    private bucketText!: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.createUI()
        this.createCatchNotification()
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
        ).setOrigin(0.5).setScrollFactor(0).setDepth(100)

        this.depthText = this.scene.add.text(50, 50,
            'Depth: 0m',
            {
                fontSize: '16px',
                color: '#000000',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: { x: 10, y: 5 }
            }
        ).setScrollFactor(0).setDepth(100)

        this.bucketText = this.scene.add.text(50, 80,
            'Bucket: 0.0/10.0kg',
            {
                fontSize: '14px',
                color: '#000000',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: { x: 10, y: 5 }
            }
        ).setScrollFactor(0).setDepth(100)

        const backButton = this.scene.add.text(600, 50, 'Back to Village', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 5 }
        }).setInteractive().setScrollFactor(0).setDepth(100)

        backButton.on('pointerdown', () => {
            this.scene.scene.start('VillageScene')
        })
    }

    private createCatchNotification(): void {
        this.catchNotification = this.scene.add.container(400, 150)
        this.catchNotification.setScrollFactor(0).setDepth(200)

        const notificationBg = this.scene.add.rectangle(0, 0, 300, 80, 0x000000, 0.8)
        notificationBg.setStrokeStyle(2, 0xFFD700)

        const fishIcon = this.scene.add.rectangle(-100, 0, 30, 15, 0x808080)

        const titleText = this.scene.add.text(0, -15, 'Fish Caught!', {
            fontSize: '18px',
            color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        const detailsText = this.scene.add.text(0, 10, '', {
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5)

        this.catchNotification.add([notificationBg, fishIcon, titleText, detailsText])
        this.catchNotification.setVisible(false)
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

    updateStats(fishCaught: number, totalValue: number): void {
        this.statsText.setText(`Fish: ${fishCaught} | Value: ${Math.floor(totalValue)}g`)
    }

    updateBucket(currentWeight: number, maxWeight: number): void {
        const isOverweight = currentWeight > maxWeight
        const color = isOverweight ? '#FF0000' : '#000000'

        this.bucketText.setColor(color)
        this.bucketText.setText(`Bucket: ${currentWeight.toFixed(1)}/${maxWeight.toFixed(1)}kg`)
    }

    showFishCaught(fishInfo: any): void {
        const container = this.catchNotification.list
        const fishIcon = container[1] as Phaser.GameObjects.Rectangle
        const detailsText = container[3] as Phaser.GameObjects.Text

        fishIcon.setFillStyle(fishInfo.species?.color || 0x808080)
        detailsText.setText(`${fishInfo.name}\n${fishInfo.weight.toFixed(1)}kg - ${Math.floor(fishInfo.value)}g`)

        this.catchNotification.setVisible(true)
        this.catchNotification.setAlpha(0)
        this.catchNotification.setScale(0.5)

        this.scene.tweens.add({
            targets: this.catchNotification,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        })

        if (this.catchNotificationTimer) {
            this.catchNotificationTimer.destroy()
        }

        this.catchNotificationTimer = this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: this.catchNotification,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 200,
                ease: 'Power2.easeIn',
                onComplete: () => {
                    this.catchNotification.setVisible(false)
                }
            })
        })
    }

    destroy(): void {
        this.depthText.destroy()
        this.instructionText.destroy()
        this.statsText.destroy()
        this.catchNotification.destroy()
        this.bucketText.destroy()

        if (this.catchNotificationTimer) {
            this.catchNotificationTimer.destroy()
        }
    }
}