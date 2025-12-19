import type { Board, Position, Piece, Color, PieceType } from '../types/chess'

// Initialize chess board
export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null))
  
  // Place black pieces (top)
  const blackPieces: Piece[] = [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' }
  ]
  
  // Place white pieces (bottom)
  const whitePieces: Piece[] = [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' }
  ]
  
  // Row 0: Black pieces
  blackPieces.forEach((piece, col) => {
    board[0][col] = { ...piece, hasMoved: false }
  })
  
  // Row 1: Black pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false }
  }
  
  // Row 6: White pawns
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false }
  }
  
  // Row 7: White pieces
  whitePieces.forEach((piece, col) => {
    board[7][col] = { ...piece, hasMoved: false }
  })
  
  return board
}

// Check if position is within board bounds
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8
}

// Get piece display symbol
export function getPieceSymbol(piece: Piece): string {
  const symbols: Record<PieceType, { white: string; black: string }> = {
    king: { white: '♔', black: '♚' },
    queen: { white: '♕', black: '♛' },
    rook: { white: '♖', black: '♜' },
    bishop: { white: '♗', black: '♝' },
    knight: { white: '♘', black: '♞' },
    pawn: { white: '♙', black: '♟' }
  }
  return symbols[piece.type][piece.color]
}

// Get piece name in English
export function getPieceName(piece: Piece): string {
  const names: Record<PieceType, string> = {
    king: 'King',
    queen: 'Queen',
    rook: 'Rook',
    bishop: 'Bishop',
    knight: 'Knight',
    pawn: 'Pawn'
  }
  return names[piece.type]
}

// Check if position is occupied by own piece
export function isOwnPiece(board: Board, pos: Position, color: Color): boolean {
  const piece = board[pos.row][pos.col]
  return piece !== null && piece.color === color
}

// Check if position is occupied by enemy piece
export function isEnemyPiece(board: Board, pos: Position, color: Color): boolean {
  const piece = board[pos.row][pos.col]
  return piece !== null && piece.color !== color
}

// Check if position is empty
export function isEmpty(board: Board, pos: Position): boolean {
  return board[pos.row][pos.col] === null
}

