import React, { useState, useEffect, useRef } from 'react';
import { useConversationOS } from '@cvos/sdk';
import { Target, Users, ArrowRight, Activity } from 'lucide-react';
import './index.css';

// Random float between min and max
const randomRange = (min, max) => Math.random() * (max - min) + min;

export default function App() {
  const { role, state, updateState, broadcast, connectedPlayers, onMessage } = useConversationOS({
    defaultState: {
      wind: { direction: 0, speed: 0 },
      gameStatus: 'waiting', // waiting, playing, finished
      scores: {},
      lastShots: {},
    }
  });

  // Player local state
  const [charging, setCharging] = useState(false);
  const [power, setPower] = useState(0);
  const powerRef = useRef(0);
  const chargeInterval = useRef(null);

  // --- HOST LOGIC ---
  useEffect(() => {
    if (role !== 'host') return;

    // Host updates wind periodically
    const windInterval = setInterval(() => {
      if (state.gameStatus === 'playing') {
        updateState({
          wind: {
            direction: randomRange(0, 360),
            speed: randomRange(0, 15)
          }
        });
      }
    }, 3000);

    return () => clearInterval(windInterval);
  }, [role, state.gameStatus, updateState]);

  useEffect(() => {
    if (role !== 'host') return;
    
    // Auto start game if not playing
    if (state.gameStatus === 'waiting') {
      updateState({ gameStatus: 'playing' });
    }
    
    // Listen for player shots
    const unsubscribe = onMessage('player_shot', (data, senderId) => {
      if (state.gameStatus !== 'playing') return;
      
      const { power, releaseTime } = data;
      const currentWind = state.wind;
      
      // Calculate score based on power (ideal is ~80%) and wind effect
      // Very simplified physics for the demo
      const powerDiff = Math.abs(power - 80);
      const windEffect = currentWind.speed * Math.cos(currentWind.direction * Math.PI / 180); // simplified
      
      // Base accuracy: 100 - diff from ideal power
      let accuracy = 100 - (powerDiff * 1.5) - Math.abs(windEffect * 1.5);
      
      let points = 0;
      if (accuracy > 90) points = 10;
      else if (accuracy > 75) points = 8;
      else if (accuracy > 60) points = 6;
      else if (accuracy > 40) points = 4;
      else if (accuracy > 20) points = 2;
      
      // Position calculation for visual arrow (normalized -100 to 100)
      const xOffset = windEffect * 5 + (Math.random() * 10 - 5);
      const yOffset = (power < 50 ? 50 : (power > 95 ? -50 : 0)) + (Math.random() * 10 - 5);
      
      updateState(prev => ({
        scores: {
          ...prev.scores,
          [senderId]: (prev.scores[senderId] || 0) + points
        },
        lastShots: {
          ...prev.lastShots,
          [senderId]: {
            points,
            x: xOffset,
            y: yOffset,
            timestamp: Date.now()
          }
        }
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [role, state.gameStatus, state.wind, onMessage, updateState]);

  // --- PLAYER LOGIC ---
  const handleStartCharge = () => {
    if (role !== 'player' || state.gameStatus !== 'playing') return;
    
    setCharging(true);
    setPower(0);
    powerRef.current = 0;
    
    chargeInterval.current = setInterval(() => {
      powerRef.current = (powerRef.current + 2) % 100;
      setPower(powerRef.current);
    }, 30);
  };

  const handleRelease = () => {
    if (!charging) return;
    
    setCharging(false);
    clearInterval(chargeInterval.current);
    
    // Transmit shot to host
    broadcast('player_shot', {
      power: powerRef.current,
      releaseTime: Date.now()
    }, { target: 'host' });
    
    // Reset power visual slightly after release
    setTimeout(() => setPower(0), 500);
  };

  // --- RENDER HELPERS ---
  const renderWind = () => {
    const { speed, direction } = state.wind || { speed: 0, direction: 0 };
    return (
      <div className="wind-indicator">
        <div 
          className="wind-arrow" 
          style={{ transform: `rotate(${direction}deg)` }}
        >
          <ArrowRight size={24} color="#f8f9fa" />
        </div>
        <div className="wind-value">{speed.toFixed(1)} mph</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>WIND</div>
      </div>
    );
  };

  const renderTarget = () => {
    // Show arrows for all recent shots (last 3 seconds)
    const now = Date.now();
    const visibleShots = Object.entries(state.lastShots || {}).filter(
      ([_, shot]) => now - shot.timestamp < 3000
    );

    return (
      <div className="target-container">
        <div className="target">
          <div className="target-inner">
            <div className="target-bullseye"></div>
          </div>
          
          {visibleShots.map(([playerId, shot]) => (
            <div 
              key={playerId} 
              className="arrow"
              style={{
                left: `calc(50% + ${shot.x}px - 120px)`, // 120px is arrow length
                top: `calc(50% + ${shot.y}px)`,
                transform: `rotate(${10 + Math.random() * 20}deg)` // Stick in at an angle
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderScores = () => {
    const sortedPlayers = Object.entries(state.scores || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5
      
    return (
      <div className="player-list glass-panel">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} /> Leaderboard
        </h3>
        {sortedPlayers.length === 0 ? (
          <div style={{ opacity: 0.5 }}>No shots yet</div>
        ) : (
          sortedPlayers.map(([playerId, score], index) => {
            const p = connectedPlayers.find(p => p.id === playerId);
            return (
              <div key={playerId} className="player-item">
                <div className="player-name">
                  {index + 1}. {p ? p.name : playerId.substring(0,6)}
                </div>
                <div className="player-score">{score}</div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // --- VIEWS ---
  
  if (role === 'spectator') {
    return (
      <div className="app-container">
        <div className="header glass-panel" style={{ marginBottom: '2rem' }}>
          <h1 className="header-title">Archery Clash</h1>
          <span className="role-badge role-spectator">Spectator</span>
        </div>
        
        <div className="game-area">
          <div className="glass-panel target-container" style={{ flex: 2 }}>
            {renderWind()}
            {renderTarget()}
          </div>
          
          <div className="controls" style={{ flex: 1 }}>
            {renderScores()}
          </div>
        </div>
      </div>
    );
  }

  if (role === 'host') {
    return (
      <div className="app-container">
        <div className="header glass-panel">
          <h1 className="header-title">Archery Clash</h1>
          <span className="role-badge role-host">Server Host</span>
        </div>
        
        <div className="game-area">
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="host-panel">
              <h2 className="host-title">Host Controls Active</h2>
              <Activity size={48} color="#2ecc71" style={{ margin: '1rem 0' }} />
              <p style={{ opacity: 0.7 }}>Simulating Wind & Physics Engine</p>
              
              <div className="host-stats">
                <div className="stat-box">
                  <div>Active Players</div>
                  <div className="stat-value">{connectedPlayers.filter(p => p.role === 'player').length}</div>
                </div>
                <div className="stat-box">
                  <div>Wind Speed</div>
                  <div className="stat-value">{state.wind?.speed.toFixed(1)}</div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto' }}>
              {renderScores()}
            </div>
          </div>
          
          <div className="glass-panel" style={{ flex: 2 }}>
             {renderWind()}
             {renderTarget()}
          </div>
        </div>
      </div>
    );
  }

  // Player View
  return (
    <div className="app-container">
      <div className="header glass-panel">
        <h1 className="header-title">Archery Clash</h1>
        <span className="role-badge role-player">Archer</span>
      </div>
      
      <div className="game-area">
        <div className="glass-panel" style={{ flex: 2 }}>
          {renderWind()}
          {renderTarget()}
        </div>
        
        <div className="controls glass-panel" style={{ flex: 1 }}>
          <div className="control-panel">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} /> Aim & Shoot
            </h3>
            
            <div style={{ width: '100%', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Power</span>
                <span>{Math.round(power)}%</span>
              </div>
              <div className="power-meter">
                <div className="power-fill" style={{ width: `${power}%` }}></div>
              </div>
            </div>
            
            <button 
              className="btn-shoot"
              onMouseDown={handleStartCharge}
              onMouseUp={handleRelease}
              onMouseLeave={handleRelease}
              onTouchStart={(e) => { e.preventDefault(); handleStartCharge(); }}
              onTouchEnd={(e) => { e.preventDefault(); handleRelease(); }}
              disabled={state.gameStatus !== 'playing'}
            >
              {charging ? 'Release!' : 'Draw Bow'}
            </button>
            
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7, textAlign: 'center' }}>
              Hold to draw bow.<br/>Release at ~80% power<br/>for best accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
