// src/phaser/scenes/FishingScene.ts
import Phaser from 'phaser'

interface RockGenerationSettings {
  density: number        // How many rock points per 100 pixels of depth
  roughness: number      // How jagged the rocks are (0-1)
  minWidth: number       // Minimum distance from edge
  maxWidth: number       // Maximum distance from edge
  seed: number          // Seed for consistent generation
  gradientStartColor: number  // Starting water color (hex)
  gradientEndColor: number  // Ending water color at max depth (hex)
  gradientDepth: number // Depth where gradient reaches end color (meters)
}

// Different map areas... to be expanded later
export const AreaSettings = {
  SHALLOW_WATERS: {
    density: 1,
    roughness: 0.1,
    minWidth: 90,
    maxWidth: 110,
    seed: 12345,
    gradientStartColor: 0x4eabc7,
    gradientEndColor: 0x111724,
    gradientDepth: 400
  } as RockGenerationSettings,

  DEEP_CAVERNS: {
    density: 4,
    roughness: 0.8,
    minWidth: 40,
    maxWidth: 100,
    seed: 54321,
    gradientStartColor: 0x2E5984,  // Medium blue
    gradientEndColor: 0x0F1419,   // Almost black
    gradientDepth: 1000
  } as RockGenerationSettings,

  NARROW_CANYON: {
    density: 5,
    roughness: 0.9,
    minWidth: 20,
    maxWidth: 60,
    seed: 99999,
    gradientStartColor: 0x3A5F8A,  // Steel blue
    gradientEndColor: 0x1C2938,   // Dark steel
    gradientDepth: 1200
  } as RockGenerationSettings
}

export default class FishingScene extends Phaser.Scene {
  // Game objects
  private hook!: Phaser.GameObjects.Rectangle
  private fishingLine!: Phaser.GameObjects.Graphics
  private boat!: Phaser.GameObjects.Rectangle
  private rockGraphics!: Phaser.GameObjects.Graphics
  private waterSurface!: Phaser.GameObjects.Graphics
  private skyBackground!: Phaser.GameObjects.Rectangle
  private waterBackground!: Phaser.GameObjects.Image

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

  // Game state
  private hookSpeed = 150
  private scrollSpeed = 100
  private worldDepth = 0  // How far down we've scrolled
  private actualDepth = 0 // Hook's depth from surface
  private hookState: 'ready' | 'casting' | 'falling' | 'reeling' = 'ready'
  private castStartTime = 0
  private castDuration = 1000
  private hookFallSpeed = 80
  private mousePointer!: Phaser.Input.Pointer

  // Constants
  private readonly WATER_LEVEL = 0

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
    this.resetScene()

    // Create background layers
    this.createBackgrounds()
    this.createWaterSurface()

    // Create the fishing scene
    this.createBoat()
    this.createFishingLine()
    this.createHook()
    this.createRockGraphics()
    this.createUI()
    this.setupControls()

    // Generate initial rocks (only below water level)
    this.generateRocks(this.WATER_LEVEL, this.WATER_LEVEL + 1200)

    // Setup camera to follow hook vertically
    this.cameras.main.startFollow(this.hook, false, 0, 0.1)
    this.cameras.main.setDeadzone(0, 100)
  }

  private createBackgrounds() {
    // Sky background (light blue/cyan)
    this.skyBackground = this.add.rectangle(400, -500, 800, 1000, 0x87CEEB)
    this.skyBackground.setOrigin(0.5, 1)
    this.skyBackground.y = this.WATER_LEVEL

    // Create water gradient background
    this.createWaterGradient()
  }

  private createWaterGradient() {
    // Remove old water background if it exists
    if (this.waterBackground) {
      this.waterBackground.destroy()
    }

    // Remove existing texture if it exists
    if (this.textures.exists('waterGradient')) {
      this.textures.remove('waterGradient')
    }

    // Convert gradient depth from meters to pixels (10 pixels per meter)
    const gradientDepthPixels = this.rockSettings.gradientDepth * 10
    const gradientHeight = Math.max(8000, gradientDepthPixels + 2000) // Much larger for infinite depth

    const canvas = this.textures.createCanvas('waterGradient', 800, gradientHeight)

    // Check if canvas creation was successful
    if (!canvas) {
      console.error('Failed to create canvas for water gradient')
      return
    }

    const context = canvas.getContext()

    if (!context) {
      console.error('Failed to get canvas context for water gradient')
      return
    }

    // Create vertical gradient
    const gradient = context.createLinearGradient(0, 0, 0, gradientDepthPixels)

    // Convert hex colors to CSS format
    const startColor = `#${this.rockSettings.gradientStartColor.toString(16).padStart(6, '0')}`
    const endColor = `#${this.rockSettings.gradientEndColor.toString(16).padStart(6, '0')}`

    gradient.addColorStop(0, startColor)
    gradient.addColorStop(1, endColor)

    context.fillStyle = gradient
    context.fillRect(0, 0, 800, gradientDepthPixels)

    // Fill the rest with the end color (for infinite depth)
    context.fillStyle = endColor
    context.fillRect(0, gradientDepthPixels, 800, gradientHeight - gradientDepthPixels)

    canvas.refresh()

    // Create sprite from gradient texture
    this.waterBackground = this.add.image(400, this.WATER_LEVEL, 'waterGradient')
    this.waterBackground.setOrigin(0.5, 0)
  }

  private createWaterSurface() {
    this.waterSurface = this.add.graphics()

    // Create animated water surface
    this.createAnimatedWaterSurface()

    // Animate the water surface with gentle waves
    this.time.addEvent({
      delay: 100,
      callback: this.createAnimatedWaterSurface,
      callbackScope: this,
      loop: true
    })
  }

  private createAnimatedWaterSurface() {
    this.waterSurface.clear()

    // Water surface line with gentle waves
    this.waterSurface.lineStyle(3, 0x0077BE) // Medium blue line
    this.waterSurface.fillStyle(0x4A90E2, 0.3) // Semi-transparent blue fill

    const time = this.time.now * 0.002 // Slow wave animation
    const waveHeight = 3
    const waveLength = 80

    // Draw the wavy water surface
    this.waterSurface.beginPath()
    this.waterSurface.moveTo(0, this.WATER_LEVEL)

    for (let x = 0; x <= 800; x += 10) {
      const wave1 = Math.sin((x / waveLength) + time) * waveHeight
      const wave2 = Math.sin((x / (waveLength * 1.5)) + time * 1.3) * (waveHeight * 0.5)
      const y = this.WATER_LEVEL + wave1 + wave2
      this.waterSurface.lineTo(x, y)
    }

    // Create a subtle water surface effect
    this.waterSurface.lineTo(800, this.WATER_LEVEL - 5)
    this.waterSurface.lineTo(0, this.WATER_LEVEL - 5)
    this.waterSurface.closePath()

    this.waterSurface.fillPath()
    this.waterSurface.strokePath()
  }

  private createBoat() {
    // Boat sits on the water surface
    this.boat = this.add.rectangle(400, this.WATER_LEVEL, 200, 40, 0x8B4513)
  }

  private createFishingLine() {
    this.fishingLine = this.add.graphics()
  }

  private createHook() {
    this.hook = this.add.rectangle(400, this.WATER_LEVEL - 30, 8, 8, 0xC0C0C0)
    this.hook.setOrigin(0.5)
  }

  private createRockGraphics() {
    this.rockGraphics = this.add.graphics()
  }

  private createUI() {
    // Instructions - fixed to camera
    this.instructionText = this.add.text(400, 30,
      'Click to Cast Hook | Click Again to Reel In',
      {
        fontSize: '14px',
        color: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setScrollFactor(0)

    // Depth indicator - fixed to camera
    this.depthText = this.add.text(50, 50,
      'Depth: 0m',
      {
        fontSize: '16px',
        color: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: { x: 10, y: 5 }
      }
    ).setScrollFactor(0)

    // Back button - fixed to camera
    const backButton = this.add.text(650, 50, 'Back to Village', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 10, y: 5 }
    }).setInteractive().setScrollFactor(0)

    backButton.on('pointerdown', () => {
      this.scene.start('VillageScene')
    })
  }

  private setupControls() {
    this.mousePointer = this.input.activePointer

    this.hookState = 'ready'

    // Handle mouse clicks for casting and reeling
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.hookState === 'ready') {
        this.castHook(pointer)
      } else if (this.hookState === 'falling') {
        this.reelInHook()
      }
    })
  }

  private castHook(pointer: Phaser.Input.Pointer) {
    this.hookState = 'casting'
    this.castStartTime = this.time.now

    // Calculate target position (where mouse clicked, but limit to water)
    const targetX = Phaser.Math.Clamp(pointer.worldX, 100, 700)
    const targetY = Math.max(this.WATER_LEVEL + 50, pointer.worldY)

    // Calculate arc height based on distance
    const distance = Phaser.Math.Distance.Between(this.hook.x, this.hook.y, targetX, targetY)
    const arcHeight = Math.min(100, distance * 0.3) // Arc height scales with distance, max 100px

    // Store initial position
    const startX = this.hook.x
    const startY = this.hook.y

    // Create parabolic arc animation using a single tween with custom easing
    this.tweens.add({
      targets: this.hook,
      x: targetX,
      y: targetY,
      duration: this.castDuration,
      ease: 'Power2.easeInOut',
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const progress = tween.progress

        // Calculate parabolic arc
        // X moves linearly
        this.hook.x = startX + (targetX - startX) * progress

        // Y follows a parabolic path (goes up then down)
        const linearY = startY + (targetY - startY) * progress
        const arcOffset = 4 * arcHeight * progress * (1 - progress) // Parabolic formula
        this.hook.y = linearY - arcOffset
      },
      onComplete: () => {
        this.hookState = 'falling'
        // Ensure final position is correct
        this.hook.x = targetX
        this.hook.y = targetY
      }
    })
  }

  private reelInHook() {
    this.hookState = 'reeling'

    // Stop any existing tweens
    this.tweens.killTweensOf(this.hook)

    // Animate hook back to boat
    this.tweens.add({
      targets: this.hook,
      x: this.boat.x,
      y: this.WATER_LEVEL - 30,
      duration: 800,
      ease: 'Power2.easeInOut',
      onComplete: () => {
        this.hookState = 'ready'
      }
    })
  }

  private updateHookMovement() {
    if (this.hookState === 'falling') {
      // Hook falls down automatically
      this.hook.y += this.hookFallSpeed * (this.game.loop.delta / 1000)

      // Guide hook towards mouse position (both X and Y)
      const mouseWorldX = this.cameras.main.getWorldPoint(this.mousePointer.x, this.mousePointer.y).x
      const mouseWorldY = this.cameras.main.getWorldPoint(this.mousePointer.x, this.mousePointer.y).y

      // Only guide if mouse is underwater
      if (mouseWorldY > this.WATER_LEVEL) {
        const targetX = Phaser.Math.Clamp(mouseWorldX, 100, 700)

        // Vertical limits: current camera view plus padding
        const cameraTop = this.cameras.main.scrollY - 200 // 200px padding above screen
        const cameraBottom = this.cameras.main.scrollY + this.cameras.main.height + 400 // 400px padding below screen
        const targetY = Phaser.Math.Clamp(mouseWorldY, Math.max(cameraTop, this.WATER_LEVEL + 20), cameraBottom)

        const moveSpeed = 60 // Speed of mouse following

        // Move horizontally
        if (Math.abs(this.hook.x - targetX) > 5) {
          const directionX = targetX > this.hook.x ? 1 : -1
          this.hook.x += directionX * moveSpeed * (this.game.loop.delta / 1000)
        }

        // Move vertically (but don't fight the natural falling too much)
        if (Math.abs(this.hook.y - targetY) > 10) {
          const directionY = targetY > this.hook.y ? 1 : -1
          // Vertical movement is slower than horizontal to feel more natural
          this.hook.y += directionY * (moveSpeed * 0.7) * (this.game.loop.delta / 1000)
        }
      }
    }
  }

  private updateInstructions() {
    switch (this.hookState) {
      case 'ready':
        this.instructionText.setText('Click to Cast Hook')
        break
      case 'casting':
        this.instructionText.setText('Casting...')
        break
      case 'falling':
        this.instructionText.setText('Move Mouse to Guide Hook | Click to Reel In')
        break
      case 'reeling':
        this.instructionText.setText('Reeling In...')
        break
    }
  }

  // Seeded random number generator for consistent rock generation
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  private generateRocks(startDepth: number, endDepth: number) {
    const segmentHeight = 20
    const easeDistance = 800

    const actualStartDepth = Math.max(startDepth, this.WATER_LEVEL)

    for (let depth = actualStartDepth; depth < endDepth; depth += segmentHeight) {
      // Calculate ease factor (0 = no rocks, 1 = full width rocks)
      const depthFromWater = depth - this.WATER_LEVEL
      const easeFactor = Math.min(1, depthFromWater / easeDistance)

      // Adjust rock width based on ease factor
      const adjustedMinWidth = this.rockSettings.minWidth * easeFactor
      const adjustedMaxWidth = this.rockSettings.maxWidth * easeFactor

      // Generate left wall points
      const leftSeed = this.rockSettings.seed + depth * 0.1
      const leftNoise = this.seededRandom(leftSeed)
      const leftWidth = adjustedMinWidth +
        (adjustedMaxWidth - adjustedMinWidth) * leftNoise

      const leftRoughness = (this.seededRandom(leftSeed * 1.5) - 0.5) *
        this.rockSettings.roughness * 20 * easeFactor

      this.rockPoints.left.push(new Phaser.Math.Vector2(
        leftWidth + leftRoughness,
        depth
      ))

      // Generate right wall points
      const rightSeed = this.rockSettings.seed + depth * 0.1 + 1000
      const rightNoise = this.seededRandom(rightSeed)
      const rightWidth = adjustedMinWidth +
        (adjustedMaxWidth - adjustedMinWidth) * rightNoise

      const rightRoughness = (this.seededRandom(rightSeed * 1.5) - 0.5) *
        this.rockSettings.roughness * 20 * easeFactor

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

    // Only draw rocks that are below water level
    const underwaterLeftPoints = this.rockPoints.left.filter(point => point.y >= this.WATER_LEVEL)
    const underwaterRightPoints = this.rockPoints.right.filter(point => point.y >= this.WATER_LEVEL)

    // Draw left wall
    if (underwaterLeftPoints.length > 1) {
      this.rockGraphics.beginPath()
      this.rockGraphics.moveTo(0, underwaterLeftPoints[0].y)

      for (const point of underwaterLeftPoints) {
        this.rockGraphics.lineTo(point.x, point.y)
      }

      // Close the path to the left edge
      const lastLeft = underwaterLeftPoints[underwaterLeftPoints.length - 1]
      this.rockGraphics.lineTo(0, lastLeft.y)
      this.rockGraphics.lineTo(0, underwaterLeftPoints[0].y)

      this.rockGraphics.closePath()
      this.rockGraphics.fillPath()
      this.rockGraphics.strokePath()
    }

    // Draw right wall
    if (underwaterRightPoints.length > 1) {
      this.rockGraphics.beginPath()
      this.rockGraphics.moveTo(800, underwaterRightPoints[0].y)

      for (const point of underwaterRightPoints) {
        this.rockGraphics.lineTo(point.x, point.y)
      }

      // Close the path to the right edge
      const lastRight = underwaterRightPoints[underwaterRightPoints.length - 1]
      this.rockGraphics.lineTo(800, lastRight.y)
      this.rockGraphics.lineTo(800, underwaterRightPoints[0].y)

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
    // Only show depth when hook is in water
    if (this.hook.y > this.WATER_LEVEL) {
      this.actualDepth = Math.max(0, this.hook.y - this.WATER_LEVEL)
      const depthMeters = Math.floor(this.actualDepth / 10)
      this.depthText.setText(`Depth: ${depthMeters}m`)
    } else {
      this.depthText.setText('Depth: 0m')
    }
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
    this.createWaterGradient()
  }

  private updateBoatBobbing() {
    const time = this.time.now * 0.002 // Same timing as water waves
    const waveHeight = 3
    const waveLength = 80

    // Calculate wave height at boat position
    const wave1 = Math.sin((this.boat.x / waveLength) + time) * waveHeight
    const wave2 = Math.sin((this.boat.x / (waveLength * 1.5)) + time * 1.3) * (waveHeight * 0.5)

    // Update boat position to match waves
    this.boat.y = this.WATER_LEVEL + wave1 + wave2
  }

  private resetScene() {
    // Reset rock generation data
    this.generatedRockDepth = 0
    this.rockPoints = {
      left: [],
      right: []
    }

    // Reset hook state
    this.hookState = 'ready'
    this.castStartTime = 0
    this.actualDepth = 0
    this.worldDepth = 0

    // Clear any existing tweens
    this.tweens.killAll()

    // Clear graphics
    if (this.rockGraphics) {
      this.rockGraphics.clear()
    }
    if (this.fishingLine) {
      this.fishingLine.clear()
    }
    if (this.waterSurface) {
      this.waterSurface.clear()
    }

    // Remove existing textures
    if (this.textures.exists('waterGradient')) {
      this.textures.remove('waterGradient')
    }

    // Reset camera
    this.cameras.main.stopFollow()
    this.cameras.main.scrollX = 0
    this.cameras.main.scrollY = 0
  }

  update() {
    const deltaTime = this.game.loop.delta / 1000

    // Update hook movement based on state
    this.updateHookMovement()

    // Update instructions
    this.updateInstructions()

    // Generate more rocks as needed
    this.checkRockGeneration()

    // Update visual elements
    this.updateBoatBobbing()
    this.updateFishingLine()
    this.updateDepthDisplay()
    this.drawRocks()
  }

}