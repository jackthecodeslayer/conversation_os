import React, { useState, useRef, useEffect } from 'react';
import { useConversationOS } from '@cvos/sdk';
import { Pen, Hand, Users, Eye } from 'lucide-react';
import './index.css';

const COLORS = ['#0f172a', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

export default function App() {
  const {
    connected,
    role,
    sharedState,
    updateState,
    sendEvent,
    onEvent
  } = useConversationOS({
    backendUrl: 'https://cvos-backend.onrender.com'
  });

  const canvasRef = useRef(null);
  
  const [tool, setTool] = useState('draw');
  const [color, setColor] = useState(COLORS[0]);
  
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  
  const [currentLine, setCurrentLine] = useState(null);
  const [lastPanPoint, setLastPanPoint] = useState(null);

  const sharedStateRef = useRef(sharedState);
  useEffect(() => {
    sharedStateRef.current = sharedState;
  }, [sharedState]);

  // Initialize state on host
  useEffect(() => {
    if (connected && role === 'host' && !sharedState.lines) {
      updateState({ lines: [] });
    }
  }, [connected, role, sharedState.lines, updateState]);

  // Host-authoritative event handling
  useEffect(() => {
    // If the SDK uses an event listener
    if (!onEvent || role !== 'host') return;
    
    const unsubscribe = onEvent('add_line', (event) => {
      const line = event.payload ? event.payload.line : event.line;
      if (!line) return;
      const currentLines = sharedStateRef.current?.lines || [];
      updateState({ lines: [...currentLines, line] });
    });
    
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [onEvent, role, updateState]);

  // Handle window messages as fallback if onEvent isn't the API
  useEffect(() => {
    if (role !== 'host') return;
    
    const handleMessage = (e) => {
      if (e.data?.type === 'cvos_event' && e.data?.event === 'add_line') {
        const line = e.data.payload?.line;
        if (!line) return;
        const currentLines = sharedStateRef.current?.lines || [];
        updateState({ lines: [...currentLines, line] });
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [role, updateState]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Resize canvas to fill window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawCanvas();
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial draw
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [sharedState?.lines, currentLine, camera]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(camera.x, camera.y);
    
    const lines = sharedState?.lines || [];
    
    const drawLine = (line) => {
      if (!line?.points || line.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(line.points[0].x, line.points[0].y);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      ctx.stroke();
    };
    
    lines.forEach(drawLine);
    if (currentLine) drawLine(currentLine);
    
    ctx.restore();
  };

  const getCanvasPoint = (e) => {
    return {
      x: e.clientX - camera.x,
      y: e.clientY - camera.y
    };
  };

  const handlePointerDown = (e) => {
    if (role === 'spectator') return; // Intercept pointer events for spectators
    
    if (tool === 'pan' || e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (tool === 'draw' && e.button === 0) {
      setIsDrawing(true);
      setCurrentLine({
        color,
        width: 3,
        points: [getCanvasPoint(e)]
      });
    }
  };

  const handlePointerMove = (e) => {
    if (role === 'spectator') return;
    
    if (isPanning && lastPanPoint) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setCamera(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (isDrawing && currentLine) {
      setCurrentLine(prev => ({
        ...prev,
        points: [...prev.points, getCanvasPoint(e)]
      }));
    }
  };

  const handlePointerUp = (e) => {
    if (role === 'spectator') return;
    
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
    } else if (isDrawing) {
      setIsDrawing(false);
      if (currentLine && currentLine.points.length > 1) {
        if (role === 'host') {
          // Host updates state directly
          const currentLines = sharedStateRef.current?.lines || [];
          updateState({ lines: [...currentLines, currentLine] });
        } else {
          // Participant sends event to host
          if (sendEvent) {
             sendEvent('add_line', { line: currentLine });
          } else {
             // Fallback if sendEvent is not available, postMessage to window
             window.postMessage({ type: 'cvos_event', event: 'add_line', payload: { line: currentLine } }, '*');
          }
        }
      }
      setCurrentLine(null);
    }
  };

  if (!connected) {
    return <div className="loading-container">Connecting to CVOS...</div>;
  }

  const isSpectator = role === 'spectator';

  return (
    <div className="whiteboard-container">
      <div className="header-card">
        <h1>CVOS Whiteboard</h1>
        <div className="user-count">
          <Users size={16} /> Host-Authoritative
        </div>
        {isSpectator && (
          <div className="spectator-badge">
            <Eye size={14} /> View Only
          </div>
        )}
      </div>

      {!isSpectator && (
        <div className="tools-card">
          <button 
            className={`tool-button ${tool === 'draw' ? 'active' : ''}`}
            onClick={() => setTool('draw')}
            title="Draw"
          >
            <Pen size={20} />
          </button>
          <button 
            className={`tool-button ${tool === 'pan' ? 'active' : ''}`}
            onClick={() => setTool('pan')}
            title="Pan"
          >
            <Hand size={20} />
          </button>
          
          <div className="color-picker">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${color === c && tool === 'draw' ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => {
                  setColor(c);
                  setTool('draw');
                }}
              />
            ))}
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`canvas-area ${isSpectator ? 'spectator-mode' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
