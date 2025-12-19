# Chess Game Test Checklist

## Basic Functionality Tests

### ✅ Build Test
- [x] Project builds without errors
- [x] No TypeScript errors
- [x] No linting errors

### Game Initialization
- [ ] Board initializes with correct piece positions
- [ ] White pieces on bottom (rows 6-7)
- [ ] Black pieces on top (rows 0-1)
- [ ] Current player starts as White

### Piece Movement
- [ ] Can select own pieces
- [ ] Valid moves are highlighted
- [ ] Cannot move to invalid positions
- [ ] Cannot move opponent's pieces
- [ ] Pieces move correctly

### Special Rules

#### Pawn Movement
- [ ] Pawns can move forward one square
- [ ] Pawns can move two squares from starting position
- [ ] Pawns can capture diagonally
- [ ] Pawns cannot move backward

#### Castling
- [ ] Kingside castling works (king moves 2 squares right)
- [ ] Queenside castling works (king moves 2 squares left)
- [ ] Castling blocked if king has moved
- [ ] Castling blocked if rook has moved
- [ ] Castling blocked if squares between are occupied
- [ ] Castling blocked if king is in check
- [ ] Castling blocked if king passes through check

#### En Passant
- [ ] En passant available after opponent pawn moves two squares
- [ ] En passant capture removes correct pawn
- [ ] En passant only available immediately after two-square move

#### Pawn Promotion
- [ ] Promotion dialog appears when pawn reaches end
- [ ] Can promote to Queen, Rook, Bishop, or Knight
- [ ] Pawn is replaced with chosen piece

### Check Detection
- [ ] Check is detected correctly
- [ ] "Check!" status displays
- [ ] Cannot make moves that put own king in check
- [ ] Invalid moves are filtered out

### Checkmate & Stalemate
- [ ] Checkmate is detected correctly
- [ ] "Checkmate!" status displays
- [ ] Stalemate is detected correctly
- [ ] "Stalemate" status displays

### Game Controls
- [ ] "New Game" button resets board
- [ ] "Undo" button reverts last move
- [ ] Undo works correctly with captures
- [ ] Undo works correctly with castling
- [ ] Undo works correctly with en passant

### UI/UX
- [ ] Board displays correctly
- [ ] Pieces display with correct symbols
- [ ] Captured pieces show in side panels
- [ ] Current player indicator works
- [ ] Game status displays correctly
- [ ] Responsive design works on mobile

## Test Scenarios

### Scenario 1: Basic Opening
1. White moves e2-e4
2. Black moves e7-e5
3. White moves Nf3
4. Black moves Nc6
**Expected**: All moves execute correctly

### Scenario 2: Castling
1. Move pieces to allow castling
2. Move king two squares toward rook
**Expected**: Rook moves automatically, castling completes

### Scenario 3: En Passant
1. White pawn on e2 moves to e4
2. Black pawn on d7 moves to d5
3. White pawn captures en passant
**Expected**: Black pawn on d5 is captured

### Scenario 4: Pawn Promotion
1. Move pawn to 7th rank (for white) or 2nd rank (for black)
2. Move pawn forward to promotion square
**Expected**: Promotion dialog appears, pawn becomes chosen piece

### Scenario 5: Check
1. Set up position where king is in check
**Expected**: "Check!" status displays, only moves that remove check are allowed

### Scenario 6: Checkmate
1. Set up checkmate position
**Expected**: "Checkmate!" status displays, game ends

## Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile device

