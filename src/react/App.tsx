// src/react/App.tsx

import React, { useEffect, useRef } from 'react'
import { initGame } from '../phaser/main'
import { GameStateDisplay } from './GameStateDisplay'

const App = () => {
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    // Initialize game after component mounts
    if (!gameRef.current) {
      gameRef.current = initGame()
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
      }}
    >
      <div
        id="game-container"
        style={{
          width: '800px',
          height: '600px',
          border: '2px solid #333'
        }}
      />
      <GameStateDisplay />
    </div>
  )
}

export default App