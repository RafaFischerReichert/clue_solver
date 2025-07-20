# Changelog

## [1.1.0] - 2025-07-16
### Added
- Introduced PlayerOrderSetup: users can now set and customize the player order and hand sizes during game setup.

### Changed
- Completely updated the color scheme and overall CSS styling for a new look and feel.
- Improved layout responsiveness and alignment for all main gameplay sections.
- No changes to core gameplay logic beyond the new setup feature. 

## [1.2.0] - 2025-07-17
### Added
- Introduced a script to automate versioning

### Changed
- Knowledge Table and Game Logic now utilize the new hand sizes.
- Refined deduction logic in GameLogic to better infer card ownership based on guess history and known hands.
- Expanded GameLogic.test.tsx for the new functionalities
- Minor updates to related components and styles for consistency.

## [1.2.1] - 2025-07-18
### Added
- New deduction logic step for deducing cards in players' hands based on known solution cards.

### Changed
- This release completes the major deduction logic refactor started in 1.2.0, unifying all deduction logic into `updateKnowledgeWithDeductions` and removing legacy functions.
- Refactored deduction logic: all deduction (tuple-based, direct, and advanced) is now handled exclusively by `updateKnowledgeWithDeductions` for consistency and maintainability.
- Removed `updatedKnowledgeBaseFromTuples` and all references to it throughout the codebase.
- Removed `analyzePlayerTuples` and migrated its logic into `updateKnowledgeWithDeductions`.
- Updated all tests to use the unified deduction pipeline and removed tests for deprecated functions.
- Improved type annotation practices in test files, ensuring explicit types where beneficial and removing unused imports.
- Cleaned up code and comments for clarity and maintainability.

## [1.3.0] - 2025-07-18
### Changed
- Fixed bugs regarding with the new deduction logic
- Improved Suggestion AI with strategic guessing capabilities:
  - **Strategic Value Recognition**: AI now recognizes when guessing cards in your hand can be strategically valuable (e.g., using a room in hand to test two possible suspect/weapon combinations)
  - **Enhanced Scoring System**: Combines entropy-based information gain with strategic value bonuses for more sophisticated decision making
  - **Smart Penalty System**: Properly penalizes poor guesses (cards known to be in other players' hands) while rewarding strategic moves
  - **World Generation Fixes**: Fixed issues with possible world generation when cards are in your hand
  - **Comprehensive Evaluation**: AI now goes through full entropy calculation for all guesses instead of returning early with basic scores
  - **LikelyHas Probability System**: Implemented soft deduction system that tracks cards likely to be in specific players' hands vs. default probability, improving world probability calculations and AI decision making

  ## [1.4.0] - 2025-01-27
  ### Added
  - **Configurable AI Weights System**: Introduced comprehensive fine-tuning capabilities for the Suggestion AI:
    - **9 Configurable Parameters**: Penalty weights, strategic multipliers, probability weights, and information gain weights
    - **5 AI Personalities**: Balanced, Conservative, Aggressive, Information-Focused, and Strategic presets
    - **UI Configuration Component**: Interactive sliders and preset selection for real-time AI behavior adjustment
    - **Demo Component**: Side-by-side comparison of different AI configurations with test scenarios
    - **Backward Compatibility**: All existing code continues to work with default weights
  - **AI Weights Configuration Interface**: Full UI for adjusting AI behavior with real-time preview
  - **AI Weights Demo**: Interactive demonstration showing how different configurations affect guess evaluation

  ### Changed
  - **Knowledge Table Rendering**: Cards being marked as solution now will automatically mark as not in any player's hands.
  - **Enhanced Suggestion AI**: Now accepts configurable weights parameter for fine-tuning behavior
  - **Updated Function Signatures**: `evaluateGuess` now accepts optional `AIWeights` parameter
  - **Improved Test Coverage**: Added tests for configurable weights functionality
  - **AI Strategic Insight Implementation**: Optimized AI decision-making by treating cards in your hand and cards in the solution as equivalent outcomes - both result in no player being able to show anything, allowing for more efficient strategic evaluation

## [1.4.1] - 2025-01-27
### Added
- **Zero Information Gain Detection**: Suggestion AI now intelligently detects and rejects guesses with zero information gain potential
- **Comprehensive Zero-Value Check**: AI evaluates whether all cards in a guess are either:
  - Known to be in your hand
  - Known to be in other players' hands  
  - Known to be in the solution
- **Enhanced Test Coverage**: Added comprehensive tests for zero information gain scenarios

### Changed
- **Suggestion AI Logic**: `evaluateGuess` function now returns 0 immediately for guesses that cannot provide any new information
- **Improved AI Efficiency**: Prevents AI from suggesting pointless guesses that waste turns and provide no strategic value
- **Debug Output Enhancement**: Added clear debug messaging when zero information gain is detected