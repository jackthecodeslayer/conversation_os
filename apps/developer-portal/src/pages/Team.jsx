import React, { useState } from 'react';
import { Mail, Trash2, Plus, Shield } from 'lucide-react';

const ROLES = ['Admin', 'Developer', 'Viewer'];

const initialMembers = [
  { id: '1', name: 'You', email: 'dev@astutestudio.com', role: 'Admin', avatar: 'AS', status: 'active' },
  { id: '2', name: 'Alex Chen', email: 'alex@astutestudio.com', role: 'Developer', avatar: 'AC', status: 'active' },
];

const initialPending = [
  { id: '3', email: 'jamie@freelance.dev', role: 'Developer', sentAt: '2 days ago' },
];

export default function Team() {
  const [members, setMembers] = useState(initialMembers);
  const [pending, setPending] = useState(initialPending);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');
  const [showInvite, setShowInvite] = useState(false);

  const invite = () => {
    if (!inviteEmail) return;
    setPending(p => [...p, { id: Date.now().toString(), email: inviteEmail, role: inviteRole, sentAt: 'Just now' }]);
    setInviteEmail('');
    setShowInvite(false);
  };

  const avatarColors = ['#0070F3', '#7928CA', '#FF0080', '#007A5A'];

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Team</h1>
          <p>Manage who has access to your developer account.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowInvite(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Invite Member
        </button>
      </div>

      {showInvite && (
        <div className="card interactive-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Invite a Team Member</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Email Address</label>
              <input className="input-field" type="email" placeholder="colleague@example.com" value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                style={{ padding: '0.65rem 0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={invite} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} /> Send Invite
              </button>
              <button className="btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
            </div>
          </div>

          {/* Role descriptions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.25rem' }}>
            {[
              { role: 'Admin', desc: 'Full access including billing, team management, and game deletion.' },
              { role: 'Developer', desc: 'Can create and manage games, view analytics, and configure webhooks.' },
              { role: 'Viewer', desc: 'Read-only access to dashboard, analytics, and game listings.' },
            ].map(item => (
              <div key={item.role} style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Shield size={13} color="var(--accent)" />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FFF' }}>{item.role}</span>
                </div>
                <p style={{ fontSize: '0.8rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Members */}
      <div className="card interactive-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0 }}>Members ({members.length})</h3>
        </div>
        {members.map((member, i) => (
          <div key={member.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
              {member.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#FFF', fontWeight: 500, marginBottom: '0.15rem' }}>{member.name}</p>
              <p style={{ fontSize: '0.83rem' }}>{member.email}</p>
            </div>
            <select defaultValue={member.role} disabled={member.id === '1'}
              style={{ padding: '0.4rem 0.75rem', borderRadius: 6, backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', color: '#FFF', cursor: member.id === '1' ? 'default' : 'pointer', outline: 'none', fontSize: '0.85rem', opacity: member.id === '1' ? 0.6 : 1 }}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            {member.id !== '1' && (
              <button onClick={() => setMembers(m => m.filter(x => x.id !== member.id))} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pending Invites */}
      {pending.length > 0 && (
        <div className="card interactive-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>Pending Invites ({pending.length})</h3>
          </div>
          {pending.map((inv, i) => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: i < pending.length - 1 ? '1px solid var(--border)' : 'none', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '1.1rem', flexShrink: 0 }}>
                ✉️
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#FFF', fontWeight: 500, marginBottom: '0.15rem' }}>{inv.email}</p>
                <p style={{ fontSize: '0.83rem' }}>Invited {inv.sentAt} · {inv.role}</p>
              </div>
              <span className="badge pending">PENDING</span>
              <button onClick={() => setPending(p => p.filter(x => x.id !== inv.id))} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
