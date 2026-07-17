import React, { useState, useEffect } from 'react';
import { createCvosClient, useConversationOS } from '@cvos/sdk';
import { BrainCircuit, Play, CheckCircle2, XCircle, Eye } from 'lucide-react';
import './index.css';

const cvos = createCvosClient({
    gameId: 'cvos-trivia-clash',
    publishableKey: 'pk_prod_demo_key_123', 
    backendUrl: 'https://cvos-backend.onrender.com'
});

const QUESTIONS = [
    { q: "What is the capital of France?", a: ["Berlin", "London", "Paris", "Rome"], correct: 2 },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
    { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"], correct: 1 },
    { q: "What is the largest ocean on Earth?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
];

export default function App() {
    const searchParams = new URLSearchParams(window.location.search);
    const roomId = searchParams.get('roomId') || 'demo-trivia';
    const userId = searchParams.get('userId') || `player_${Math.floor(Math.random()*1000)}`;
    const role = searchParams.get('role') || 'player';

    const { roomStatus, myRole, participants, gameState, sendAction, startGame } = useConversationOS(cvos, roomId, userId, role);

    const isSpectator = role === 'spectator';
    const currentQ = gameState?.currentQuestion;
    const isRevealed = gameState?.isRevealed;
    const scores = gameState?.scores || {};
    const answers = gameState?.answers || {};
    const [timeLeft, setTimeLeft] = useState(0);

    // Timer logic
    useEffect(() => {
        if (gameState?.endTime && !isRevealed) {
            const updateTimer = () => {
                const remaining = Math.max(0, Math.floor((gameState.endTime - Date.now()) / 1000));
                setTimeLeft(remaining);
                
                if (remaining === 0 && myRole === 'host') {
                    // Host auto-reveals when time is up
                    sendAction('REVEAL_ANSWER', {});
                }
            };
            const interval = setInterval(updateTimer, 500);
            updateTimer();
            return () => clearInterval(interval);
        }
    }, [gameState?.endTime, isRevealed, myRole]);

    const handleHostNext = () => {
        const qIdx = Math.floor(Math.random() * QUESTIONS.length);
        sendAction('NEXT_QUESTION', {
            questionObj: QUESTIONS[qIdx],
            endTime: Date.now() + 10000 // 10 seconds
        });
        if (!gameState) startGame();
    };

    const submitAnswer = (idx) => {
        if (isSpectator || answers[userId] !== undefined || isRevealed) return;
        sendAction('SUBMIT_ANSWER', {
            userId,
            answerIdx: idx,
            isCorrect: idx === currentQ.correct
        });
    };

    if (roomStatus === 'connecting') return <div className="loading">Connecting to CVOS Relay...</div>;
    if (roomStatus === 'error') return <div className="error">Failed to connect.</div>;

    const hasAnswered = answers[userId] !== undefined;

    return (
        <div className="app-container">
            <header className="header glass-panel">
                <div className="brand">
                    <BrainCircuit className="brand-icon" />
                    <h1>Trivia Clash</h1>
                </div>
                <div className="room-badge">
                    {isSpectator && <Eye size={16} style={{marginRight: '5px'}}/>}
                    {isSpectator ? 'Spectating' : `Room: ${roomId.slice(0, 6)}`}
                </div>
            </header>

            {!currentQ ? (
                <div className="glass-panel" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem'}}>
                    <h2 style={{marginBottom: '1rem'}}>Waiting for Host...</h2>
                    <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>
                        {participants.length} Participant(s) joined.
                    </p>
                    {myRole === 'host' && (
                        <button className="primary-btn" onClick={handleHostNext}>
                            <Play size={20} />
                            Start Trivia
                        </button>
                    )}
                </div>
            ) : (
                <div className="game-area">
                    {isSpectator && (
                        <div className="spectator-banner">
                            <Eye size={18} /> You are spectating this match
                        </div>
                    )}
                    
                    <div className="glass-panel" style={{width: '100%', padding: '2rem'}}>
                        <div className="question-panel">
                            {currentQ.q}
                        </div>
                        
                        {!isRevealed && (
                            <div className="timer-bar-container">
                                <div className="timer-bar" style={{ width: `${(timeLeft / 10) * 100}%` }} />
                            </div>
                        )}
                    </div>

                    <div className="answers-grid">
                        {currentQ.a.map((ans, idx) => {
                            let className = "answer-btn glass-panel ";
                            const isMyAnswer = answers[userId] === idx;
                            
                            if (isMyAnswer) className += "selected ";
                            
                            if (isRevealed) {
                                if (idx === currentQ.correct) className += "correct ";
                                else if (isMyAnswer) className += "incorrect ";
                            }

                            return (
                                <button 
                                    key={idx}
                                    className={className}
                                    onClick={() => submitAnswer(idx)}
                                    disabled={isSpectator || hasAnswered || isRevealed}
                                >
                                    {ans}
                                    {isRevealed && idx === currentQ.correct && <CheckCircle2 size={20} style={{position:'absolute', right:'1rem', top:'1.5rem'}}/>}
                                    {isRevealed && isMyAnswer && idx !== currentQ.correct && <XCircle size={20} style={{position:'absolute', right:'1rem', top:'1.5rem'}}/>}
                                </button>
                            );
                        })}
                    </div>

                    {isRevealed && myRole === 'host' && (
                        <button className="primary-btn" onClick={handleHostNext} style={{marginTop: '1rem'}}>
                            Next Question
                        </button>
                    )}

                    <div className="glass-panel leaderboard">
                        <h3 style={{padding: '1rem', borderBottom: '1px solid var(--panel-border)', margin: 0}}>Leaderboard</h3>
                        {participants.filter(p => p.role !== 'spectator').map(p => (
                            <div key={p.user_id} className="leaderboard-item">
                                <span>{p.user_id === userId ? 'You' : p.user_id.slice(0, 8)}</span>
                                <strong>{scores[p.user_id] || 0} pts</strong>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
