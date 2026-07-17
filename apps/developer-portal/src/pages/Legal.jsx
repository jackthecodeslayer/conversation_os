import React, { useState } from 'react';
import { Download, Copy, Check, ChevronRight } from 'lucide-react';

const sections = [
  'SDK Download',
  'Terms of Use',
  'Permissible Use',
  'Non-Permissible Use',
  'Advertising Policy',
  'Platform Rules',
  'Privacy Policy',
  'Revenue Share Agreement',
];

function CopyBlock({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
      <span>{text}</span>
      <button onClick={copy} style={{ color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '1rem', flexShrink: 0 }}>
        {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
      </button>
    </div>
  );
}

function SdkDownload() {
  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>SDK Download</h2>
      <p style={{ marginBottom: '2rem' }}>Download the CVOS SDK or install via npm. Always use the latest stable release.</p>

      <div className="card glass-panel interactive-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <h3 style={{ margin: 0 }}>@cvos/sdk</h3>
            <span style={{ backgroundColor: 'rgba(0,122,90,0.15)', color: '#2EA043', border: '1px solid rgba(46,160,67,0.4)', padding: '2px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>v1.4.2 STABLE</span>
          </div>
          <p style={{ fontSize: '0.85rem' }}>Released July 13, 2026 · React, Vanilla JS, TypeScript support</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <Download size={16} /> Download .zip
        </button>
      </div>

      <div className="card interactive-card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Install via npm</h3>
        <CopyBlock text="npm install @cvos/sdk" />
      </div>

      <div className="card interactive-card">
        <h3 style={{ marginBottom: '0.75rem' }}>Install via yarn</h3>
        <CopyBlock text="yarn add @cvos/sdk" />
      </div>

      <div className="card interactive-card" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Changelog</h3>
        {[
          { version: '1.4.2', date: 'Jul 13, 2026', notes: 'Fixed entitlement cache invalidation bug on Android WebView' },
          { version: '1.4.0', date: 'Jul 1, 2026', notes: 'Added cvos.store.getBalance() for consumable credits' },
          { version: '1.3.0', date: 'Jun 15, 2026', notes: 'Introduced spectator mode event subscriptions' },
          { version: '1.2.0', date: 'Jun 1, 2026', notes: 'Cloud saves: cvos.save() and cvos.load()' },
        ].map((item, i, arr) => (
          <div key={item.version} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', marginBottom: i < arr.length - 1 ? '1rem' : 0, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <code style={{ color: '#A5D6FF', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', minWidth: 60 }}>v{item.version}</code>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{item.date}</p>
              <p style={{ fontSize: '0.9rem', color: '#FFF' }}>{item.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegalSection({ title, children }) {
  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: July 1, 2026</p>
      <div className="card interactive-card" style={{ lineHeight: 1.9, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </div>
  );
}

function PolicyHeading({ children }) {
  return <h3 style={{ color: '#FFF', marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1rem' }}>{children}</h3>;
}

const SECTION_CONTENT = {
  'SDK Download': <SdkDownload />,

  'Terms of Use': (
    <LegalSection title="Terms of Use">
      <PolicyHeading>1. Acceptance of Terms</PolicyHeading>
      <p>By registering as a CVOS Developer, you agree to these Terms of Use in full. If you do not agree, you may not access or use the CVOS Developer Platform. These terms govern your rights and obligations as a developer building experiences on Conversation OS.</p>
      <PolicyHeading>2. Developer Account</PolicyHeading>
      <p>You must provide accurate information during registration. You are responsible for all activity conducted through your developer account. You may not share, sell, or transfer your account to another party. CVOS reserves the right to suspend or terminate accounts that violate these terms.</p>
      <PolicyHeading>3. Intellectual Property</PolicyHeading>
      <p>You retain ownership of all original game code, artwork, and content you create. By publishing on CVOS, you grant CVOS a non-exclusive, royalty-free licence to display, distribute, and promote your experience within the platform. You warrant that your experience does not infringe any third-party intellectual property rights.</p>
      <PolicyHeading>4. Payments and Entitlements</PolicyHeading>
      <p>All in-app purchases must be processed exclusively through the CVOS entitlement system. Implementing external payment flows is strictly prohibited and will result in immediate removal from the platform. CVOS processes all payments via Stripe Connect.</p>
      <PolicyHeading>5. Termination</PolicyHeading>
      <p>CVOS may suspend or terminate your access at any time for violations of these terms. Upon termination, your games will be removed from the storefront and no further payouts will be issued for the current period.</p>
    </LegalSection>
  ),

  'Permissible Use': (
    <LegalSection title="Permissible Use">
      <PolicyHeading>What You Can Build on CVOS</PolicyHeading>
      <p>The following categories of experiences are explicitly permitted on the CVOS platform:</p>
      <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
        {['Multiplayer games of skill, strategy, trivia, word games, board games, card games, and puzzles',
          'Educational experiences including flashcard battles, quizzes, language practice, and revision tools',
          'Productivity tools including collaborative whiteboards, decision polls, brainstorming sessions, and shared timers',
          'Creative experiences including collaborative drawing, writing challenges, and music games',
          'AI-powered experiences where AI acts as an opponent, coach, referee, commentator, or teammate within the game world',
          'Experiences targeting any age group, provided content is age-appropriate',
          'Experiences that support spectator roles and live observation',
          'Experiences with ambient brand integrations that are native to the game world (see Advertising Policy)'].map((item, i) => (
          <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
        ))}
      </ul>
    </LegalSection>
  ),

  'Non-Permissible Use': (
    <LegalSection title="Non-Permissible Use">
      <PolicyHeading>What Is Prohibited on CVOS</PolicyHeading>
      <p>The following are strictly prohibited. Violation will result in immediate removal from the platform and potential legal action:</p>
      <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
        {['Real-money gambling, loot boxes, or any mechanic where randomised outcomes determine real-world value, unless the developer holds all required gaming licences in every jurisdiction of operation',
          'Adult or sexually explicit content of any kind',
          'Content promoting, glorifying, or facilitating hate speech, discrimination, or violence',
          'Misinformation, propaganda, or content designed to manipulate public opinion in a deceptive manner',
          'Data harvesting beyond what is disclosed in your privacy policy and beyond what is required for the experience to function',
          'Cryptocurrency, NFT, or blockchain-based mechanics',
          'Experiences designed to facilitate harassment, stalking, or abuse',
          'Use of any third-party advertising SDK or external payment processor',
          'Experiences that attempt to impersonate CVOS, other developers, or any third party'].map((item, i) => (
          <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
        ))}
      </ul>
    </LegalSection>
  ),

  'Advertising Policy': (
    <LegalSection title="Advertising Policy">
      <div style={{ backgroundColor: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ color: '#E53935', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Advertising is prohibited on CVOS.</p>
        <p>Any experience that integrates advertising — in any form — will be immediately and permanently removed from the platform without prior notice.</p>
      </div>
      <PolicyHeading>What Is Prohibited</PolicyHeading>
      <p>The following advertising mechanisms are prohibited without exception:</p>
      <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
        {['Pop-up advertisements', 'Interstitial advertisements', 'Banner advertisements', 'Pre-roll or mid-roll video advertisements', 'Rewarded video advertisements', 'Any third-party advertising SDK (Google AdMob, Meta Audience Network, Unity Ads, ironSource, AppLovin, or equivalent)', 'Any mechanism that interrupts, overlays, or pauses the user experience to deliver a commercial message', 'Sponsored push notifications or in-game messaging'].map((item, i) => (
          <li key={i} style={{ marginBottom: '0.5rem' }}>❌ {item}</li>
        ))}
      </ul>
      <PolicyHeading>What Is Permitted</PolicyHeading>
      <p>Ambient brand presence that is native to the game world is permitted under the following conditions:</p>
      <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
        {['The brand integration is part of the game environment (e.g. branded signage around a football pitch, a sponsored jersey in a sports game)',
          'The integration is non-interactive — it cannot be tapped, clicked, or engaged with as an advertisement',
          'The integration is visually consistent with the game\'s art direction',
          'The brand presence is disclosed in your game\'s listing description',
          'CVOS is notified of brand partnerships in advance via developer@cvos.app'].map((item, i) => (
          <li key={i} style={{ marginBottom: '0.5rem' }}>✅ {item}</li>
        ))}
      </ul>
      <PolicyHeading>Rationale</PolicyHeading>
      <p>CVOS is built on the principle that every user interaction should feel premium and intentional. Advertising interruptions destroy this experience. The only path to monetisation on CVOS is through entitlements — purchasable items, paid entry, and consumable credits. This model ensures developers and users are aligned: revenue comes from value delivered, not attention extracted.</p>
    </LegalSection>
  ),

  'Platform Rules': (
    <LegalSection title="Platform Rules">
      <PolicyHeading>Review Process</PolicyHeading>
      <p>Every game submitted to CVOS undergoes a review before it appears in the storefront. Review typically takes 3–5 business days. CVOS reserves the right to reject any submission for any reason, including design quality, policy violations, or platform fit.</p>
      <PolicyHeading>Game Quality Standards</PolicyHeading>
      <p>Experiences must meet minimum quality standards: functional gameplay, clear instructions, stable session handling, and a user experience consistent with CVOS design guidelines. CVOS may request changes before approving a submission.</p>
      <PolicyHeading>Updates and Versioning</PolicyHeading>
      <p>Major updates that change core gameplay mechanics must be re-submitted for review. Bug fixes and minor changes may be pushed without re-review. CVOS reserves the right to roll back versions that cause platform instability.</p>
      <PolicyHeading>Removal Policy</PolicyHeading>
      <p>CVOS may remove an experience from the storefront if it receives sustained negative user reports, violates any policy, or degrades platform reliability. Developers will be notified by email and given 48 hours to respond before permanent removal.</p>
    </LegalSection>
  ),

  'Privacy Policy': (
    <LegalSection title="Privacy Policy">
      <PolicyHeading>Data Collected</PolicyHeading>
      <p>CVOS collects minimal data necessary to operate the platform: account information, game session data (moves, outcomes, duration), payment records (via Stripe — CVOS does not store card details), and analytics data (player counts, session lengths, geographic region).</p>
      <PolicyHeading>Developer Obligations</PolicyHeading>
      <p>As a developer, you must maintain your own privacy policy for your game. You must only collect data that is disclosed to users and necessary for your game to function. You may not sell, rent, or share user data with third parties.</p>
      <PolicyHeading>Data Retention</PolicyHeading>
      <p>Session data is retained for 90 days. Financial records are retained for 7 years in accordance with applicable tax law. Developer accounts and associated data are retained until account deletion.</p>
    </LegalSection>
  ),

  'Revenue Share Agreement': (
    <LegalSection title="Revenue Share Agreement">
      <PolicyHeading>Platform Fee</PolicyHeading>
      <p>CVOS charges a 15% platform fee on all revenue generated through the CVOS entitlement system. This fee covers platform infrastructure, payment processing coordination, storefront distribution, and developer tooling.</p>
      <PolicyHeading>Payment Processing</PolicyHeading>
      <p>All payments are processed via Stripe. Stripe charges approximately 2.9% + $0.30 per transaction. This fee is deducted before the platform fee calculation. Developers receive the remainder.</p>
      <div className="code-block" style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Developer Payout = Gross Revenue × (1 − 0.029) − $0.30 − (Net × 0.15)</p>
      </div>
      <PolicyHeading>Payout Schedule</PolicyHeading>
      <p>Payouts are issued on the 15th of each month for revenue earned in the previous calendar month. A minimum payout threshold of $10.00 applies. Balances below this threshold roll over to the following month.</p>
      <PolicyHeading>Currency</PolicyHeading>
      <p>All transactions are processed in USD. International payouts are subject to Stripe's currency conversion rates at the time of payout.</p>
      <PolicyHeading>Disputes</PolicyHeading>
      <p>Chargeback costs are the responsibility of the developer. CVOS will deduct chargeback fees from the next scheduled payout. Developers with a chargeback rate exceeding 1% may be suspended from the platform.</p>
    </LegalSection>
  ),
};

export default function Legal() {
  const [active, setActive] = useState('SDK Download');

  return (
    <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'start' }}>
      {/* Nav */}
      <div style={{ position: 'sticky', top: '2rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Legal & SDK</p>
        {sections.map(s => (
          <button key={s} onClick={() => setActive(s)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.55rem 0.75rem', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '0.2rem', fontSize: '0.88rem', fontWeight: active === s ? 600 : 400, transition: 'all 0.15s',
              backgroundColor: active === s ? 'rgba(0,112,243,0.1)' : 'transparent',
              color: active === s ? '#0070F3' : 'var(--text-secondary)' }}>
            {s}
            {active === s && <ChevronRight size={14} />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>{SECTION_CONTENT[active]}</div>
    </div>
  );
}
