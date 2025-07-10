import React, { useEffect } from 'react'
import '../phaser/main' // import to start Phaser game

const App = () => {
  useEffect(() => {
    // Game will mount on first render
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <div id="game-container" style={{ width: '800px', height: '600px' }} />
      <div style={{ marginLeft: '20px' }}>
        <h2>Penguin Fishing Game</h2>
        {/* Insert React UI here later */}
      </div>
    </div>
  )
}

export default App
