import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, ExternalLink, Plus, Trash2, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ENTITLEMENT_TYPES = ['One-Time Item', 'Paid Entry', 'Consumable Credits'];

export default function Monetization() {
  const { developer } = useAuth();
  const [products, setProducts] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [revenueByGame, setRevenueByGame] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', type: 'One-Time Item', price: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!developer?.id) return;
    async function loadData() {
      try {
        const [statsRes, payoutsRes] = await Promise.all([
          fetch(`https://cvos-backend.onrender.com/api/developer/${developer.id}/analytics`),
          fetch(`https://cvos-backend.onrender.com/api/developer/${developer.id}/payouts`)
        ]);
        
        if (statsRes.ok) {
          const stats = await statsRes.json();
          // Transform games into pie chart format
          const pieData = (stats.games || []).map((g, i) => ({
            name: g.title,
            value: g.mrr_cents / 100,
            color: ['#0070F3', '#7928CA', '#F5A623', '#50E3C2'][i % 4]
          })).filter(g => g.value > 0);
          setRevenueByGame(pieData);
        }

        if (payoutsRes.ok) {
          const p = await payoutsRes.json();
          setPayouts(p.payouts || []);
        }
      } catch (err) {
        console.error('Failed to load monetization data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [developer]);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !developer) return;
    const priceCents = Math.round(parseFloat(newProduct.price) * 100);
    const entitlementId = newProduct.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
    
    // Default to the first game for the portal demo
    const gameId = 'demo-game-1';

    try {
      const res = await fetch(`https://cvos-backend.onrender.com/api/games/${gameId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId: developer.id,
          name: newProduct.name,
          type: newProduct.type,
          priceCents,
          entitlementId
        })
      });
      if (res.ok) {
        const { product } = await res.json();
        setProducts(prev => [...prev, { ...product, price: (product.price_cents/100).toFixed(2) }]);
        setNewProduct({ name: '', type: 'One-Time Item', price: '' });
        setShowAddProduct(false);
      }
    } catch (err) {
      alert("Failed to create product");
    }
  };

  const connectStripe = async () => {
    try {
      const res = await fetch('https://cvos-backend.onrender.com/api/developer/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId: developer.id,
          email: developer.contact_email,
          returnUrl: window.location.href,
          refreshUrl: window.location.href
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Failed to connect Stripe");
    }
  };

  if (loading) return <div>Loading...</div>;

  // Stripe Onboarding Gate
  if (!developer?.stripe_account_id) {
    return (
      <div className="animate-fade-in-up" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <DollarSign size={64} color="var(--accent)" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(0, 112, 243, 0.5))' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Get Paid for Your Games</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.6 }}>
          CVOS partners with Stripe to process payments and send payouts directly to your bank account. Connect your account to enable In-App Products.
        </p>
        <button className="btn-primary" onClick={connectStripe} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Connect Stripe Account
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Monetization</h1>
        <p>Manage your earnings, payouts, and in-app products.</p>
      </div>

      {/* Ads Policy Banner */}
      <div style={{ backgroundColor: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <AlertTriangle size={18} color="#E53935" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ color: '#E53935', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>Advertising is prohibited on CVOS</p>
          <p style={{ color: '#8B8B8B', fontSize: '0.85rem' }}>
            No pop-ups, banners, interstitials, or ad SDKs are permitted. The only permitted brand presence is ambient integration native to the game world (e.g. a branded sign on a stadium scoreboard). Violations result in permanent removal.{' '}
            <a href="/legal#ads-policy" style={{ color: '#E53935', textDecoration: 'underline' }}>Read Ads Policy →</a>
          </p>
        </div>
      </div>

      {/* Earnings Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card interactive-card">
          <p>Current MRR</p>
          <div className="metric-value">$450.00</div>
          <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>↗ 18% vs last month</p>
        </div>
        <div className="card interactive-card">
          <p>Lifetime Earnings</p>
          <div className="metric-value">$1,135.00</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Since April 2026</p>
        </div>
        <div className="card interactive-card">
          <p>Platform Take Rate</p>
          <div className="metric-value" style={{ fontSize: '1.5rem' }}>15% + 2.9%</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>CVOS fee + Stripe processing</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Payout History */}
        <div className="card interactive-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0 }}>Payout History</h3>
            <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Stripe Dashboard <ExternalLink size={13} />
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['DATE', 'AMOUNT', 'STATUS'].map(h => (
                  <th key={h} style={{ padding: '0.6rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr key={i} style={{ borderBottom: i < payouts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.9rem', color: '#FFF' }}>{p.date}</td>
                  <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.9rem', fontWeight: 600, color: '#FFF' }}>{p.amount}</td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span className={`badge ${p.status === 'paid' ? 'active' : 'pending'}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Revenue by Game */}
        <div className="card interactive-card">
          <h3 style={{ marginBottom: '1.25rem' }}>Revenue by Game</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={revenueByGame} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {revenueByGame.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: 8 }} formatter={(val) => `$${val}`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '0.75rem' }}>
            {revenueByGame.map(g => (
              <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: g.color }} />
                  <span style={{ fontSize: '0.85rem' }}>{g.name}</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 600 }}>${g.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* In-App Products / Entitlements */}
      <div className="card interactive-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>In-App Products</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Define purchasable items. Each item generates a unique <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>entitlement_id</code> for use with <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>cvos.store.checkEntitlement()</code></p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddProduct(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} /> Add Product
          </button>
        </div>

        {showAddProduct && (
          <div style={{ backgroundColor: 'var(--surface-hover)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>New Product</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Product Name</label>
                <input className="input-field" placeholder="e.g. Princess Gown" value={newProduct.name}
                  onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Type</label>
                <select value={newProduct.type} onChange={e => setNewProduct(p => ({ ...p, type: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }}>
                  {ENTITLEMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Price (USD)</label>
                <input className="input-field" type="number" step="0.01" placeholder="0.99" value={newProduct.price}
                  onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6, backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: '#FFF', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-primary" onClick={addProduct}>Save</button>
                <button className="btn-secondary" onClick={() => setShowAddProduct(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
              {['PRODUCT', 'ENTITLEMENT ID', 'TYPE', 'PRICE', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((prod, i) => (
              <tr key={prod.id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '0.9rem 1rem', color: '#FFF', fontWeight: 500 }}>{prod.name}</td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: 4 }}>{prod.id}</code>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <span className="badge pending">{prod.type}</span>
                </td>
                <td style={{ padding: '0.9rem 1rem', color: '#FFF', fontWeight: 600 }}>${prod.price}</td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <button onClick={() => setProducts(p => p.filter(x => x.id !== prod.id))} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tax Documents */}
      <div className="card interactive-card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Tax Documents</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: 8 }}>
          <div>
            <p style={{ color: '#FFF', fontWeight: 500, marginBottom: '0.25rem' }}>Form 1099-K — Tax Year 2026</p>
            <p style={{ fontSize: '0.85rem' }}>Available January 31, 2027</p>
          </div>
          <button className="btn-secondary" disabled style={{ opacity: 0.5, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <DollarSign size={14} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
