import React, { useState, useEffect } from 'react';
import { useConversationOS } from '@cvos/sdk';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('roomId') || 'demo-room';
  const userId = params.get('userId') || 'user-' + Math.floor(Math.random() * 1000);
  const requestedRole = params.get('role') || 'player';

  const { roomStatus, myRole, gameState, sendAction, startGame, error } = useConversationOS(
    roomId,
    userId,
    requestedRole,
    { backendUrl: 'https://cvos-backend.onrender.com' }
  );

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(myRole === 'host');
  const [winner, setWinner] = useState(null);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'DRAW';
    return null;
  };

  useEffect(() => {
    if (gameState?.action?.type === 'MOVE') {
      const newBoard = [...board];
      newBoard[gameState.action.index] = gameState.action.playerSymbol;
      setBoard(newBoard);
      setWinner(checkWinner(newBoard));
      setIsMyTurn(true);
    } else if (gameState?.action?.type === 'RESET') {
      setBoard(Array(9).fill(null));
      setWinner(null);
      setIsMyTurn(myRole === 'host');
    }
  }, [gameState]);

  const handleCellClick = (index) => {
    if (myRole === 'spectator' || !isMyTurn || board[index] || winner) return;

    const playerSymbol = myRole === 'host' ? 'X' : 'O';
    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);
    setIsMyTurn(false);

    const winResult = checkWinner(newBoard);
    setWinner(winResult);

    sendAction({
      type: 'MOVE',
      index,
      playerSymbol
    });
  };

  const handleReset = () => {
    if (myRole === 'spectator') return;
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsMyTurn(myRole === 'host');
    sendAction({ type: 'RESET' });
  };

  const getStatusText = () => {
    if (winner === 'DRAW') return "It's a Draw! 🤝";
    if (winner) return `Winner: Player ${winner}! 🏆`;
    if (myRole === 'spectator') return 'Spectating live match...';
    return isMyTurn ? 'Your turn to move!' : 'Waiting for opponent...';
  };

  return (
    <div className="tictactoe-container">
      <div>
        <header className="bento-header">
          <div className="game-title">Tic-Tac-Toe Live</div>
          <div className={`turn-pill ${isMyTurn ? 'turn-my' : 'turn-wait'}`}>
            {myRole === 'spectator' ? 'Spectator' : isMyTurn ? 'Your Turn' : 'Waiting'}
          </div>
        </header>

        {myRole === 'spectator' && (
          <div className="spectator-banner">
            👁️ You are watching this match in real time
          </div>
        )}

        <main className="board-wrap">
          <div className="board-grid">
            {board.map((val, idx) => (
              <button
                key={idx}
                className={`board-cell ${val === 'X' ? 'x-mark' : val === 'O' ? 'o-mark' : ''}`}
                onClick={() => handleCellClick(idx)}
                disabled={myRole === 'spectator' || !isMyTurn || !!val || !!winner}
              >
                {val}
              </button>
            ))}
          </div>
        </main>
      </div>

      <footer className="bento-footer">
        <div className="status-text">{getStatusText()}</div>
        {myRole !== 'spectator' && (
          <button className="reset-btn" onClick={handleReset}>
            {winner ? 'Play Again' : 'Reset Board'}
          </button>
        )}
      </footer>
    </div>
  );
}
