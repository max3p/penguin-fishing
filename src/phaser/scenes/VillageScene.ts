// src/phaser/scenes/VillageScene.ts - Enhanced version
import Phaser from 'phaser'

export default class VillageScene extends Phaser.Scene {
  private goldText!: Phaser.GameObjects.Text
  private fishCountText!: Phaser.GameObjects.Text

  constructor() {
    super('VillageScene')
  }

  create() {
    // Set village background color (light green)
    this.cameras.main.setBackgroundColor('#98FB98')
    
    // Title
    this.add.text(400, 100, 'Frostbite Bay Village', {
      fontSize: '28px',
      color: '#2C5F8A',
      fontFamily: 'Arial'
    }).setOrigin(0.5)

    // Fishing button
    const fishingBtn = this.add.text(400, 200, 'Go Fishing', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#4169E2',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive()

    fishingBtn.on('pointerdown', () => {
      this.scene.start('FishingScene')
    })

    // Shop button (placeholder for now)
    const shopBtn = this.add.text(400, 250, 'Shop (Coming Soon)', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5)

    // Player stats (placeholder - will connect to Redux later)
    this.goldText = this.add.text(50, 50, 'Gold: 0g', {
      fontSize: '18px',
      color: '#FFD700',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: { x: 10, y: 5 }
    })

    this.fishCountText = this.add.text(50, 80, 'Fish Caught: 0', {
      fontSize: '18px',
      color: '#4169E2',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: { x: 10, y: 5 }
    })
  }
}