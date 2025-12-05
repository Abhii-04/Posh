// backend/routes/authroutes.js
import dotenv from 'dotenv';
dotenv.config(); // must run before using process.env

import express from 'express';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { register, login } from '../controllers/authcontroller.js';

const router = express.Router();

/* ----------------- ADMIN SUPABASE (SERVICE ROLE) ----------------- */
const ADMIN_SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!ADMIN_SUPABASE_KEY) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY in .env'
  );
}

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL in .env');
}

const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  ADMIN_SUPABASE_KEY,
  { auth: { persistSession: false } }
);

/* ----------------- SSR CLIENT (COOKIE-BASED AUTH) ----------------- */
function createSupabase(req, res) {
  return createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => req.cookies?.[name],
      set: (name, value, options) => {
        if (res.headersSent) return;
        res.cookie(name, value, {
          ...options,
          httpOnly: true,
          sameSite: "Lax",
          secure: false,
        });
      },
      remove: (name, options) => {
        if (res.headersSent) return;
        res.clearCookie(name, options);
      },
    },
  });
}

/* -------------------- REGISTER PAGE -------------------- */
router
  .route('/register')
  .get((req, res) => {
    res.render('register', {
      user: req.session?.user || null,
      currentPage: 'register',
      error: req.query.error || null,
      emailPrefill: req.query.email || null
    });
  })
  .post(register);

/* -------------------- LOGIN PAGE -------------------- */
router
  .route('/login')
  .get((req, res) => {
    res.render('login', {
      user: req.session?.user || null,
      currentPage: 'login',
      msg: req.query.msg || null,
      error: req.query.error || null,
    });
  })
  .post(login);

/* -------------------- GOOGLE LOGIN -------------------- */
router.get('/login/google', async (req, res) => {
  try {
    const supabase = createSupabase(req, res);
    const redirectTo = `${process.env.BASE_URL || "http://localhost:5000"}/auth/callback?flow=login&next=${encodeURIComponent(req.query.next || '/profile')}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });

    if (error) {
      console.error(error);
      return res.redirect('/login?error=oauth_failed');
    }

    return res.redirect(data.url);
  } catch (err) {
    console.error(err);
    return res.redirect('/login?error=server_error');
  }
});

/* -------------------- GOOGLE REGISTER -------------------- */
router.get('/register/google', async (req, res) => {
  try {
    const supabase = createSupabase(req, res);
    const redirectTo = `${process.env.BASE_URL || "http://localhost:5000"}/auth/callback?flow=register&next=${encodeURIComponent(req.query.next || '/profile')}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });

    if (error) {
      console.error(error);
      return res.redirect('/register?error=oauth_failed');
    }

    return res.redirect(data.url);
  } catch (err) {
    console.error(err);
    return res.redirect('/register?error=server_error');
  }
});

/* -------------------- OAUTH CALLBACK -------------------- */
router.get('/auth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const flow = req.query.flow || 'login';
    const next = req.query.next || '/profile';

    const supabase = createSupabase(req, res);

    const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeErr) {
      console.error("exchange error:", exchangeErr);
      return res.redirect('/login?error=oauth_failed');
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return res.redirect('/login?error=invalid_user');

    /* Extract phone safely */
    let phoneBigInt = null;
    if (user.user_metadata?.phone) {
      const digits = String(user.user_metadata.phone).replace(/\D/g, '');
      if (digits) phoneBigInt = digits;
    }

    const userObj = {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      email: user.email,
      password_hash: null,
      phone: phoneBigInt,
      address: user.user_metadata?.address || null,
      role: "user"
    };

    /* ---------- REGISTER FLOW ---------- */
    if (flow === 'register') {
      const { data: upserted, error: upsertErr } = await adminSupabase
        .from('User')
        .upsert(userObj, { returning: 'representation' })
        .select()
        .single();

      if (upsertErr) {
        console.error(upsertErr);
        return res.redirect('/register?error=server_error');
      }

      req.session.user = {
        id: upserted.id,
        email: upserted.email,
        name: upserted.name,
        phone: upserted.phone,
        address: upserted.address,
        is_admin: upserted.email === process.env.ADMIN_EMAIL
      };

      return req.session.save(() => res.redirect(next));
    }

    /* ---------- LOGIN FLOW ---------- */
    // Check if this user exists in app database
    const { data: foundUser } = await adminSupabase
      .from('User')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Not found → redirect to /register with their email pre-filled
    if (!foundUser) {
      return res.redirect(`/register?error=not_registered&email=${encodeURIComponent(user.email)}`);
    }

    // Found → login normally
    req.session.user = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      phone: foundUser.phone,
      address: foundUser.address,
      is_admin: foundUser.email === process.env.ADMIN_EMAIL
    };

    return req.session.save(() => res.redirect(next));
  } catch (err) {
    console.error(err);
    return res.redirect('/login?error=server_error');
  }
});

/* -------------------- SESSION ENDPOINT -------------------- */
router.get('/auth/session', async (req, res) => {
  try {
    if (req.session?.user) return res.json(req.session.user);

    const supabase = createSupabase(req, res);
    const { data } = await supabase.auth.getUser();

    if (!data.user) return res.json(null);

    return res.json({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || "User",
    });
  } catch (err) {
    console.error(err);
    return res.json(null);
  }
});

/* -------------------- LOGOUT -------------------- */
router.get('/logout', async (req, res) => {
  try {
    const supabase = createSupabase(req, res);
    await supabase.auth.signOut();
    req.session.destroy(() => res.redirect('/'));
  } catch (err) {
    console.error(err);
    req.session.destroy(() => res.redirect('/'));
  }
});

export default router;
