import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useConversationOS } from '@cvos/sdk';
import { Eye, RotateCcw } from 'lucide-react';
import './index.css';

// Unicode Chess Piece Glyphs
const PIECE_GLYPHS = {
  w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
  b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
};

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('roomId') || 'demo-room';
  const userId = params.get('userId') || 'host-user';

  const cvosClient = window.cvosClient || {
    _backendUrl: 'https://cvos-backend.onrender.com',
    _publishableKey: 'pk_chess_demo'
  };

  const {
    myRole,
    gameState,
    sendAction
  } = useConversationOS(cvosClient, roomId, userId, 'player');

  const isHost = myRole === 'host';
  const isSpectator = myRole === 'spectator';

  // Local chess engine instance
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);

  // Sync board state when receiving gameState over WebSocket
  useEffect(() => {
    if (gameState?.fen) {
      const newGame = new Chess(gameState.fen);
      setGame(newGame);
      setLastMove(gameState.lastMove || null);
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  }, [gameState]);

  // White is Host, Black is Guest Player
  const myColor = isSpectator ? null : (isHost ? 'w' : 'b');
  const isMyTurn = !isSpectator && (game.turn() === myColor);

  // Board layout 8x8 representation
  const board = useMemo(() => game.board(), [game]);

  const handleSquareClick = useCallback((row, col) => {
    if (!isMyTurn || game.isGameOver()) return;

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const square = `${files[col]}${8 - row}`;

    // If already selected, try to move
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Check if moving to this square is legal
      try {
        const moveAttempt = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q'
        });

        if (moveAttempt) {
          const newFen = game.fen();
          setGame(new Chess(newFen));
          setLastMove({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setPossibleMoves([]);

          // Broadcast state to opponent and spectators
          sendAction('CHESS_MOVE', {
            fen: newFen,
            lastMove: { from: selectedSquare, to: square },
            turn: game.turn(),
            isGameOver: game.isGameOver(),
            isCheckmate: game.isCheckmate()
          });
          return;
        }
      } catch (_e) {
        // Move was illegal, fallthrough to selecting the new piece if it belongs to current player
      }
    }

    // Select piece
    const piece = game.get(square);
    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setPossibleMoves(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  }, [game, isMyTurn, myColor, selectedSquare, sendAction]);

  const handleReset = () => {
    if (isSpectator) return;
    const freshGame = new Chess();
    setGame(freshGame);
    setLastMove(null);
    setSelectedSquare(null);
    setPossibleMoves([]);
    sendAction('CHESS_RESET', {
      fen: freshGame.fen(),
      lastMove: null
    });
  };

  // Status message
  let statusMessage = "White's Turn";
  if (game.isCheckmate()) {
    statusMessage = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins! 🏆`;
  } else if (game.isDraw()) {
    statusMessage = 'Game Draw (Stalemate / Insufficient Material)';
  } else if (game.isCheck()) {
    statusMessage = `${game.turn() === 'w' ? 'White' : 'Black'} is in Check! ⚠️`;
  } else {
    statusMessage = `${game.turn() === 'w' ? "White's" : "Black's"} Turn ${isMyTurn ? '(Your Move)' : '(Waiting...)'}`;
  }

  return (
    <div className="chess-container">
      {/* Header */}
      <div className="chess-header">
        <div className="title-wrap">
          <span className="title-emoji">♟️</span>
          <span className="title-text">CVOS Chess Masters</span>
        </div>
        {isSpectator && (
          <div className="spectator-badge">
            <Eye size={14} />
            LIVE SPECTATOR
          </div>
        )}
      </div>

      {/* Opponent (Black) Bar */}
      <div className="player-bar">
        <div className="player-info">
          <div className="player-icon player-black">♟</div>
          <span className="player-name">Player 2 (Black)</span>
        </div>
        <span className={`turn-pill ${game.turn() === 'b' ? 'turn-active' : 'turn-wait'}`}>
          {game.turn() === 'b' ? 'ACTIVE' : 'WAITING'}
        </span>
      </div>

      {/* 8x8 Chess Board */}
      <div className="board-wrapper">
        <div className="chess-board">
          {board.map((rowArr, rowIndex) =>
            rowArr.map((cell, colIndex) => {
              const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
              const squareName = `${files[colIndex]}${8 - rowIndex}`;
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare === squareName;
              const isLastMoveSquare = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
              const isPossibleMove = possibleMoves.includes(squareName);
              const pieceGlyph = cell ? PIECE_GLYPHS[cell.color][cell.type] : null;

              return (
                <div
                  key={squareName}
                  className={`square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isLastMoveSquare ? 'last-move' : ''}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {isPossibleMove && (
                    <div className={cell ? 'capture-indicator' : 'move-indicator'} />
                  )}
                  {cell && (
                    <span
                      className="piece-glyph"
                      style={{ color: cell.color === 'w' ? '#ffffff' : '#0f172a', textShadow: cell.color === 'w' ? '0 1px 2px rgba(0,0,0,0.6)' : 'none' }}
                    >
                      {pieceGlyph}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Host (White) Bar */}
      <div className="player-bar">
        <div className="player-info">
          <div className="player-icon player-white">♙</div>
          <span className="player-name">Player 1 (White)</span>
        </div>
        <span className={`turn-pill ${game.turn() === 'w' ? 'turn-active' : 'turn-wait'}`}>
          {game.turn() === 'w' ? 'ACTIVE' : 'WAITING'}
        </span>
      </div>

      {/* Game Status Banner */}
      <div className="game-status-banner">
        {statusMessage}
      </div>

      {/* Reset CTA */}
      {!isSpectator && (game.isGameOver() || isHost) && (
        <button className="reset-button" onClick={handleReset}>
          <RotateCcw size={16} />
          Reset Match
        </button>
      )}
    </div>
  );
}
