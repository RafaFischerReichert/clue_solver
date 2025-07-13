# Cluedo Solver Desktop App

A modern desktop application for solving Cluedo/Clue mysteries, built with Tauri and React.

## Features

- **Game Setup**: Configure players, suspects, weapons, and rooms
- **Room Access Control**: Directly specify which rooms you can access (no more roll-based logic!)
- **Guess Recording**: Record guesses and their outcomes
- **Knowledge Tracking**: Track what you know about each player's cards
- **Solution Analysis**: See possible solutions and best next guesses
- **Modern UI**: Beautiful, responsive interface with tabbed navigation

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Rust** (latest stable version)
- **Tauri CLI**

### Installing Prerequisites

1. **Node.js**: Download from [nodejs.org](https://nodejs.org/)

2. **Rust**: Install via [rustup.rs](https://rustup.rs/)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **Tauri CLI**: Install globally
   ```bash
   npm install -g @tauri-apps/cli
   ```

## Installation & Setup

1. **Clone the repository** (if not already done)
   ```bash
   git clone <your-repo-url>
   cd clue_solver/desktop-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run tauri dev
   ```

This will start both the React development server and the Tauri application.

## Building for Production

To create a distributable application:

```bash
npm run tauri build
```

This will create platform-specific installers in the `src-tauri/target/release/bundle/` directory.

## Usage

### 1. Game Setup
- Enter player names (one per line)
- Configure suspects, weapons, and rooms (or use defaults)
- Enter your player name and the cards in your hand
- Click "Initialize Game State" to start

### 2. Room Access Setup
- Select which rooms you currently have access to
- This replaces the old roll-based system with direct input
- Only accessible rooms will be available for guessing

### 3. Recording Guesses
- Select the guesser, suspect, weapon, and room
- Choose the order of players asked
- Record who showed a card (if any) and which card
- Click "Record Guess" to save

### 4. Analysis
- **Knowledge Tab**: See what you know about each player's cards
- **Solutions Tab**: View remaining possible solutions
- **Suggestions Tab**: Get recommendations for your next guess

## Key Improvements Over Streamlit Version

### 1. Room Access Logic
- **Before**: Roll-based system that was complex and error-prone
- **After**: Direct selection of accessible rooms - much more intuitive!

### 2. Desktop Experience
- **Before**: Web-based Streamlit app
- **After**: Native desktop application with better performance and offline capability

### 3. Modern UI
- **Before**: Basic Streamlit widgets
- **After**: Modern React components with tabbed navigation and better UX

## Architecture

```
desktop-app/
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── GameSetup.tsx   # Game setup interface
│   │   └── GamePlay.tsx    # Main game interface
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── src-tauri/             # Rust backend
│   ├── src/main.rs        # Main Rust code
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
└── package.json           # Node.js dependencies
```

## Development

### Frontend (React)
- Located in `src/`
- Uses TypeScript for type safety
- Styled with CSS modules
- Uses Lucide React for icons

### Backend (Rust/Tauri)
- Located in `src-tauri/`
- Handles file system operations
- Provides native desktop capabilities

### Adding New Features
1. **Frontend**: Add React components in `src/components/`
2. **Backend**: Add Rust functions in `src-tauri/src/main.rs`
3. **Communication**: Use Tauri commands for frontend-backend communication

## Troubleshooting

### Common Issues

1. **"Command not found: tauri"**
   - Install Tauri CLI: `npm install -g @tauri-apps/cli`

2. **Rust compilation errors**
   - Update Rust: `rustup update`
   - Check Rust version: `rustc --version`

3. **Node.js version issues**
   - Use Node.js v16 or higher
   - Check version: `node --version`

4. **Build failures**
   - Clear cache: `npm run tauri clean`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the same terms as the main Cluedo Solver project.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the main project documentation
3. Open an issue on GitHub 