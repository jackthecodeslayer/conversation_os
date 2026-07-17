import React, { useState, useEffect, useRef } from 'react';
import { createCvosClient, useConversationOS } from '@cvos/sdk';
import { Palette, Play, Brush, Send, Eye } from 'lucide-react';
import './index.css';

const cvos = createCvosClient({
    gameId: 'cvos-scribble-chat',
    publishableKey: 'pk_prod_demo_key_123', // Demo key will be rejected in production, but used for scaffolding shape
    backendUrl: 'https://cvos-backend.onrender.com' // Pointing to production or proper backend URL when deployed
});

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];
const WORDS = ['apple', 'guitar', 'airplane', 'dog', 'house', 'computer'];

export default function App() {
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId') || 'demo-scribble';
    const userId = searchParams.get('userId') || `player_${Math.floor(Math.random()*1000)}`;
    const role = searchParams.get('role') || 'player'; // Can be 'host', 'player', or 'spectator'

    const { roomStatus, myRole, participants, gameState, sendAction, startGame } = useConversationOS(cvos, roomId, userId, role);

    const canvasRef = useRef(null);
    const [isDrawingLocal, setIsDrawingLocal] = useState(false);
    const [color, setColor] = useState(COLORS[0]);
    const [guess, setGuess] = useState('');
    
    // Draw state
    const drawerId = gameState?.drawerId;
    const isMyTurn = drawerId === userId;
    const isSpectator = role === 'spectator';
    const lines = gameState?.lines || [];
    const chat = gameState?.chat || [];
    const currentWord = gameState?.word;

    // Draw lines when state changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 4;

        lines.forEach(line => {
            ctx.strokeStyle = line.color;
            ctx.beginPath();
            line.points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
        });
    }, [lines]);

    const handleHostStart = () => {
        // Host logic: pick a drawer and a word
        const players = participants.filter(p => p.role !== 'spectator');
        if (players.length === 0) return;
        
        const nextDrawer = players[Math.floor(Math.random() * players.length)].user_id;
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        
        sendAction('START_ROUND', {
            drawerId: nextDrawer,
            word,
            lines: [],
            chat: []
        });
        startGame();
    };

    // Drawing handlers
    const currentLine = useRef(null);

    const startDraw = (e) => {
        if (!isMyTurn || isSpectator) return;
        setIsDrawingLocal(true);
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        currentLine.current = { color, points: [{x, y}] };
    };

    const draw = (e) => {
        if (!isDrawingLocal || !isMyTurn || isSpectator) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        currentLine.current.points.push({x, y});
        
        // Optimistic render
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const endDraw = () => {
        if (!isDrawingLocal || !isMyTurn || isSpectator) return;
        setIsDrawingLocal(false);
        if (currentLine.current) {
            sendAction('ADD_LINE', { line: currentLine.current });
            currentLine.current = null;
        }
    };

    const submitGuess = (e) => {
        e.preventDefault();
        if (!guess.trim() || isMyTurn || isSpectator) return;
        
        sendAction('GUESS', { 
            text: guess,
            userId,
            isCorrect: guess.toLowerCase() === currentWord?.toLowerCase()
        });
        setGuess('');
    };

    if (roomStatus === 'connecting') return <div className="loading">Connecting to CVOS Relay...</div>;
    if (roomStatus === 'error') return <div className="error">Failed to connect. (Need real backend + keys)</div>;

    const gameStarted = !!gameState?.drawerId;

    return (
        <div className="app-container">
            <header className="header glass-panel">
                <div className="brand">
                    <Palette className="brand-icon" />
                    <h1>Scribble Chat</h1>
                </div>
                <div className="room-badge">
                    {isSpectator && <Eye size={16} style={{marginRight: '5px'}}/>}
                    {isSpectator ? 'Spectating' : `Room: ${roomId.slice(0, 6)}`}
                </div>
            </header>

            {!gameStarted ? (
                <div className="glass-panel" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem'}}>
                    <h2 style={{marginBottom: '1rem'}}>Waiting to start...</h2>
                    <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>
                        {participants.length} Participant(s) joined.
                    </p>
                    {myRole === 'host' && (
                        <button className="primary-btn" onClick={handleHostStart}>
                            <Play size={20} />
                            Start Drawing Phase
                        </button>
                    )}
                </div>
            ) : (
                <div className="game-area">
                    <div className="canvas-container glass-panel">
                        <div className="status-overlay">
                            {isMyTurn ? `Draw: ${currentWord}` : (isSpectator ? `Spectating Drawing` : `Guess the word!`)}
                        </div>
                        <canvas 
                            ref={canvasRef}
                            width={500}
                            height={400}
                            className={`drawing-canvas ${isSpectator ? 'spectator' : ''}`}
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={endDraw}
                            onMouseLeave={endDraw}
                        />
                        {isMyTurn && (
                            <div className="tools-panel">
                                {COLORS.map(c => (
                                    <button 
                                        key={c}
                                        className={`color-btn ${color === c ? 'active' : ''}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="sidebar">
                        <div className="players-list glass-panel">
                            <h3>Players</h3>
                            {participants.map(p => (
                                <div key={p.user_id} className={`player-item ${drawerId === p.user_id ? 'drawer' : ''}`}>
                                    {drawerId === p.user_id ? <Brush size={16} /> : <div style={{width:16}}/>}
                                    {p.user_id === userId ? 'You' : p.user_id.slice(0, 8)}
                                    {p.role === 'spectator' && <Eye size={14} style={{marginLeft: 'auto', color: 'var(--text-muted)'}}/>}
                                </div>
                            ))}
                        </div>
                        <div className="chat-panel glass-panel">
                            <h3>Guesses</h3>
                            <div className="chat-messages">
                                {chat.map((c, i) => (
                                    <div key={i} className={`chat-message ${c.isCorrect ? 'correct' : ''}`}>
                                        <strong>{c.userId.slice(0, 6)}: </strong>
                                        {c.isCorrect ? 'Guessed the word!' : c.text}
                                    </div>
                                ))}
                            </div>
                            {!isMyTurn && !isSpectator && (
                                <form className="chat-input" onSubmit={submitGuess}>
                                    <input 
                                        type="text" 
                                        placeholder="Type your guess..." 
                                        value={guess}
                                        onChange={e => setGuess(e.target.value)}
                                    />
                                    <button type="submit"><Send size={18} /></button>
                                </form>
                            )}
                            {isSpectator && (
                                <div style={{textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem'}}>
                                    Spectators cannot guess.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
