// backend/local-server.js
const app = require('./server');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local server listening on http://localhost:${PORT}`);
});
