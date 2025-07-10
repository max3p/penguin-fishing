// src/phaser/main.ts

import Phaser from 'phaser'
import FishingScene from './scenes/FishingScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  scene: [FishingScene],
  physics: {
    default: 'arcade',
  },
  backgroundColor: '#1e1e1e',
}

export default new Phaser.Game(config)
