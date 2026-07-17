const fs = require('fs');
const dirs = ['undercover', 'scribble-chat', 'trivia-clash', 'cvos-uno', 'connect-four', 'flick-darts', 'archery-clash', 'word-forge', 'wordle-blitz'];
dirs.forEach(d => {
  const file = 'D:/desktop/Astute web/conversation_os/packages/demo-games/' + d + '/src/App.jsx';
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/backendUrl:\s*['"]http:\/\/localhost:3000['"]/g, 'backendUrl: \'https://cvos-backend.onrender.com\'');
    fs.writeFileSync(file, content);
  }
});
console.log('Done mapping backend URLs to production!');
