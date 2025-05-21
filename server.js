const express = require('express');
const bodyParser = require('body-parser');
const usersHandler = require('./api/users.js');

const app = express();
app.use(bodyParser.json());

// Serve static files from the current directory (project root)
app.use(express.static(__dirname));

// API route
app.post('/api/users.js', usersHandler);

app.listen(8001, () => {
  console.log('Backend server running on http://localhost:8001');
});
