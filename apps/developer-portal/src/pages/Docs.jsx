import React, { useState } from 'react';
import { Copy, Check, ChevronRight } from 'lucide-react';

const sections = ['Quickstart', 'SDK Reference', 'Store & Entitlements', 'WebSockets', 'Deep Links', 'Webhooks'];

function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: 'relative', marginBottom: '1rem' }}>
      {label && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</p>}
      <div className="code-block" style={{ position: 'relative', padding: '1rem 3rem 1rem 1rem' }}>
        <pre style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{code}</pre>
        <button onClick={copy} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  );
}

function Quickstart() {
  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Quickstart</h2>
      <p style={{ marginBottom: '2rem' }}>Get your first CVOS game running in under 10 minutes.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {[
          {
            step: '01', title: 'Install the SDK',
            content: <CodeBlock code={`npm install @cvos/sdk\n# or\nyarn add @cvos/sdk`} />
          },
          {
            step: '02', title: 'Initialise in your game',
            content: <CodeBlock code={`import { createCvosClient } from '@cvos/sdk';\n\nconst cvos = createCvosClient({\n  gameId: 'your-game-id',  // from the CVOS Developer Portal\n  apiKey: process.env.CVOS_API_KEY,\n});\n\n// Subscribe to player moves\ncvos.on('move', (state) => {\n  renderBoard(state);\n});\n\n// Send a move\ncvos.send('move', { square: 4, player: 'X' });`} />
          },
          {
            step: '03', title: 'Deploy and submit',
            content: (
              <div>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Deploy your game to any static host (Vercel, Netlify, GitHub Pages). Then register the URL in the CVOS Developer Portal under <strong>Games → New Game → Web App URL</strong>.</p>
                <p style={{ fontSize: '0.9rem' }}>Once approved, your game will appear in the CVOS Storefront and keyboard. Players can launch it in any conversation.</p>
              </div>
            )
          }
        ].map(item => (
          <div key={item.step} className="card interactive-card" style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '1.25rem', alignItems: 'start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0,112,243,0.1)', border: '1px solid rgba(0,112,243,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0070F3', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              {item.step}
            </div>
            <div>
              <h3 style={{ marginBottom: '0.75rem' }}>{item.title}</h3>
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SdkReference() {
  const methods = [
    { method: 'createCvosClient(options)', returns: 'CvosClient', desc: 'Initialises and returns the CVOS client.' },
    { method: 'cvos.on(event, handler)', returns: 'void', desc: 'Subscribe to real-time events (move, player_joined, session_ended…).' },
    { method: 'cvos.send(event, payload)', returns: 'Promise<void>', desc: 'Broadcast an event to all session participants.' },
    { method: 'cvos.getSession()', returns: 'Session', desc: 'Returns current session metadata: roomId, players, status.' },
    { method: 'cvos.getUser()', returns: 'User', desc: 'Returns the authenticated user object: id, displayName, avatar.' },
    { method: 'cvos.store.getProducts()', returns: 'Product[]', desc: 'Fetches all products defined in the Developer Portal for this game.' },
    { method: 'cvos.store.purchase(entitlementId)', returns: 'Promise<Receipt>', desc: 'Opens the CVOS payment sheet. Resolves with receipt on success.' },
    { method: 'cvos.store.checkEntitlement(entitlementId)', returns: 'Promise<boolean>', desc: 'Returns true if the current user owns this item/entitlement.' },
    { method: 'cvos.store.getBalance()', returns: 'Promise<number>', desc: "Returns the user's current consumable credit balance for this game." },
    { method: 'cvos.notify(message)', returns: 'Promise<void>', desc: 'Sends a push notification to all players whose turn it is.' },
    { method: 'cvos.save(key, value)', returns: 'Promise<void>', desc: "Persists arbitrary JSON data to the user's cloud save." },
    { method: 'cvos.load(key)', returns: 'Promise<any>', desc: 'Loads a previously saved cloud save value.' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>SDK Reference</h2>
      <p style={{ marginBottom: '2rem' }}>Full API reference for the <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)' }}>@cvos/sdk</code> package.</p>
      <div className="card interactive-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
              {['METHOD', 'RETURNS', 'DESCRIPTION'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {methods.map((m, i) => (
              <tr key={m.method} style={{ borderBottom: i < methods.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{m.method}</code>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ color: '#79C0FF', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{m.returns}</code>
                </td>
                <td style={{ padding: '0.9rem 1rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{m.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StoreEntitlements() {
  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Store & Entitlements</h2>
      <p style={{ marginBottom: '2rem' }}>How to define purchasable items and gate content in your game.</p>

      <div className="card interactive-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>How It Works</h3>
        <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 2.2, fontSize: '0.9rem' }}>
          <li>Define products in the Portal under <strong style={{ color: '#FFF' }}>Games → [Your Game] → Monetization</strong></li>
          <li>Each product gets an auto-generated <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)' }}>entitlement_id</code></li>
          <li>In your game, call <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)' }}>cvos.store.checkEntitlement(id)</code> to gate content</li>
          <li>Call <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)' }}>cvos.store.purchase(id)</code> to trigger the CVOS-hosted payment UI</li>
          <li>CVOS handles payment, receipt, and entitlement storage. You receive a webhook and your revenue share.</li>
        </ol>
      </div>

      <CodeBlock label="Example: Gating a premium item in a dress-up game" code={`import { createCvosClient } from '@cvos/sdk';

const cvos = createCvosClient({ gameId: 'your-game-id', apiKey: '...' });

async function showOutfit(outfitId, entitlementId) {
  const owned = await cvos.store.checkEntitlement(entitlementId);

  if (owned) {
    renderOutfit(outfitId); // user owns it, show it
  } else {
    // User doesn't own it — trigger purchase flow
    try {
      const receipt = await cvos.store.purchase(entitlementId);
      if (receipt.success) {
        renderOutfit(outfitId);
      }
    } catch (err) {
      showLockedMessage(); // user cancelled or payment failed
    }
  }
}

// Usage
showOutfit('princess-gown-3d', 'outfit_princess_001');`} />

      <div style={{ backgroundColor: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.25)', borderRadius: 10, padding: '1rem 1.25rem', marginTop: '1rem' }}>
        <p style={{ color: '#E53935', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>⚠️ Ad SDKs are not permitted</p>
        <p style={{ color: '#8B8B8B', fontSize: '0.85rem' }}>Integrating any third-party advertising SDK (e.g. AdMob, Meta Audience Network) is a violation of the CVOS Platform Terms and will result in your game being removed. The only monetisation path is through CVOS entitlements.</p>
      </div>
    </div>
  );
}

function WebSockets() {
  const events = [
    { name: 'player.joined', payload: '{ userId, displayName, joinedAt }', desc: 'A new player joined the session' },
    { name: 'player.left', payload: '{ userId, reason }', desc: 'A player disconnected or left' },
    { name: 'move', payload: '{ playerId, data: any, timestamp }', desc: 'A player sent a game move (any JSON payload)' },
    { name: 'session.started', payload: '{ sessionId, players[], gameId }', desc: 'The session has enough players and has begun' },
    { name: 'session.ended', payload: '{ winnerId, reason, finalState }', desc: 'The session concluded' },
    { name: 'presence.update', payload: '{ userId, status: "active"|"idle"|"offline" }', desc: "A player's presence status changed" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>WebSocket Events</h2>
      <p style={{ marginBottom: '2rem' }}>CVOS uses a managed WebSocket connection. You never open sockets directly — just subscribe to events.</p>
      <div className="card interactive-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
              {['EVENT', 'PAYLOAD', 'DESCRIPTION'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={e.name} style={{ borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '0.9rem 1rem' }}><code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{e.name}</code></td>
                <td style={{ padding: '0.9rem 1rem' }}><code style={{ color: '#79C0FF', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{e.payload}</code></td>
                <td style={{ padding: '0.9rem 1rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeepLinks() {
  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Deep Links</h2>
      <p style={{ marginBottom: '2rem' }}>CVOS generates universal links that open the game session directly.</p>
      <div className="card interactive-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Link Format</h3>
        <CodeBlock code={`https://play.cvos.app/game/{gameId}/{sessionId}?role={host|guest|spectator}`} />
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          {[["gameId", "Your game's unique ID from the portal"],
            ['sessionId', 'The room ID generated by cvos.getSession()'],
            ['role', 'host (game creator), guest (invited), spectator (watch-only)']].map(([param, desc]) => (
            <tr key={param} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.7rem 0', width: 120 }}><code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{param}</code></td>
              <td style={{ padding: '0.7rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{desc}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
}

function Webhooks() {
  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Webhooks</h2>
      <p style={{ marginBottom: '2rem' }}>Receive real-time POST requests to your server when key events occur.</p>
      <CodeBlock label="Example webhook payload (session.ended)" code={`{
  "event": "session.ended",
  "timestamp": "2026-07-15T07:00:00Z",
  "gameId": "tic-tac-toe-pro",
  "sessionId": "session_abc123",
  "data": {
    "winnerId": "user_xyz",
    "reason": "game_complete",
    "finalState": { "board": ["X","O","X","O","X","","","","X"], "winner": "X" }
  },
  "signature": "sha256=abc123..." // verify with your webhook secret
}`} />
      <div className="card interactive-card">
        <h3 style={{ marginBottom: '1rem' }}>Verifying Signatures</h3>
        <CodeBlock label="Node.js" code={`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const computed = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}`} />
      </div>
    </div>
  );
}

const SECTION_COMPONENTS = {
  'Quickstart': <Quickstart />,
  'SDK Reference': <SdkReference />,
  'Store & Entitlements': <StoreEntitlements />,
  'WebSockets': <WebSockets />,
  'Deep Links': <DeepLinks />,
  'Webhooks': <Webhooks />,
};

export default function Docs() {
  const [active, setActive] = useState('Quickstart');

  return (
    <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'start' }}>
      {/* Doc Nav */}
      <div style={{ position: 'sticky', top: '2rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Documentation</p>
        {sections.map(s => (
          <button key={s} onClick={() => setActive(s)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '0.2rem', fontSize: '0.9rem', fontWeight: active === s ? 600 : 400, transition: 'all 0.15s',
              backgroundColor: active === s ? 'rgba(0,112,243,0.1)' : 'transparent',
              color: active === s ? '#0070F3' : 'var(--text-secondary)' }}>
            {s}
            {active === s && <ChevronRight size={14} />}
          </button>
        ))}
      </div>

      {/* Doc Content */}
      <div>
        {SECTION_COMPONENTS[active]}
      </div>
    </div>
  );
}
