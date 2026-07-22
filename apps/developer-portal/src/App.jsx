import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams, Navigate } from 'react-router-dom';
import { Terminal, LayoutDashboard, BarChart3, CreditCard, Key, Settings, Plus, Gamepad2, ArrowUpRight, Upload, PlayCircle, Code2, Users, ChevronRight, BookOpen, Scale, UserPlus, LogOut } from 'lucide-react';
import './index.css';

import Analytics from './pages/Analytics.jsx';
import Monetization from './pages/Monetization.jsx';
import Games, { GameDetail } from './pages/Games.jsx';
import Docs from './pages/Docs.jsx';
import Legal from './pages/Legal.jsx';
import Team from './pages/Team.jsx';
import SettingsPage from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { createGame, uploadGameAsset } from './services/api.js';

  { id: '1', name: 'Tic-Tac-Toe Pro', status: 'active', players: '12.4k', mrr: '$450' },
  { id: '2', name: 'Word Battles', status: 'pending', players: '-', mrr: '-' },
];

function AnimatedBackground() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <>
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>
    </>
  );
}

function LandingPage() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '100vh', padding: '0 2rem' }}>
      <div className="animate-fade-in-up">
        <img src="/logo.png" alt="CVOS Logo" style={{ height: '64px', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))' }} />
      </div>
      <h1 className="animate-fade-in-up delay-100" style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '800px', background: 'linear-gradient(to right, #FFF, #8B8B8B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Make Every Conversation Playable.
      </h1>
      <p className="animate-fade-in-up delay-200" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem' }}>
        Build, deploy, and monetize multiplayer experiences that inject directly into WhatsApp, iMessage, and Telegram.
      </p>
      <div className="animate-scale-up delay-300" style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/dashboard" className="btn-primary animate-glow" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '50px' }}>
          Start Building <ChevronRight size={20} />
        </Link>
        <Link to="/legal" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '50px' }}>
          Read the Docs
        </Link>
      </div>
      <div className="grid-3 animate-fade-in-up delay-400" style={{ marginTop: '5rem', maxWidth: '1000px', textAlign: 'left' }}>
        <div className="card glass-panel interactive-card">
          <Code2 size={24} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h3>Zero Networking</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Use our React SDK. We handle the WebSockets, matchmaking, and state diffing.</p>
        </div>
        <div className="card glass-panel interactive-card">
          <PlayCircle size={24} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h3>Instant Play</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>No app installs required. Ghost authentication gives players a 0.5s Time to First Move.</p>
        </div>
        <div className="card glass-panel interactive-card">
          <Users size={24} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h3>Viral Spectating</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Drop links in group chats. Hundreds can watch your game live via the Spectator Role.</p>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  const navGroups = [
    {
      label: 'Platform',
      links: [
        { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={17} /> },
        { name: 'Games', path: '/games', icon: <Gamepad2 size={17} /> },
        { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={17} /> },
        { name: 'Monetization', path: '/monetization', icon: <CreditCard size={17} /> },
        { name: 'API Keys', path: '/keys', icon: <Key size={17} /> },
      ]
    },
    {
      label: 'Resources',
      links: [
        { name: 'Docs', path: '/docs', icon: <BookOpen size={17} /> },
        { name: 'Legal & SDK', path: '/legal', icon: <Scale size={17} /> },
      ]
    },
    {
      label: 'Account',
      links: [
        { name: 'Team', path: '/team', icon: <UserPlus size={17} /> },
        { name: 'Settings', path: '/settings', icon: <Settings size={17} /> },
      ]
    }
  ];

  const isActive = (linkPath) => {
    if (linkPath === '/games') return path === '/games' || path.startsWith('/games/');
    return path === linkPath;
  };

  const { developer, signOut } = useAuth();

  return (
    <div className="sidebar animate-slide-in-right">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="CVOS Logo" style={{ height: '24px' }} />
          <span style={{ fontSize: '1.05rem', margin: 0, fontWeight: 400, color: 'var(--text-secondary)' }}>Developers</span>
        </Link>
      </div>

      <nav style={{ flex: 1 }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.75rem', marginBottom: '0.4rem' }}>{group.label}</p>
            {group.links.map(link => (
              <Link key={link.name} to={link.path} className={`nav-link ${isActive(link.path) ? 'active' : ''}`}>
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="card interactive-card" style={{ padding: '0.85rem 1rem', backgroundColor: '#000' }}>
        <p style={{ fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Signed in as</p>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.6rem', color: '#FFF' }}>{developer?.company_name || 'Developer'}</p>
        <button
          onClick={signOut}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
}

function Overview() {
  const { developer } = useAuth();
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({ players: 0, mrr: 0 });

  useEffect(() => {
    if (!developer?.id) return;
    
    // Fetch games list
    fetch(`https://cvos-backend.onrender.com/api/games?developerId=${developer.id}`)
      .then(res => res.json())
      .then(data => setGames(data.games || []));

    // Fetch stats
    fetch(`https://cvos-backend.onrender.com/api/developer/${developer.id}/analytics`)
      .then(res => res.json())
      .then(data => {
        const mrrCents = (data.games || []).reduce((sum, g) => sum + g.mrr_cents, 0);
        setStats({ mrr: mrrCents / 100, players: 12402 }); // mock players for now
      });
  }, [developer]);

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="animate-slide-in-right">Welcome back, {developer?.company_name || 'Studio'}.</h1>
          <p className="animate-slide-in-right delay-100">Here's what's happening across your games today.</p>
        </div>
        <Link to="/submit" className="btn-primary animate-scale-up delay-200">
          <Plus size={18} /> New Game
        </Link>
      </div>
      <div className="grid-3 animate-fade-in-up delay-300">
        <div className="card interactive-card">
          <p>Total Active Players (24h)</p>
          <div className="metric-value">{stats.players.toLocaleString()}</div>
          <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>↗ 14% vs yesterday</p>
        </div>
        <div className="card interactive-card">
          <p>Current MRR</p>
          <div className="metric-value">${stats.mrr.toFixed(2)}</div>
          <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>↗ 18% vs last month</p>
        </div>
        <div className="card interactive-card">
          <p>API Errors (24h)</p>
          <div className="metric-value" style={{ color: 'var(--text-primary)' }}>12</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>System healthy</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        <div>
          <h3 className="animate-fade-in-up delay-400" style={{ marginBottom: '1rem' }}>Recent Games</h3>
          <div className="card interactive-card animate-fade-in-up delay-400" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  {['GAME', 'STATUS', 'PLAYERS', 'MRR'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {games.slice(0, 5).map((game, i) => (
                  <tr key={game.id} style={{ borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 500, color: '#FFF' }}>{game.title}</td>
                    <td style={{ padding: '0.9rem 1rem' }}><span className={`badge ${game.status === 'active' ? 'active' : 'pending'}`}>{game.status.toUpperCase()}</span></td>
                    <td style={{ padding: '0.9rem 1rem' }}>-</td>
                    <td style={{ padding: '0.9rem 1rem' }}>${(game.mrr_cents || 0) / 100}</td>
                  </tr>
                ))}
                {games.length === 0 && (
                  <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No games found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="animate-fade-in-up delay-400" style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Submit a New Game', to: '/submit', icon: <Upload size={16} /> },
              { label: 'View Analytics', to: '/analytics', icon: <BarChart3 size={16} /> },
              { label: 'Configure Webhooks', to: '/games/1', icon: <Gamepad2 size={16} /> },
              { label: 'Read the Docs', to: '/docs', icon: <BookOpen size={16} /> },
            ].map(item => (
              <Link key={item.label} to={item.to} className="card interactive-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1rem', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFF', fontWeight: 500, fontSize: '0.9rem' }}>
                  {item.icon}{item.label}
                </div>
                <ChevronRight size={16} color="var(--text-secondary)" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitGame() {
  const { developer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: 'Games', web_app_url: '',
    short_description: '', full_description: ''
  });
  const [appIcon, setAppIcon] = useState(null);
  const [featureGraphic, setFeatureGraphic] = useState(null);
  const [screenshots, setScreenshots] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appIcon || !featureGraphic) {
      return alert("App Icon and Feature Graphic are required for the Storefront.");
    }
    setLoading(true);
    try {
      const devId = developer?.id || 'pending_dev_id';
      
      // Upload assets to Supabase Storage
      const iconUrl = await uploadGameAsset(appIcon, `${devId}/${Date.now()}_icon.png`);
      const featureUrl = await uploadGameAsset(featureGraphic, `${devId}/${Date.now()}_feature.png`);
      
      const screenshotUrls = [];
      for (let i = 0; i < screenshots.length; i++) {
         const url = await uploadGameAsset(screenshots[i], `${devId}/${Date.now()}_screen_${i}.png`);
         screenshotUrls.push(url);
      }
      
      // Submit game metadata
      await createGame(devId, {
         title: formData.title,
         category: formData.category,
         web_app_url: formData.web_app_url,
         short_description: formData.short_description,
         full_description: formData.full_description,
         app_icon_url: iconUrl,
         feature_graphic_url: featureUrl,
         screenshot_urls: screenshotUrls,
         status: 'pending'
      });
      
      alert("Game submitted successfully for review!");
      window.location.href = '/dashboard';
    } catch (e) {
      alert("Submission failed: " + e.message);
    }
    setLoading(false);
  };

  const handleScreenshotChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // Limit to 5
    setScreenshots(files);
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1>Submit a Game</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Upload your game metadata and premium graphical assets. Once approved, it will be live on the CVOS Storefront and Keyboard.</p>
      
      <div className="card interactive-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Game Title</label>
              <input type="text" placeholder="e.g., Uno Live" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }}>
                <option>Games</option><option>Study</option><option>Productivity</option><option>Creative</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Web App URL</label>
            <input type="url" placeholder="https://your-game.vercel.app" required value={formData.web_app_url} onChange={e => setFormData({...formData, web_app_url: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} className="input-field" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Short Description</label>
            <input type="text" placeholder="A quick summary for list views (max 80 chars)" maxLength={80} required value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} className="input-field" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Description</label>
            <textarea placeholder="Detailed description for the Storefront product page..." required rows={4} value={formData.full_description} onChange={e => setFormData({...formData, full_description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none', resize: 'vertical' }} className="input-field" />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>App Icon (512x512)</label>
              <input type="file" accept="image/png, image/jpeg" required onChange={e => setAppIcon(e.target.files[0])} style={{ width: '100%', fontSize: '0.85rem' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Used in the custom keyboard for instant launch.</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Feature Graphic (1024x500)</label>
              <input type="file" accept="image/png, image/jpeg" required onChange={e => setFeatureGraphic(e.target.files[0])} style={{ width: '100%', fontSize: '0.85rem' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Used as the header banner in the Storefront.</p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Gameplay Screenshots (Optional, up to 5)</label>
            <input type="file" accept="image/png, image/jpeg" multiple onChange={handleScreenshotChange} style={{ width: '100%', fontSize: '0.85rem' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: 6 }}>
              💡 <strong>Developer Tip:</strong> Because CVOS games are built with web tech, you can just open your game locally in Google Chrome, resize the window to a phone dimension, and use a browser extension to take screenshots!
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '1rem', display: 'flex', gap: '0.5rem', padding: '1rem' }}>
            {loading ? 'Uploading Assets & Submitting...' : <><Upload size={18} /> Submit for Review</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function Keys() {
  return (
    <div className="animate-fade-in-up">
      <h1>API Keys</h1>
      <p style={{ marginBottom: '2rem' }}>Manage your keys for the @cvos/sdk and server integration.</p>
      
      <div className="card interactive-card" style={{ marginBottom: '2rem', border: '1px solid var(--error)' }}>
        <h3 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>⚠️ Security Warning</h3>
        <p style={{ fontSize: '0.85rem' }}>Never expose your <strong>Secret Key</strong> (sk_...) in your frontend web app or mobile app. Only use the <strong>Publishable Key</strong> (pk_...) for the React SDK.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {[
          { label: 'Production Environment', pk: 'pk_live_xxxxxxxxxxxxxxxxxxxx', sk: 'sk_live_xxxxxxxxxxxxxxxxxxxx', env: 'production' },
          { label: 'Test Environment', pk: 'pk_test_xxxxxxxxxxxxxxxxxxxx', sk: 'sk_test_xxxxxxxxxxxxxxxxxxxx', env: 'test' },
        ].map(item => (
          <div key={item.label} className="card interactive-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ margin: 0 }}>{item.label}</h3>
                <span className={`badge ${item.env === 'production' ? 'active' : 'pending'}`}>{item.env.toUpperCase()}</span>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>Roll Keys</button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Publishable Key (Frontend SDK)</p>
                <div className="code-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{item.pk}</span>
                <button style={{ color: 'var(--text-secondary)', marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(item.pk)}>Copy</button>
                </div>
            </div>

            <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Secret Key (Backend Only)</p>
                <div className="code-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(255,100,100,0.3)' }}>
                <span>{item.sk}</span>
                <button style={{ color: 'var(--text-secondary)', marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(item.sk)}>Copy</button>
                </div>
            </div>
            <p style={{ fontSize: '0.83rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>Status: Active</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardLayout({ children }) {
  return (
    <>
      <Sidebar />
      <main className="main-content">{children}</main>
    </>
  );
}

// Auth-gated wrapper — redirects to /login if no session
function RequireAuth({ children }) {
  const { session } = useAuth();
  if (session === undefined) return null; // still loading
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <AnimatedBackground />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/docs" element={<DashboardLayout><Docs /></DashboardLayout>} />
            <Route path="/legal" element={<DashboardLayout><Legal /></DashboardLayout>} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<RequireAuth><DashboardLayout><Overview /></DashboardLayout></RequireAuth>} />
            <Route path="/games" element={<RequireAuth><DashboardLayout><Games /></DashboardLayout></RequireAuth>} />
            <Route path="/games/:id" element={<RequireAuth><DashboardLayout><GameDetail /></DashboardLayout></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth><DashboardLayout><Analytics /></DashboardLayout></RequireAuth>} />
            <Route path="/monetization" element={<RequireAuth><DashboardLayout><Monetization /></DashboardLayout></RequireAuth>} />
            <Route path="/keys" element={<RequireAuth><DashboardLayout><Keys /></DashboardLayout></RequireAuth>} />
            <Route path="/team" element={<RequireAuth><DashboardLayout><Team /></DashboardLayout></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><DashboardLayout><SettingsPage /></DashboardLayout></RequireAuth>} />
            <Route path="/submit" element={<RequireAuth><DashboardLayout><SubmitGame /></DashboardLayout></RequireAuth>} />

            <Route path="*" element={
              <DashboardLayout>
                <div className="animate-fade-in-up" style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <Terminal size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                  <h2 style={{ color: 'var(--text-secondary)' }}>Page Not Found</h2>
                  <Link to="/dashboard" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Go to Dashboard</Link>
                </div>
              </DashboardLayout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
