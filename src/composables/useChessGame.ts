import { ref } from 'vue'
import type { Board, Position, Piece, Color, Move, GameStatus, PieceType, GameMode } from '../types/chess'
import { createInitialBoard, isEmpty, isValidPosition } from '../utils/chessUtils'
import { getValidMoves, setLastMove, getLastMove } from '../utils/moveValidator'
import { isCheckmate, isStalemate, isInCheck } from '../utils/checkDetector'

// Ensure a single shared game state across all components
let gameState: ReturnType<typeof createGameState> | null = null

export function useChessGame() {
  if (!gameState) {
    gameState = createGameState()
  }
  return gameState
}

function createGameState() {
  const board = ref<Board>(createInitialBoard())
  const currentPlayer = ref<Color>('white')
  const selectedSquare = ref<Position | null>(null)
  const validMoves = ref<Position[]>([])
  const moveHistory = ref<Move[]>([])
  const capturedPieces = ref<{ white: Piece[]; black: Piece[] }>({
    white: [],
    black: []
  })
  const gameStatus = ref<GameStatus>('playing')
  const pendingPromotion = ref<Position | null>(null)
  const gameMode = ref<GameMode>('classic')
  const gameStartTime = ref<Date | null>(null)
  const whiteTime = ref(0) // Time in seconds
  const blackTime = ref(0) // Time in seconds
  const currentTimer = ref<number | null>(null)
  const enableAi = ref(true)
  const aiColor: Color = 'black'

  // Draw support (half-move clock; repetition tracking can be added later)
  const halfmoveClock = ref(0) // 50-move rule (ply count since last pawn move or capture)
  const halfmoveHistory: number[] = []

  // Placeholder for future threefold repetition tracking
  function recordPosition() {
    // Intentionally left simple; repetition detection can be added later
  }

  function tickStunFor(color: Color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const pc = board.value[r][c]
        if (pc && pc.color === color && pc.stunnedTurns && pc.stunnedTurns > 0) {
          pc.stunnedTurns = Math.max(0, pc.stunnedTurns - 1)
        }
      }
    }
  }

  // Select square
  function selectSquare(pos: Position) {
    console.log('selectSquare called:', { pos, currentPlayer: currentPlayer.value })
    const piece = board.value[pos.row][pos.col]
    
    // If clicking own piece, select it
    if (piece && piece.color === currentPlayer.value) {
      console.log('Selecting own piece:', piece.type)
      selectedSquare.value = pos
      validMoves.value = getValidMoves(board.value, pos, currentPlayer.value, { mode: gameMode.value })
      console.log('Valid moves:', validMoves.value.length)
      return
    }
    
    // If piece already selected, try to move
    if (selectedSquare.value) {
      const isValidMove = validMoves.value.some(
        move => move.row === pos.row && move.col === pos.col
      )
      
      console.log('selectSquare: trying to move', {
        from: selectedSquare.value,
        to: pos,
        isValidMove,
        currentPlayer: currentPlayer.value,
        validMovesCount: validMoves.value.length
      })
      
      if (isValidMove) {
        console.log('Move is valid, calling makeMove...')
        const result = makeMove(selectedSquare.value, pos)
        console.log('makeMove result:', result)
      } else {
        console.warn('Invalid move attempted - clearing selection')
      }
      
      // Clear selection
      selectedSquare.value = null
      validMoves.value = []
    } else {
      console.log('No piece selected, clicking empty square or opponent piece')
    }
  }

  // Execute move
  function makeMove(from: Position, to: Position, promotionType?: PieceType) {
    console.log('makeMove called:', { from, to, promotionType, currentPlayer: currentPlayer.value })
    const piece = board.value[from.row][from.col]
    if (!piece) {
      console.warn('makeMove: no piece at from position')
      return false
    }

    let captured = board.value[to.row][to.col]
    let enPassantPos: Position | undefined = undefined
    
    // Check for en passant
    if (piece.type === 'pawn' && !captured && from.col !== to.col) {
      const lastMove = getLastMove()
      if (lastMove && lastMove.piece.type === 'pawn') {
        // Check if this is an en passant move (pawn moves diagonally to empty square)
        const enPassantRow = piece.color === 'white' ? 3 : 4
        if (from.row === enPassantRow && Math.abs(to.col - from.col) === 1) {
          // En passant capture - capture the pawn that just moved two squares
          const capturedRow = piece.color === 'white' ? 3 : 4
          const capturedCol = to.col
          captured = board.value[capturedRow][capturedCol]
          if (captured && captured.type === 'pawn' && captured.color !== piece.color) {
            enPassantPos = { row: capturedRow, col: capturedCol }
            board.value[capturedRow][capturedCol] = null
          }
        }
      }
    }
    
    // Record move with original state
    const move: Move = {
      from,
      to,
      piece: { ...piece },
      captured: captured ? { ...captured } : undefined,
      promotion: promotionType,
      enPassant: enPassantPos,
      pieceHadMoved: piece.hasMoved || false,
      capturedHadMoved: captured?.hasMoved || false
    }
    // Detect ghost walk usage
    const isGhostWalk =
      gameMode.value === 'ghost_pawn' &&
      piece.type === 'pawn' &&
      Math.abs(to.row - from.row) === 2 &&
      !isEmpty(board.value, { row: (from.row + to.row) / 2, col: from.col }) &&
      !piece.ghostWalkUsed
    
    // Handle castling
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      const isKingside = to.col > from.col
      const rookCol = isKingside ? 7 : 0
      const newRookCol = isKingside ? 5 : 3
      const rook = board.value[from.row][rookCol]
      
      if (rook && rook.type === 'rook') {
        board.value[from.row][newRookCol] = { ...rook, hasMoved: true }
        board.value[from.row][rookCol] = null
        move.castling = isKingside ? 'kingside' : 'queenside'
      }
    }
    
    // Update board
    const finalPiece: Piece = promotionType 
      ? { type: promotionType, color: piece.color, hasMoved: true }
      : { ...piece, hasMoved: true }
    if (isGhostWalk) {
      finalPiece.ghostWalkUsed = true
    }
    
    board.value[to.row][to.col] = finalPiece
    board.value[from.row][from.col] = null
    
    // Record captured piece
    if (captured) {
      capturedPieces.value[captured.color].push(captured)
    }

    // Heavy knight: stun adjacent enemy pieces for 1 turn
    if (gameMode.value === 'heavy_knight' && piece.type === 'knight') {
      const adj = [
        { row: to.row - 1, col: to.col },
        { row: to.row + 1, col: to.col },
        { row: to.row, col: to.col - 1 },
        { row: to.row, col: to.col + 1 }
      ]
      adj.forEach(p => {
        if (isValidPosition(p)) {
          const target = board.value[p.row][p.col]
          if (target && target.color !== piece.color) {
            target.stunnedTurns = 1
          }
        }
      })
    }

    // Rook charge: if capture with 3+ straight distance, plow one extra if empty
    if (
      gameMode.value === 'rook_charge' &&
      piece.type === 'rook' &&
      captured &&
      (from.row === to.row || from.col === to.col) &&
      Math.abs(from.row - to.row + from.col - to.col) >= 3
    ) {
      const dirRow = Math.sign(to.row - from.row)
      const dirCol = Math.sign(to.col - from.col)
      const extra: Position = { row: to.row + dirRow, col: to.col + dirCol }
      if (isValidPosition(extra) && isEmpty(board.value, extra)) {
        board.value[extra.row][extra.col] = board.value[to.row][to.col]
        board.value[to.row][to.col] = null
        move.to = extra
      }
    }
    
    // Check for pawn promotion
    if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
      if (!promotionType) {
        // Need to prompt for promotion - add move to history first
        moveHistory.value.push(move)
        setLastMove(move)
        pendingPromotion.value = to
        // Don't switch player yet - wait for promotion
        return true
      }
    }
    
    moveHistory.value.push(move)
    setLastMove(move)
    
    // Update halfmove clock (reset on pawn move or capture)
    if (piece.type === 'pawn' || captured) {
      halfmoveHistory.push(halfmoveClock.value)
      halfmoveClock.value = 0
    } else {
      halfmoveHistory.push(halfmoveClock.value)
      halfmoveClock.value += 1
    }

    // Update timer before switching player
    updateTimer()
    
    // Switch player
    const oldPlayer = currentPlayer.value
    currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
    console.log('Player switched:', { from: oldPlayer, to: currentPlayer.value })

    // Tick stun for the new player (their stunned pieces recover)
    tickStunFor(currentPlayer.value)
    
    // Start timer for new player
    startTimer()
    
    // Update position repetition tracking
    recordPosition()

    // Update game status
    updateGameStatus()

    // 触发 AI 走子
    queueAiMove()
    
    return true
  }

  // Promote pawn
  function promotePawn(pieceType: PieceType) {
    if (!pendingPromotion.value) return false
    
    const pos = pendingPromotion.value
    const piece = board.value[pos.row][pos.col]
    if (!piece) return false
    
    // Update the piece on the board to the promoted type
    board.value[pos.row][pos.col] = {
      type: pieceType,
      color: piece.color,
      hasMoved: true
    }
    
    // Update last move with promotion type
    // Note: move.piece still contains the original pawn, which is correct for undo
    if (moveHistory.value.length > 0) {
      const lastMove = moveHistory.value[moveHistory.value.length - 1]
      lastMove.promotion = pieceType
    }
    
    pendingPromotion.value = null
    
    // Update timer before switching player
    updateTimer()
    
    // Switch player after promotion (makeMove didn't switch player when promotion was pending)
    currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
    
    // Tick stun for the new player (their stunned pieces recover)
    tickStunFor(currentPlayer.value)
    
    // Start timer for new player
    startTimer()
    
    // Update game status after promotion
    updateGameStatus()

    // 触发 AI 走子（如果轮到 AI）
    queueAiMove()
    
    return true
  }

  // 简单 AI：收集所有合法走法，优先吃子，否则随机
  function getAllValidMoves(color: Color): { from: Position; to: Position; promotion?: PieceType; captured?: Piece | null }[] {
    const moves: { from: Position; to: Position; promotion?: PieceType; captured?: Piece | null }[] = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.value[row][col]
        if (!piece || piece.color !== color) continue
        const from: Position = { row, col }
        const valids = getValidMoves(board.value, from, color, { mode: gameMode.value })
        valids.forEach(to => {
          const target = board.value[to.row][to.col]
          const isPromotion = piece.type === 'pawn' && (to.row === 0 || to.row === 7)
          moves.push({
            from,
            to,
            promotion: isPromotion ? 'queen' : undefined,
            captured: target
          })
        })
      }
    }
    return moves
  }

  function queueAiMove() {
    // 只让指定颜色的 AI 行动
    if (!enableAi.value) return
    if (gameStatus.value !== 'playing') return
    if (pendingPromotion.value) return
    if (currentPlayer.value !== aiColor) return

    // 异步调度，避免阻塞 UI
    setTimeout(runAiMove, 200)
  }

  function runAiMove() {
    if (gameStatus.value !== 'playing') return
    if (pendingPromotion.value) return
    if (currentPlayer.value !== aiColor) return

    const moves = getAllValidMoves(aiColor)
    if (moves.length === 0) return

    // 优先吃子，否则随机
    const captureMoves = moves.filter(m => m.captured)
    const chosen = (captureMoves.length > 0 ? captureMoves : moves)[Math.floor(Math.random() * (captureMoves.length > 0 ? captureMoves.length : moves.length))]

    console.log('AI move chosen:', chosen)
    makeMove(chosen.from, chosen.to, chosen.promotion)
  }

  function toggleAi() {
    enableAi.value = !enableAi.value
    console.log('AI toggled:', enableAi.value ? 'ON' : 'OFF')
    // 如果关闭 AI，停止任何等待中的执行
    if (!enableAi.value && currentTimer.value !== null) {
      // 不影响计时，仅避免 AI 继续排队
      return
    }
    // 如果打开 AI 且轮到 AI，立即排队
    queueAiMove()
  }

  // Update game status
  function updateGameStatus() {
    const toMove: Color = currentPlayer.value
    const mode = gameMode.value

    if (isCheckmate(board.value, toMove, mode)) {
      gameStatus.value = 'checkmate'
    } else if (isStalemate(board.value, toMove, mode)) {
      gameStatus.value = 'stalemate'
    } else if (isInCheck(board.value, toMove)) {
      gameStatus.value = 'check'
    } else {
      gameStatus.value = 'playing'
    }
  }

  // Timer functions
  function startTimer() {
    // Stop current timer if running
    if (currentTimer.value !== null) {
      clearInterval(currentTimer.value)
    }
    
    // Start timer for current player
    currentTimer.value = window.setInterval(() => {
      if (currentPlayer.value === 'white') {
        whiteTime.value++
      } else {
        blackTime.value++
      }
    }, 1000)
  }
  
  function stopTimer() {
    if (currentTimer.value !== null) {
      clearInterval(currentTimer.value)
      currentTimer.value = null
    }
  }
  
  function updateTimer() {
    // Update timer when player switches
    // This is called before switching, so we update the current player's time
    // The timer will be started for the new player after switching
  }
  
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Reset game
  function resetGame(mode?: GameMode) {
    console.log('=== resetGame FUNCTION CALLED ===')
    try {
      // Set mode
      if (mode) {
        if (mode === 'random') {
          const modes: GameMode[] = ['classic', 'special_pawn_power', 'ghost_pawn', 'heavy_knight']
          gameMode.value = modes[Math.floor(Math.random() * modes.length)]
        } else {
          gameMode.value = mode
        }
      }

      stopTimer()
      console.log('Timer stopped')
      
      board.value = createInitialBoard()
      console.log('Board reset')
      
      currentPlayer.value = 'white'
      console.log('Current player set to white')
      
      selectedSquare.value = null
      validMoves.value = []
      moveHistory.value = []
      capturedPieces.value = { white: [], black: [] }
      gameStatus.value = 'playing'
      pendingPromotion.value = null
      setLastMove(null)
      whiteTime.value = 0
      blackTime.value = 0
      gameStartTime.value = new Date()
      
      console.log('All game state reset')
      
      startTimer()
      console.log('Timer started')
      
      console.log('resetGame completed successfully, mode:', gameMode.value)
    } catch (error) {
      console.error('Error in resetGame:', error)
      throw error
    }
  }

  // Undo move
  function undoMove() {
    console.log('=== undoMove FUNCTION CALLED ===')
    console.log('undoMove called, moveHistory length:', moveHistory.value.length)
    
    if (moveHistory.value.length === 0) {
      console.warn('Cannot undo: no moves in history')
      throw new Error('No moves to undo')
    }
    
    // Stop timer
    stopTimer()
    
    console.log('Timer stopped, proceeding with undo...')
    
    const lastMove = moveHistory.value.pop()!
    const { 
      from, 
      to, 
      piece, 
      captured, 
      castling, 
      enPassant, 
      promotion,
      pieceHadMoved,
      capturedHadMoved
    } = lastMove
    
    // Handle castling undo first
    if (castling) {
      const isKingside = castling === 'kingside'
      const rookCol = isKingside ? 5 : 3
      const originalRookCol = isKingside ? 7 : 0
      const rook = board.value[from.row][rookCol]
      
      if (rook && rook.type === 'rook') {
        // Restore rook to original position with original hasMoved state
        board.value[from.row][originalRookCol] = { 
          ...rook, 
          hasMoved: false // Rook hadn't moved before castling
        }
        board.value[from.row][rookCol] = null
      }
    }
    
    // Restore the moved piece to its original position with original hasMoved state
    // If it was a promotion, piece.type is still 'pawn' (the original piece)
    board.value[from.row][from.col] = {
      ...piece,
      hasMoved: pieceHadMoved
    }
    
    // Restore captured piece or clear destination square
    if (enPassant) {
      // En passant: restore captured pawn to its original position
      if (captured) {
        board.value[enPassant.row][enPassant.col] = {
          ...captured,
          hasMoved: capturedHadMoved
        }
      }
      // Clear the destination square (where the capturing pawn moved to)
      board.value[to.row][to.col] = null
    } else if (promotion) {
      // If piece was promoted, the destination square should be empty
      // (the promoted piece is being moved back to from position as a pawn)
      board.value[to.row][to.col] = captured || null
    } else {
      // Normal move: restore captured piece or clear square
      if (captured) {
        board.value[to.row][to.col] = {
          ...captured,
          hasMoved: capturedHadMoved
        }
      } else {
        board.value[to.row][to.col] = null
      }
    }
    
    // Remove captured piece from captured pieces list
    if (captured) {
      const capturedList = capturedPieces.value[captured.color]
      const index = capturedList.length - 1
      if (index >= 0) {
        capturedList.splice(index, 1)
      }
    }
    
    // Update last move reference
    if (moveHistory.value.length > 0) {
      setLastMove(moveHistory.value[moveHistory.value.length - 1])
    } else {
      setLastMove(null)
    }
    
    // Switch player back
    currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
    tickStunFor(currentPlayer.value)
    
    // Start timer for the player we switched back to
    startTimer()
    
    // Clear selection
    selectedSquare.value = null
    validMoves.value = []
    pendingPromotion.value = null
    
    // Update game status
    updateGameStatus()
  }

  // Initialize game start time and timer
  if (gameStartTime.value === null) {
    gameStartTime.value = new Date()
    console.log('Game initialized, starting timer for white')
    startTimer()
  }

  return {
    board,
    currentPlayer,
    selectedSquare,
    validMoves,
    moveHistory,
    capturedPieces,
    gameStatus,
    pendingPromotion,
    gameMode,
    enableAi,
    whiteTime,
    blackTime,
    formatTime,
    selectSquare,
    makeMove,
    promotePawn,
    resetGame,
    undoMove,
    toggleAi
  }
}
