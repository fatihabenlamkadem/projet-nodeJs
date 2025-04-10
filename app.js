const http = require("http");
const fs = require("fs");
const path = require("path");
const { parse } = require("querystring");

const PORT = 3000;
const dbPath = path.join(__dirname, "db.json");

function collectRequestData(request, callback) {
  const FORM_URLENCODED = 'application/x-www-form-urlencoded';
  if (request.headers['content-type'] === FORM_URLENCODED) {
    let body = '';
    request.on('data', chunk => body += chunk.toString());
    request.on('end', () => callback(parse(body)));
  } else {
    callback(null);
  }
}

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    fs.readFile("index.html", (err, content) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    });

  } else if (req.url === "/style.css" && req.method === "GET") {
    fs.readFile("style.css", (err, content) => {
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(content);
    });

  } else if (req.url === "/add" && req.method === "POST") {
    collectRequestData(req, data => {
      const note = {
        title: data.title,
        content: data.content,
        date: new Date().toLocaleString()
      };

      const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      db.push(note);
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      res.writeHead(302, { Location: "/" });
      res.end();
    });

  } else if (req.url === "/notes" && req.method === "GET") {
    const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(db));

  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});
