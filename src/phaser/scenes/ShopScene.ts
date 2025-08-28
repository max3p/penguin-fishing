// src/phaser/scenes/ShopScene.ts
import Phaser from 'phaser'
import { SHOP_ITEMS } from '../types/ShopTypes'
import type { ShopItemCategory, ShopItemTier } from '../types/ShopTypes'
import { phaserReduxBridge } from '../../store/phaserBridge'

export default class ShopScene extends Phaser.Scene {
  private goldText!: Phaser.GameObjects.Text
  private categoryButtons: Phaser.GameObjects.Container[] = []
  private itemDisplayContainer: Phaser.GameObjects.Container | null = null
  private currentCategory: ShopItemCategory = 'fishingRod'
  private backButton!: Phaser.GameObjects.Text
  private unsubscribe: (() => void) | null = null

  constructor() {
    super('ShopScene')
  }

  create() {
    // Set shop background color to match village
    this.cameras.main.setBackgroundColor('#dfeef2')
    
    // Create background pattern to match village
    this.createBackgroundPattern()
    
    // Title
    this.add.text(400, 50, 'FROSTBITE BAY SHOP', {
      fontSize: '28px',
      color: '#2C5F8A',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Player gold display
    this.createGoldDisplay()
    
    // Category selection buttons
    this.createCategoryButtons()
    
    // Item display area
    this.createItemDisplayArea()
    
    // Back button
    this.createBackButton()
    
    // Show initial category
    this.showCategoryItems(this.currentCategory)
    
    // Subscribe to Redux store changes
    this.subscribeToStore()
    
    // Set current scene in Redux
    phaserReduxBridge.setCurrentScene('ShopScene')
  }

  // Called when scene becomes active (returning from other scenes)
  resume() {
    // Refresh the UI to ensure proper state
    this.createCategoryButtons()
    this.showCategoryItems(this.currentCategory)
  }

  private subscribeToStore() {
    // Subscribe to Redux store changes to update gold display
    this.unsubscribe = phaserReduxBridge.subscribe(() => {
      // Only update if the scene is still active and the text object exists
      if (this.scene.isActive() && this.goldText && this.goldText.active) {
        const currentGold = phaserReduxBridge.getGold()
        this.goldText.setText(`Gold: ${currentGold}g`)
      }
    })
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

  private createBackgroundPattern() {
    // Create a subtle grid pattern for visual interest (matching village)
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

  private createGoldDisplay() {
    const currentGold = phaserReduxBridge.getGold()
    this.goldText = this.add.text(650, 50, `Gold: ${currentGold}g`, {
      fontSize: '18px',
      color: '#FFD700',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: { x: 15, y: 8 },
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    })
    
    const statsBg = this.add.rectangle(650, 50, 120, 30, 0xFFFFFF, 0.1)
    statsBg.setStrokeStyle(1, 0x4A90E2, 0.5)
    statsBg.setDepth(-1)
  }

  private createCategoryButtons() {
    const categories: ShopItemCategory[] = ['fishingRod', 'fishingLine', 'hook', 'bucket', 'boat']
    const categoryNames = {
      fishingRod: 'Fishing Rods',
      fishingLine: 'Fishing Lines',
      hook: 'Hooks',
      bucket: 'Buckets',
      boat: 'Boats'
    }
    
    const startX = 100
    const buttonWidth = 120
    const buttonHeight = 40
    const spacing = 20

    // Clear existing buttons
    this.categoryButtons.forEach(btn => btn.destroy())
    this.categoryButtons = []

    categories.forEach((category, index) => {
      const x = startX + (index * (buttonWidth + spacing))
      const y = 120
      
      const buttonContainer = this.add.container(x, y)
      
      // Background
      const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 
        category === this.currentCategory ? 0x4CAF50 : 0x4A90E2, 
        0.9
      )
      
      // Border
      const border = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 
        category === this.currentCategory ? 0x45A049 : 0x2C5F8A, 
        0
      )
      border.setStrokeStyle(2, category === this.currentCategory ? 0x45A049 : 0x2C5F8A)
      
      // Text
      const text = this.add.text(0, 0, categoryNames[category], {
        fontSize: '12px',
        color: '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5)
      
      buttonContainer.add([background, border, text])
      
      // Make interactive
      background.setInteractive()
      background.on('pointerover', () => {
        if (category !== this.currentCategory) {
          background.setFillStyle(0x5BA0F2, 0.9)
        }
      })
      background.on('pointerout', () => {
        if (category !== this.currentCategory) {
          background.setFillStyle(0x4A90E2, 0.9)
        }
      })
      background.on('pointerdown', () => {
        this.selectCategory(category)
      })
      
      this.categoryButtons.push(buttonContainer)
    })
  }

  private createItemDisplayArea() {
    // Create a container for the item display area
    this.itemDisplayContainer = this.add.container(400, 350)
    
    // Background for item display
    const displayBg = this.add.rectangle(0, 0, 600, 400, 0xFFFFFF, 0.1)
    displayBg.setStrokeStyle(2, 0x4A90E2)
    
    this.itemDisplayContainer.add(displayBg)
  }

  private createBackButton() {
    this.backButton = this.add.text(50, 50, '← Back', {
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#666666',
      padding: { x: 15, y: 8 }
    }).setOrigin(0, 0.5).setInteractive()

    this.backButton.on('pointerover', () => {
      this.backButton.setBackgroundColor('#777777')
    })
    
    this.backButton.on('pointerout', () => {
      this.backButton.setBackgroundColor('#666666')
    })
    
    this.backButton.on('pointerdown', () => {
      this.scene.start('VillageScene')
    })
  }

  private selectCategory(category: ShopItemCategory) {
    this.currentCategory = category
    
    // Update category button appearances
    this.categoryButtons.forEach((buttonContainer, index) => {
      const categories: ShopItemCategory[] = ['fishingRod', 'fishingLine', 'hook', 'bucket', 'boat']
      const categoryIndex = categories.indexOf(category)
      
      const background = buttonContainer.getAt(0) as Phaser.GameObjects.Rectangle
      const border = buttonContainer.getAt(1) as Phaser.GameObjects.Rectangle
      
      if (index === categoryIndex) {
        background.setFillStyle(0x4CAF50, 0.9)
        border.setStrokeStyle(2, 0x45A049)
      } else {
        background.setFillStyle(0x4A90E2, 0.9)
        border.setStrokeStyle(2, 0x2C5F8A)
      }
    })
    
    // Show items for selected category
    this.showCategoryItems(category)
  }

  private showCategoryItems(category: ShopItemCategory) {
    if (!this.itemDisplayContainer) return
    
    // Clear existing items
    this.itemDisplayContainer.removeAll(true)
    
    // Add background back
    const displayBg = this.add.rectangle(0, 0, 600, 400, 0xFFFFFF, 0.1)
    displayBg.setStrokeStyle(2, 0x4A90E2)
    this.itemDisplayContainer.add(displayBg)
    
    const items = SHOP_ITEMS[category]
    const playerInventory = phaserReduxBridge.getPlayerInventory()
    const currentLevel = playerInventory[category]
    
    // Category title
    const categoryTitle = this.add.text(0, -170, this.getCategoryDisplayName(category), {
      fontSize: '24px',
      color: '#2C5F8A',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.itemDisplayContainer.add(categoryTitle)
    
    // Show items
    items.forEach((item, index) => {
      const y = -120 + (index * 70)
      const playerInventory = phaserReduxBridge.getPlayerInventory()
      const isOwned = item.level <= currentLevel
      const canAfford = playerInventory.gold >= item.cost
      const isNextUpgrade = item.level === currentLevel + 1
      
      this.createItemRow(item, y, isOwned, canAfford, isNextUpgrade)
    })
  }

  private createItemRow(item: ShopItemTier, y: number, isOwned: boolean, canAfford: boolean, isNextUpgrade: boolean) {
    const rowContainer = this.add.container(0, y)
    
    // Row background
    const rowBg = this.add.rectangle(0, 0, 550, 60, 
      isOwned ? 0x4CAF50 : isNextUpgrade ? 0xFF9800 : 0xE8F4F8, 
      isOwned ? 0.3 : isNextUpgrade ? 0.2 : 0.1
    )
    rowBg.setStrokeStyle(1, isOwned ? 0x45A049 : isNextUpgrade ? 0xF57C00 : 0x4A90E2)
    
    // Item name
    const nameText = this.add.text(-250, -10, item.name, {
      fontSize: '16px',
      color: isOwned ? '#2E7D32' : '#2C5F8A',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5)
    
    // Item description
    const descText = this.add.text(-250, 10, item.description, {
      fontSize: '12px',
      color: isOwned ? '#388E3C' : '#4A90E2',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0, 0.5)
    
    // Bonus text
    const bonusText = this.add.text(0, 0, item.bonus || '', {
      fontSize: '11px',
      color: '#FF9800',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'italic'
    }).setOrigin(0.5)
    
    // Cost
    const costText = this.add.text(150, -10, `${item.cost}g`, {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    
    // Status/button
    let statusElement: Phaser.GameObjects.GameObject
    
    if (isOwned) {
      statusElement = this.add.text(200, 0, '✓ OWNED', {
        fontSize: '14px',
        color: '#4CAF50',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5)
    } else if (isNextUpgrade && canAfford) {
      const buyButton = this.add.text(200, 0, 'BUY', {
        fontSize: '14px',
        color: '#FFFFFF',
        backgroundColor: '#4CAF50',
        padding: { x: 15, y: 8 },
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive()
      
      buyButton.on('pointerover', () => {
        buyButton.setBackgroundColor('#5CBA60')
      })
      
      buyButton.on('pointerout', () => {
        buyButton.setBackgroundColor('#4CAF50')
      })
      
      buyButton.on('pointerdown', () => {
        this.purchaseItem(item)
      })
      
      statusElement = buyButton
    } else if (isNextUpgrade && !canAfford) {
      statusElement = this.add.text(200, 0, 'NOT ENOUGH GOLD', {
        fontSize: '12px',
        color: '#F44336',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5)
    } else {
      statusElement = this.add.text(200, 0, '🔒 LOCKED', {
        fontSize: '12px',
        color: '#9E9E9E',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5)
    }
    
    rowContainer.add([rowBg, nameText, descText, bonusText, costText, statusElement])
    this.itemDisplayContainer!.add(rowContainer)
  }

  private getCategoryDisplayName(category: ShopItemCategory): string {
    const names = {
      fishingRod: 'Fishing Rods',
      fishingLine: 'Fishing Lines',
      hook: 'Hooks',
      bucket: 'Buckets',
      boat: 'Boats'
    }
    return names[category]
  }

  private purchaseItem(item: ShopItemTier) {
    const playerInventory = phaserReduxBridge.getPlayerInventory()
    if (playerInventory.gold >= item.cost) {
      // Use Redux to purchase the upgrade
      phaserReduxBridge.purchaseUpgrade(this.currentCategory, item.level, item.cost)
      
      // Refresh the item display
      this.showCategoryItems(this.currentCategory)
      
      // Show purchase confirmation
      this.showPurchaseConfirmation(item)
    }
  }

  private showPurchaseConfirmation(item: ShopItemTier) {
    // Create a temporary confirmation message
    const confirmation = this.add.text(400, 100, `Purchased ${item.name}!`, {
      fontSize: '20px',
      color: '#4CAF50',
      backgroundColor: '#FFFFFF',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    
    // Remove after 2 seconds
    this.time.delayedCall(2000, () => {
      confirmation.destroy()
    })
  }
}
