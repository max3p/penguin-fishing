// src/store/phaserBridge.ts
import { store } from './index'
import { 
  updateGold, 
  addGold, 
  purchaseUpgrade, 
  setFishingResults, 
  clearFishingResults,
  setCurrentScene 
} from './gameSlice'
import type { FishingResults } from './gameSlice'

// Bridge class to connect Phaser scenes with Redux store
export class PhaserReduxBridge {
  private static instance: PhaserReduxBridge
  private updateTimeout: number | null = null
  
  private constructor() {}
  
  static getInstance(): PhaserReduxBridge {
    if (!PhaserReduxBridge.instance) {
      PhaserReduxBridge.instance = new PhaserReduxBridge()
    }
    return PhaserReduxBridge.instance
  }
  
  // Gold management
  getGold(): number {
    try {
      const state = store.getState()
      if (state && state.game && state.game.playerInventory) {
        return state.game.playerInventory.gold
      }
      return 0 // Return default value if state is invalid
    } catch (error) {
      console.error('Error in getGold:', error)
      return 0 // Return default value on error
    }
  }
  
  updateGold(amount: number): void {
    try {
      // Validate gold amount
      if (typeof amount === 'number' && amount >= 0) {
        store.dispatch(updateGold(amount))
      } else {
        console.warn('Invalid gold amount:', amount)
      }
    } catch (error) {
      console.error('Error in updateGold:', error)
    }
  }
  
  addGold(amount: number): void {
    try {
      // Validate gold amount
      if (typeof amount === 'number' && amount > 0) {
        store.dispatch(addGold(amount))
      } else {
        console.warn('Invalid gold amount to add:', amount)
      }
    } catch (error) {
      console.error('Error in addGold:', error)
    }
  }
  
  // Inventory management
  getPlayerInventory() {
    try {
      const state = store.getState()
      if (state && state.game && state.game.playerInventory) {
        return state.game.playerInventory
      }
      // Return default inventory if state is invalid
      return {
        fishingRod: 1,
        fishingLine: 1,
        hook: 1,
        bucket: 1,
        boat: 1,
        gold: 0
      }
    } catch (error) {
      console.error('Error in getPlayerInventory:', error)
      // Return default inventory on error
      return {
        fishingRod: 1,
        fishingLine: 1,
        hook: 1,
        bucket: 1,
        boat: 1,
        gold: 0
      }
    }
  }
  
  purchaseUpgrade(category: keyof Omit<import('./gameSlice').GameState['playerInventory'], 'gold'>, level: number, cost: number): void {
    try {
      // Validate the purchase before dispatching
      const currentState = store.getState()
      const currentGold = currentState.game.playerInventory.gold
      const currentLevel = currentState.game.playerInventory[category]
      
      // Only allow purchasing if it's a valid upgrade and player can afford it
      if (level > currentLevel && currentGold >= cost) {
        store.dispatch(purchaseUpgrade({ category, level, cost }))
      } else {
        console.warn('Invalid purchase attempt:', { category, level, cost, currentGold, currentLevel })
      }
    } catch (error) {
      console.error('Error in purchaseUpgrade:', error)
    }
  }
  
  // Fishing results
  getFishingResults() {
    try {
      const state = store.getState()
      if (state && state.game) {
        return state.game.fishingResults
      }
      return null
    } catch (error) {
      console.error('Error in getFishingResults:', error)
      return null
    }
  }
  
  setFishingResults(results: FishingResults): void {
    try {
      // Validate fishing results before dispatching
      if (results && results.fishCaught > 0 && results.caughtFish && results.caughtFish.length > 0) {
        store.dispatch(setFishingResults(results))
      } else {
        console.warn('Invalid fishing results:', results)
      }
    } catch (error) {
      console.error('Error in setFishingResults:', error)
    }
  }
  
  clearFishingResults(): void {
    try {
      store.dispatch(clearFishingResults())
    } catch (error) {
      console.error('Error in clearFishingResults:', error)
    }
  }
  
  // Scene management
  setCurrentScene(sceneName: string): void {
    try {
      // Only update scene if it's different from current
      const currentScene = store.getState().game.currentScene
      if (currentScene !== sceneName) {
        store.dispatch(setCurrentScene(sceneName))
      }
    } catch (error) {
      console.error('Error in setCurrentScene:', error)
    }
  }
  
  // Subscribe to store changes with debouncing
  subscribe(callback: () => void): () => void {
    return store.subscribe(() => {
      try {
        // Debounce rapid updates to prevent overwhelming the UI
        if (this.updateTimeout) {
          clearTimeout(this.updateTimeout)
        }
        
        this.updateTimeout = setTimeout(() => {
          try {
            callback()
          } catch (error) {
            console.warn('Error in debounced Redux subscription callback:', error)
          }
        }, 16) // ~60fps debounce
      } catch (error) {
        console.warn('Error in Redux subscription setup:', error)
      }
    })
  }

  // Cleanup method for the bridge
  cleanup(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
      this.updateTimeout = null
    }
  }
}

// Export singleton instance
export const phaserReduxBridge = PhaserReduxBridge.getInstance()
