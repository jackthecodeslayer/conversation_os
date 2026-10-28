const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const HUB_DIST = path.join(ROOT_DIR, 'apps', 'play-hub', 'dist');

const EXPERIENCES = [
  { slug: 'chess', name: 'Chess Masters', emoji: '♟️', path: 'packages/demo-games/cvos-chess', category: 'Classic Board' },
  { slug: 'uno', name: 'Uno Live', emoji: '🃏', path: 'packages/demo-games/cvos-uno', category: 'Card Game' },
  { slug: 'wordle', name: 'Wordle Blitz', emoji: '🟩', path: 'packages/demo-games/wordle-blitz', category: 'Word Puzzle' },
  { slug: 'connect-four', name: 'Connect 4', emoji: '🔴', path: 'packages/demo-games/connect-four', category: 'Board Game' },
  { slug: 'whiteboard', name: 'Whiteboard', emoji: '✏️', path: 'packages/demo-apps/cvos-whiteboard', category: 'Productivity' },
  { slug: 'splitter', name: 'Splitter', emoji: '🧾', path: 'packages/demo-apps/cvos-splitter', category: 'Productivity' },
  { slug: 'planner', name: 'Planner', emoji: '📅', path: 'packages/demo-apps/cvos-planner', category: 'Productivity' },
  { slug: 'undercover', name: 'Undercover', emoji: '🕵️', path: 'packages/demo-games/undercover', category: 'Party Game' },
  { slug: 'scribble', name: 'Scribble Chat', emoji: '🎨', path: 'packages/demo-games/scribble-chat', category: 'Party Game' },
  { slug: 'trivia', name: 'Trivia Blitz', emoji: '🎯', path: 'packages/demo-games/trivia-clash', category: 'Trivia Game' },
  { slug: 'darts', name: 'Flick Darts', emoji: '🎯', path: 'packages/demo-games/flick-darts', category: 'Arcade' },
  { slug: 'archery', name: 'Archery Clash', emoji: '🏹', path: 'packages/demo-games/archery-clash', category: 'Arcade' },
  { slug: 'word-forge', name: 'Word Forge', emoji: '🔤', path: 'packages/demo-games/word-forge', category: 'Word Game' },
  { slug: 'tictactoe', name: 'Tic-Tac-Toe', emoji: '❌', path: 'packages/demo-games/tic-tac-toe', category: 'Quick Match' },
];

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🚀 Starting Unified Hub Build for 14 Conversation OS Experiences...\n');

fs.rmSync(HUB_DIST, { recursive: true, force: true });
fs.mkdirSync(HUB_DIST, { recursive: true });

let builtCount = 0;

for (const exp of EXPERIENCES) {
  const expDir = path.join(ROOT_DIR, exp.path);
  console.log(`📦 [${builtCount + 1}/${EXPERIENCES.length}] Building ${exp.name} (${exp.slug})...`);

  try {
    execSync('npm run build', { cwd: expDir, stdio: 'pipe' });
    const srcDist = path.join(expDir, 'dist');
    const targetDist = path.join(HUB_DIST, exp.slug);

    if (fs.existsSync(srcDist)) {
      copyDirRecursive(srcDist, targetDist);
      console.log(`   ✓ Copied into hub at /${exp.slug}/`);
      builtCount++;
    } else {
      console.error(`   ❌ Missing dist folder in ${exp.path}`);
    }
  } catch (err) {
    console.error(`   ❌ Failed to build ${exp.name}:`, err.message);
  }
}

const cardsHtml = EXPERIENCES.map(e => `
      <a class="card" href="./${e.slug}/" onclick="if(window.location.search) this.href='./${e.slug}/'+window.location.search;">
        <div class="emoji-box">${e.emoji}</div>
        <div class="meta">
          <div class="card-name">${e.name}</div>
          <div class="card-category">${e.category}</div>
        </div>
        <span class="badge">Play</span>
      </a>`).join('\n');

const hubHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Conversation OS • Play Hub</title>
  <style>
    :root {
      --bg: #F8FAFC;
      --card-bg: rgba(255, 255, 255, 0.95);
      --text: #0F172A;
      --muted: #64748B;
      --accent: #2563EB;
      --border: #E2E8F0;
      --shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; padding: 24px 16px; }
    .hub-container { max-width: 680px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 28px; }
    .brand-logo { font-size: 2.4rem; display: inline-block; margin-bottom: 8px; }
    .title { font-size: 1.6rem; font-weight: 850; letter-spacing: -0.5px; }
    .subtitle { font-size: 0.95rem; color: var(--muted); margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      color: inherit;
      box-shadow: var(--shadow);
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .card:hover { transform: translateY(-2px); border-color: var(--accent); }
    .card:active { transform: scale(0.98); }
    .emoji-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #F1F5F9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }
    .meta { flex: 1; min-width: 0; }
    .card-name { font-size: 1.05rem; font-weight: 750; }
    .card-category { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent);
      background: #EFF6FF;
      padding: 4px 10px;
      border-radius: 999px;
    }
  </style>
</head>
<body>
  <div class="hub-container">
    <header class="header">
      <div class="brand-logo">💬</div>
      <h1 class="title">Conversation OS Hub</h1>
      <p class="subtitle">14 Instant In-Chat Launch Experiences • Zero-Install</p>
    </header>
    <div class="grid">
${cardsHtml}
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(HUB_DIST, 'index.html'), hubHtml, 'utf8');

// Write Cloudflare Pages headers
const headersContent = `/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: *
`;
fs.writeFileSync(path.join(HUB_DIST, '_headers'), headersContent, 'utf8');

// Also mirror to backend/public/hub so Render serves it immediately
const BACKEND_HUB = path.join(ROOT_DIR, 'backend', 'public', 'hub');
fs.rmSync(BACKEND_HUB, { recursive: true, force: true });
copyDirRecursive(HUB_DIST, BACKEND_HUB);
console.log(`📡 Mirrored hub to backend at ${BACKEND_HUB}`);

console.log(`\n✨ Successfully assembled all ${builtCount} experiences in ${HUB_DIST}`);
