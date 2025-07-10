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
  }
}
