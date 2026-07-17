import React, { useState, useEffect, useCallback } from 'react';
import { useConversationOS } from '@cvos/sdk';
import { Eye, RotateCcw } from 'lucide-react';
import './index.css';

const ROWS = 6;
const COLS = 7;

function createEmptyBoard() {
  return Array.from({ length: COLS }, () => []);
}

function checkWinCondition(board, col, row, player) {
  const dirs = [
    [[0, 1], [0, -1]], // vertical
    [[1, 0], [-1, 0]], // horizontal
    [[1, 1], [-1, -1]], // diagonal /
    [[1, -1], [-1, 1]]  // diagonal \
  ];

  for (let dir of dirs) {
    let count = 1;
    let winningCells = [{ c: col, r: row }];
    
    for (let [dx, dy] of dir) {
      let c = col + dx;
      let r = row + dy;
      while (c >= 0 && c < COLS && r >= 0 && r < ROWS && board[c][r] === player) {
        count++;
        winningCells.push({ c, r });
        c += dx;
        r += dy;
      }
    }
    
    if (count >= 4) {
      return winningCells;
    }
  }
  return null;
}

export default function App() {
  const { role, state, sendAction, isHost } = useConversationOS({
    defaultState: {
      board: createEmptyBoard(),
      currentPlayer: 1, // 1 (Red) or 2 (Yellow)
      winner: null,
      winningCells: [],
      isDraw: false
    },
    onAction: (action, prevState) => {
      if (!isHost) return prevState; // Only host updates state

      if (action.type === 'DROP_CHIP' && !prevState.winner && !prevState.isDraw) {
        if (action.player !== prevState.currentPlayer) return prevState;
        
        const { col } = action;
        const column = prevState.board[col];
        if (column.length >= ROWS) return prevState; 

        const newBoard = prevState.board.map((c, i) => i === col ? [...c, action.player] : c);
        const row = column.length; 
        
        const winningCells = checkWinCondition(newBoard, col, row, action.player);
        
        if (winningCells) {
          return {
            ...prevState,
            board: newBoard,
            winner: action.player,
            winningCells
          };
        }
        
        const isDraw = newBoard.every(c => c.length >= ROWS);
        
        return {
          ...prevState,
          board: newBoard,
          currentPlayer: prevState.currentPlayer === 1 ? 2 : 1,
          isDraw
        };
      }
      
      if (action.type === 'RESET') {
        return {
          board: createEmptyBoard(),
          currentPlayer: 1,
          winner: null,
          winningCells: [],
          isDraw: false
        };
      }
      
      return prevState;
    }
  });

  const { board, currentPlayer, winner, winningCells, isDraw } = state;
  const isSpectator = role === 'spectator';
  const myPlayerId = isHost ? 1 : (isSpectator ? null : 2);
  
  const canPlay = !isSpectator && !winner && !isDraw && currentPlayer === myPlayerId;

  const handleColumnClick = (colIndex) => {
    if (!canPlay) return;
    if (board[colIndex].length >= ROWS) return;
    
    sendAction({ type: 'DROP_CHIP', col: colIndex, player: myPlayerId });
  };

  const handleReset = () => {
    if (!isSpectator) {
      sendAction({ type: 'RESET' });
    }
  };

  const renderCell = (colIndex, rowIndex) => {
    const player = board[colIndex][rowIndex];
    const isWinCell = winningCells.some(cell => cell.c === colIndex && cell.r === rowIndex);
    
    return (
      <div className="cell" key={rowIndex}>
        {player && (
          <div className={`chip p${player} ${isWinCell ? 'win' : ''}`}></div>
        )}
      </div>
    );
  };

  const renderColumn = (colIndex) => {
    const cells = [];
    for (let r = 0; r < ROWS; r++) {
      cells.push(renderCell(colIndex, r));
    }
    return cells;
  };

  let statusText = '';
  let statusClass = '';
  if (winner) {
    statusText = `Player ${winner} Wins!`;
    statusClass = `p${winner}-turn`;
  } else if (isDraw) {
    statusText = 'Game Draw!';
  } else {
    statusText = `Player ${currentPlayer}'s Turn`;
    statusClass = `p${currentPlayer}-turn`;
    if (myPlayerId) {
      statusText += (currentPlayer === myPlayerId) ? ' (You)' : ' (Waiting...)';
    }
  }

  return (
    <div className="game-container">
      {isSpectator && (
        <div className="spectator-badge">
          <Eye size={18} />
          Spectator Mode
        </div>
      )}
      
      <div className="header">
        <h1>4 In A Row</h1>
        <div className={`status ${statusClass}`}>
          {statusText}
        </div>
      </div>

      <div className="board">
        {Array.from({ length: COLS }).map((_, colIndex) => (
          <div 
            key={colIndex} 
            className={`column ${(!canPlay || board[colIndex].length >= ROWS) ? 'disabled' : ''}`}
            onClick={() => handleColumnClick(colIndex)}
          >
            {renderColumn(colIndex)}
          </div>
        ))}
      </div>

      {!isSpectator && (winner || isDraw) && (
        <div className="controls">
          <button onClick={handleReset}>
            <RotateCcw size={18} /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}
