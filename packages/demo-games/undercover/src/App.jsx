import React, { useState, useEffect } from 'react';
import { createCvosClient, useConversationOS } from '@cvos/sdk';
import { Users, Crown, EyeOff, User, Play, ShieldAlert } from 'lucide-react';
import './index.css';

const cvos = createCvosClient({
    gameId: 'cvos-undercover',
    publishableKey: 'pk_prod_demo_key_123',
    backendUrl: 'https://cvos-backend.onrender.com'
});

const LOCATIONS = [
    'Pirate Ship', 'Space Station', 'Submarine', 'Bank Vault',
    'Haunted House', 'Casino', 'Movie Studio', 'Hospital'
];

export default function App() {
    const searchParams = new URLSearchParams(window.location.search);
    const [roomId, setRoomId] = useState(searchParams.get('roomId'));
    const [userId, setUserId] = useState(searchParams.get('userId'));
    const role = searchParams.get('role') || 'host';

    useEffect(() => {
        async function setup() {
            try {
                // 1. Get a valid user ID via Ghost Auth (avoids Postgres UUID errors)
                let currentUserId = userId;
                if (!currentUserId) {
                    const authRes = await fetch('http://localhost:3000/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ deviceId: 'demo_device_' + Math.random() })
                    });
                    const authData = await authRes.json();
                    currentUserId = authData.user.id;
                    setUserId(currentUserId);
                }

                // 2. If host and no room, create a room
                if (!roomId && role === 'host') {
                    const roomRes = await fetch('http://localhost:3000/api/rooms', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'pk_prod_demo_key_123' },
                        body: JSON.stringify({ hostId: currentUserId, gameId: null })
                    });
                    const roomData = await roomRes.json();
                    
                    if (roomData.room?.id) {
                        const newUrl = `${window.location.pathname}?roomId=${roomData.room.id}&role=host&userId=${currentUserId}`;
                        window.history.replaceState({}, '', newUrl);
                        setRoomId(roomData.room.id);
                    }
                }
            } catch (err) {
                console.error("Test setup failed:", err);
            }
        }
        setup();
    }, [roomId, role, userId]);

    const { roomStatus, myRole, participants, gameState, sendAction, startGame } = useConversationOS(cvos, roomId || 'pending', userId || 'pending', role);

    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (roomStatus === 'active' && myRole === 'host' && !gameState) {
            const players = participants.filter(p => p.role !== 'spectator');
            const undercoverIdx = Math.floor(Math.random() * players.length);
            const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

            const roles = {};
            players.forEach((p, i) => {
                roles[p.user_id] = i === undercoverIdx ? 'undercover' : location;
            });

            sendAction('INIT_GAME', { phase: 'playing', roles, votes: {} });
        }
    }, [roomStatus, myRole, participants, gameState, sendAction]);

    const handleVote = (targetUserId) => {
        if (hasVoted) return;
        setHasVoted(true);
        const newVotes = { ...gameState.votes, [targetUserId]: (gameState.votes[targetUserId] || 0) + 1 };
        
        const totalVotes = Object.values(newVotes).reduce((a, b) => a + b, 0);
        const playersCount = participants.filter(p => p.role !== 'spectator').length;
        
        if (totalVotes >= playersCount && myRole === 'host') {
            const undercoverUserId = Object.keys(gameState.roles).find(k => gameState.roles[k] === 'undercover');
            const undercoverVotes = newVotes[undercoverUserId] || 0;
            const undercoverCaught = undercoverVotes > (playersCount / 2);
            
            sendAction('END_GAME', { 
                phase: 'game_over', 
                votes: newVotes, 
                undercoverId: undercoverUserId,
                winner: undercoverCaught ? 'players' : 'undercover' 
            });
        } else {
            sendAction('VOTE', { phase: 'voting', roles: gameState.roles, votes: newVotes });
        }
    };

    if (!roomId) return <div className="loading">Creating test room...</div>;
    if (roomStatus === 'connecting') return <div className="loading">Connecting to CVOS Relay...</div>;
    if (roomStatus === 'error') return <div className="error">Failed to connect to CVOS relay. (Make sure backend is running!)</div>;

    const myGameRole = gameState?.roles?.[userId];
    const isUndercover = myGameRole === 'undercover';

    return (
        <div className="app-container">
            <header className="header glass-panel">
                <div className="brand">
                    <EyeOff className="brand-icon" />
                    <h1>Undercover</h1>
                </div>
                <div className="room-badge">Room: {roomId.slice(0, 6)}</div>
            </header>

            {roomStatus === 'lobby' && (
                <div className="panel glass-panel">
                    <h2><Users size={18} /> Lobby ({participants.length}/8)</h2>
                    <ul className="player-list">
                        {participants.map(p => (
                            <li key={p.user_id} className="player-row">
                                <span>{p.user_id === userId ? 'You' : p.user_id.slice(0, 6)}</span>
                                {p.role === 'host' ? <Crown size={16} className="icon-host" /> : <User size={16} className="icon-player" />}
                            </li>
                        ))}
                    </ul>
                    {myRole === 'host' ? (
                        <button onClick={startGame} className="btn-primary">
                            <Play size={18} /> Start Game
                        </button>
                    ) : (
                        <p className="waiting-text">Waiting for host to start...</p>
                    )}
                </div>
            )}

            {roomStatus === 'active' && gameState?.phase === 'playing' && (
                <div className="game-area">
                    <div className="identity-card glass-panel">
                        <div className="identity-accent"></div>
                        <p className="subtitle">Your Secret Identity</p>
                        {isUndercover ? (
                            <div>
                                <h2 className="role-title undercover">UNDERCOVER</h2>
                                <p className="role-desc">Blend in. Figure out the location before you are caught!</p>
                            </div>
                        ) : (
                            <div>
                                <h2 className="role-title player">{myGameRole}</h2>
                                <p className="role-desc">Find the undercover agent hiding among you.</p>
                            </div>
                        )}
                    </div>

                    <div className="voting-panel glass-panel">
                        <h3>Interrogate players in the chat, then vote:</h3>
                        <div className="grid">
                            {participants.filter(p => p.role !== 'spectator' && p.user_id !== userId).map(p => (
                                <button 
                                    key={p.user_id} 
                                    onClick={() => handleVote(p.user_id)}
                                    disabled={hasVoted}
                                    className="btn-vote"
                                >
                                    Vote {p.user_id.slice(0,6)}
                                </button>
                            ))}
                        </div>
                        {hasVoted && <p className="success-text">Vote cast! Waiting for others...</p>}
                    </div>
                </div>
            )}

            {roomStatus === 'active' && gameState?.phase === 'game_over' && (
                <div className="panel glass-panel center-content">
                    <ShieldAlert size={48} className={gameState.winner === 'undercover' ? 'icon-undercover-win' : 'icon-players-win'} />
                    <h2 className="game-over-title">
                        {gameState.winner === 'undercover' ? 'UNDERCOVER ESCAPED' : 'UNDERCOVER CAUGHT!'}
                    </h2>
                    <p className="game-over-desc">
                        The Undercover Agent was <strong>{gameState.undercoverId.slice(0,6)}</strong>.
                    </p>
                    
                    <div className="results-panel">
                        <h4>Voting Results</h4>
                        {Object.entries(gameState.votes).map(([id, count]) => (
                            <div key={id} className="result-row">
                                <span>{id.slice(0,6)}</span>
                                <span className="vote-count">{count} vote(s)</span>
                            </div>
                        ))}
                    </div>

                    {myRole === 'host' && (
                        <button onClick={() => sendAction('RESET', { phase: 'lobby' })} className="btn-secondary">
                            Play Again
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
