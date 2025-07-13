# Cluedo Solver Desktop App

A desktop application for solving Cluedo/Clue board games using React, TypeScript, and Tauri. This app helps players track game information, analyze clues, and deduce the solution through logical reasoning.

## 🎯 Features

### ✅ Implemented
- **Game Setup**: Configure players, your hand, and game elements
- **Knowledge Tracking**: Track which cards are in which players' hands
- **Deduction Engine**: Advanced logic to deduce card locations based on game events
- **Three-State Knowledge System**: Distinguish between "definitely has", "definitely doesn't have", and "unknown"
- **Guess Response Tracking**: Record and analyze player responses to suggestions
- **Solution Detection**: Automatically identify when cards must be in the solution
- **Comprehensive Testing**: Full test coverage with TDD approach

### 🚧 In Progress / Planned
- **Suggestion AI**: Intelligent suggestions for optimal gameplay
- **Response Tracker UI**: Interface for recording player responses
- **Solution Display**: Clear presentation of deduced solution
- **Game State Persistence**: Save and load game progress
- **Export/Import**: Share game states with other players
- **Advanced Analytics**: Statistical analysis of deduction accuracy

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Desktop Framework**: Tauri (Rust + Web Technologies)
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS Modules
- **Icons**: Lucide React

## 📁 Project Structure

```
clue_solver/
├── src/                    # React application source
│   ├── components/         # React components
│   │   ├── GameSetup.tsx   # Game initialization
│   │   ├── HandInput.tsx   # Player hand selection
│   │   ├── KnowledgeTable.tsx # Knowledge display
│   │   ├── GameLogic.tsx   # Core deduction logic
│   │   ├── SuggestionForm.tsx # Suggestion interface
│   │   ├── ResponseTracker.tsx # Response recording
│   │   └── ...            # Other components
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── src-tauri/             # Tauri backend (Rust)
│   ├── src/               # Rust source code
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Rust (for Tauri)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RafaFischerReichert/clue_solver.git
   cd clue_solver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once
npm run tauri        # Tauri CLI commands
```

## 🧠 Core Logic

### Knowledge Base System
The app uses a sophisticated three-state knowledge system:
- **`true`**: Player definitely has this card
- **`false`**: Player definitely does not have this card  
- **`null`**: Unknown whether player has this card

### Deduction Engine
The `GameLogic.tsx` module contains the core deduction algorithms:
- **`analyzePlayerTuples`**: Analyzes guess responses to deduce card locations
- **`updatedKnowledgeBaseFromTuples`**: Applies deductions to knowledge base
- **`checkForSolution`**: Identifies cards that must be in the solution

### Key Functions
- `initializeKnowledgeBase()`: Sets up initial game state
- `markCardInPlayerHand()`: Marks a card as definitely in a player's hand
- `markCardNotInPlayerHand()`: Marks a card as definitely not in a player's hand
- `recordGuessResponse()`: Records and analyzes player responses
- `analyzePlayerTuples()`: Deduces new information from recorded responses

## 🧪 Testing

The project follows Test-Driven Development (TDD) principles with comprehensive test coverage:

```bash
npm test              # Run all tests
npm run test:ui       # Interactive test UI
npm run test:run      # Run tests once
```

Tests cover:
- ✅ Core logic functions
- ✅ Component rendering and interactions
- ✅ Edge cases and error handling
- ✅ Three-state knowledge system
- ✅ Deduction algorithms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TDD: Write tests first, then implement
- Use TypeScript for type safety
- Follow React best practices
- Maintain comprehensive test coverage
- Document complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**RafaFischerReichert** - [GitHub Profile](https://github.com/RafaFischerReichert)

## 🙏 Acknowledgments

- Cluedo/Clue board game creators
- Tauri team for the excellent desktop framework
- React and TypeScript communities
- All contributors and testers

---

**Happy deducing! 🕵️‍♂️**
