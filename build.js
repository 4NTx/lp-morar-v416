const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function prepareTarget(dir) {
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync('index.html')) {
    fs.copyFileSync('index.html', path.join(dir, 'index.html'));
  }
  if (fs.existsSync('_headers')) {
    fs.copyFileSync('_headers', path.join(dir, '_headers'));
  }
  if (fs.existsSync('img')) {
    copyDir('img', path.join(dir, 'img'));
  }
}

// Suporta qualquer diretório de saída que possa estar configurado no Cloudflare Pages
['dist', 'public', 'build', 'out'].forEach(prepareTarget);
console.log('Build finalizado: arquivos preparados com sucesso para o Cloudflare Pages.');
