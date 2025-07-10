// src/phaser/scenes/VillageScene.ts

import Phaser from 'phaser'

export default class VillageScene extends Phaser.Scene {
  constructor() {
    super('VillageScene')
  }

  create() {
    this.add.text(10, 10, 'Village!', { color: '#ffffff' })
    // Add a button to go fishing
    const btn = this.add.text(120, 10, 'Go Fishing', { color: '#ffffff', backgroundColor: '#222', padding: { x: 10, y: 5 } })
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('FishingScene')
      })
  }
}