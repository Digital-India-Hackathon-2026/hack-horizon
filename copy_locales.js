const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'client', 'public', 'locales');
const sourceFile = path.join(localesDir, 'en', 'translation.json');

const newLangs = ['kn', 'ta', 'mr', 'or'];

newLangs.forEach(lang => {
  const dir = path.join(localesDir, lang);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(sourceFile, path.join(dir, 'translation.json'));
  console.log(`Copied translation to ${lang}`);
});
