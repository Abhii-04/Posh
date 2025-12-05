// api/index.js
const serverless = require('serverless-http');
// require the exported express app
const app = require('../backend/server'); // adjust path if needed

module.exports = serverless(app);
