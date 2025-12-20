// Piece types
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
export type Color = 'white' | 'black'

// Chess piece
export interface Piece {
  type: PieceType
  color: Color
  hasMoved?: boolean // Used for castling and pawn initial move
  ghostWalkUsed?: boolean // For ghost pawn power
  stunnedTurns?: number // For heavy knight stun
}

// Board position (0-7, 0-7)
export interface Position {
  row: number
  col: number
}

// Board square
export type Square = Piece | null

// Board state (8x8)
export type Board = Square[][]

// Game status
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
export type GameMode =
  | 'classic'
  | 'random'
  | 'special_pawn_power'
  | 'ghost_pawn'
  | 'heavy_knight'
  | 'bishop_sniper'
  | 'rook_charge'

// Move
export interface Move {
  from: Position
  to: Position
  piece: Piece
  captured?: Piece
  promotion?: PieceType // Pawn promotion
  enPassant?: Position // En passant capture position
  castling?: 'kingside' | 'queenside' // Castling type
  pieceHadMoved?: boolean // Original hasMoved state of the piece
  capturedHadMoved?: boolean // Original hasMoved state of captured piece (if any)
}

// Game state
export interface GameState {
  board: Board
  currentPlayer: Color
  status: GameStatus
  moveHistory: Move[]
  capturedPieces: {
    white: Piece[]
    black: Piece[]
  }
}

