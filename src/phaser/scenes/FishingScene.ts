// src/phaser/scenes/FishingScene.ts

import Phaser from 'phaser'

export default class FishingScene extends Phaser.Scene {
  constructor() {
    super('FishingScene')
  }

  preload() {
    // Load assets here later
  }

  create() {
    this.add.text(100, 100, 'Fishing Scene!', { color: '#ffffff' })
    // Add a button to return to the village
    const btn = this.add.text(100, 200, 'Return to Village', { color: '#00ff00', backgroundColor: '#222', padding: { x: 10, y: 5 } })
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('VillageScene')
      })
  }
}
