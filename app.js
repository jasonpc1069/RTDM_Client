const http = require('http');
const port = process.env.PORT || 3300;
const path = require ('path');
const disruptionData = require('./config/current/disruption_data.json');
const lineData = require('.//config/current/line_data.json');
const fragmentsData = require('.//config/current/fragment_data.json');
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
      case '/lfragment_data.json':
        res.write(JSON.stringify(fragmentsData));
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

