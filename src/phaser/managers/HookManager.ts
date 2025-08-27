// src/phaser/managers/HookManager.ts

import Phaser from "phaser";
import type { HookState, RockGenerationSettings } from "../types/GameTypes";
import type { Fish } from "../entities/Fish";
import { GAME_CONSTANTS } from "../config/GameConstants";

export class HookManager {
  private scene: Phaser.Scene;
  private hook!: Phaser.GameObjects.Rectangle;
  private fishingLine!: Phaser.GameObjects.Graphics;
  private boat!: Phaser.GameObjects.Sprite;
  private state: HookState = "ready";
  private mousePointer: Phaser.Input.Pointer;
  private caughtFish: Fish | null = null;
  private bucketWeight: number = 0;
  private maxBucketWeight: number = GAME_CONSTANTS.BUCKET_MAX_WEIGHT;
  
  // Fishing rod tip position relative to boat center
  private readonly ROD_OFFSET_X = 104;
  private readonly ROD_OFFSET_Y = -27;

  private hookVelocityX = 0;
  private hookVelocityY = 0;
  private readonly RUBBER_BAND_STRENGTH = 10; // How strong the pull towards mouse is
  private readonly DAMPING = 0.85; // Reduces velocity over time (0-1, higher = less damping)
  private readonly MAX_VELOCITY_X = 2000; // Max horizontal speed
  private readonly MAX_VELOCITY_Y = 1500; // Max vertical speed (for upward movement)
  private readonly GRAVITY = 1200; // Constant downward force
  private readonly VERTICAL_INFLUENCE = 0.2; // How much mouse Y affects hook movement
  private depthLimit: number = 100; // Default depth limit in meters

  constructor(scene: Phaser.Scene, areaSettings?: RockGenerationSettings) {
    this.scene = scene;
    this.mousePointer = scene.input.activePointer;
    
    // Set depth limit from area settings if provided
    if (areaSettings) {
      this.depthLimit = areaSettings.depthLimit;
    }
    
    this.createGameObjects();
    this.setupInput();
  }

  private createGameObjects(): void {
    this.boat = this.scene.add
      .sprite(400, GAME_CONSTANTS.WATER_LEVEL, "boat_idle")
      .setOrigin(0.5, 0.5)
      .setScale(2); //ALL sprites are 2x scaled

    this.boat.play("boat-idle");
    this.boat.setDepth(100); // Above depth filter, below UI

    this.hook = this.scene.add.rectangle(
      400 + this.ROD_OFFSET_X,
      GAME_CONSTANTS.WATER_LEVEL + this.ROD_OFFSET_Y,
      8,
      8,
      0xc0c0c0
    );
    this.hook.setOrigin(0.5);
    this.hook.setDepth(100); // Above depth filter, below UI
    
    this.fishingLine = this.scene.add.graphics();
    this.fishingLine.setDepth(100); // Above depth filter, below UI
  }

  private setupInput(): void {
    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.state === "ready") {
        if (this.isBucketFull()) {
          this.showBucketFullNotification();
        } else {
          this.castHook(pointer);
        }
      } else if (this.state === "falling") {
        this.reelInHook();
      }
    });
  }

  private showBucketFullNotification(): void {
    // Emit event for the scene to handle the notification
    this.scene.events.emit("bucketFull");
  }

  private castHook(pointer: Phaser.Input.Pointer): void {
    this.state = "casting";

    const targetX = Phaser.Math.Clamp(pointer.worldX, 100, 700);
    const targetY = Math.max(GAME_CONSTANTS.WATER_LEVEL + 50, pointer.worldY);

    const distance = Phaser.Math.Distance.Between(
      this.hook.x,
      this.hook.y,
      targetX,
      targetY
    );
    const arcHeight = Math.min(100, distance * 0.3);

    const startX = this.hook.x;
    const startY = this.hook.y;

    this.scene.tweens.add({
      targets: this.hook,
      x: targetX,
      y: targetY,
      duration: GAME_CONSTANTS.CAST_DURATION,
      ease: "Power2.easeInOut",
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const progress = tween.progress;
        this.hook.x = startX + (targetX - startX) * progress;
        const linearY = startY + (targetY - startY) * progress;
        const arcOffset = 4 * arcHeight * progress * (1 - progress);
        this.hook.y = linearY - arcOffset;
      },
      onComplete: () => {
        this.state = "falling";
        this.hook.x = targetX;
        this.hook.y = targetY;
        // Reset physics when starting to fall
        this.hookVelocityX = 0;
        this.hookVelocityY = 0;
      },
    });
  }

  private reelInHook(): void {
    this.state = "reeling";
    this.scene.tweens.killTweensOf(this.hook);

    // Reset physics
    this.hookVelocityX = 0;
    this.hookVelocityY = 0;

    this.scene.tweens.add({
      targets: this.hook,
      x: this.boat.x + this.ROD_OFFSET_X,
      y: this.boat.y + this.ROD_OFFSET_Y,
      duration: 800,
      ease: "Power2.easeInOut",
      onUpdate: () => {
        // If we have a caught fish, move it with the hook
        if (this.caughtFish) {
          const fishSprite = this.caughtFish.getSprite();
          fishSprite.setPosition(this.hook.x, this.hook.y + 10);
        }
      },
      onComplete: () => {
        // Fish has been successfully caught and reeled in
        if (this.caughtFish) {
          this.onFishCaught(this.caughtFish);
          this.caughtFish.destroy();
          this.caughtFish = null;
        }
        this.state = "ready";
      },
    });
  }

  private onFishCaught(fish: Fish): void {
    // Get fish info for display
    const fishInfo = fish.getDisplayInfo();

    // Emit custom event for the scene to handle
    this.scene.events.emit("fishCaught", fishInfo);

    // Remove the fish from the scene (it will be cleaned up by FishManager)
    // We don't destroy it here since FishManager handles that
    console.log(
      `Caught ${fishInfo.name}! Weight: ${fishInfo.weight.toFixed(
        1
      )}kg, Value: ${fishInfo.value.toFixed(0)}g`
    );
  }

  // Method to be called when a fish collision is detected
  hookFish(fish: Fish): boolean {
    // Only hook fish if we're in falling state and don't already have a fish
    if (this.state === "falling" && !this.caughtFish) {
      this.caughtFish = fish;

      // Automatically start reeling in when fish is hooked
      this.reelInHook();

      return true;
    }
    return false;
  }

  update(): void {
    this.updateBoatBobbing();
    this.updateHookMovement();
    this.updateFishingLine();
  }

  private updateBoatBobbing(): void {
    const time = this.scene.time.now * 0.002;
    const waveHeight = 3;
    const waveLength = 80;

    const wave1 = Math.sin(this.boat.x / waveLength + time) * waveHeight;
    const wave2 =
      Math.sin(this.boat.x / (waveLength * 1.5) + time * 1.3) *
      (waveHeight * 0.5);

    this.boat.y = GAME_CONSTANTS.WATER_LEVEL + wave1 + wave2;
  }

  private updateHookMovement(): void {
    if (this.state !== "falling") return;

    const deltaTime = this.scene.game.loop.delta / 1000;

    // Get mouse world position
    const mouseWorldX = this.scene.cameras.main.getWorldPoint(
      this.mousePointer.x,
      this.mousePointer.y
    ).x;
    const mouseWorldY = this.scene.cameras.main.getWorldPoint(
      this.mousePointer.x,
      this.mousePointer.y
    ).y;

    // Only apply physics if mouse is underwater
    if (mouseWorldY > GAME_CONSTANTS.WATER_LEVEL) {
      // Calculate target positions with constraints
      const targetX = Phaser.Math.Clamp(mouseWorldX, 100, 700);
      const cameraTop = this.scene.cameras.main.scrollY - 200;
      const cameraBottom =
        this.scene.cameras.main.scrollY + this.scene.cameras.main.height + 400;
      const targetY = Phaser.Math.Clamp(
        mouseWorldY,
        Math.max(cameraTop, GAME_CONSTANTS.WATER_LEVEL + 20),
        cameraBottom
      );

      // Calculate distance to target (rubber band effect)
      const distanceX = targetX - this.hook.x;
      const distanceY = targetY - this.hook.y;

      // Apply rubber band force (proportional to distance)
      const forceX = distanceX * this.RUBBER_BAND_STRENGTH;
      const forceY =
        distanceY * this.RUBBER_BAND_STRENGTH * this.VERTICAL_INFLUENCE;

      // Update velocities with forces
      this.hookVelocityX += forceX * deltaTime;
      this.hookVelocityY += forceY * deltaTime;

      // Apply damping to make movement smooth
      this.hookVelocityX *= this.DAMPING;
      this.hookVelocityY *= this.DAMPING;

      // Clamp velocities to prevent extreme speeds
      this.hookVelocityX = Phaser.Math.Clamp(
        this.hookVelocityX,
        -this.MAX_VELOCITY_X,
        this.MAX_VELOCITY_X
      );
      this.hookVelocityY = Phaser.Math.Clamp(
        this.hookVelocityY,
        -this.MAX_VELOCITY_Y,
        this.MAX_VELOCITY_Y
      );
    } else {
      // If mouse is above water, gradually reduce horizontal movement and apply more damping
      this.hookVelocityX *= this.DAMPING * 0.9;
      this.hookVelocityY *= this.DAMPING * 0.9;
    }

    // Always apply gravity (constant downward force)
    this.hookVelocityY += this.GRAVITY * deltaTime;

    // Apply velocities to hook position
    this.hook.x += this.hookVelocityX * deltaTime;
    this.hook.y += this.hookVelocityY * deltaTime;

    // Keep hook within horizontal bounds
    if (this.hook.x < 100) {
      this.hook.x = 100;
      this.hookVelocityX = Math.max(0, this.hookVelocityX); // Remove leftward velocity
    } else if (this.hook.x > 700) {
      this.hook.x = 700;
      this.hookVelocityX = Math.min(0, this.hookVelocityX); // Remove rightward velocity
    }

    // Prevent hook from going above water
    if (this.hook.y < GAME_CONSTANTS.WATER_LEVEL + 10) {
      this.hook.y = GAME_CONSTANTS.WATER_LEVEL + 10;
      this.hookVelocityY = Math.max(0, this.hookVelocityY); // Remove upward velocity
    }

    // Check if hook has reached the depth limit and auto-reel if so
    const currentDepth = this.hook.y - GAME_CONSTANTS.WATER_LEVEL;
    const depthLimitInPixels = this.depthLimit * 10; // Convert meters to pixels (10:1 ratio)
    if (currentDepth >= depthLimitInPixels) {
      console.log(`Hook reached depth limit of ${this.depthLimit}m (${depthLimitInPixels}px), auto-reeling...`);
      this.reelInHook();
    }
  }

  private updateFishingLine(): void {
    this.fishingLine.clear();
    this.fishingLine.lineStyle(2, 0x000000);
    this.fishingLine.moveTo(this.boat.x + this.ROD_OFFSET_X, this.boat.y + this.ROD_OFFSET_Y);
    this.fishingLine.lineTo(this.hook.x, this.hook.y);
    this.fishingLine.stroke();
  }

  getHook(): Phaser.GameObjects.Rectangle {
    return this.hook;
  }

  getState(): HookState {
    return this.state;
  }

  getDepth(): number {
    return Math.max(0, this.hook.y - GAME_CONSTANTS.WATER_LEVEL);
  }

  // Update bucket weight
  updateBucketWeight(weight: number): void {
    this.bucketWeight = weight;
  }

  // Check if bucket is full
  isBucketFull(): boolean {
    return this.bucketWeight >= this.maxBucketWeight;
  }

  // Check if hook can catch fish (not already caught one and bucket not full)
  canCatchFish(): boolean {
    return this.state === "falling" && this.caughtFish === null && !this.isBucketFull();
  }

  // Get the bounds of the hook for collision detection
  getHookBounds(): Phaser.Geom.Rectangle {
    return this.hook.getBounds();
  }

  reset(): void {
    this.state = "ready";
    this.caughtFish = null;
    this.scene.tweens.killAll();
    this.hook.setPosition(400 + this.ROD_OFFSET_X, GAME_CONSTANTS.WATER_LEVEL + this.ROD_OFFSET_Y);
    this.hook.setFillStyle(0xc0c0c0); // Reset hook color
    this.fishingLine.clear();
    this.hookVelocityX = 0;
    this.hookVelocityY = 0;
  }

  destroy(): void {
    this.hook.destroy();
    this.fishingLine.destroy();
    this.boat.destroy();
  }

  public adjustPhysics(settings: {
    rubberBandStrength?: number;
    damping?: number;
    verticalInfluence?: number;
    gravity?: number;
  }): void {
    if (settings.rubberBandStrength !== undefined) {
      (this as any).RUBBER_BAND_STRENGTH = settings.rubberBandStrength;
    }
    if (settings.damping !== undefined) {
      (this as any).DAMPING = settings.damping;
    }
    if (settings.verticalInfluence !== undefined) {
      (this as any).VERTICAL_INFLUENCE = settings.verticalInfluence;
    }
    if (settings.gravity !== undefined) {
      (this as any).GRAVITY = settings.gravity;
    }
  }
}
