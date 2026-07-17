import React, { useState, useEffect, useRef } from 'react';
import { createCvosClient, useConversationOS } from '@cvos/sdk';
import { Users, Play, Trophy, Frown, Eye } from 'lucide-react';
import './index.css';

const cvos = createCvosClient({ gameId: 'wordle-blitz', publishableKey: 'pk_test_wordle_blitz' });

const WORDS = ['BLITZ', 'REACT', 'NEONS', 'GLASS', 'VITES', 'GAMES', 'SMART', 'GHOST', 'PLANT', 'WORDS'];
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId') || 'wordle-room-1';
  const userId = urlParams.get('userId') || 'user-' + Math.floor(Math.random() * 1000);
  const requestedRole = urlParams.get('role') || 'player';

  const {
    roomStatus,
    myRole,
    participants,
    gameState,
    sendAction,
    startGame
  } = useConversationOS(cvos, roomId, userId, requestedRole);

  const [currentInput, setCurrentInput] = useState('');
  const targetWordRef = useRef('');

  // Host initializes the game state when the game starts
  useEffect(() => {
    if (myRole === 'host' && roomStatus === 'active' && !gameState) {
      targetWordRef.current = WORDS[Math.floor(Math.random() * WORDS.length)];
      sendAction({ type: 'INIT' }, {
        status: 'playing', // 'playing', 'won', 'lost'
        guesses: [],
        pendingGuesses: [],
        winner: null
      });
    }
  }, [myRole, roomStatus, gameState, sendAction]);

  // Host handles pending guesses
  useEffect(() => {
    if (myRole === 'host' && gameState?.status === 'playing' && gameState.pendingGuesses?.length > 0) {
      const newGuesses = [...gameState.guesses];
      let newStatus = gameState.status;
      let winner = gameState.winner;

      const target = targetWordRef.current || WORDS[0]; // fallback

      gameState.pendingGuesses.forEach(pg => {
        if (newStatus !== 'playing') return; // Stop if already won/lost
        
        // Calculate colors
        const guess = pg.word.toUpperCase();
        const colors = Array(WORD_LENGTH).fill('gray');
        const targetArr = target.split('');
        
        // First pass: green
        for (let i = 0; i < WORD_LENGTH; i++) {
          if (guess[i] === targetArr[i]) {
            colors[i] = 'green';
            targetArr[i] = null;
          }
        }
        
        // Second pass: yellow
        for (let i = 0; i < WORD_LENGTH; i++) {
          if (colors[i] !== 'green' && targetArr.includes(guess[i])) {
            colors[i] = 'yellow';
            targetArr[targetArr.indexOf(guess[i])] = null;
          }
        }

        newGuesses.push({ word: guess, colors, user: pg.user });

        if (guess === target) {
          newStatus = 'won';
          winner = pg.user;
        } else if (newGuesses.length >= MAX_GUESSES) {
          newStatus = 'lost';
        }
      });

      // Update state
      sendAction({ type: 'RESOLVE_GUESSES' }, {
        ...gameState,
        pendingGuesses: [],
        guesses: newGuesses,
        status: newStatus,
        winner,
        targetWord: newStatus !== 'playing' ? target : undefined // Reveal word if game over
      });
    }
  }, [myRole, gameState?.pendingGuesses, gameState?.status, sendAction]);

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (myRole === 'spectator') return;
    if (currentInput.length !== WORD_LENGTH) return;
    if (gameState?.status !== 'playing') return;

    sendAction({ type: 'SUBMIT_GUESS' }, {
      ...gameState,
      pendingGuesses: [...(gameState.pendingGuesses || []), { word: currentInput, user: userId }]
    });
    setCurrentInput('');
  };

  if (roomStatus === 'connecting') {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>Connecting to CVOS...</div>
      </div>
    );
  }
  if (roomStatus === 'error') {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '2rem', color: 'red' }}>Connection Error</div>
      </div>
    );
  }

  const isHost = myRole === 'host';
  const isSpectator = myRole === 'spectator';
  const isLobby = roomStatus === 'lobby';

  return (
    <>
      {isSpectator && (
        <div className="spectator-banner">
          <Eye size={18} style={{verticalAlign: 'middle', marginRight: '8px', display: 'inline'}} />
          You are watching as a Spectator
        </div>
      )}
      
      <div className="header">
        <h1>Wordle Blitz</h1>
        <p style={{color: '#888', margin: '5px 0 0'}}>Co-op Word Guessing</p>
      </div>

      <div className="main-content" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        {isLobby ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Waiting in Lobby</h2>
            <p><Users size={20} style={{verticalAlign: 'middle', marginRight: '8px', display: 'inline'}} /> Participants: {participants.length + 1}</p>
            {isHost ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button className="submit-btn" onClick={startGame}>
                  <Play size={20} style={{marginRight: '8px'}} />
                  Start Game
                </button>
              </div>
            ) : (
              <p style={{color: 'var(--neon-yellow)', marginTop: '20px'}}>Waiting for host to start...</p>
            )}
          </div>
        ) : (
          <div className="game-board">
            
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
              <div className="wordle-grid">
                {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
                  const guess = gameState?.guesses?.[rowIndex];
                  const isPending = !guess && gameState?.status === 'playing' && rowIndex === gameState?.guesses?.length;
                  const wordStr = guess ? guess.word : (isPending && !isSpectator ? currentInput.padEnd(WORD_LENGTH, ' ') : '     ');

                  return (
                    <div key={rowIndex} className="wordle-row">
                      {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                        const letter = wordStr[colIndex] || ' ';
                        let colorClass = '';
                        if (guess) {
                          colorClass = guess.colors[colIndex];
                        }
                        return (
                          <div key={colIndex} className={`wordle-cell ${colorClass}`}>
                            {letter !== ' ' ? letter : ''}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {gameState?.status === 'playing' && !isSpectator && (
                <form className="input-area" onSubmit={handleGuessSubmit}>
                  <input
                    type="text"
                    className="word-input"
                    value={currentInput}
                    onChange={e => setCurrentInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, WORD_LENGTH))}
                    placeholder="ENTER WORD"
                    maxLength={WORD_LENGTH}
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={currentInput.length !== WORD_LENGTH}
                  >
                    GUESS
                  </button>
                </form>
              )}

              {gameState?.status === 'won' && (
                <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--neon-green)' }}>
                  <h2><Trophy size={24} style={{verticalAlign: 'middle', display: 'inline', marginRight: '8px'}}/> You Won!</h2>
                  <p>Word: <strong>{gameState.targetWord}</strong></p>
                </div>
              )}

              {gameState?.status === 'lost' && (
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#ff4444' }}>
                  <h2><Frown size={24} style={{verticalAlign: 'middle', display: 'inline', marginRight: '8px'}}/> Game Over</h2>
                  <p>The word was: <strong>{gameState.targetWord}</strong></p>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </>
  );
}

export default App;
