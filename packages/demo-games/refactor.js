const fs = require('fs');
const path = require('path');

const games = [
  'undercover',
  'scribble-chat',
  'trivia-clash',
  'cvos-uno',
  'connect-four',
  'flick-darts',
  'archery-clash',
  'word-forge',
  'wordle-blitz'
];

games.forEach(game => {
  const cssPath = path.join(__dirname, game, 'src', 'index.css');
  if (!fs.existsSync(cssPath)) {
    console.log(`Skipping ${game}, no index.css`);
    return;
  }
  
  let css = fs.readFileSync(cssPath, 'utf8');

  // Add --shadow to :root
  if (!css.includes('--shadow:')) {
    css = css.replace(/:root\s*\{/, `:root {\n  --shadow: 0 10px 40px -10px rgba(0,0,0,0.08);`);
  }
  
  // Replace colors in :root
  css = css.replace(/--bg-color:\s*[^;]+;/g, '--bg-color: #f8fafc;');
  css = css.replace(/--text-main:\s*[^;]+;/g, '--text-main: #0f172a;');
  css = css.replace(/--text-muted:\s*[^;]+;/g, '--text-muted: #64748b;');
  css = css.replace(/--panel-bg:\s*[^;]+;/g, '--panel-bg: rgba(255, 255, 255, 0.9);');
  css = css.replace(/--glass-bg:\s*[^;]+;/g, '--glass-bg: rgba(255, 255, 255, 0.9);');
  css = css.replace(/--glass-border:\s*[^;]+;/g, '--glass-border: rgba(0, 0, 0, 0.08);');
  css = css.replace(/--panel-border:\s*[^;]+;/g, '--panel-border: rgba(0, 0, 0, 0.08);');
  
  // Refactor .glass-panel
  css = css.replace(/\.glass-panel\s*\{([^}]+)\}/g, (match, inner) => {
    let newInner = inner;
    if (/border-radius:\s*[^;]+;/.test(newInner)) {
      newInner = newInner.replace(/border-radius:\s*[^;]+;/, 'border-radius: 20px;');
    } else {
      newInner += '\n  border-radius: 20px;';
    }
    
    if (/box-shadow:\s*[^;]+;/.test(newInner)) {
      newInner = newInner.replace(/box-shadow:\s*[^;]+;/, 'box-shadow: var(--shadow);');
    } else {
      newInner += '\n  box-shadow: var(--shadow);';
    }
    return `.glass-panel {${newInner}}`;
  });

  // Remove neon effects
  css = css.replace(/text-shadow:\s*[^;]+;/g, '');
  css = css.replace(/box-shadow:\s*.*?var\(--(?:glow|accent-glow).*?\).*?;/g, '');
  css = css.replace(/box-shadow:\s*.*?rgba\(.*?glow.*?\).*?;/g, ''); // just in case

  // Replace dark backgrounds with light equivalents
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'rgba(0, 0, 0, 0.05)');
  css = css.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'rgba(0, 0, 0, 0.08)');
  css = css.replace(/rgba\(255,255,255,0\.05\)/g, 'rgba(0,0,0,0.05)');
  css = css.replace(/rgba\(255,255,255,0\.1\)/g, 'rgba(0,0,0,0.08)');
  css = css.replace(/rgba\(255,255,255,0\.03\)/g, 'rgba(0,0,0,0.03)');
  // Lighter shadows for dark text over transparent backgrounds
  css = css.replace(/rgba\(0,0,0,0\.2\)/g, 'rgba(0,0,0,0.05)'); 
  css = css.replace(/rgba\(0,0,0,0\.3\)/g, 'rgba(0,0,0,0.08)'); 

  // Typography color adjust
  css = css.replace(/color:\s*white;/g, 'color: var(--text-main);');
  css = css.replace(/color:\s*#fff(?:fff)?;/g, 'color: var(--text-main);');
  
  // Revert specific classes to white text
  css = css.replace(/\.btn-primary\s*\{([^}]+)\}/g, (match, inner) => {
    return `.btn-primary {${inner.replace(/color:\s*var\(--text-main\);/g, 'color: white;')}}`;
  });
  css = css.replace(/\.primary-btn\s*\{([^}]+)\}/g, (match, inner) => {
    return `.primary-btn {${inner.replace(/color:\s*var\(--text-main\);/g, 'color: white;')}}`;
  });
  
  // Specific fix for .answer-btn.correct / .incorrect
  css = css.replace(/\.answer-btn\.correct\s*\{([^}]+)\}/g, (match, inner) => {
    return `.answer-btn.correct {${inner.replace(/color:\s*var\(--text-main\);/g, 'color: #15803d;')}}`;
  });

  fs.writeFileSync(cssPath, css);
  console.log(`Updated ${game}`);
});
