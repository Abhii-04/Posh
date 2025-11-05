import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import pagerouter from './routes/pageroutes.js';
import authrouter from './routes/authroutes.js';
// import authlogger from './middleware/authlogger.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/templates'));

// ------------------- Session Setup -------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set true in production with HTTPS
  })
);


// ------------------- Middleware -------------------
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


// ------------------- Routes -------------------
app.use('/', pagerouter, authrouter);


// ------------------- Start Server -------------------
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
