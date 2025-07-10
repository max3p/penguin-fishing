// src/phaser/scenes/FishingScene.ts

import Phaser from 'phaser'

export default class FishingScene extends Phaser.Scene {
  constructor() {
    super('FishingScene')
  }

  preload() {
    this.load.image('sky1', '/src/assets/backgrounds/sky1.jpg')
  }

  create() {
    this.cameras.main.setBackgroundColor('#87CEEB')

    this.add.text(10, 10, 'Fishing!', { color: '#ffffff' })

    const btn = this.add.text(120, 10, 'Return to Village', { color: '#ffffff', backgroundColor: '#222', padding: { x: 10, y: 5 } })
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('VillageScene')
      })
  }
}
