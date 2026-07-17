import React, { useState, useEffect } from 'react';
import { useConversationOS } from '@cvos/sdk';
import { Trophy, Eye, Key, AlertCircle } from 'lucide-react';

const LETTER_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, 
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const calculateWordScore = (word) => {
  return word.toUpperCase().split('').reduce((score, char) => score + (LETTER_VALUES[char] || 0), 0);
};

const isValidWord = (word) => {
  return word.length >= 2 && /^[a-zA-Z]+$/.test(word);
};

export default function App() {
  const cvos = useConversationOS({
    defaultState: {
      words: [],
      scores: {},
      errors: {}
    }
  });

  const state = cvos.state || cvos.gameState || { words: [], scores: {}, errors: {} };
  const updateState = cvos.updateState || cvos.setGameState || cvos.setState || (() => {});
  const { sendAction, role, userId, isHost, useAction, onAction } = cvos;

  const [input, setInput] = useState('');

  const handleWordSubmission = (payload, senderId) => {
    if (!isHost) return;
    const word = payload.word.trim();
    if (!isValidWord(word)) {
      updateState(prev => ({
        ...prev,
        errors: { ...prev.errors, [senderId]: `'${word}' is not a valid word!` }
      }));
      return;
    }

    const score = calculateWordScore(word);
    
    updateState(prev => ({
      ...prev,
      words: [...(prev.words || []), { word: word.toUpperCase(), userId: senderId, score, id: Date.now() + Math.random() }],
      scores: { ...(prev.scores || {}), [senderId]: ((prev.scores || {})[senderId] || 0) + score },
      errors: { ...(prev.errors || {}), [senderId]: null }
    }));
  };

  // Safe wrapper for useAction if it behaves as a React Hook
  const HookActionHandler = () => {
    if (typeof useAction === 'function') {
      useAction('SUBMIT_WORD', handleWordSubmission);
    }
    return null;
  };

  useEffect(() => {
    let unsubscribe;
    if (typeof onAction === 'function') {
      unsubscribe = onAction('SUBMIT_WORD', handleWordSubmission);
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [onAction, isHost]); // include isHost here if the closure needs to be updated

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || role === 'spectator') return;
    
    if (typeof sendAction === 'function') {
      sendAction('SUBMIT_WORD', { word: input });
    }
    
    setInput('');
  };

  const isSpectator = role === 'spectator';
  const myError = state.errors?.[userId];
  const words = state.words || [];
  const scores = state.scores || {};

  const sortedPlayers = Object.entries(scores).sort(([,a], [,b]) => b - a);

  return (
    <div className="glass-panel">
      <HookActionHandler />
      {isSpectator && (
        <div className="spectator-badge">
          <Eye size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
          Spectator Mode
        </div>
      )}
      <h1 className="game-title">Word Forge</h1>
      
      <div className="game-layout">
        <div className="main-area">
          <div className="board">
            {words.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '2rem' }}>
                No words forged yet. {isSpectator ? 'Waiting for players to begin...' : 'Be the first!'}
              </div>
            ) : (
              words.map((w) => (
                <div key={w.id} className="word-entry">
                  <div className="author">{w.userId === userId ? 'You' : `Player ${w.userId.substring(0,4)}`}</div>
                  <div className="word-tiles">
                    {w.word.split('').map((char, i) => (
                      <div key={i} className="tile">
                        {char}
                        <span className="points">{LETTER_VALUES[char] || 0}</span>
                      </div>
                    ))}
                  </div>
                  <div className="word-score">+{w.score}</div>
                </div>
              ))
            )}
          </div>
          
          {!isSpectator ? (
            <div className="input-section">
              <form className="input-area" onSubmit={handleSubmit}>
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Forge a word..."
                  maxLength={15}
                  pattern="[a-zA-Z]+"
                  title="Only letters allowed"
                />
                <button type="submit" disabled={!input.trim()}>
                  Forge
                </button>
              </form>
              {myError && (
                <div className="error-message">
                  <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
                  {myError}
                </div>
              )}
            </div>
          ) : (
            <div className="input-section" style={{ marginTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
              You are watching the game.
            </div>
          )}
        </div>
        
        <div className="sidebar">
          <div className="leaderboard">
            <h2><Trophy size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Leaderboard</h2>
            {sortedPlayers.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>No scores yet.</div>
            ) : (
              sortedPlayers.map(([pid, score]) => (
                <div key={pid} className="player-score">
                  <span className="name">{pid === userId ? 'You' : `Player ${String(pid).substring(0,4)}`}</span>
                  <span className="score">{score}</span>
                </div>
              ))
            )}
          </div>
          {isHost && (
            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
              <Key size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Host Active
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
