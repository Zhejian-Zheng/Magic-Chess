<template>
  <div class="chess-board">
    <div
      v-for="(row, rowIndex) in board"
      :key="rowIndex"
      class="board-row"
    >
      <div
        v-for="(square, colIndex) in row"
        :key="colIndex"
        class="square"
        :class="{
          'square-light': (rowIndex + colIndex) % 2 === 0,
          'square-dark': (rowIndex + colIndex) % 2 === 1,
          'selected': isSelected(rowIndex, colIndex),
          'valid-move': isValidMove(rowIndex, colIndex)
        }"
        @click="handleSquareClick(rowIndex, colIndex)"
      >
        <span v-if="square" class="piece" :class="square.color">
          {{ getPieceSymbol(square) }}
        </span>
        <span v-else-if="isValidMove(rowIndex, colIndex)" class="move-indicator"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChessGame } from '../composables/useChessGame'
import { getPieceSymbol } from '../utils/chessUtils'

const { board, selectedSquare, validMoves, selectSquare } = useChessGame()

function isSelected(row: number, col: number): boolean {
  return selectedSquare.value?.row === row && selectedSquare.value?.col === col
}

function isValidMove(row: number, col: number): boolean {
  return validMoves.value.some(move => move.row === row && move.col === col)
}

function handleSquareClick(row: number, col: number) {
  selectSquare({ row, col })
}
</script>

<style scoped>
.chess-board {
  display: inline-block;
  border: 3px solid #333;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.board-row {
  display: flex;
}

.square {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.square-light {
  background-color: #f0d9b5;
}

.square-dark {
  background-color: #b58863;
}

.square:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.square.selected {
  background-color: #f7f769 !important;
  box-shadow: inset 0 0 0 3px #333;
}

.square.valid-move {
  position: relative;
}

.square.valid-move::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.square.valid-move:hover::before {
  background-color: rgba(0, 0, 0, 0.5);
  width: 30px;
  height: 30px;
}

.piece {
  font-size: 2.5em;
  line-height: 1;
  user-select: none;
  z-index: 2;
  position: relative;
  cursor: grab;
  transition: transform 0.2s;
}

.piece:hover {
  transform: scale(1.1);
}

.piece.white {
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
}

.piece.black {
  filter: drop-shadow(1px 1px 1px rgba(255, 255, 255, 0.3));
}

.move-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .square {
    width: 45px;
    height: 45px;
  }

  .piece {
    font-size: 2em;
  }
}
</style>

