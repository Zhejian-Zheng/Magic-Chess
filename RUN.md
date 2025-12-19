# How to Run the Chess Game

## Quick Start

### Option 1: Development Server (Already Running)
The development server is already running! Just:
1. Open your browser
2. Go to: **http://localhost:3000**
3. Refresh the page (F5) if you made changes

### Option 2: Restart Development Server

If you need to restart the server:

```bash
# Stop the current server (press Ctrl+C in the terminal where it's running)
# Or kill the process:
pkill -f "vite"

# Then start it again:
npm run dev
```

### Option 3: First Time Setup

If you haven't installed dependencies yet:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Available Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change the port in vite.config.ts
```

### Server Not Responding
```bash
# Check if server is running
curl http://localhost:3000

# Restart the server
pkill -f "vite"
npm run dev
```

## Access the Game

Once the server is running:
- **Local**: http://localhost:3000
- **Network**: Check the terminal output for the network URL


