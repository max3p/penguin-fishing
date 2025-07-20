// src/phaser/scenes/FishingScene.ts
import Phaser from 'phaser'

interface RockGenerationSettings {
  density: number        // How many rock points per 100 pixels of depth
  roughness: number      // How jagged the rocks are (0-1)
  minWidth: number       // Minimum distance from edge
  maxWidth: number       // Maximum distance from edge
  seed: number          // Seed for consistent generation
}

export default class FishingScene extends Phaser.Scene {
  // Game objects
  private hook!: Phaser.GameObjects.Rectangle
  private fishingLine!: Phaser.GameObjects.Graphics
  private boat!: Phaser.GameObjects.Rectangle
  private rockGraphics!: Phaser.GameObjects.Graphics
  
  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  
  // Game state
  private hookSpeed = 150
  private scrollSpeed = 100
  private worldDepth = 0  // How far down we've scrolled
  private actualDepth = 0 // Hook's actual depth from surface
  
  // Camera and scrolling
  private cameraTarget = { x: 400, y: 300 }
  
  // Rock generation
  private rockSettings: RockGenerationSettings = AreaSettings.SHALLOW_WATERS
  private generatedRockDepth = 0
  private rockPoints: { left: Phaser.Math.Vector2[], right: Phaser.Math.Vector2[] } = {
    left: [],
    right: []
  }
  
  // UI elements
  private depthText!: Phaser.GameObjects.Text
  private instructionText!: Phaser.GameObjects.Text

  constructor() {
    super('FishingScene')
  }

  create() {
    // Set light blue background
    this.cameras.main.setBackgroundColor('#87CEEB')
    
    // Create the fishing scene
    this.createBoat()
    this.createFishingLine()
    this.createHook()
    this.createRockGraphics()
    this.createUI()
    this.setupControls()
    
    // Generate initial rocks
    this.generateRocks(0, 1200) // Generate first screen + buffer
    
    // Setup camera to follow hook vertically
    this.cameras.main.startFollow(this.hook, false, 0, 0.1)
    this.cameras.main.setDeadzone(0, 100)
  }

  private createBoat() {
    // Simple boat representation - this will stay at the surface
    this.boat = this.add.rectangle(400, -50, 80, 20, 0x8B4513)
  }

  private createFishingLine() {
    this.fishingLine = this.add.graphics()
  }

  private createHook() {
    // Start hook at boat position
    this.hook = this.add.rectangle(400, 50, 8, 8, 0xC0C0C0)
    this.hook.setOrigin(0.5)
  }

  private createRockGraphics() {
    this.rockGraphics = this.add.graphics()
  }

  private createUI() {
    // Instructions - fixed to camera
    this.instructionText = this.add.text(400, 30,
      'Arrow Keys: Move Hook | DOWN: Drop Down | UP: Reel Up',
      {
        fontSize: '14px',
        color: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setScrollFactor(0) // Fixed to camera
    
    // Depth indicator - fixed to camera
    this.depthText = this.add.text(50, 50,
      'Depth: 0m',
      {
        fontSize: '16px',
        color: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: { x: 10, y: 5 }
      }
    ).setScrollFactor(0) // Fixed to camera
    
    // Back button - fixed to camera
    const backButton = this.add.text(650, 50, 'Back to Village', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 10, y: 5 }
    }).setInteractive().setScrollFactor(0) // Fixed to camera

    backButton.on('pointerdown', () => {
      this.scene.start('VillageScene')
    })
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys()
  }

  // Seeded random number generator for consistent rock generation
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  private generateRocks(startDepth: number, endDepth: number) {
    const segmentHeight = 20 // Generate rocks in 20px segments
    
    for (let depth = startDepth; depth < endDepth; depth += segmentHeight) {
      // Generate left wall points
      const leftSeed = this.rockSettings.seed + depth * 0.1
      const leftNoise = this.seededRandom(leftSeed)
      const leftWidth = this.rockSettings.minWidth + 
        (this.rockSettings.maxWidth - this.rockSettings.minWidth) * leftNoise
      
      // Add some roughness
      const leftRoughness = (this.seededRandom(leftSeed * 1.5) - 0.5) * 
        this.rockSettings.roughness * 20
      
      this.rockPoints.left.push(new Phaser.Math.Vector2(
        leftWidth + leftRoughness,
        depth
      ))
      
      // Generate right wall points
      const rightSeed = this.rockSettings.seed + depth * 0.1 + 1000
      const rightNoise = this.seededRandom(rightSeed)
      const rightWidth = this.rockSettings.minWidth + 
        (this.rockSettings.maxWidth - this.rockSettings.minWidth) * rightNoise
      
      const rightRoughness = (this.seededRandom(rightSeed * 1.5) - 0.5) * 
        this.rockSettings.roughness * 20
      
      this.rockPoints.right.push(new Phaser.Math.Vector2(
        800 - rightWidth - rightRoughness,
        depth
      ))
    }
    
    this.generatedRockDepth = Math.max(this.generatedRockDepth, endDepth)
  }

  private drawRocks() {
    this.rockGraphics.clear()
    this.rockGraphics.fillStyle(0x4A4A4A) // Dark gray rocks
    this.rockGraphics.lineStyle(2, 0x2A2A2A) // Darker outline
    
    // Draw left wall
    if (this.rockPoints.left.length > 1) {
      this.rockGraphics.beginPath()
      this.rockGraphics.moveTo(0, this.rockPoints.left[0].y)
      
      for (const point of this.rockPoints.left) {
        this.rockGraphics.lineTo(point.x, point.y)
      }
      
      // Close the path to the left edge
      const lastLeft = this.rockPoints.left[this.rockPoints.left.length - 1]
      this.rockGraphics.lineTo(0, lastLeft.y)
      this.rockGraphics.lineTo(0, this.rockPoints.left[0].y)
      
      this.rockGraphics.closePath()
      this.rockGraphics.fillPath()
      this.rockGraphics.strokePath()
    }
    
    // Draw right wall
    if (this.rockPoints.right.length > 1) {
      this.rockGraphics.beginPath()
      this.rockGraphics.moveTo(800, this.rockPoints.right[0].y)
      
      for (const point of this.rockPoints.right) {
        this.rockGraphics.lineTo(point.x, point.y)
      }
      
      // Close the path to the right edge
      const lastRight = this.rockPoints.right[this.rockPoints.right.length - 1]
      this.rockGraphics.lineTo(800, lastRight.y)
      this.rockGraphics.lineTo(800, this.rockPoints.right[0].y)
      
      this.rockGraphics.closePath()
      this.rockGraphics.fillPath()
      this.rockGraphics.strokePath()
    }
  }

  private updateFishingLine() {
    this.fishingLine.clear()
    this.fishingLine.lineStyle(2, 0x000000)
    
    // Draw line from boat to hook
    this.fishingLine.moveTo(this.boat.x, this.boat.y + 10)
    this.fishingLine.lineTo(this.hook.x, this.hook.y)
    this.fishingLine.stroke()
  }

  private updateDepthDisplay() {
    this.actualDepth = Math.max(0, this.hook.y - 100)
    const depthMeters = Math.floor(this.actualDepth / 10)
    this.depthText.setText(`Depth: ${depthMeters}m`)
  }

  private checkRockGeneration() {
    // Generate more rocks if we're getting close to the bottom of generated area
    const cameraBottom = this.cameras.main.scrollY + this.cameras.main.height
    const generationBuffer = 600 // Generate rocks 600px ahead
    
    if (cameraBottom + generationBuffer > this.generatedRockDepth) {
      this.generateRocks(
        this.generatedRockDepth, 
        this.generatedRockDepth + 1200
      )
    }
  }

  // Method to change rock generation settings (for different areas later)
  public setRockSettings(settings: Partial<RockGenerationSettings>) {
    this.rockSettings = { ...this.rockSettings, ...settings }
    // Could regenerate rocks here if needed
  }

  update() {
    const deltaTime = this.game.loop.delta / 1000
    
    // Hook movement controls 
    if (this.cursors.left.isDown && this.hook.x > 50) {
      this.hook.x -= this.hookSpeed * deltaTime
    } else if (this.cursors.right.isDown && this.hook.x < 750) {
      this.hook.x += this.hookSpeed * deltaTime
    }

    // Vertical movement
    if (this.cursors.down.isDown) {
      this.hook.y += this.hookSpeed * deltaTime
    } else if (this.cursors.up.isDown) {
      if (this.hook.y > 100) { // Don't go above the boat
        this.hook.y -= this.hookSpeed * deltaTime
      }
    }

    // Generate more rocks as needed
    this.checkRockGeneration()
    
    // Update visual elements
    this.updateFishingLine()
    this.updateDepthDisplay()
    this.drawRocks()
  }
}

// Different map areas... to be expanded later
export const AreaSettings = {
  SHALLOW_WATERS: {
    density: 1,
    roughness: 0.1,
    minWidth: 90,
    maxWidth: 110,
    seed: 12345
  } as RockGenerationSettings,
  
  DEEP_CAVERNS: {
    density: 4,
    roughness: 0.8,
    minWidth: 40,
    maxWidth: 100,
    seed: 54321
  } as RockGenerationSettings,
  
  NARROW_CANYON: {
    density: 5,
    roughness: 0.9,
    minWidth: 20,
    maxWidth: 60,
    seed: 99999
  } as RockGenerationSettings
}