import React, { useEffect, useState } from 'react';
import { useConversationOS } from '@cvos/sdk';
import { Users, Play, Eye } from 'lucide-react';
import './index.css';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
const WILD_VALUES = ['wild', 'wild4'];

function generateDeck() {
  const deck = [];
  let id = 0;
  for (const color of COLORS) {
    deck.push({ id: `card-${id++}`, color, value: '0' });
    for (const value of VALUES.slice(1)) {
      deck.push({ id: `card-${id++}`, color, value });
      deck.push({ id: `card-${id++}`, color, value });
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `card-${id++}`, color: 'wild', value: 'wild' });
    deck.push({ id: `card-${id++}`, color: 'wild', value: 'wild4' });
  }
  return deck.sort(() => Math.random() - 0.5);
}

function canPlayCard(card, topCard, currentColor) {
  if (card.color === 'wild') return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId') || 'demo-room';
  const userId = urlParams.get('userId') || `user-${Math.floor(Math.random()*1000)}`;
  
  // Real SDK usage
  const cvos = window.cvosClient || { _backendUrl: 'https://cvos-backend.onrender.com', _publishableKey: 'pk_demo' }; // Mock fallback
  
  const { 
    roomStatus, 
    myRole, 
    participants, 
    pendingParticipants, 
    gameState, 
    sendAction, 
    startGame, 
    admitUser, 
    demoteToSpectator 
  } = useConversationOS(cvos, roomId, userId, 'player');

  const sharedState = gameState || {
    gameStarted: false,
    players: [],
    hands: {},
    discardPile: [],
    deck: [],
    turnIndex: 0,
    direction: 1,
    currentColor: null,
    winner: null,
  };
  
  const updateSharedState = (newState) => {
    sendAction('STATE_UPDATE', { ...sharedState, ...newState });
  };
  
  const sendData = (action) => {
    sendAction(action.type, action.payload);
  };

  const role = myRole;
  const session = { participants };

  const [selectedWildCard, setSelectedWildCard] = useState(null);

  const me = session?.localParticipant;
  const isHost = role === 'host';
  const isSpectator = role === 'spectator';
  const isMyTurn = sharedState.gameStarted && sharedState.players[sharedState.turnIndex] === me?.id && !isSpectator;

  // Host Action Listeners
  useEffect(() => {
    if (!isHost || !session) return;

    const handleData = (event) => {
      const { type, payload, senderId } = event;
      if (!sharedState.gameStarted || sharedState.winner) return;
      
      const drawCardsHelper = (amount, currentDeck, currentDiscardPile) => {
        let deck = [...currentDeck];
        let discard = [...currentDiscardPile];
        let drawn = [];
        for (let i = 0; i < amount; i++) {
          if (deck.length === 0) {
            if (discard.length <= 1) break;
            const topCard = discard.pop();
            deck = discard.sort(() => Math.random() - 0.5);
            discard = [topCard];
          }
          drawn.push(deck.shift());
        }
        return { drawn, deck, discard };
      };

      if (type === 'PLAY_CARD') {
        const { cardId, chosenColor } = payload;
        const currentHand = sharedState.hands[senderId] || [];
        const cardIndex = currentHand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;
        
        const card = currentHand[cardIndex];
        const topCard = sharedState.discardPile[sharedState.discardPile.length - 1];
        
        if (sharedState.players[sharedState.turnIndex] !== senderId) return; // Not their turn
        if (!canPlayCard(card, topCard, sharedState.currentColor)) return; // Invalid move
        
        const newHand = [...currentHand];
        newHand.splice(cardIndex, 1);
        
        let nextDiscardPile = [...sharedState.discardPile, card];
        let newHands = { ...sharedState.hands, [senderId]: newHand };
        let nextColor = card.color === 'wild' ? chosenColor : card.color;
        let nextDirection = sharedState.direction;
        let skipNext = false;
        let nextDeck = [...sharedState.deck];
        
        if (newHand.length === 0) {
          updateSharedState({ winner: senderId, discardPile: nextDiscardPile, hands: newHands, currentColor: nextColor });
          return;
        }
        
        // Effects
        if (card.value === 'reverse') {
          nextDirection = sharedState.players.length > 2 ? nextDirection * -1 : nextDirection;
          if (sharedState.players.length === 2) skipNext = true;
        } else if (card.value === 'skip') {
          skipNext = true;
        } else if (card.value === 'draw2') {
          skipNext = true;
          let nextPlayer = sharedState.players[(sharedState.turnIndex + nextDirection + sharedState.players.length) % sharedState.players.length];
          const result = drawCardsHelper(2, nextDeck, nextDiscardPile);
          nextDeck = result.deck;
          nextDiscardPile = result.discard;
          newHands[nextPlayer] = [...(newHands[nextPlayer] || []), ...result.drawn];
        } else if (card.value === 'wild4') {
          skipNext = true;
          let nextPlayer = sharedState.players[(sharedState.turnIndex + nextDirection + sharedState.players.length) % sharedState.players.length];
          const result = drawCardsHelper(4, nextDeck, nextDiscardPile);
          nextDeck = result.deck;
          nextDiscardPile = result.discard;
          newHands[nextPlayer] = [...(newHands[nextPlayer] || []), ...result.drawn];
        }
        
        let nextTurnIndex = (sharedState.turnIndex + nextDirection * (skipNext ? 2 : 1) + (sharedState.players.length * 2)) % sharedState.players.length;
        
        updateSharedState({
          discardPile: nextDiscardPile,
          hands: newHands,
          deck: nextDeck,
          currentColor: nextColor,
          direction: nextDirection,
          turnIndex: nextTurnIndex
        });
      } else if (type === 'DRAW_CARD') {
        if (sharedState.players[sharedState.turnIndex] !== senderId) return;
        
        const result = drawCardsHelper(1, sharedState.deck, sharedState.discardPile);
        
        let newHands = { ...sharedState.hands, [senderId]: [...(sharedState.hands[senderId] || []), ...result.drawn] };
        let nextTurnIndex = (sharedState.turnIndex + sharedState.direction + sharedState.players.length) % sharedState.players.length;
        
        updateSharedState({
          hands: newHands,
          deck: result.deck,
          discardPile: result.discard,
          turnIndex: nextTurnIndex
        });
      }
    };

    session.on('data', handleData);
    return () => session.off('data', handleData);
  }, [isHost, session, sharedState, updateSharedState]);

  const startGame = () => {
    if (!isHost) return;
    
    const deck = generateDeck();
    const playingParticipants = session.participants.filter(p => p.role !== 'spectator');
    if (playingParticipants.length === 0) return;
    
    const players = playingParticipants.map(p => p.id);
    const hands = {};
    players.forEach(pId => {
      hands[pId] = deck.splice(0, 7);
    });
    
    let firstCard = deck.shift();
    while (firstCard.color === 'wild') {
      deck.push(firstCard);
      firstCard = deck.shift();
    }
    
    updateSharedState({
      gameStarted: true,
      players,
      hands,
      discardPile: [firstCard],
      deck,
      turnIndex: 0,
      direction: 1,
      currentColor: firstCard.color,
      winner: null
    });
  };

  const handlePlayCard = (card) => {
    if (!isMyTurn) return;
    const topCard = sharedState.discardPile[sharedState.discardPile.length - 1];
    
    if (!canPlayCard(card, topCard, sharedState.currentColor)) return;

    if (card.color === 'wild') {
      setSelectedWildCard(card);
    } else {
      sendData({ type: 'PLAY_CARD', payload: { cardId: card.id, chosenColor: card.color } }, 'host');
    }
  };

  const handleChooseColor = (color) => {
    if (selectedWildCard) {
      sendData({ type: 'PLAY_CARD', payload: { cardId: selectedWildCard.id, chosenColor: color } }, 'host');
      setSelectedWildCard(null);
    }
  };

  const handleDrawCard = () => {
    if (!isMyTurn) return;
    sendData({ type: 'DRAW_CARD', payload: {} }, 'host');
  };

  // Rendering logic
  const renderCard = (card, onClick, disabled = false) => {
    let displayValue = card.value;
    if (displayValue === 'skip') displayValue = 'Ø';
    if (displayValue === 'reverse') displayValue = '⇄';
    if (displayValue === 'draw2') displayValue = '+2';
    if (displayValue === 'wild') displayValue = 'W';
    if (displayValue === 'wild4') displayValue = '+4';

    return (
      <div 
        key={card.id} 
        className={`uno-card card-${card.color} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && onClick && onClick(card)}
      >
        <span className="card-corner top-left">{displayValue}</span>
        <span className="card-value">{displayValue}</span>
        <span className="card-corner bottom-right">{displayValue}</span>
      </div>
    );
  };

  if (roomStatus === 'connecting') return <div className="game-container"><div className="glass-panel" style={{padding: '20px'}}>Connecting...</div></div>;

  if (roomStatus === 'lobby') {
    return (
      <div className="game-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 20px 0' }}>Tournament Lobby</h1>
          <p>You are in the waiting room.</p>
          
          {isHost ? (
            <>
              <div style={{ margin: '20px 0', textAlign: 'left' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Waiting Room ({pendingParticipants?.length || 0})</h3>
                {pendingParticipants?.map(p => (
                  <div key={p.user_id} style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', alignItems: 'center' }}>
                    <span>User: {p.user_id}</span>
                    <div>
                      <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem', marginRight: '5px' }} onClick={() => admitUser(p.user_id)}>Admit</button>
                      <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#e74c3c' }} onClick={() => demoteToSpectator(p.user_id)}>Deny</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ margin: '20px 0', textAlign: 'left' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Admitted Players ({participants?.length || 0})</h3>
                {participants?.map(p => (
                  <div key={p.user_id} style={{ margin: '5px 0' }}>User: {p.user_id} ({p.role})</div>
                ))}
              </div>
              <button className="btn" onClick={startGame} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <Play size={20} style={{ marginRight: '10px' }} /> Start Game
              </button>
            </>
          ) : (
            <div style={{ margin: '20px 0' }}>
              <Loader2 className="spinner" size={32} style={{ display: 'block', margin: '0 auto 15px auto' }} />
              <p>Waiting for the host to admit you...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isSpectator && !sharedState.gameStarted) {
    return (
      <div className="game-container">
        <div className="spectator-view glass-panel">
          <Eye size={48} />
          <h2>You are a Spectator</h2>
          <p>Waiting for the host to start the game...</p>
        </div>
      </div>
    );
  }

  if (!sharedState.gameStarted) {
    return (
      <div className="game-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '3rem', margin: '0 0 20px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>CVOS UNO</h1>
          <p>Waiting for host to start...</p>
          <div style={{ margin: '20px 0' }}>
            <Users size={24} style={{ verticalAlign: 'middle', marginRight: '10px' }}/>
            {session.participants.length} Players joined
          </div>
          {isHost && (
            <button className="btn" onClick={() => {
              // Casual Start Flow
              startGame();
              // Trigger the Uno deal state
              const deck = generateDeck();
              const playingParticipants = session.participants.filter(p => p.role !== 'spectator');
              if (playingParticipants.length === 0) return;
              
              const players = playingParticipants.map(p => p.user_id || p.id);
              const hands = {};
              players.forEach(pId => {
                hands[pId] = deck.splice(0, 7);
              });
              
              let firstCard = deck.shift();
              while (firstCard.color === 'wild') {
                deck.push(firstCard);
                firstCard = deck.shift();
              }
              
              updateSharedState({
                gameStarted: true,
                players,
                hands,
                discardPile: [firstCard],
                deck,
                turnIndex: 0,
                direction: 1,
                currentColor: firstCard.color,
                winner: null
              });
            }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <Play size={20} style={{ marginRight: '10px' }} /> Start Game
            </button>
          )}
        </div>
      </div>
    );
  }

  if (sharedState.winner) {
    return (
      <div className="game-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Game Over!</h1>
          <h2>{session.participants.find(p => p.id === sharedState.winner)?.name || sharedState.winner} Wins!</h2>
          {isHost && (
            <button className="btn" onClick={startGame} style={{ marginTop: '20px' }}>
              Play Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const topCard = sharedState.discardPile[sharedState.discardPile.length - 1];
  const myHand = sharedState.hands[me?.id] || [];

  return (
    <div className="game-container">
      <div className="header glass-panel">
        <div className="player-list">
          {sharedState.players.map((pId, idx) => {
            const p = session.participants.find(part => part.id === pId);
            const isTurn = sharedState.turnIndex === idx;
            const handSize = sharedState.hands[pId]?.length || 0;
            return (
              <div key={pId} className={`player-avatar ${isTurn ? 'active' : ''}`}>
                <div style={{ fontWeight: 'bold' }}>{p?.name || pId}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{handSize} Cards</div>
              </div>
            );
          })}
        </div>
        <div>
          {isSpectator && <span className="spectator-badge">SPECTATOR VIEW</span>}
        </div>
      </div>

      <div className="play-area">
        <div className="deck-area">
          <div className="deck-pile" onClick={() => !isSpectator && isMyTurn && handleDrawCard()}>
            UNO
          </div>
          <div className="discard-pile">
            {renderCard(topCard)}
          </div>
        </div>

        {sharedState.currentColor && topCard.color === 'wild' && (
          <div className="current-color-indicator" style={{ color: `var(--uno-${sharedState.currentColor})` }}>
            Current Color: {sharedState.currentColor.toUpperCase()}
          </div>
        )}

        {selectedWildCard && (
          <div className="color-picker">
            {COLORS.map(c => (
              <div 
                key={c} 
                className={`color-btn`} 
                style={{ backgroundColor: `var(--uno-${c})` }}
                onClick={() => handleChooseColor(c)}
              />
            ))}
          </div>
        )}
      </div>

      {!isSpectator && (
        <div className="hand-area glass-panel">
          <div className="hand-cards">
            {myHand.map(card => {
              const disabled = !isMyTurn || !canPlayCard(card, topCard, sharedState.currentColor) || selectedWildCard;
              return renderCard(card, handlePlayCard, disabled);
            })}
          </div>
        </div>
      )}
    </div>
  );
}
