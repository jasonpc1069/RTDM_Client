const http = require('http');
const port = process.env.PORT || 3300;
const path = require ('path');
const disruptionData = require('./config/current/disruption_data.json');
const reasonData = require('./config/current/reason_data.json');
const lineData = require('./config/current/line_data.json');
const preambleData = require('./config/current/preamble_data.json');
const fragmentsData = require('./config/current/fragment_data.json');
const appData = require('./config/current/app_data.json');
const express      = require('express');
const fs = require ('fs');

// Obtain the Express instance
const app = express();

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));


http.createServer((req, res) => {

  let filePath = path.join (__dirname, 'public', req.url == '/' ? '/html/main.html' : req.url);
  let contentType = "text/html";

  if (path.extname(filePath) == '.json')
  {
    contentType = "application/json"

    res.writeHead(200, {
      'Content-Type' : contentType,
          "Access-Control-Allow-Origin" : "*"
        });

    switch (req.url)
    {
      case '/disruption_data.json':
        res.write(JSON.stringify(disruptionData));
        break;
      case '/line_data.json':
        res.write(JSON.stringify(lineData));
        break;
      case '/fragment_data.json':
        res.write(JSON.stringify(fragmentsData));
        break;
      case '/preamble_data.json':
        res.write(JSON.stringify(preambleData));
        break;
      case '/reason_data.json':
        res.write(JSON.stringify(reasonData));
        break;
      case '/app_data.json':
          res.write(JSON.stringify(appData));
          break;
    }

    res.end();
  }
  else
  {
    contentType = 'text/html';

    switch (path.extname(filePath))
    {
      case '.png':
        contentType = 'image/png';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'application/javascript';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
    }
    
    fs.readFile (filePath, (err, content) => {
      res.writeHead(200, {
        'Content-Type' : contentType,
            "Access-Control-Allow-Origin" : "*"
          });
  
          res.end(content, 'utf8');
    });
  }
}).listen(port);
console.log(`Node Server is running on port : ${port}`)

