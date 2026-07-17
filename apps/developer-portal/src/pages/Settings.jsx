import React, { useState } from 'react';
import { AlertTriangle, Bell, User, Globe } from 'lucide-react';

const tabs = ['Studio Profile', 'Notifications', 'Danger Zone'];

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: checked ? '#0070F3' : 'var(--surface-hover)', border: checked ? 'none' : '1px solid var(--border)', position: 'relative', cursor: 'pointer', transition: 'all 0.25s', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#FFF', position: 'absolute', top: 3, left: checked ? 22 : 3, transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('Studio Profile');
  const [notifs, setNotifs] = useState({
    newPlayer: true, sessionEnded: true, payout: true, reviewUpdate: true, apiError: false, newReview: false,
  });
  const [toggleNotif, setToggleNotif] = useState((key) => setNotifs(n => ({ ...n, [key]: !n[key] })));

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Settings</h1>
        <p>Manage your studio, notifications, and account preferences.</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s',
              backgroundColor: tab === t ? 'rgba(0,112,243,0.15)' : 'transparent',
              color: tab === t ? '#0070F3' : 'var(--text-secondary)' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Studio Profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card interactive-card">
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} /> Studio Identity
            </h3>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ width: 80, height: 80, borderRadius: 18, backgroundColor: '#0070F3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0 }}>
                AS
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Studio Name</label>
                  <input className="input-field" defaultValue="Astute Studio" style={{ width: '100%', padding: '0.7rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Bio</label>
                  <textarea rows={3} defaultValue="Building playful multiplayer experiences for the CVOS platform." style={{ width: '100%', padding: '0.7rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Website</label>
                <input className="input-field" defaultValue="https://astutestudio.com" style={{ width: '100%', padding: '0.7rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Support Email</label>
                <input className="input-field" defaultValue="support@astutestudio.com" style={{ width: '100%', padding: '0.7rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn-primary">Save Profile</button>
            </div>
          </div>

          <div className="card interactive-card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} /> Public Page
            </h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Your public developer page is visible to all CVOS users in the storefront.</p>
            <div className="code-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>https://cvos.app/studio/astute-studio</span>
              <button className="btn-secondary" style={{ marginLeft: '1rem', fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>Visit →</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'Notifications' && (
        <div className="card interactive-card">
          <h3 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} /> Email Notifications
          </h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Choose which events trigger email alerts to your account address.</p>
          {[
            { key: 'newPlayer', label: 'New player milestone', desc: 'When your game reaches 1k, 10k, 100k players' },
            { key: 'sessionEnded', label: 'Session anomalies', desc: 'Unusual drop in session completion rate' },
            { key: 'payout', label: 'Payout processed', desc: 'When a monthly payout is initiated' },
            { key: 'reviewUpdate', label: 'Review status update', desc: 'When your game submission is approved or rejected' },
            { key: 'apiError', label: 'API error spikes', desc: 'When SDK errors exceed 1% of requests' },
            { key: 'newReview', label: 'New player reviews', desc: 'When a player leaves a review in the storefront' },
          ].map((item, i, arr) => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <p style={{ color: '#FFF', fontWeight: 500, marginBottom: '0.2rem' }}>{item.label}</p>
                <p style={{ fontSize: '0.83rem' }}>{item.desc}</p>
              </div>
              <Toggle checked={notifs[item.key]} onChange={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))} />
            </div>
          ))}
        </div>
      )}

      {tab === 'Danger Zone' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { title: 'Remove all games from storefront', desc: 'Immediately unpublishes all your games. Sessions in progress will complete, but no new sessions can be started. This cannot be undone.', action: 'Unpublish All', danger: true },
            { title: 'Delete developer account', desc: 'Permanently deletes your developer account, all game data, and removes all games from the storefront. Any pending payouts will be processed before deletion. This action is irreversible.', action: 'Delete Account', danger: true },
          ].map(item => (
            <div key={item.title} style={{ border: '1px solid rgba(229,57,53,0.3)', borderRadius: 10, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <AlertTriangle size={16} color="#E53935" />
                    <h3 style={{ margin: 0, color: '#E53935', fontSize: '1rem' }}>{item.title}</h3>
                  </div>
                  <p style={{ fontSize: '0.88rem' }}>{item.desc}</p>
                </div>
                <button style={{ backgroundColor: 'rgba(229,57,53,0.1)', color: '#E53935', border: '1px solid rgba(229,57,53,0.4)', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {item.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
