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
