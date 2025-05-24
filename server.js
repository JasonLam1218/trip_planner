const express = require('express');
const bodyParser = require('body-parser');
const loginHandler = require('./api/login.js');
const signupHandler = require('./api/signup.js');

const app = express();
app.use(bodyParser.json());

// Serve static files from the current directory (project root)
app.use(express.static(__dirname));

// API routes
app.post('/api/login.js', loginHandler);
app.post('/api/signup.js', signupHandler);

app.listen(8001, () => {
    console.log('Backend server running on http://localhost:8001');
});
