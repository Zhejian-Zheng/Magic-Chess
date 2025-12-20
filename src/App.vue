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
          <div class="game-mode">
            Mode: {{ modeLabel }}
          </div>
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
        <div class="controls-bar">
          <button @click="handleResetGame" class="btn btn-primary">New Game</button>
          <button 
            @click="handleUndo" 
            class="btn btn-secondary" 
            :disabled="!canUndo"
            :title="canUndo ? 'Undo last move' : (moveHistory.length === 0 ? 'No moves to undo' : 'Complete pawn promotion first')"
          >
            Undo {{ moveHistory.length > 0 ? `(${moveHistory.length})` : '' }}
          </button>
          <button class="btn btn-ai slim" @click="handleToggleAi">
            AI: {{ enableAi ? 'On' : 'Off' }}
          </button>
          <button class="btn btn-ghost" @click="openRulesDoc">Chess Rules</button>
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

  <!-- Game Mode Modal -->
  <div v-if="showModeModal" class="modal-overlay" @click.self="showModeModal = false">
    <div class="modal-content">
      <h3>Select Game Mode</h3>
      <p>Choose how you want to play:</p>
      <div class="mode-options">
        <button
          class="mode-btn"
          :class="{ active: selectedMode === 'classic' }"
          @click="selectedMode = 'classic'"
        >
          Classic
          <span class="mode-desc">Standard chess rules</span>
        </button>
        <button
          class="mode-btn"
          :class="{ active: selectedMode === 'random' }"
          @click="pickRandomAbility()"
        >
          Random Ability
          <span class="mode-desc">Click to pick a random magic ability</span>
        </button>
        <div class="mode-select-box">
          <label class="mode-label" for="mode-select">Special Power</label>
          <select id="mode-select" v-model="selectedMode" class="mode-select">
            <option value="special_pawn_power">Pawns always move 2 squares</option>
            <option value="ghost_pawn">Ghost Pawn (1x Ghost Walk)</option>
            <option value="heavy_knight">Heavy Knight (Stun + Vault)</option>
            <option value="bishop_sniper">Bishop Sniper (Ranged + Warding)</option>
            <option value="rook_charge">Rook Charge (Plow extra step)</option>
          </select>
          <div class="mode-picked">Selected: {{ selectedModeLabel }}</div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="showModeModal = false">Cancel</button>
        <button class="btn btn-primary" @click="handleConfirmMode">Start</button>
      </div>
    </div>
  </div>

  <!-- Game Result Modal -->
  <div v-if="showResultModal" class="modal-overlay" @click.self="handleResetGame">
    <div class="modal-content">
      <h3>{{ resultInfo.title }}</h3>
      <p>{{ resultInfo.message }}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="showModeModal = true">Change Mode</button>
        <button class="btn btn-primary" @click="handleResetGame">New Game</button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue'
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
  gameMode,
  enableAi,
  whiteTime,
  blackTime,
  formatTime,
  resetGame,
  undoMove,
  promotePawn,
  toggleAi
} = useChessGame()

const showModeModal = ref(false)
const selectedMode = ref<'classic' | 'random' | 'special_pawn_power' | 'ghost_pawn' | 'heavy_knight' | 'bishop_sniper' | 'rook_charge'>('classic')
const showResultModal = computed(() =>
  ['checkmate', 'stalemate', 'draw'].includes(gameStatus.value)
)

const openRulesDoc = () => {
  window.open('/rules.html', '_blank', 'noopener')
}

const resultInfo = computed(() => {
  if (gameStatus.value === 'checkmate') {
    const winner = currentPlayer.value === 'white' ? 'Black' : 'White'
    return { title: 'Checkmate', message: `${winner} wins!` }
  }
  if (gameStatus.value === 'stalemate') {
    return { title: 'Stalemate', message: 'Draw by stalemate.' }
  }
  if (gameStatus.value === 'draw') {
    return { title: 'Draw', message: 'The game ended in a draw.' }
  }
  return { title: '', message: '' }
})

function handleResetGame() {
  showModeModal.value = true
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

function handleToggleAi() {
  toggleAi()
}

const modeLabel = computed(() => {
  switch (gameMode.value) {
    case 'classic':
      return 'Classic'
    case 'special_pawn_power':
      return 'Special Power (Pawns 2-step anytime)'
    case 'ghost_pawn':
      return 'Ghost Pawn (1x Ghost Walk)'
    case 'heavy_knight':
      return 'Heavy Knight (Stun + Vault)'
    case 'random':
      return 'Random Ability'
    default:
      return gameMode.value
  }
})

const selectedModeLabel = computed(() => {
  switch (selectedMode.value) {
    case 'classic':
      return 'Classic'
    case 'special_pawn_power':
      return 'Special Power (Pawns 2-step anytime)'
    case 'ghost_pawn':
      return 'Ghost Pawn (1x Ghost Walk)'
    case 'heavy_knight':
      return 'Heavy Knight (Stun + Vault)'
    case 'bishop_sniper':
      return 'Bishop Sniper (Ranged + Warding)'
    case 'rook_charge':
      return 'Rook Charge (Plow extra step)'
    case 'random':
      return 'Random Ability'
    default:
      return selectedMode.value
  }
})

function pickRandomAbility() {
  const pool: typeof selectedMode.value[] = [
    'special_pawn_power',
    'ghost_pawn',
    'heavy_knight',
    'bishop_sniper',
    'rook_charge'
  ]
  const pick = pool[Math.floor(Math.random() * pool.length)]
  selectedMode.value = pick
  console.log('Random ability picked:', pick)
}

function handleConfirmMode() {
  try {
    resetGame(selectedMode.value)
    showModeModal.value = false
  } catch (error) {
    console.error('Error in resetGame:', error)
    alert('Error resetting game: ' + (error instanceof Error ? error.message : String(error)))
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
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
  max-width: 980px;
  width: 100%;
  backdrop-filter: blur(12px);
}

.game-header {
  text-align: center;
  margin-bottom: 30px;
}

.game-header h1 {
  font-size: 2.4em;
  color: #2d2f38;
  margin-bottom: 12px;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 1.1em;
  align-items: center;
}

.game-info > div {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.controls-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 18px 0 24px;
}

.game-mode {
  color: #444;
  font-weight: 600;
}

.ai-toggle .btn-ai {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
}

.ai-toggle .btn-ai:hover {
  filter: brightness(1.05);
}

.ai-toggle .btn-ai:active {
  transform: translateY(1px);
}

.btn-ghost {
  padding: 8px 14px;
  border: 2px solid #6366f1;
  border-radius: 6px;
  background: #eef2ff;
  color: #3730a3;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.15);
}

.btn-ghost.accent {
  padding: 10px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffffff, #eef2ff);
  border-color: #7c3aed;
  color: #312e81;
  box-shadow: 0 10px 28px rgba(124, 58, 237, 0.25);
  letter-spacing: 0.3px;
}

.btn-ai.slim {
  padding: 10px 14px;
  border-radius: 10px;
}

.btn-ghost:hover {
  background: #e0e7ff;
}

.btn-ghost:active {
  transform: translateY(1px);
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

.mode-label {
  font-weight: 600;
  color: #444;
}

.mode-select {
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.mode-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

/* Mode modal styles */
.mode-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.mode-btn {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  font-weight: 600;
}

.mode-btn .mode-desc {
  display: block;
  font-weight: 400;
  font-size: 0.9em;
  color: #666;
  margin-top: 4px;
}

.mode-btn.active {
  border-color: #667eea;
  background: #f5f5ff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.mode-btn:hover {
  border-color: #667eea;
}

.mode-select-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mode-label {
  font-weight: 600;
  color: #444;
}

.mode-select {
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.mode-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
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

