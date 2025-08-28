// src/phaser/scenes/VillageScene.ts - Enhanced version with menu UI and fishing results modal
import Phaser from 'phaser'
import { phaserReduxBridge } from '../../store/phaserBridge'

interface MenuItem {
  name: string
  description: string
  enabled: boolean
  action: () => void
}

interface CaughtFish {
  species: string
  weight: number
  value: number
  totalValue: number
}



export default class VillageScene extends Phaser.Scene {
  private goldText!: Phaser.GameObjects.Text
  private menuItems: MenuItem[] = []
  private menuButtons: Phaser.GameObjects.Container[] = []
  private modalContainer: Phaser.GameObjects.Container | null = null
  private caughtFishData: CaughtFish[] = []
  private unsubscribe: (() => void) | null = null

  constructor() {
    super('VillageScene')
  }

  create() {
    // Set village background color (light blue-grey for winter theme)
    this.cameras.main.setBackgroundColor('#dfeef2')
    
    // Add a subtle background pattern
    this.createBackgroundPattern()
    
    // Title with better styling
    this.add.text(400, 80, 'FROSTBITE BAY', {
      fontSize: '32px',
      color: '#2C5F8A',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Create menu items
    this.createMenuItems()
    
    // Create the menu UI
    this.createMenuUI()
    
    // Player stats (only gold)
    this.createPlayerStats()
    
    // Subscribe to Redux store changes
    this.subscribeToStore()
    
    // Check if we're returning from fishing and show results modal
    this.checkForFishingResults()
    
    // Set current scene in Redux
    phaserReduxBridge.setCurrentScene('VillageScene')
  }

  private createBackgroundPattern() {
    // Create a subtle grid pattern for visual interest
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0xE8F4F8, 0.3)
    
    for (let x = 0; x < 800; x += 40) {
      graphics.moveTo(x, 0)
      graphics.lineTo(x, 600)
    }
    for (let y = 0; y < 600; y += 40) {
      graphics.moveTo(0, y)
      graphics.lineTo(800, y)
    }
    graphics.strokePath()
  }

  private createMenuItems() {
    this.menuItems = [
      {
        name: 'Shop',
        description: 'Buy upgrades',
        enabled: true,
        action: () => {
          this.scene.start('ShopScene')
        }
      },
      {
        name: 'Fish Museum',
        description: 'View your most impressive catches in a personal exhibit',
        enabled: false,
        action: () => {
          // Museum functionality will be implemented later
          console.log('Fish Museum clicked - functionality coming soon!')
        }
      },
      {
        name: 'Workshop',
        description: 'Combine fish parts to craft decorations and trophies',
        enabled: false,
        action: () => {
          // Workshop functionality will be implemented later
          console.log('Workshop clicked - functionality coming soon!')
        }
      },
      {
        name: 'Fishing Boat',
        description: 'Set sail to catch fish',
        enabled: true,
        action: () => {
          this.scene.start('FishingScene')
        }
      }
    ]
  }

  private createMenuUI() {
    const startY = 180
    const buttonHeight = 80
    const spacing = 20

    this.menuItems.forEach((item, index) => {
      const y = startY + (index * (buttonHeight + spacing))
      
      // Create button container
      const buttonContainer = this.add.container(400, y)
      
      // Background rectangle
      const background = this.add.rectangle(0, 0, 500, buttonHeight, 
        item.enabled ? 0x4A90E2 : 0x9E9E9E, 
        item.enabled ? 0.9 : 0.6
      )
      
      // Border
      const border = this.add.rectangle(0, 0, 500, buttonHeight, 
        item.enabled ? 0x2C5F8A : 0x666666, 
        0
      )
      border.setStrokeStyle(2, item.enabled ? 0x2C5F8A : 0x666666)
      
      // Title text
      const titleText = this.add.text(-200, -15, item.name, {
        fontSize: '22px',
        color: item.enabled ? '#FFFFFF' : '#CCCCCC',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5)
      
      // Description text
      const descText = this.add.text(-200, 15, item.description, {
        fontSize: '14px',
        color: item.enabled ? '#E8F4F8' : '#AAAAAA',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0, 0.5)
      
      // Status indicator
      const statusText = this.add.text(200, 0, item.enabled ? '✓' : '🔒', {
        fontSize: '24px',
        color: item.enabled ? '#4CAF50' : '#FF9800'
      }).setOrigin(0.5)
      
      // Add all elements to container
      buttonContainer.add([background, border, titleText, descText, statusText])
      
      // Make interactive if enabled
      if (item.enabled) {
        background.setInteractive()
        background.on('pointerover', () => {
          background.setFillStyle(0x5BA0F2, 0.9)
        })
        background.on('pointerout', () => {
          background.setFillStyle(0x4A90E2, 0.9)
        })
        background.on('pointerdown', item.action)
      }
      
      this.menuButtons.push(buttonContainer)
    })
  }

  private createPlayerStats() {
    // Gold display with better styling
    const currentGold = phaserReduxBridge.getGold()
    this.goldText = this.add.text(50, 50, `Gold: ${Math.round(currentGold)}g`, {
      fontSize: '20px',
      color: '#FFD700',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: { x: 15, y: 10 },
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    })
    
    // Add a subtle background for stats
    const statsBg = this.add.rectangle(120, 60, 120, 40, 0xFFFFFF, 0.1)
    statsBg.setStrokeStyle(1, 0xE8F4F8, 0.5)
    statsBg.setDepth(-1)
  }

  private subscribeToStore() {
    // Subscribe to Redux store changes to update gold display
    this.unsubscribe = phaserReduxBridge.subscribe(() => {
      // Only update if the scene is still active and the text object exists
      if (this.scene.isActive() && this.goldText && this.goldText.active) {
        const currentGold = phaserReduxBridge.getGold()
        this.goldText.setText(`Gold: ${Math.round(currentGold)}g`)
      }
    })
  }

  private checkForFishingResults() {
    // Check if we have fishing results data from Redux store
    const fishingResults = phaserReduxBridge.getFishingResults()
    
    console.log('Checking for fishing results from Redux:', fishingResults)
    
    if (fishingResults && fishingResults.fishCaught > 0) {
      this.caughtFishData = fishingResults.caughtFish || []
      this.showFishingResultsModal()
      
      // Clear the data from Redux so it doesn't show again
      phaserReduxBridge.clearFishingResults()
    }
  }

  private showFishingResultsModal() {
    if (this.modalContainer) {
      this.modalContainer.destroy()
    }

    // Create modal background
    const modalBg = this.add.rectangle(400, 300, 600, 400, 0x2C5F8A, 0.95)
    modalBg.setStrokeStyle(3, 0x4A90E2)
    
    // Modal title
    const title = this.add.text(400, 150, 'Fishing Results!', {
      fontSize: '28px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Create fish list
    let totalValue = 0
    const fishListTexts: Phaser.GameObjects.Text[] = []
    
    this.caughtFishData.forEach((fish, index) => {
      const y = 200 + (index * 30)
      const fishText = this.add.text(150, y, `${fish.species}`, {
        fontSize: '16px',
        color: '#E8F4F8',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0, 0.5)
      
      const weightText = this.add.text(350, y, `${fish.weight.toFixed(1)}kg`, {
        fontSize: '16px',
        color: '#E8F4F8',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0, 0.5)
      
      const valueText = this.add.text(450, y, `${fish.totalValue}g`, {
        fontSize: '16px',
        color: '#FFD700',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5)
      
      fishListTexts.push(fishText, weightText, valueText)
      totalValue += fish.totalValue
    })

    // Column headers
    const speciesHeader = this.add.text(150, 170, 'Species', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5)
    
    const weightHeader = this.add.text(350, 170, 'Weight', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5)
    
    const valueHeader = this.add.text(450, 170, 'Value', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5)

    // Total value
    const totalText = this.add.text(400, 450, `Total Value: ${totalValue}g`, {
      fontSize: '22px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Continue button
    const continueBtn = this.add.text(400, 500, 'Continue', {
      fontSize: '20px',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive()

    continueBtn.on('pointerover', () => {
      continueBtn.setBackgroundColor('#5CBA60')
    })
    
    continueBtn.on('pointerout', () => {
      continueBtn.setBackgroundColor('#4CAF50')
    })
    
    continueBtn.on('pointerdown', () => {
      // Add the total value to player's gold
      phaserReduxBridge.addGold(totalValue)
      
      // Close modal
      this.closeFishingResultsModal()
    })

    // Create container for all modal elements
    this.modalContainer = this.add.container(0, 0, [
      modalBg, title, speciesHeader, weightHeader, valueHeader,
      ...fishListTexts, totalText, continueBtn
    ])
  }

  private closeFishingResultsModal() {
    if (this.modalContainer) {
      this.modalContainer.destroy()
      this.modalContainer = null
    }
    this.caughtFishData = []
  }

  private updateGoldDisplay() {
    const currentGold = phaserReduxBridge.getGold()
    this.goldText.setText(`Gold: ${Math.round(currentGold)}g`)
  }

  // Method to set fishing results (called from FishingScene)
  setFishingResults(fishData: CaughtFish[]) {
    this.caughtFishData = fishData
    this.showFishingResultsModal()
  }

  // Cleanup when scene is destroyed
  shutdown() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    // Cleanup the Redux bridge
    phaserReduxBridge.cleanup()
  }

  // Also cleanup when scene is paused (scene transition)
  pause() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }
}