import React, { useState } from 'react';
import { AIWeights, DEFAULT_AI_WEIGHTS, AI_PRESETS } from './SuggestionAI';

interface AIWeightsConfigProps {
  weights: AIWeights;
  onWeightsChange: (weights: AIWeights) => void;
}

const AIWeightsConfig: React.FC<AIWeightsConfigProps> = ({ weights, onWeightsChange }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('balanced');

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = AI_PRESETS[presetName as keyof typeof AI_PRESETS];
    if (preset) {
      onWeightsChange(preset);
    }
  };

  const handleWeightChange = (key: keyof AIWeights, value: number) => {
    onWeightsChange({
      ...weights,
      [key]: value,
    });
  };

  const resetToDefault = () => {
    onWeightsChange(DEFAULT_AI_WEIGHTS);
    setSelectedPreset('balanced');
  };

  return (
    <div className="ai-weights-config">
      <h3>AI Behavior Configuration</h3>
      
      {/* Preset Selection */}
      <div className="preset-section">
        <label htmlFor="preset-select">AI Personality:</label>
        <select
          id="preset-select"
          value={selectedPreset}
          onChange={(e) => handlePresetChange(e.target.value)}
        >
          <option value="balanced">Balanced</option>
          <option value="conservative">Conservative</option>
          <option value="aggressive">Aggressive</option>
          <option value="informationFocused">Information-Focused</option>
          <option value="strategic">Strategic</option>
        </select>
        <button onClick={resetToDefault} className="reset-btn">
          Reset to Default
        </button>
      </div>

      {/* Penalty Weights */}
      <div className="weight-section">
        <h4>Penalty Weights</h4>
        <div className="weight-row">
          <label htmlFor="penalty-definite">
            Cards Definitely in Other Hands:
          </label>
          <input
            id="penalty-definite"
            type="range"
            min="-2"
            max="0"
            step="0.1"
            value={weights.penaltyDefinitelyInOtherHands}
            onChange={(e) => handleWeightChange('penaltyDefinitelyInOtherHands', parseFloat(e.target.value))}
          />
          <span className="weight-value">{weights.penaltyDefinitelyInOtherHands}</span>
        </div>
        
        <div className="weight-row">
          <label htmlFor="penalty-likely">
            Cards Likely in Other Hands:
          </label>
          <input
            id="penalty-likely"
            type="range"
            min="-1"
            max="0"
            step="0.1"
            value={weights.penaltyLikelyInOtherHands}
            onChange={(e) => handleWeightChange('penaltyLikelyInOtherHands', parseFloat(e.target.value))}
          />
          <span className="weight-value">{weights.penaltyLikelyInOtherHands}</span>
        </div>
      </div>

      {/* Strategic Weights */}
      <div className="weight-section">
        <h4>Strategic Weights</h4>
        <div className="weight-row">
          <label htmlFor="strategic-multiplier">
            Strategic Value Multiplier:
          </label>
          <input
            id="strategic-multiplier"
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={weights.strategicValueMultiplier}
            onChange={(e) => handleWeightChange('strategicValueMultiplier', parseFloat(e.target.value))}
          />
          <span className="weight-value">{weights.strategicValueMultiplier}</span>
        </div>
        
        <div className="weight-row">
          <label htmlFor="elimination-bonus">
            Strategic Elimination Bonus:
          </label>
          <input
            id="elimination-bonus"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={weights.strategicEliminationBonus}
            onChange={(e) => handleWeightChange('strategicEliminationBonus', parseFloat(e.target.value))}
          />
          <span className="weight-value">{weights.strategicEliminationBonus}</span>
        </div>
      </div>

      {/* Probability Weights */}
      <div className="weight-section">
        <h4>Probability Weights</h4>
        <div className="weight-row">
          <label htmlFor="prob-definite">
            Definitely Known Cards:
          </label>
          <input
            id="prob-definite"
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={weights.probabilityDefinitelyKnown}
            onChange={(e) => handleWeightChange('probabilityDefinitelyKnown', parseFloat(e.target.value))}
          />
          <span className="weight-value">{weights.probabilityDefinitelyKnown}</span>
        </div>
        
        <div className="weight-row">
          <label htmlFor="prob-likely">
            Likely Cards:
          </label>
          <input
            id="prob-likely"
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={weights.probabilityLikely}
            onChange={(e) => handleWeightChange('probabilityLikely', parseFloat(e.target.value))}
          />
          <span className="weight-value">{weights.probabilityLikely}</span>
        </div>
        
        <div className="weight-row">
          <label htmlFor="prob-unlikely">
            Unlikely Cards:
          </label>
          <input
            id="prob-unlikely"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={weights.probabilityUnlikely}
            onChange={(e) => handleWeightChange('probabilityUnlikely', parseFloat(e.target.value))}
          />
          <span className="weight-value">{weights.probabilityUnlikely}</span>
        </div>
      </div>

      {/* Information Gain Weights */}
      <div className="weight-section">
        <h4>Information Gain Weights</h4>
        <div className="weight-row">
          <label htmlFor="entropy-weight">
            Entropy Weight:
          </label>
          <input
            id="entropy-weight"
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={weights.entropyWeight}
            onChange={(e) => handleWeightChange('entropyWeight', parseFloat(e.target.value))}
          />
          <span className="weight-value">{weights.entropyWeight}</span>
        </div>
        
        <div className="weight-row">
          <label htmlFor="bonus-weight">
            Information Bonus Weight:
          </label>
          <input
            id="bonus-weight"
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={weights.informationBonusWeight}
            onChange={(e) => handleWeightChange('informationBonusWeight', parseFloat(e.target.value))}
          />
          <span className="weight-value">{weights.informationBonusWeight}</span>
        </div>
      </div>

      {/* Current Configuration Summary */}
      <div className="config-summary">
        <h4>Current Configuration</h4>
        <pre>{JSON.stringify(weights, null, 2)}</pre>
      </div>
    </div>
  );
};

export default AIWeightsConfig; 