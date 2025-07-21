// src/phaser/managers/HookManager.ts
import Phaser from 'phaser'
import type { HookState } from '../types/GameTypes'
import { GAME_CONSTANTS } from '../config/GameConstants'

export class HookManager {
    private scene: Phaser.Scene
    private hook!: Phaser.GameObjects.Rectangle
    private fishingLine!: Phaser.GameObjects.Graphics
    private boat!: Phaser.GameObjects.Rectangle
    private state: HookState = 'ready'
    private mousePointer: Phaser.Input.Pointer

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.mousePointer = scene.input.activePointer
        this.createGameObjects()
        this.setupInput()
    }

    private createGameObjects(): void {
        this.boat = this.scene.add.rectangle(400, GAME_CONSTANTS.WATER_LEVEL, 200, 40, 0x8B4513)
        this.hook = this.scene.add.rectangle(400, GAME_CONSTANTS.WATER_LEVEL - 30, 8, 8, 0xC0C0C0)
        this.hook.setOrigin(0.5)
        this.fishingLine = this.scene.add.graphics()
    }

    private setupInput(): void {
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.state === 'ready') {
                this.castHook(pointer)
            } else if (this.state === 'falling') {
                this.reelInHook()
            }
        })
    }

    private castHook(pointer: Phaser.Input.Pointer): void {
        this.state = 'casting'

        const targetX = Phaser.Math.Clamp(pointer.worldX, 100, 700)
        const targetY = Math.max(GAME_CONSTANTS.WATER_LEVEL + 50, pointer.worldY)

        const distance = Phaser.Math.Distance.Between(this.hook.x, this.hook.y, targetX, targetY)
        const arcHeight = Math.min(100, distance * 0.3)

        const startX = this.hook.x
        const startY = this.hook.y

        this.scene.tweens.add({
            targets: this.hook,
            x: targetX,
            y: targetY,
            duration: GAME_CONSTANTS.CAST_DURATION,
            ease: 'Power2.easeInOut',
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                const progress = tween.progress
                this.hook.x = startX + (targetX - startX) * progress
                const linearY = startY + (targetY - startY) * progress
                const arcOffset = 4 * arcHeight * progress * (1 - progress)
                this.hook.y = linearY - arcOffset
            },
            onComplete: () => {
                this.state = 'falling'
                this.hook.x = targetX
                this.hook.y = targetY
            }
        })
    }

    private reelInHook(): void {
        this.state = 'reeling'
        this.scene.tweens.killTweensOf(this.hook)

        this.scene.tweens.add({
            targets: this.hook,
            x: this.boat.x,
            y: GAME_CONSTANTS.WATER_LEVEL - 30,
            duration: 800,
            ease: 'Power2.easeInOut',
            onComplete: () => {
                this.state = 'ready'
            }
        })
    }

    update(): void {
        this.updateBoatBobbing()
        this.updateHookMovement()
        this.updateFishingLine()
    }

    private updateBoatBobbing(): void {
        const time = this.scene.time.now * 0.002
        const waveHeight = 3
        const waveLength = 80

        const wave1 = Math.sin((this.boat.x / waveLength) + time) * waveHeight
        const wave2 = Math.sin((this.boat.x / (waveLength * 1.5)) + time * 1.3) * (waveHeight * 0.5)

        this.boat.y = GAME_CONSTANTS.WATER_LEVEL + wave1 + wave2
    }

    private updateHookMovement(): void {
        if (this.state !== 'falling') return

        this.hook.y += GAME_CONSTANTS.HOOK_FALL_SPEED * (this.scene.game.loop.delta / 1000)

        const mouseWorldX = this.scene.cameras.main.getWorldPoint(this.mousePointer.x, this.mousePointer.y).x
        const mouseWorldY = this.scene.cameras.main.getWorldPoint(this.mousePointer.x, this.mousePointer.y).y

        if (mouseWorldY > GAME_CONSTANTS.WATER_LEVEL) {
            const targetX = Phaser.Math.Clamp(mouseWorldX, 100, 700)
            const cameraTop = this.scene.cameras.main.scrollY - 200
            const cameraBottom = this.scene.cameras.main.scrollY + this.scene.cameras.main.height + 400
            const targetY = Phaser.Math.Clamp(mouseWorldY, Math.max(cameraTop, GAME_CONSTANTS.WATER_LEVEL + 20), cameraBottom)

            const deltaTime = this.scene.game.loop.delta / 1000

            if (Math.abs(this.hook.x - targetX) > 5) {
                const directionX = targetX > this.hook.x ? 1 : -1
                this.hook.x += directionX * GAME_CONSTANTS.HOOK_MOVE_SPEED * deltaTime
            }

            if (Math.abs(this.hook.y - targetY) > 10) {
                const directionY = targetY > this.hook.y ? 1 : -1
                this.hook.y += directionY * (GAME_CONSTANTS.HOOK_MOVE_SPEED * 0.7) * deltaTime
            }
        }
    }

    private updateFishingLine(): void {
        this.fishingLine.clear()
        this.fishingLine.lineStyle(2, 0x000000)
        this.fishingLine.moveTo(this.boat.x, this.boat.y + 10)
        this.fishingLine.lineTo(this.hook.x, this.hook.y)
        this.fishingLine.stroke()
    }

    getHook(): Phaser.GameObjects.Rectangle {
        return this.hook
    }

    getState(): HookState {
        return this.state
    }

    getDepth(): number {
        return Math.max(0, this.hook.y - GAME_CONSTANTS.WATER_LEVEL)
    }

    reset(): void {
        this.state = 'ready'
        this.scene.tweens.killAll()
        this.hook.setPosition(400, GAME_CONSTANTS.WATER_LEVEL - 30)
        this.fishingLine.clear()
    }

    destroy(): void {
        this.hook.destroy()
        this.fishingLine.destroy()
        this.boat.destroy()
    }
}