const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '..', 'packages');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== 'dist') walk(full);
    } else if (f === 'vite.config.js') {
      let content = fs.readFileSync(full, 'utf8');
      if (!content.includes("base: './'")) {
        content = content.replace('defineConfig({', "defineConfig({\n  base: './',");
        fs.writeFileSync(full, content, 'utf8');
        console.log('Updated:', path.relative(packagesDir, full));
      }
    }
  }
}

walk(packagesDir);
console.log('All vite.config.js base paths set to relative.');
