# Magic Chess ♔

A web-based chess game built with Vue 3 + TypeScript.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast frontend build tool

## Features

- ✅ Complete board and piece display
- ✅ Basic move rules (pawn, rook, knight, bishop, queen, king)
- ✅ Move validation and highlighting
- ✅ Captured pieces display
- ✅ Undo functionality
- ✅ Responsive design

## Planned Features

- ⏳ Check/checkmate detection
- ⏳ Castling
- ⏳ En passant
- ⏳ Pawn promotion
- ⏳ Draw detection
- ⏳ AI opponent
- ⏳ Online multiplayer

## Quick Start

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The project will start at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Vue components
│   └── ChessBoard.vue  # Chess board component
├── composables/         # Composable functions
│   └── useChessGame.ts # Game logic
├── types/              # TypeScript type definitions
│   └── chess.ts        # Chess-related types
├── utils/              # Utility functions
│   ├── chessUtils.ts   # Board utility functions
│   └── moveValidator.ts # Move validation
├── App.vue             # Main app component
├── main.ts             # Entry file
└── style.css           # Global styles
```

## How to Play

1. Click to select your piece
2. Green highlights show valid moves for that piece
3. Click target position to move
4. Use "Undo" button to undo last move
5. Use "New Game" button to restart

## Development Roadmap

- [ ] Complete game rules (special moves)
- [ ] Add game state detection
- [ ] Implement simple AI
- [ ] Add sound effects and animations
- [ ] Support PGN format import/export
- [ ] Add game history

## License

GPL-3.0
