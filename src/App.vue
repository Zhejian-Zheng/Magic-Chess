<template>
  <div class="app">
    <div class="game-container">
      <div class="game-header">
        <h1>♔ Magic Chess ♚</h1>
        <div class="game-info">
          <div class="current-player">
            Current Player: <span :class="currentPlayer">{{ currentPlayer === 'white' ? 'White' : 'Black' }}</span>
          </div>
          <div class="game-status">{{ getStatusText() }}</div>
          <div class="game-timer" v-if="gameStatus === 'playing'">
            <div class="timer white-timer" :class="{ active: currentPlayer === 'white' }">
              <span class="timer-label">White:</span>
              <span class="timer-value">{{ formatTime(whiteTime) }}</span>
            </div>
            <div class="timer black-timer" :class="{ active: currentPlayer === 'black' }">
              <span class="timer-label">Black:</span>
              <span class="timer-value">{{ formatTime(blackTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="game-content">
        <div class="captured-pieces captured-black">
          <h3>Black Captured</h3>
          <div class="pieces-list">
            <span
              v-for="(piece, index) in capturedPieces.black"
              :key="`black-${index}`"
              class="captured-piece"
            >
              {{ getPieceSymbol(piece) }}
            </span>
          </div>
        </div>

        <ChessBoard />

        <div class="captured-pieces captured-white">
          <h3>White Captured</h3>
          <div class="pieces-list">
            <span
              v-for="(piece, index) in capturedPieces.white"
              :key="`white-${index}`"
              class="captured-piece"
            >
              {{ getPieceSymbol(piece) }}
            </span>
          </div>
        </div>
      </div>

      <div class="game-controls">
        <button @click="handleResetGame" class="btn btn-primary">New Game</button>
        <button 
          @click="handleUndo" 
          class="btn btn-secondary" 
          :disabled="!canUndo"
          :title="canUndo ? 'Undo last move' : (moveHistory.length === 0 ? 'No moves to undo' : 'Complete pawn promotion first')"
        >
          Undo {{ moveHistory.length > 0 ? `(${moveHistory.length})` : '' }}
        </button>
      </div>

      <!-- Pawn Promotion Modal -->
      <div v-if="pendingPromotion" class="modal-overlay" @click.self="promotePawn('queen')">
        <div class="modal-content">
          <h3>Promote Pawn</h3>
          <p>Choose a piece to promote your pawn:</p>
          <div class="promotion-options">
            <button
              v-for="pieceType in promotionOptions"
              :key="pieceType"
              @click="promotePawn(pieceType)"
              class="promotion-btn"
            >
              {{ getPieceSymbol({ type: pieceType, color: currentPlayer }) }}
              <span>{{ getPieceName({ type: pieceType, color: currentPlayer }) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import type { PieceType } from './types/chess'
import ChessBoard from './components/ChessBoard.vue'
import { useChessGame } from './composables/useChessGame'
import { getPieceSymbol, getPieceName } from './utils/chessUtils'

const {
  currentPlayer,
  capturedPieces,
  gameStatus,
  moveHistory,
  pendingPromotion,
  whiteTime,
  blackTime,
  formatTime,
  resetGame,
  undoMove,
  promotePawn
} = useChessGame()

function handleResetGame() {
  console.log('=== RESET GAME BUTTON CLICKED ===')
  console.log('handleResetGame called')
  try {
    resetGame()
    console.log('resetGame() completed successfully')
  } catch (error) {
    console.error('Error in resetGame:', error)
    alert('Error resetting game: ' + (error instanceof Error ? error.message : String(error)))
  }
}

const promotionOptions: PieceType[] = ['queen', 'rook', 'bishop', 'knight']

const canUndo = computed(() => {
  const hasMoves = moveHistory.value.length > 0
  const noPendingPromotion = !pendingPromotion.value
  const result = hasMoves && noPendingPromotion
  console.log('canUndo computed:', { hasMoves, noPendingPromotion, result, moveHistoryLength: moveHistory.value.length })
  return result
})

// Watch currentPlayer changes for debugging
watch(currentPlayer, (newVal, oldVal) => {
  console.log('currentPlayer changed:', { from: oldVal, to: newVal })
}, { immediate: true })

function handleUndo() {
  console.log('=== UNDO BUTTON CLICKED ===')
  console.log('handleUndo called!', {
    moveHistoryLength: moveHistory.value.length,
    pendingPromotion: pendingPromotion.value,
    canUndo: canUndo.value
  })
  
  if (!canUndo.value) {
    console.warn('Cannot undo:', {
      moveHistoryLength: moveHistory.value.length,
      pendingPromotion: pendingPromotion.value
    })
    return
  }
  
  console.log('Calling undoMove()...')
  try {
    undoMove()
    console.log('undoMove() completed successfully')
  } catch (error) {
    console.error('Error in undoMove:', error)
    alert('Error undoing move: ' + (error instanceof Error ? error.message : String(error)))
  }
}

function getStatusText(): string {
  switch (gameStatus.value) {
    case 'check':
      return 'Check!'
    case 'checkmate':
      return 'Checkmate!'
    case 'stalemate':
      return 'Stalemate'
    case 'draw':
      return 'Draw'
    default:
      return 'In Progress'
  }
}
</script>

<style scoped>
.app {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.game-container {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
}

.game-header {
  text-align: center;
  margin-bottom: 30px;
}

.game-header h1 {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 15px;
}

.game-info {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  font-size: 1.1em;
}

.current-player span.white {
  color: #333;
  font-weight: bold;
}

.current-player span.black {
  color: #666;
  font-weight: bold;
}

.game-status {
  color: #666;
  font-style: italic;
}

.game-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 30px;
}

.captured-pieces {
  min-width: 120px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}

.captured-pieces h3 {
  font-size: 0.9em;
  margin-bottom: 10px;
  color: #666;
}

.pieces-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}

.captured-piece {
  font-size: 1.5em;
  display: inline-block;
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  font-size: 1em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #d0d0d0;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-secondary:not(:disabled) {
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
}

.modal-content h3 {
  margin-bottom: 15px;
  color: #333;
}

.modal-content p {
  margin-bottom: 20px;
  color: #666;
}

.promotion-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.promotion-btn {
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 2em;
}

.promotion-btn:hover {
  border-color: #667eea;
  background: #f5f5ff;
  transform: translateY(-2px);
}

.promotion-btn span {
  font-size: 0.4em;
  color: #666;
  font-weight: 500;
}

@media (max-width: 768px) {
  .game-content {
    flex-direction: column;
    align-items: center;
  }

  .captured-pieces {
    width: 100%;
  }
}
</style>

