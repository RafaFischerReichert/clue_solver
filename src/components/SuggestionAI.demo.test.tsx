import { describe, expect, it } from 'vitest';
import { demonstrateStrategicGuesses } from './SuggestionAI.demo';

describe('Strategic Guess Demo', () => {
  it('should demonstrate strategic guessing', () => {
    // This will run the demo and show the output
    demonstrateStrategicGuesses();
    
    // The test passes if the demo runs without errors
    expect(true).toBe(true);
  });
}); 