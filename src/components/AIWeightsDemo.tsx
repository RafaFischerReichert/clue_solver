import React, { useState } from 'react';
import { evaluateGuess, AIWeights, DEFAULT_AI_WEIGHTS, AI_PRESETS } from './SuggestionAI';
import { Guess, GameState } from './GuessEvaluator';
import AIWeightsConfig from './AIWeightsConfig';

const AIWeightsDemo: React.FC = () => {
  const [currentWeights, setCurrentWeights] = useState<AIWeights>(DEFAULT_AI_WEIGHTS);
  const [results, setResults] = useState<Array<{ guess: Guess; score: number; preset: string }>>([]);

  // Sample game state for demonstration
  const sampleGameState: GameState = {
    knowledge: [
      // Suspects
      {
        cardName: 'Colonel Mustard',
        category: 'suspect',
        inYourHand: true, // In your hand
        inPlayersHand: {},
        likelyHas: {},
        inSolution: false,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Professor Plum',
        category: 'suspect',
        inYourHand: false,
        inPlayersHand: { 'Alice': true }, // Known to be in Alice's hand
        likelyHas: {},
        inSolution: false,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Miss Scarlet',
        category: 'suspect',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: { 'Bob': true }, // Likely in Bob's hand
        inSolution: null,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Mrs. White',
        category: 'suspect',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      },
      // Weapons
      {
        cardName: 'Revolver',
        category: 'weapon',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Dagger',
        category: 'weapon',
        inYourHand: false,
        inPlayersHand: { 'Charlie': true }, // Known to be in Charlie's hand
        likelyHas: {},
        inSolution: false,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Candlestick',
        category: 'weapon',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      },
      // Rooms
      {
        cardName: 'Library',
        category: 'room',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Study',
        category: 'room',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Kitchen',
        category: 'room',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      }
    ],
    previousGuesses: [],
    playerOrder: ['You', 'Alice', 'Bob', 'Charlie']
  };

  // Test guesses to evaluate
  const testGuesses: Guess[] = [
    // Strategic guess: Colonel Mustard (in hand) + Revolver + Library
    {
      suspect: 'Colonel Mustard',
      weapon: 'Revolver',
      room: 'Library'
    },
    // Poor guess: Professor Plum (known to be in Alice's hand) + Revolver + Library
    {
      suspect: 'Professor Plum',
      weapon: 'Revolver',
      room: 'Library'
    },
    // Risky guess: Miss Scarlet (likely in Bob's hand) + Revolver + Library
    {
      suspect: 'Miss Scarlet',
      weapon: 'Revolver',
      room: 'Library'
    },
    // Standard guess: Mrs. White + Revolver + Library
    {
      suspect: 'Mrs. White',
      weapon: 'Revolver',
      room: 'Library'
    }
  ];

  const runComparison = () => {
    const newResults: Array<{ guess: Guess; score: number; preset: string }> = [];
    
    // Test each preset
    Object.entries(AI_PRESETS).forEach(([presetName, presetWeights]) => {
      testGuesses.forEach(guess => {
        const score = evaluateGuess(guess, sampleGameState, presetWeights, false);
        newResults.push({ guess, score, preset: presetName });
      });
    });
    
    setResults(newResults);
  };

  const testCurrentWeights = () => {
    const newResults: Array<{ guess: Guess; score: number; preset: string }> = [];
    
    testGuesses.forEach(guess => {
      const score = evaluateGuess(guess, sampleGameState, currentWeights, false);
      newResults.push({ guess, score, preset: 'Custom' });
    });
    
    setResults(newResults);
  };

  const getGuessDescription = (guess: Guess): string => {
    const descriptions = [];
    
    if (guess.suspect === 'Colonel Mustard') {
      descriptions.push('Colonel Mustard (in your hand)');
    } else if (guess.suspect === 'Professor Plum') {
      descriptions.push('Professor Plum (known in Alice\'s hand)');
    } else if (guess.suspect === 'Miss Scarlet') {
      descriptions.push('Miss Scarlet (likely in Bob\'s hand)');
    } else {
      descriptions.push(guess.suspect);
    }
    
    if (guess.weapon === 'Dagger') {
      descriptions.push('Dagger (known in Charlie\'s hand)');
    } else {
      descriptions.push(guess.weapon);
    }
    
    descriptions.push(guess.room);
    
    return descriptions.join(' + ');
  };

  return (
    <div className="ai-weights-demo">
      <h2>AI Weights Configuration Demo</h2>
      
      <div className="demo-description">
        <p>
          This demo shows how different AI weight configurations affect guess evaluation. 
          The AI evaluates guesses based on information gain, strategic value, and penalties for poor choices.
        </p>
        
        <div className="test-scenario">
          <h4>Test Scenario:</h4>
          <ul>
            <li>You have <strong>Colonel Mustard</strong> in your hand</li>
            <li><strong>Professor Plum</strong> is known to be in Alice's hand</li>
            <li><strong>Miss Scarlet</strong> is likely in Bob's hand</li>
            <li><strong>Dagger</strong> is known to be in Charlie's hand</li>
            <li>Other cards are unknown</li>
          </ul>
        </div>
      </div>

      <AIWeightsConfig 
        weights={currentWeights} 
        onWeightsChange={setCurrentWeights} 
      />

      <div className="demo-controls">
        <button onClick={runComparison} className="demo-btn">
          Compare All Presets
        </button>
        <button onClick={testCurrentWeights} className="demo-btn">
          Test Current Weights
        </button>
      </div>

      {results.length > 0 && (
        <div className="results-section">
          <h3>Evaluation Results</h3>
          
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>Guess</th>
                  <th>Description</th>
                  {Array.from(new Set(results.map(r => r.preset))).map(preset => (
                    <th key={preset}>{preset}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {testGuesses.map(guess => (
                  <tr key={`${guess.suspect}-${guess.weapon}-${guess.room}`}>
                    <td>
                      {guess.suspect}, {guess.weapon}, {guess.room}
                    </td>
                    <td>{getGuessDescription(guess)}</td>
                    {Array.from(new Set(results.map(r => r.preset))).map(preset => {
                      const result = results.find(r => 
                        r.guess.suspect === guess.suspect && 
                        r.guess.weapon === guess.weapon && 
                        r.guess.room === guess.room && 
                        r.preset === preset
                      );
                      return (
                        <td key={preset} className={result?.score === Math.max(...results.filter(r => r.preset === preset).map(r => r.score)) ? 'best-score' : ''}>
                          {result ? result.score.toFixed(3) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="results-analysis">
            <h4>Analysis:</h4>
            <ul>
              <li><strong>Strategic Guess</strong> (Colonel Mustard in hand): Should score well with strategic presets</li>
              <li><strong>Poor Guess</strong> (Professor Plum known in Alice's hand): Should score poorly with conservative presets</li>
              <li><strong>Risky Guess</strong> (Miss Scarlet likely in Bob's hand): Should score moderately</li>
              <li><strong>Standard Guess</strong> (Mrs. White): Should score consistently across presets</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWeightsDemo; 