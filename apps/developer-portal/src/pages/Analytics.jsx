import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const playerData = [
  { date: 'Jul 1', players: 3200 }, { date: 'Jul 2', players: 4100 },
  { date: 'Jul 3', players: 3800 }, { date: 'Jul 4', players: 5200 },
  { date: 'Jul 5', players: 6100 }, { date: 'Jul 6', players: 7400 },
  { date: 'Jul 7', players: 8900 }, { date: 'Jul 8', players: 9200 },
  { date: 'Jul 9', players: 8700 }, { date: 'Jul 10', players: 10100 },
  { date: 'Jul 11', players: 11300 }, { date: 'Jul 12', players: 12402 },
];

const sessionData = [
  { range: '0–1 min', sessions: 820 }, { range: '1–3 min', sessions: 1450 },
  { range: '3–5 min', sessions: 2300 }, { range: '5–10 min', sessions: 3100 },
  { range: '10–20 min', sessions: 2800 }, { range: '20+ min', sessions: 1200 },
];

const funnelData = [
  { stage: 'Invites Sent', value: 18400 },
  { stage: 'Link Opened', value: 11200 },
  { stage: 'Session Joined', value: 7800 },
  { stage: 'First Move', value: 6900 },
  { stage: 'Session Completed', value: 5100 },
];

const retentionData = [
  { cohort: 'Week 1', d1: 72, d7: 41, d30: 18 },
  { cohort: 'Week 2', d1: 68, d7: 38, d30: 15 },
  { cohort: 'Week 3', d1: 75, d7: 44, d30: 22 },
  { cohort: 'Week 4', d1: 71, d7: 40, d30: 20 },
];

const geoData = [
  { country: '🇺🇸 United States', players: 4120, pct: '33%' },
  { country: '🇬🇧 United Kingdom', players: 2310, pct: '19%' },
  { country: '🇳🇬 Nigeria', players: 1890, pct: '15%' },
  { country: '🇨🇦 Canada', players: 1200, pct: '10%' },
  { country: '🇿🇦 South Africa', players: 980, pct: '8%' },
  { country: '🇦🇺 Australia', players: 870, pct: '7%' },
];

const ACCENT = '#0070F3';
const GRID_COLOR = '#2A2A2A';

export default function Analytics() {
  const [period, setPeriod] = useState('7d');

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Analytics</h1>
          <p>Performance across all your games</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['7d', '30d', '90d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={period === p ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-3 animate-fade-in-up delay-100" style={{ marginBottom: '2rem' }}>
        <div className="card interactive-card">
          <p>Total Players (7d)</p>
          <div className="metric-value">12,402</div>
          <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>↗ 14% vs last week</p>
        </div>
        <div className="card interactive-card">
          <p>Avg. Session Duration</p>
          <div className="metric-value">7.3 min</div>
          <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>↗ 2.1 min vs last week</p>
        </div>
        <div className="card interactive-card">
          <p>Invite Conversion</p>
          <div className="metric-value">37.5%</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Stable</p>
        </div>
      </div>

      {/* Player Growth Chart */}
      <div className="card interactive-card animate-fade-in-up delay-200" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Daily Active Players</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={playerData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="date" stroke="#8B8B8B" tick={{ fontSize: 12 }} />
            <YAxis stroke="#8B8B8B" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: 8 }} />
            <Line type="monotone" dataKey="players" stroke={ACCENT} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Session Duration */}
        <div className="card interactive-card animate-fade-in-up delay-300">
          <h3 style={{ marginBottom: '1.5rem' }}>Session Duration Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="range" stroke="#8B8B8B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8B8B8B" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: 8 }} />
              <Bar dataKey="sessions" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Retention */}
        <div className="card interactive-card animate-fade-in-up delay-300">
          <h3 style={{ marginBottom: '1.5rem' }}>Retention Cohorts</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="cohort" stroke="#8B8B8B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8B8B8B" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="d1" name="Day 1" fill="#0070F3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="d7" name="Day 7" fill="#7928CA" radius={[4, 4, 0, 0]} />
              <Bar dataKey="d30" name="Day 30" fill="#FF0080" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Invite Funnel */}
      <div className="card interactive-card animate-fade-in-up delay-400" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Invite Conversion Funnel</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {funnelData.map((item, i) => {
            const pct = Math.round((item.value / funnelData[0].value) * 100);
            return (
              <div key={item.stage}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.9rem' }}>{item.stage}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {item.value.toLocaleString()} · {pct}%
                  </span>
                </div>
                <div style={{ height: 8, backgroundColor: 'var(--surface-hover)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: `linear-gradient(to right, #0070F3, #7928CA)`,
                    borderRadius: 4,
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Geography */}
      <div className="card interactive-card animate-fade-in-up delay-400">
        <h3 style={{ marginBottom: '1.5rem' }}>Top Regions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>REGION</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>PLAYERS</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>SHARE</th>
            </tr>
          </thead>
          <tbody>
            {geoData.map((row, i) => (
              <tr key={row.country} style={{ borderBottom: i < geoData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '0.9rem 1rem', color: '#FFF', fontWeight: 500 }}>{row.country}</td>
                <td style={{ padding: '0.9rem 1rem' }}>{row.players.toLocaleString()}</td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: 6, backgroundColor: 'var(--surface-hover)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: row.pct, backgroundColor: ACCENT, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', minWidth: 32 }}>{row.pct}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
