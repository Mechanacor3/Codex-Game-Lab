// Simple static file server for game/dist
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'game', 'dist');
const port = process.env.PORT || 3000;
const mime = {
  '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png'
};
http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const fp = path.join(root, decodeURIComponent(p));
  if (!fp.startsWith(root)) return res.end('Forbidden');
  fs.stat(fp, (err, st) => {
    if (err) return res.writeHead(404).end('Not found');
    const ext = path.extname(fp);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    fs.createReadStream(fp).pipe(res);
  });
}).listen(port, () => console.log('Serving', root, 'on', port));
