import { useState, useRef, useEffect } from 'react';
import { useConversationOS } from '@cvos/sdk';
import Tesseract from 'tesseract.js';
import { Camera, Receipt, Users, Loader2, ImagePlus } from 'lucide-react';
import './index.css';

function App() {
  const {
    role,
    userId,
    userName,
    participants,
    sharedState,
    updateState,
    syncRoom,
    isReady
  } = useConversationOS({
    backendUrl: 'https://cvos-backend.onrender.com'
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Initialize shared state if empty and host
  useEffect(() => {
    if (isReady && role === 'host' && !sharedState.items) {
      updateState({
        items: [],
        tax: 0,
        tip: 0
      });
    }
  }, [isReady, role, sharedState.items, updateState]);

  if (!isReady) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <Loader2 className="spinner" size={32} />
          <p>Connecting to Conversation OS...</p>
        </div>
      </div>
    );
  }

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.round(m.progress * 100));
          }
        }
      });

      // Simple heuristic to extract items and prices
      const lines = result.data.lines;
      const newItems = [];
      
      lines.forEach(line => {
        const text = line.text.trim();
        // Look for something that looks like a price at the end: $12.99 or 12.99
        const priceMatch = text.match(/[$]?(\d+\.\d{2})$/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1]);
          const name = text.replace(priceMatch[0], '').trim();
          if (name && price > 0) {
            newItems.push({
              id: Math.random().toString(36).substring(2, 9),
              name,
              price,
              claimedBy: []
            });
          }
        }
      });

      if (newItems.length > 0) {
        updateState({
          items: [...(sharedState.items || []), ...newItems]
        });
      } else {
        alert("No prices found on receipt.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to scan receipt. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleClaim = (itemId) => {
    if (role === 'spectator') return;

    const items = sharedState.items || [];
    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const item = items[itemIndex];
    const claimedBy = item.claimedBy || [];
    
    let newClaimedBy;
    if (claimedBy.includes(userId)) {
      // Unclaim
      newClaimedBy = claimedBy.filter(id => id !== userId);
    } else {
      // Claim
      newClaimedBy = [...claimedBy, userId];
    }

    const newItems = [...items];
    newItems[itemIndex] = { ...item, claimedBy: newClaimedBy };

    updateState({ items: newItems });
  };

  const handleRemoveItem = (itemId) => {
    if (role !== 'host') return;
    
    const items = sharedState.items || [];
    updateState({
      items: items.filter(i => i.id !== itemId)
    });
  };

  const items = sharedState.items || [];
  const tax = sharedState.tax || 0;
  const tip = sharedState.tip || 0;

  // Calculate splits
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + tax + tip;
  
  const userTotals = {};
  items.forEach(item => {
    if (item.claimedBy && item.claimedBy.length > 0) {
      const splitPrice = item.price / item.claimedBy.length;
      item.claimedBy.forEach(uid => {
        userTotals[uid] = (userTotals[uid] || 0) + splitPrice;
      });
    }
  });

  // Distribute tax and tip proportionally
  if (subtotal > 0) {
    Object.keys(userTotals).forEach(uid => {
      const ratio = userTotals[uid] / subtotal;
      userTotals[uid] += (tax * ratio) + (tip * ratio);
    });
  }

  const isSpectator = role === 'spectator';

  return (
    <div className="app-container">
      <div className="header">
        <div className={`status-badge ${role}`}>
          {role === 'host' ? 'Host' : role === 'participant' ? 'Participant' : 'Spectator (View Only)'}
        </div>
        <h1>CVOS Splitter</h1>
        <p>Scan receipts and split the bill fairly</p>
      </div>

      {role === 'host' && (
        <div className="bento-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
            <Camera size={20} className="text-primary" />
            Scan Receipt
          </h2>
          
          <div className="file-input-wrapper">
            <button className="btn btn-primary" disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="spinner" size={18} />
                  Scanning... {scanProgress}%
                </>
              ) : (
                <>
                  <ImagePlus size={18} />
                  Take Picture / Upload
                </>
              )}
            </button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleImageCapture}
              disabled={isScanning}
            />
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="receipt-card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'JetBrains Mono' }}>
            <h2>GUEST CHECK</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="receipt-items">
            {items.map(item => {
              const isClaimedByMe = item.claimedBy?.includes(userId);
              const isClaimedByOthers = item.claimedBy?.length > 0 && !isClaimedByMe;
              const claimants = (participants || []).filter(p => item.claimedBy?.includes(p.id)).map(p => p.name).join(', ');

              return (
                <div key={item.id} className="receipt-item">
                  <div className="item-name">
                    {item.name}
                    {item.claimedBy?.length > 0 && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                        claimed by: {claimants}
                      </div>
                    )}
                  </div>
                  <div className="item-price">${item.price.toFixed(2)}</div>
                  
                  {!isSpectator && (
                    <button 
                      className={`claim-button ${isClaimedByMe ? 'claimed' : isClaimedByOthers ? 'claimed-by-other' : 'unclaimed'}`}
                      onClick={() => handleClaim(item.id)}
                    >
                      {isClaimedByMe ? 'Mine' : 'Claim'}
                    </button>
                  )}

                  {role === 'host' && (
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: '0.5rem', padding: '0.25rem' }}
                      title="Remove Item"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="totals">
            {role === 'host' ? (
              <>
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row" style={{ alignItems: 'center' }}>
                  <span>Tax</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    $
                    <input 
                      type="number" 
                      value={tax || ''} 
                      onChange={e => updateState({ tax: parseFloat(e.target.value) || 0 })}
                      style={{ width: '80px', marginLeft: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem', fontFamily: 'inherit' }}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="total-row" style={{ alignItems: 'center' }}>
                  <span>Tip</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    $
                    <input 
                      type="number" 
                      value={tip || ''} 
                      onChange={e => updateState({ tip: parseFloat(e.target.value) || 0 })}
                      style={{ width: '80px', marginLeft: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem', fontFamily: 'inherit' }}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Tip</span>
                  <span>${tip.toFixed(2)}</span>
                </div>
              </>
            )}
            
            <div className="total-row grand-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {Object.keys(userTotals).length > 0 && (
        <div className="bento-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
            <Users size={20} className="text-primary" />
            Final Splits
          </h2>
          
          <div className="user-splits">
            {Object.entries(userTotals).map(([uid, amount]) => {
              const participant = (participants || []).find(p => p.id === uid);
              const name = participant ? participant.name : (uid === userId ? userName : 'Unknown');
              
              return (
                <div key={uid} className="user-split-card" style={{ borderLeft: uid === userId ? '4px solid var(--primary)' : '4px solid transparent' }}>
                  <span>{name} {uid === userId && '(You)'}</span>
                  <span style={{ fontWeight: 'bold' }}>${amount.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
