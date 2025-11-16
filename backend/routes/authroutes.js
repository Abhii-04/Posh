import express from 'express';
import { register, login, oauthcallback, logout } from '../controllers/authcontroller.js';
import supabase from '../config/supabase.js';

const router = express.Router();

// -------------------- REGISTER --------------------
router
  .route('/register')
  .get((req, res) => {
    res.render('register', {
      user: req.session?.user || null,
      currentPage: 'register',
    });
  })
  .post(register);

// -------------------- GOOGLE OAUTH (REGISTER) --------------------
router.get('/register/google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5000/oauth/callback', // FIXED
      },
    });

    if (error) throw error;
    return res.redirect(data.url);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Google OAuth error');
  }
});

// -------------------- LOGIN --------------------
router
  .route('/login')
  .get((req, res) => {
    res.render('login', {
      user: req.session?.user || null,
      currentPage: 'login',
      msg: req.query.msg || null,
      error: null,
    });
  })
  .post(login);

// -------------------- GOOGLE OAUTH (LOGIN) --------------------
router.get('/login/google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5000/oauth/callback', // FIXED
      },
    });

    if (error) throw error;
    return res.redirect(data.url);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Google OAuth error');
  }
});

// -------------------- OAUTH CALLBACK --------------------
router.get('/oauth/callback', oauthcallback);

// -------------------- LOGOUT --------------------
router.get('/logout', logout);

export default router;
