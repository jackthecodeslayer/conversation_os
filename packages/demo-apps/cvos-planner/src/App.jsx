import React, { useState, useEffect, useRef } from 'react';
import { useConversationOS } from '@cvos/sdk';
import { Calendar, Users, Eye, ShieldAlert } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9:00 to 17:00

export default function App() {
  const {
    isHost,
    role,
    users,
    localUser,
    sendData,
    onDataReceived,
    error,
    isConnected
  } = useConversationOS({
    backendUrl: 'https://cvos-backend.onrender.com'
  });

  const [globalState, setGlobalState] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  
  const stateRef = useRef(globalState);
  useEffect(() => {
    stateRef.current = globalState;
  }, [globalState]);

  // Request state when joining
  useEffect(() => {
    if (isConnected && !isHost) {
      sendData({ type: 'REQUEST_STATE' });
    }
  }, [isConnected, isHost, sendData]);

  // Handle incoming messages
  useEffect(() => {
    if (!onDataReceived) return;

    const unsubscribe = onDataReceived((payload, senderId) => {
      if (isHost) {
        if (payload.type === 'SET_SLOT') {
          setGlobalState(prev => {
            const current = prev[payload.slotId] || [];
            const isSelected = current.includes(senderId);
            let newState = prev;
            
            if (payload.mode === 'add' && !isSelected) {
              newState = { ...prev, [payload.slotId]: [...current, senderId] };
            } else if (payload.mode === 'remove' && isSelected) {
              newState = { ...prev, [payload.slotId]: current.filter(id => id !== senderId) };
            }

            if (newState !== prev) {
              sendData({ type: 'SYNC_STATE', state: newState });
            }
            return newState;
          });
        }
        
        if (payload.type === 'REQUEST_STATE') {
          sendData({ type: 'SYNC_STATE', state: stateRef.current });
        }
      }

      if (payload.type === 'SYNC_STATE') {
        setGlobalState(payload.state);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isHost, onDataReceived, sendData]);

  const applyDragAction = (slotId, mode) => {
    const myId = localUser?.id;
    if (!myId) return;

    if (isHost) {
      setGlobalState(prev => {
        const current = prev[slotId] || [];
        const isSelected = current.includes(myId);
        let newState = prev;

        if (mode === 'add' && !isSelected) {
          newState = { ...prev, [slotId]: [...current, myId] };
        } else if (mode === 'remove' && isSelected) {
          newState = { ...prev, [slotId]: current.filter(id => id !== myId) };
        }

        if (newState !== prev) {
          sendData({ type: 'SYNC_STATE', state: newState });
        }
        return newState;
      });
    } else {
      sendData({ type: 'SET_SLOT', slotId, mode });
    }
  };

  const onMouseDown = (slotId) => {
    if (role === 'spectator') return;
    setIsDragging(true);
    const myId = localUser?.id;
    const isSelected = (globalState[slotId] || []).includes(myId);
    const mode = isSelected ? 'remove' : 'add';
    setDragMode(mode);
    applyDragAction(slotId, mode);
  };

  const onMouseEnter = (slotId) => {
    if (!isDragging || role === 'spectator') return;
    applyDragAction(slotId, dragMode);
  };

  const onMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  if (!isConnected) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e5e7eb', borderTopColor: '#4f46e5', animation: 'spin 1s linear infinite' }} />
          <p>Connecting to CVOS Backend...</p>
        </div>
      </div>
    );
  }

  const activeUsers = users.filter(u => u.role !== 'spectator');
  const maxOverlap = Math.max(1, activeUsers.length);
  const myId = localUser?.id;

  return (
    <div className="app-container" onMouseLeave={onMouseUp} onMouseUp={onMouseUp}>
      <header className="header">
        <div className="badge">Productivity App 3</div>
        <h1 className="header-title">
          <Calendar size={36} color="#4f46e5" />
          CVOS Planner
        </h1>
        <p className="header-subtitle">Drag to highlight your availability</p>
      </header>

      {error && (
        <div className="error-banner">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {role === 'spectator' && (
        <div className="spectator-banner">
          <Eye size={20} />
          You are viewing as a spectator. You can see the group's heatmap but cannot edit slots.
        </div>
      )}

      <div className="controls">
        <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <div className="user-avatar" style={{ backgroundColor: '#4f46e5', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem' }}>
            {myId?.substring(0, 2).toUpperCase() || 'ME'}
          </div>
          You {isHost ? '(Host)' : ''}
        </div>
        
        <div className="group-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
          <Users size={20} />
          <span>{users.length} connected ({activeUsers.length} active)</span>
        </div>
      </div>

      <div className="card">
        <div className="grid-container" style={{ gridTemplateColumns: `60px repeat(${DAYS.length}, 1fr)` }}>
          <div className="grid-header-cell" style={{ borderBottom: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6' }}>Time</div>
          {DAYS.map(day => (
            <div key={day} className="grid-header-cell" style={{ borderBottom: '1px solid #f3f4f6' }}>
              {day}
            </div>
          ))}

          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div className="grid-time-label" style={{ borderRight: '1px solid #f3f4f6' }}>
                {hour}:00
              </div>
              {DAYS.map(day => {
                const slotId = `${day}-${hour}`;
                const usersInSlot = globalState[slotId] || [];
                const isMySelection = usersInSlot.includes(myId);
                const heatRatio = Math.min(1, usersInSlot.length / maxOverlap);
                
                return (
                  <div
                    key={slotId}
                    className={`grid-cell ${role !== 'spectator' ? 'interactable' : ''} ${isMySelection ? 'selected' : ''}`}
                    onMouseDown={() => onMouseDown(slotId)}
                    onMouseEnter={() => onMouseEnter(slotId)}
                    onDragStart={(e) => e.preventDefault()}
                  >
                    {usersInSlot.length > 0 && (
                      <div
                        className="heatmap-overlay"
                        style={{
                          backgroundColor: '#4f46e5',
                          opacity: role === 'spectator' ? heatRatio * 0.8 : heatRatio * 0.5,
                        }}
                      />
                    )}
                    {isMySelection && role !== 'spectator' && (
                      <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4f46e5', border: '1px solid white' }} />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
