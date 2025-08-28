// src/phaser/types/ShopTypes.ts - Shop system types and interfaces

export interface ShopItem {
  id: string
  name: string
  description: string
  cost: number
  level: number
  maxLevel: number
  icon?: string
  category: ShopItemCategory
}

export type ShopItemCategory = 'fishingRod' | 'fishingLine' | 'hook' | 'bucket' | 'boat'

export interface ShopItemTier {
  level: number
  name: string
  description: string
  cost: number
  bonus?: string
}

export const SHOP_ITEMS: Record<ShopItemCategory, ShopItemTier[]> = {
  fishingRod: [
    { level: 1, name: 'Basic Rod', description: 'A simple wooden fishing rod', cost: 0, bonus: 'Basic fishing capability' },
    { level: 2, name: 'Reinforced Rod', description: 'Sturdy rod with better durability', cost: 100, bonus: '+10% casting distance' },
    { level: 3, name: 'Carbon Fiber Rod', description: 'Lightweight and responsive', cost: 300, bonus: '+25% casting distance' },
    { level: 4, name: 'Titanium Rod', description: 'Professional grade equipment', cost: 800, bonus: '+50% casting distance' },
    { level: 5, name: 'Legendary Rod', description: 'The ultimate fishing rod', cost: 2000, bonus: '+100% casting distance' }
  ],
  fishingLine: [
    { level: 1, name: 'Basic Line', description: 'Simple fishing line', cost: 0, bonus: 'Basic line strength' },
    { level: 2, name: 'Braided Line', description: 'Stronger and more durable', cost: 75, bonus: '+15% line strength' },
    { level: 3, name: 'Fluorocarbon Line', description: 'Nearly invisible underwater', cost: 200, bonus: '+35% line strength' },
    { level: 4, name: 'Dyneema Line', description: 'Ultra-strong synthetic fiber', cost: 600, bonus: '+60% line strength' },
    { level: 5, name: 'Mythril Line', description: 'Legendary strength and durability', cost: 1500, bonus: '+100% line strength' }
  ],
  hook: [
    { level: 1, name: 'Basic Hook', description: 'Simple metal hook', cost: 0, bonus: 'Basic hook effectiveness' },
    { level: 2, name: 'Barbed Hook', description: 'Better fish retention', cost: 50, bonus: '+20% hook effectiveness' },
    { level: 3, name: 'Treble Hook', description: 'Triple hook design', cost: 150, bonus: '+45% hook effectiveness' },
    { level: 4, name: 'Circle Hook', description: 'Fish-friendly design', cost: 400, bonus: '+70% hook effectiveness' },
    { level: 5, name: 'Golden Hook', description: 'Legendary hook of legends', cost: 1200, bonus: '+100% hook effectiveness' }
  ],
  bucket: [
    { level: 1, name: 'Small Bucket', description: 'Basic fish storage', cost: 0, bonus: 'Holds 5kg of fish' },
    { level: 2, name: 'Medium Bucket', description: 'Larger capacity', cost: 80, bonus: 'Holds 10kg of fish' },
    { level: 3, name: 'Large Bucket', description: 'Substantial storage', cost: 250, bonus: 'Holds 20kg of fish' },
    { level: 4, name: 'Cooler Bucket', description: 'Keeps fish fresh longer', cost: 700, bonus: 'Holds 35kg of fish' },
    { level: 5, name: 'Bottomless Bucket', description: 'Infinite fish storage', cost: 1800, bonus: 'Holds unlimited fish' }
  ],
  boat: [
    { level: 1, name: 'Rowboat', description: 'Basic fishing vessel', cost: 0, bonus: 'Access to shallow waters' },
    { level: 2, name: 'Motorboat', description: 'Faster travel', cost: 200, bonus: '+30% travel speed' },
    { level: 3, name: 'Fishing Yacht', description: 'Luxury fishing experience', cost: 600, bonus: '+60% travel speed' },
    { level: 4, name: 'Commercial Trawler', description: 'Professional fishing vessel', cost: 1500, bonus: '+90% travel speed' },
    { level: 5, name: 'Flying Dutchman', description: 'Legendary ghost ship', cost: 3000, bonus: '+150% travel speed' }
  ]
}

export interface PlayerInventory {
  fishingRod: number
  fishingLine: number
  hook: number
  bucket: number
  boat: number
  gold: number
}
