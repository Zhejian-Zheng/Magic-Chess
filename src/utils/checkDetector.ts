import type { Board, Position, Color, GameMode } from '../types/chess'
import { isValidPosition, isEnemyPiece } from './chessUtils'
import { getValidMoves } from './moveValidator'

// Find king position
export function findKing(board: Board, color: Color): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

// Check if a square is under attack by enemy pieces
export function isSquareUnderAttack(board: Board, pos: Position, attackerColor: Color): boolean {
  // Check all enemy pieces and see if they can attack this square
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === attackerColor) {
        const moves = getAttackingMoves(board, { row, col }, attackerColor)
        if (moves.some(move => move.row === pos.row && move.col === pos.col)) {
          return true
        }
      }
    }
  }
  return false
}

// Get attacking moves (without check filtering to avoid recursion)
function getAttackingMoves(board: Board, pos: Position, color: Color): Position[] {
  const piece = board[pos.row][pos.col]
  if (!piece || piece.color !== color) {
    return []
  }

  const moves: Position[] = []

  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnAttacks(board, pos, color))
      break
    case 'rook':
      moves.push(...getRookMoves(board, pos, color))
      break
    case 'knight':
      moves.push(...getKnightMoves(board, pos, color))
      break
    case 'bishop':
      moves.push(...getBishopMoves(board, pos, color))
      break
    case 'queen':
      moves.push(...getRookMoves(board, pos, color))
      moves.push(...getBishopMoves(board, pos, color))
      break
    case 'king':
      moves.push(...getKingMoves(board, pos, color))
      break
  }

  return moves
}

// Pawn attacks (diagonal only)
function getPawnAttacks(board: Board, pos: Position, color: Color): Position[] {
  const moves: Position[] = []
  const direction = color === 'white' ? -1 : 1

  const attackLeft: Position = { row: pos.row + direction, col: pos.col - 1 }
  const attackRight: Position = { row: pos.row + direction, col: pos.col + 1 }

  if (isValidPosition(attackLeft) && isEnemyPiece(board, attackLeft, color)) {
    moves.push(attackLeft)
  }
  if (isValidPosition(attackRight) && isEnemyPiece(board, attackRight, color)) {
    moves.push(attackRight)
  }

  return moves
}

// Rook moves
function getRookMoves(board: Board, pos: Position, color: Color): Position[] {
  const moves: Position[] = []
  const directions = [
    { row: -1, col: 0 }, // Up
    { row: 1, col: 0 },  // Down
    { row: 0, col: -1 }, // Left
    { row: 0, col: 1 }   // Right
  ]

  for (const dir of directions) {
    for (let i = 1; i < 8; i++) {
      const newPos: Position = {
        row: pos.row + dir.row * i,
        col: pos.col + dir.col * i
      }

      if (!isValidPosition(newPos)) break
      const piece = board[newPos.row][newPos.col]
      if (piece && piece.color === color) break
      if (piece && piece.color !== color) {
        moves.push(newPos)
        break
      }
      moves.push(newPos)
    }
  }

  return moves
}

// Knight moves
function getKnightMoves(board: Board, pos: Position, color: Color): Position[] {
  const moves: Position[] = []
  const offsets = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ]

  for (const offset of offsets) {
    const newPos: Position = {
      row: pos.row + offset.row,
      col: pos.col + offset.col
    }

    if (isValidPosition(newPos)) {
      const piece = board[newPos.row][newPos.col]
      if (!piece || piece.color !== color) {
        moves.push(newPos)
      }
    }
  }

  return moves
}

// Bishop moves
function getBishopMoves(board: Board, pos: Position, color: Color): Position[] {
  const moves: Position[] = []
  const directions = [
    { row: -1, col: -1 }, // Top-left
    { row: -1, col: 1 },  // Top-right
    { row: 1, col: -1 },  // Bottom-left
    { row: 1, col: 1 }    // Bottom-right
  ]

  for (const dir of directions) {
    for (let i = 1; i < 8; i++) {
      const newPos: Position = {
        row: pos.row + dir.row * i,
        col: pos.col + dir.col * i
      }

      if (!isValidPosition(newPos)) break
      const piece = board[newPos.row][newPos.col]
      if (piece && piece.color === color) break
      if (piece && piece.color !== color) {
        moves.push(newPos)
        break
      }
      moves.push(newPos)
    }
  }

  return moves
}

// King moves
function getKingMoves(board: Board, pos: Position, color: Color): Position[] {
  const moves: Position[] = []
  const offsets = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
  ]

  for (const offset of offsets) {
    const newPos: Position = {
      row: pos.row + offset.row,
      col: pos.col + offset.col
    }

    if (isValidPosition(newPos)) {
      const piece = board[newPos.row][newPos.col]
      if (!piece || piece.color !== color) {
        moves.push(newPos)
      }
    }
  }

  return moves
}

// Check if king is in check
export function isInCheck(board: Board, color: Color): boolean {
  const kingPos = findKing(board, color)
  if (!kingPos) return false

  const enemyColor: Color = color === 'white' ? 'black' : 'white'
  return isSquareUnderAttack(board, kingPos, enemyColor)
}

// Check if player has any valid moves
export function hasValidMoves(board: Board, color: Color, mode: GameMode): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col }, color, { mode })
        if (moves.length > 0) {
          return true
        }
      }
    }
  }
  return false
}

// Check if it's checkmate
export function isCheckmate(board: Board, color: Color, mode: GameMode): boolean {
  return isInCheck(board, color) && !hasValidMoves(board, color, mode)
}

// Check if it's stalemate
export function isStalemate(board: Board, color: Color, mode: GameMode): boolean {
  return !isInCheck(board, color) && !hasValidMoves(board, color, mode)
}

