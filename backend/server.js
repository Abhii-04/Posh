import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import pagerouter from './routes/pageroutes.js';
import authrouter from './routes/authroutes.js';
import adminrouter from './routes/adminroutes.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import cookieParser from "cookie-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cookieParser());           // MUST be before authroutes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/templates'));

// ------------------- Session Setup -------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true in production with HTTPS + app.set('trust proxy', 1)
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// ------------------- Middleware -------------------
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../frontend/uploads')));
app.use('/product-images', express.static(path.join(__dirname, '../frontend/uploads/products')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make user and Supabase credentials available in all EJS views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.SUPABASE_URL = process.env.SUPABASE_URL || '';
  res.locals.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
  next();
});

// ------------------- Routes -------------------
app.use('/', pagerouter);
app.use('/', authrouter);
app.use('/', adminrouter);

// ------------------- Start Server -------------------
const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   console.log(`✅ Server running on port ${port}`);
// });
module.exports=app; // Export the Express application instance