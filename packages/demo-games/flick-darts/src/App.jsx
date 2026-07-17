import React, { useState, useEffect } from 'react';
import { useConversationOS } from '@cvos/sdk';
import { Target, ArrowUp, Zap, Info, Play, Plus, RefreshCw } from 'lucide-react';
import './index.css';

const BOARD_RADIUS = 150;

const calculateScore = (x, y) => {
  const distance = Math.sqrt(Math.pow(x - BOARD_RADIUS, 2) + Math.pow(y - BOARD_RADIUS, 2));
  if (distance < 10) return 50;
  if (distance < 25) return 25;
  if (distance > BOARD_RADIUS) return 0;
  return Math.max(10 - Math.floor(distance / 15), 1);
};

export default function App() {
  const { role, state, updateState, sendAction } = useConversationOS({
    initialState: {
      darts: [],
      players: [],
      gameStarted: false,
      currentTurn: null,
      winner: null
    }
  });

  const isHost = role === 'host';
  const isSpectator = role === 'spectator';
  
  const [angle, setAngle] = useState(0); 
  const [power, setPower] = useState(50); 
  
  // Expose a function for clients to send actions to the host.
  const handleAction = (action) => {
    if (sendAction) {
       sendAction(action);
    } else {
       // fallback for typical window events
       window.dispatchEvent(new CustomEvent('game-action', { detail: action }));
    }
  };

  useEffect(() => {
    if (!isHost) return;
    
    const processAction = (action) => {
      if (!updateState) return;
      
      updateState(curr => {
        let next = { ...curr };
        if (!next.players) next.players = [];
        if (!next.darts) next.darts = [];
        
        switch (action.type) {
          case 'JOIN_GAME':
            if (!next.gameStarted && !next.players.find(p => p.id === action.playerId)) {
              next.players = [...next.players, { id: action.playerId, name: action.playerName, score: 0 }];
              if (!next.currentTurn) next.currentTurn = action.playerId;
            }
            break;
          case 'START_GAME':
            if (next.players.length > 0) next.gameStarted = true;
            break;
          case 'THROW_DART':
            if (next.currentTurn === action.playerId && !next.winner) {
              const angleRad = (action.angle * Math.PI) / 180;
              const powerFactor = action.power / 100;
              const maxDistance = BOARD_RADIUS + 20; 
              // Simple mapped trajectory: 
              // 100 power hits near center if angle is 0.
              // Lower power undershoots.
              const distance = BOARD_RADIUS * (1 - powerFactor) * 1.5; 
              
              const hitX = BOARD_RADIUS + Math.sin(angleRad) * distance + (Math.random() * 12 - 6);
              const hitY = BOARD_RADIUS + Math.cos(angleRad) * distance + (Math.random() * 12 - 6);
              
              const score = calculateScore(hitX, hitY);
              const newDart = {
                id: Date.now().toString() + Math.random(),
                x: hitX,
                y: hitY,
                player: action.playerId,
                score
              };
              
              next.darts = [...next.darts, newDart];
              next.players = next.players.map(p => 
                p.id === action.playerId ? { ...p, score: p.score + score } : p
              );
              
              const currentPlayerIndex = next.players.findIndex(p => p.id === action.playerId);
              const nextPlayer = next.players[(currentPlayerIndex + 1) % next.players.length]?.id;
              
              const winner = next.players.find(p => p.score >= 100);
              
              if (winner) {
                next.winner = winner.id;
                next.currentTurn = null;
              } else {
                next.currentTurn = nextPlayer;
              }
            }
            break;
          case 'RESET_GAME':
             next.darts = [];
             next.players = [];
             next.gameStarted = false;
             next.currentTurn = null;
             next.winner = null;
             break;
        }
        return next;
      });
    };

    const listener = (e) => processAction(e.detail);
    window.addEventListener('game-action', listener);
    
    // Also attach to global to allow SDK to push actions if it uses a global callback
    window.onGameAction = processAction;
    
    return () => {
      window.removeEventListener('game-action', listener);
      window.onGameAction = null;
    };
  }, [isHost, updateState]);

  const safeState = {
     darts: state?.darts || [],
     players: state?.players || [],
     gameStarted: state?.gameStarted || false,
     currentTurn: state?.currentTurn || null,
     winner: state?.winner || null
  };

  const myId = isHost ? 'host-1' : 'player-1';
  const isMyTurn = safeState.currentTurn === myId;
  const amIPlaying = safeState.players.some(p => p.id === myId);
  const myName = isHost ? 'Host Player' : 'Challenger';

  if (isSpectator) {
    return (
      <div className="app-container spectator-mode">
        <div className="glass-overlay"></div>
        <header className="glass-header">
          <div className="header-content">
             <h1>🎯 Flick Darts</h1>
             <div className="status-badge pulse">LIVE SPECTATOR</div>
          </div>
        </header>
        
        <main className="game-area">
          <div className="scoreboard glass-panel glass-effect">
            <h2 className="panel-title">Leaderboard</h2>
            {safeState.players.length === 0 ? (
               <p className="empty-state">Waiting for players...</p>
            ) : (
              <ul className="player-list">
                {safeState.players.map(p => (
                  <li key={p.id} className={safeState.currentTurn === p.id ? 'active-turn' : ''}>
                    <span className="player-name">{p.name}</span>
                    <span className="player-score">{p.score} pts</span>
                  </li>
                ))}
              </ul>
            )}
            {safeState.winner && (
              <div className="winner-banner">
                <p>🏆 Winner: {safeState.players.find(p => p.id === safeState.winner)?.name}!</p>
              </div>
            )}
          </div>
          
          <div className="dartboard-container glass-panel glass-effect">
            <div className="dartboard">
               <div className="ring ring-outer"></div>
               <div className="ring ring-middle"></div>
               <div className="ring ring-inner"></div>
               <div className="ring bullseye"></div>
               
               {safeState.darts.map(dart => (
                 <div key={dart.id} className="dart-hit spectator-dart" style={{ left: dart.x, top: dart.y }}>
                   <div className="dart-point"></div>
                   <div className="dart-score-float">+{dart.score}</div>
                 </div>
               ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
       <div className="glass-overlay"></div>
       <header className="glass-header">
          <div className="header-content">
             <h1>🎯 Flick Darts</h1>
             <div className="role-badge">{role?.toUpperCase() || 'PLAYER'}</div>
          </div>
        </header>

        <main className="game-area">
          <div className="scoreboard glass-panel glass-effect">
            <h2 className="panel-title">Match Info</h2>
            {safeState.players.length === 0 ? (
              <p className="empty-state">No players joined yet.</p>
            ) : (
              <ul className="player-list">
                {safeState.players.map(p => (
                  <li key={p.id} className={`player-item ${safeState.currentTurn === p.id ? 'active-turn' : ''}`}>
                    <span className="player-name">{p.name} {safeState.winner === p.id && '👑'}</span>
                    <span className="player-score">{p.score} pts</span>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="action-buttons">
               {!amIPlaying && !safeState.gameStarted && (
                 <button className="btn primary-btn" onClick={() => handleAction({ type: 'JOIN_GAME', playerId: myId, playerName: myName })}>
                   <Plus size={18}/> Join Game
                 </button>
               )}
               
               {isHost && !safeState.gameStarted && safeState.players.length > 0 && (
                  <button className="btn success-btn" onClick={() => handleAction({ type: 'START_GAME' })}>
                    <Play size={18}/> Start Match
                  </button>
               )}
            </div>
            
            {safeState.winner && (
              <div className="winner-announcement">
                 <h3>Match Over!</h3>
                 <p>{safeState.players.find(p => p.id === safeState.winner)?.name} won the match!</p>
                 {isHost && (
                   <button className="btn secondary-btn mt-3" onClick={() => handleAction({ type: 'RESET_GAME' })}>
                     <RefreshCw size={18}/> Play Again
                   </button>
                 )}
              </div>
            )}
          </div>
          
          <div className="dartboard-container glass-panel glass-effect">
            <div className="dartboard">
               <div className="ring ring-outer"></div>
               <div className="ring ring-middle"></div>
               <div className="ring ring-inner"></div>
               <div className="ring bullseye"></div>
               
               {safeState.darts.map(dart => (
                 <div key={dart.id} className={`dart-hit ${dart.player === myId ? 'my-dart' : 'opponent-dart'}`} style={{ left: dart.x, top: dart.y }}>
                   <div className="dart-point"></div>
                 </div>
               ))}

               {isMyTurn && safeState.gameStarted && !safeState.winner && (
                 <div className="aim-indicator" style={{ transform: `rotate(${angle}deg)` }}>
                    <div className="aim-line" style={{ height: `${power * 1.5}px` }}></div>
                 </div>
               )}
            </div>
          </div>

          <div className="controls-panel glass-panel glass-effect">
            <h2 className="panel-title">Your Controls</h2>
            {safeState.gameStarted && !safeState.winner ? (
              isMyTurn ? (
                <div className="flick-controls">
                  <div className="control-group">
                    <label className="control-label"><Target size={18}/> Angle: {angle}°</label>
                    <input 
                      type="range" 
                      min="-45" max="45" 
                      value={angle} 
                      className="glass-slider"
                      onChange={e => setAngle(Number(e.target.value))}
                    />
                  </div>
                  <div className="control-group">
                    <label className="control-label"><Zap size={18}/> Power: {power}%</label>
                    <input 
                      type="range" 
                      min="10" max="100" 
                      value={power} 
                      className="glass-slider"
                      onChange={e => setPower(Number(e.target.value))}
                    />
                  </div>
                  <button className="btn throw-btn" onClick={() => {
                     handleAction({ type: 'THROW_DART', playerId: myId, angle, power });
                     setAngle(0);
                     setPower(50);
                  }}>
                     <ArrowUp size={24}/> FLICK DART
                  </button>
                </div>
              ) : (
                <div className="waiting-state">
                  <Info size={32} className="wait-icon pulse-slow"/>
                  <p>Waiting for opponent to throw...</p>
                </div>
              )
            ) : (
              <div className="waiting-state">
                 <p className="empty-state">{safeState.winner ? 'Game Finished' : 'Game not active.'}</p>
              </div>
            )}
          </div>
        </main>
    </div>
  );
}
