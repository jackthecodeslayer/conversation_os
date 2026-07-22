import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Globe, Webhook, Layers, FlaskConical, Copy, Check, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function GameCard({ game }) {
  // Use uploaded icon if available, otherwise fallback emoji
  const iconContent = game.app_icon_url 
    ? <img src={game.app_icon_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }} />
    : <Gamepad2 size={28} color="var(--accent)" />;
  return (
    <Link to={`/games/${game.id}`} style={{ textDecoration: 'none' }}>
      <div className="card interactive-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {iconContent}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{game.title}</h3>
            <span className={`badge ${game.status === 'active' ? 'active' : 'pending'}`}>{game.status.toUpperCase()}</span>
          </div>
          <p style={{ fontSize: '0.85rem' }}>v{game.version || '1.0.0'} · {game.category}</p>
        </div>
        <ChevronRight size={18} color="var(--text-secondary)" />
      </div>
    </Link>
  );
}

export function GameDetail() {
  const { id } = useParams();
  const { developer } = useAuth();
  const [game, setGame] = useState(null);
  const [tab, setTab] = useState('listing');
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!developer?.id || !id) return;
    fetch(`https://cvos-backend.onrender.com/api/games?developerId=${developer.id}`)
      .then(res => res.json())
      .then(data => {
        const found = data.games.find(g => g.id === id);
        setGame(found);
        setLoading(false);
      });
  }, [developer, id]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const tabs = [
    { id: 'listing', label: 'Listing', icon: <Globe size={15} /> },
    { id: 'versions', label: 'Versions', icon: <Layers size={15} /> },
    { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={15} /> },
    { id: 'testing', label: 'Testing', icon: <FlaskConical size={15} /> },
  ];

  if (loading) return <div>Loading...</div>;
  if (!game) return <div>Game not found.</div>;

  const iconContent = game.app_icon_url 
    ? <img src={game.app_icon_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 18, objectFit: 'cover' }} />
    : <Gamepad2 size={36} color="var(--accent)" />;

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Link to="/games" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Games</Link>
        <ChevronRight size={14} color="var(--text-secondary)" />
        <span style={{ fontSize: '0.9rem', color: '#FFF' }}>{game.title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {iconContent}
        </div>
        <div>
          <h1 style={{ margin: 0 }}>{game.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
            <span className={`badge ${game.status === 'active' ? 'active' : 'pending'}`}>{game.status.toUpperCase()}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>v{game.version || '1.0.0'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s',
              backgroundColor: tab === t.id ? 'rgba(0,112,243,0.15)' : 'transparent',
              color: tab === t.id ? '#0070F3' : 'var(--text-secondary)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'listing' && (
        <div className="card interactive-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Display Name</label>
            <input className="input-field" defaultValue={game.title} style={{ width: '100%', padding: '0.7rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Short Description</label>
            <textarea rows={3} defaultValue={game.short_description || ''} style={{ width: '100%', padding: '0.7rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Category</label>
              <select defaultValue={game.category || "Games"} style={{ width: '100%', padding: '0.7rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }}>
                <option>Games</option><option>Study</option><option>Productivity</option><option>Creative</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Web App URL</label>
              <input className="input-field" defaultValue={game.web_app_url || ''} style={{ width: '100%', padding: '0.7rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button className="btn-secondary">Discard</button>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      )}

      {tab === 'versions' && (
        <div className="card interactive-card" style={{ padding: 0, overflow: 'hidden' }}>
          {[{ v: '2.1.0', date: 'Jul 13, 2026', status: 'live', notes: 'Improved matchmaking speed, added rematch button' },
            { v: '2.0.0', date: 'Jul 1, 2026', status: 'archived', notes: 'Spectator mode launch' },
            { v: '1.9.5', date: 'Jun 20, 2026', status: 'archived', notes: 'Bug fixes for reconnection handling' }].map((ver, i, arr) => (
            <div key={ver.v} style={{ padding: '1.25rem 1.5rem', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#FFF', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>v{ver.v}</span>
                  <span className={`badge ${ver.status === 'live' ? 'active' : 'pending'}`}>{ver.status.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: '0.85rem' }}>{ver.date} · {ver.notes}</p>
              </div>
              {ver.status !== 'live' && <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>Rollback</button>}
            </div>
          ))}
        </div>
      )}

      {tab === 'webhooks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card interactive-card">
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Webhook Endpoint URL</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="input-field" placeholder="https://yourserver.com/webhooks/cvos" style={{ flex: 1, padding: '0.7rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} />
              <button className="btn-primary">Save</button>
            </div>
          </div>
          <div className="card interactive-card">
            <h3 style={{ marginBottom: '1rem' }}>Events</h3>
            {[['session.started', 'Fired when a new multiplayer room is created'],
              ['player.joined', 'Fired when a player joins the session'],
              ['move.made', 'Fired on every player action/move'],
              ['session.ended', 'Fired when the game concludes'],
              ['entitlement.granted', 'Fired when a user completes a purchase']].map(([name, desc]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{name}</code>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{desc}</p>
                </div>
                <input type="checkbox" defaultChecked style={{ cursor: 'pointer', accentColor: '#0070F3' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'testing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card interactive-card">
            <h3 style={{ marginBottom: '0.5rem' }}>Sandbox Mode</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>In sandbox mode, all purchases use test payment methods and no real money is charged.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 26, borderRadius: 13, backgroundColor: '#0070F3', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#FFF', position: 'absolute', right: 3, top: 3, transition: 'all 0.2s' }} />
              </div>
              <span style={{ color: '#FFF', fontWeight: 500 }}>Enabled</span>
            </div>
          </div>
          <div className="card interactive-card">
            <h3 style={{ marginBottom: '1rem' }}>Generate Test Invite Link</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="code-block" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem' }}>https://play.cvos.app/game/tic-tac-toe/sandbox-xyz</span>
                <button onClick={() => copy('https://play.cvos.app/game/tic-tac-toe/sandbox-xyz', 'invite')} style={{ color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '1rem' }}>
                  {copied === 'invite' ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
                </button>
              </div>
              <button className="btn-primary">Regenerate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Games() {
  const { developer } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!developer?.id) return;
    fetch(`https://cvos-backend.onrender.com/api/games?developerId=${developer.id}`)
      .then(res => res.json())
      .then(data => {
        setGames(data.games || []);
        setLoading(false);
      });
  }, [developer]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Games</h1>
          <p>Manage your published experiences on CVOS.</p>
        </div>
        <Link to="/submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          + New Game
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {games.length === 0 ? (
           <p style={{ color: 'var(--text-secondary)' }}>No games submitted yet.</p>
        ) : (
           games.map(game => <GameCard key={game.id} game={game} />)
        )}
      </div>
    </div>
  );
}
