import type { Board, Position, Color, Move, GameMode } from '../types/chess'
import { isValidPosition, isEmpty, isOwnPiece, isEnemyPiece } from './chessUtils'
import { isInCheck } from './checkDetector'

// Store last move for en passant detection
let lastMove: Move | null = null

export function setLastMove(move: Move | null) {
  lastMove = move
}

export function getLastMove(): Move | null {
  return lastMove
}

// Get all valid moves
export function getValidMoves(
  board: Board,
  pos: Position,
  color: Color,
  options?: { mode?: GameMode }
): Position[] {
  const piece = board[pos.row][pos.col]
  if (!piece || piece.color !== color) {
    return []
  }

  // Stunned pieces cannot move
  if (piece.stunnedTurns && piece.stunnedTurns > 0) {
    return []
  }

  const moves: Position[] = []
  const mode = options?.mode ?? 'classic'

  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(board, pos, color, mode))
      break
    case 'rook':
      moves.push(...getRookMoves(board, pos, color))
      break
    case 'knight':
      moves.push(...getKnightMoves(board, pos, color, mode))
      break
    case 'bishop':
      moves.push(...getBishopMoves(board, pos, color, mode))
      break
    case 'queen':
      moves.push(...getRookMoves(board, pos, color))
      moves.push(...getBishopMoves(board, pos, color, mode))
      break
    case 'king':
      moves.push(...getKingMoves(board, pos, color))
      break
  }

  // Filter out moves that would put own king in check
  return moves.filter(move => {
    return !wouldMovePutKingInCheck(board, pos, move, color)
  })
}

// Check if a move would put the king in check
function wouldMovePutKingInCheck(
  board: Board,
  from: Position,
  to: Position,
  color: Color
): boolean {
  // Create a temporary board to test the move
  const tempBoard: Board = board.map(row => row.map(piece => piece ? { ...piece } : null))
  const piece = tempBoard[from.row][from.col]
  if (!piece) return true

  tempBoard[to.row][to.col] = piece
  tempBoard[from.row][from.col] = null

  return isInCheck(tempBoard, color)
}

// Pawn moves
function getPawnMoves(board: Board, pos: Position, color: Color, mode: GameMode): Position[] {
  const moves: Position[] = []
  const direction = color === 'white' ? -1 : 1
  const startRow = color === 'white' ? 6 : 1
  const piece = board[pos.row][pos.col]
  if (!piece || piece.type !== 'pawn') return moves

  // Move forward one square
  const oneStep: Position = { row: pos.row + direction, col: pos.col }
  if (isValidPosition(oneStep) && isEmpty(board, oneStep)) {
    moves.push(oneStep)

    const allowDoubleStep =
      mode === 'special_pawn_power'
        ? true // always allow double if path clear
        : pos.row === startRow && !piece.hasMoved

    if (allowDoubleStep) {
      const twoStep: Position = { row: pos.row + direction * 2, col: pos.col }
      if (isValidPosition(twoStep) && isEmpty(board, twoStep)) {
        moves.push(twoStep)
      }
    }
  }

  // Capture diagonally
  const captureLeft: Position = { row: pos.row + direction, col: pos.col - 1 }
  const captureRight: Position = { row: pos.row + direction, col: pos.col + 1 }

  if (isValidPosition(captureLeft) && isEnemyPiece(board, captureLeft, color)) {
    moves.push(captureLeft)
  }
  if (isValidPosition(captureRight) && isEnemyPiece(board, captureRight, color)) {
    moves.push(captureRight)
  }

  // En passant
  if (lastMove && lastMove.piece.type === 'pawn') {
    const enPassantRow = color === 'white' ? 3 : 4
    const enPassantTargetRow = color === 'white' ? 2 : 5
    
    // Check if last move was a two-square pawn move
    const rowDiff = Math.abs(lastMove.to.row - lastMove.from.row)
    if (rowDiff === 2 && lastMove.to.row === enPassantRow && pos.row === enPassantRow) {
      // Check if enemy pawn is adjacent
      if (lastMove.to.col === pos.col - 1) {
        const enPassantMove = { row: enPassantTargetRow, col: pos.col - 1 }
        if (!wouldMovePutKingInCheck(board, pos, enPassantMove, color)) {
          moves.push(enPassantMove)
        }
      }
      if (lastMove.to.col === pos.col + 1) {
        const enPassantMove = { row: enPassantTargetRow, col: pos.col + 1 }
        if (!wouldMovePutKingInCheck(board, pos, enPassantMove, color)) {
          moves.push(enPassantMove)
        }
      }
    }
  }

  // Ghost walk (only in ghost_pawn mode): jump over one piece ahead if landing is empty and unused
  if (mode === 'ghost_pawn' && !piece.ghostWalkUsed) {
    const mid: Position = { row: pos.row + direction, col: pos.col }
    const landing: Position = { row: pos.row + direction * 2, col: pos.col }
    if (isValidPosition(landing) && board[mid.row][mid.col] && isEmpty(board, landing)) {
      moves.push(landing)
    }
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
      if (isOwnPiece(board, newPos, color)) break
      if (isEnemyPiece(board, newPos, color)) {
        moves.push(newPos)
        break
      }
      moves.push(newPos)
    }
  }

  return moves
}

// Knight moves
function getKnightMoves(board: Board, pos: Position, color: Color, mode: GameMode): Position[] {
  const moves: Position[] = []
  const offsets = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ]
  // Heavy knight vault: extended L (3,1)
  if (mode === 'heavy_knight') {
    offsets.push(
      { row: -3, col: -1 }, { row: -3, col: 1 },
      { row: 3, col: -1 }, { row: 3, col: 1 },
      { row: -1, col: -3 }, { row: 1, col: -3 },
      { row: -1, col: 3 }, { row: 1, col: 3 }
    )
  }

  for (const offset of offsets) {
    const newPos: Position = {
      row: pos.row + offset.row,
      col: pos.col + offset.col
    }

    if (isValidPosition(newPos) && !isOwnPiece(board, newPos, color)) {
      moves.push(newPos)
    }
  }

  return moves
}

// Bishop moves
function getBishopMoves(board: Board, pos: Position, color: Color, mode: GameMode): Position[] {
  const moves: Position[] = []
  const directions = [
    { row: -1, col: -1 }, // Top-left
    { row: -1, col: 1 },  // Top-right
    { row: 1, col: -1 },  // Bottom-left
    { row: 1, col: 1 }    // Bottom-right
  ]

  // Standard sliding
  for (const dir of directions) {
    for (let i = 1; i < 8; i++) {
      const newPos: Position = {
        row: pos.row + dir.row * i,
        col: pos.col + dir.col * i
      }

      if (!isValidPosition(newPos)) break
      if (isOwnPiece(board, newPos, color)) break
      if (isEnemyPiece(board, newPos, color)) {
        moves.push(newPos)
        break
      }
      moves.push(newPos)
    }
  }

  // Sniper: can capture up to 2 squares away diagonally without being blocked by intermediate piece
  if (mode === 'bishop_sniper') {
    for (const dir of directions) {
      for (let i = 1; i <= 2; i++) {
        const target: Position = { row: pos.row + dir.row * i, col: pos.col + dir.col * i }
        if (!isValidPosition(target)) break
        const occupant = board[target.row][target.col]
        if (occupant && occupant.color !== color) {
          moves.push(target)
          break
        }
        // If friendly piece or empty, do nothing; sniper only for capture
      }
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

  const piece = board[pos.row][pos.col]
  if (!piece || piece.type !== 'king') return moves

  for (const offset of offsets) {
    const newPos: Position = {
      row: pos.row + offset.row,
      col: pos.col + offset.col
    }

    if (isValidPosition(newPos) && !isOwnPiece(board, newPos, color)) {
      moves.push(newPos)
    }
  }

  // Castling
  if (!piece.hasMoved && !isInCheck(board, color)) {
    const kingRow = color === 'white' ? 7 : 0
    
    // Kingside castling
    if (pos.row === kingRow && pos.col === 4) {
      const kingsideRook = board[kingRow][7]
      if (kingsideRook && kingsideRook.type === 'rook' && 
          kingsideRook.color === color && !kingsideRook.hasMoved) {
        // Check if squares between king and rook are empty
        if (isEmpty(board, { row: kingRow, col: 5 }) &&
            isEmpty(board, { row: kingRow, col: 6 })) {
          // Check if king would pass through check
          if (!wouldMovePutKingInCheck(board, pos, { row: kingRow, col: 5 }, color) &&
              !wouldMovePutKingInCheck(board, pos, { row: kingRow, col: 6 }, color)) {
            moves.push({ row: kingRow, col: 6 })
          }
        }
      }
    }

    // Queenside castling
    if (pos.row === kingRow && pos.col === 4) {
      const queensideRook = board[kingRow][0]
      if (queensideRook && queensideRook.type === 'rook' && 
          queensideRook.color === color && !queensideRook.hasMoved) {
        // Check if squares between king and rook are empty
        if (isEmpty(board, { row: kingRow, col: 1 }) &&
            isEmpty(board, { row: kingRow, col: 2 }) &&
            isEmpty(board, { row: kingRow, col: 3 })) {
          // Check if king would pass through check
          if (!wouldMovePutKingInCheck(board, pos, { row: kingRow, col: 3 }, color) &&
              !wouldMovePutKingInCheck(board, pos, { row: kingRow, col: 2 }, color)) {
            moves.push({ row: kingRow, col: 2 })
          }
        }
      }
    }
  }

  return moves
}

