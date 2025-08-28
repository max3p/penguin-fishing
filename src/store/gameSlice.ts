// src/store/gameSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PlayerInventory } from '../phaser/types/ShopTypes'

export interface CaughtFish {
  species: string
  weight: number
  value: number
  totalValue: number
}

export interface FishingResults {
  fishCaught: number
  totalValue: number
  caughtFish: CaughtFish[]
}

export interface GameState {
  // Player data
  playerInventory: PlayerInventory
  fishingResults: FishingResults | null
  
  // Game settings
  currentScene: string
  
  // UI state
  showFishingResultsModal: boolean
}

const initialState: GameState = {
  playerInventory: {
    fishingRod: 1,
    fishingLine: 1,
    hook: 1,
    bucket: 1,
    boat: 1,
    gold: 1000, // Starting gold
  },
  fishingResults: null,
  currentScene: 'VillageScene',
  showFishingResultsModal: false,
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Player inventory actions
    updateGold: (state, action: PayloadAction<number>) => {
      state.playerInventory.gold = action.payload
    },
    
    addGold: (state, action: PayloadAction<number>) => {
      state.playerInventory.gold += action.payload
    },
    
    purchaseUpgrade: (state, action: PayloadAction<{ category: keyof Omit<PlayerInventory, 'gold'>, level: number, cost: number }>) => {
      const { category, level, cost } = action.payload
      state.playerInventory[category] = level
      state.playerInventory.gold -= cost
    },
    
    // Fishing results actions
    setFishingResults: (state, action: PayloadAction<FishingResults>) => {
      state.fishingResults = action.payload
      state.showFishingResultsModal = true
    },
    
    clearFishingResults: (state) => {
      state.fishingResults = null
      state.showFishingResultsModal = false
    },
    
    // Scene management
    setCurrentScene: (state, action: PayloadAction<string>) => {
      state.currentScene = action.payload
    },
    
    // UI state actions
    setShowFishingResultsModal: (state, action: PayloadAction<boolean>) => {
      state.showFishingResultsModal = action.payload
    },
    
    // Reset game state (for new game)
    resetGame: (state) => {
      state.playerInventory = initialState.playerInventory
      state.fishingResults = null
      state.showFishingResultsModal = false
      state.currentScene = 'VillageScene'
    },
  },
})

export const {
  updateGold,
  addGold,
  purchaseUpgrade,
  setFishingResults,
  clearFishingResults,
  setCurrentScene,
  setShowFishingResultsModal,
  resetGame,
} = gameSlice.actions

export default gameSlice.reducer
