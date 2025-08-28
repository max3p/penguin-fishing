// src/react/GameStateDisplay.tsx
import { useAppSelector } from '../store/hooks'

export const GameStateDisplay = () => {
  const gameState = useAppSelector(state => state.game)
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Game State (Redux)</h4>
      <div><strong>Scene:</strong> {gameState.currentScene}</div>
      <div><strong>Gold:</strong> {gameState.playerInventory.gold}g</div>
      <div><strong>Fishing Rod:</strong> Level {gameState.playerInventory.fishingRod}</div>
      <div><strong>Fishing Line:</strong> Level {gameState.playerInventory.fishingLine}</div>
      <div><strong>Hook:</strong> Level {gameState.playerInventory.hook}</div>
      <div><strong>Bucket:</strong> Level {gameState.playerInventory.bucket}</div>
      <div><strong>Boat:</strong> Level {gameState.playerInventory.boat}</div>
      {gameState.fishingResults && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #666' }}>
          <strong>Fishing Results:</strong>
          <div>Fish Caught: {gameState.fishingResults.fishCaught}</div>
          <div>Total Value: {gameState.fishingResults.totalValue}g</div>
        </div>
      )}
    </div>
  )
}
