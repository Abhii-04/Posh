import express from 'express';
import { register, login, logout as localLogout } from '../controllers/authcontroller.js';
import { createServerClient } from '@supabase/ssr';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

/**
 * Helper: Create a Supabase SSR client bound to req/res
 */
function createSupabase(req, res) {
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies?.[name],
        set: (name, value, options) => {
          if (res.headersSent) return;
          res.cookie(name, value, {
            ...options,
            httpOnly: true,
            sameSite: "Lax",
            secure: false, // ⚠ set to true in production with HTTPS
          });
        },
        remove: (name, options) => {
          if (res.headersSent) return;
          res.clearCookie(name, options);
        },
      },
    }
  );
}

/* -------------------- REGISTER -------------------- */
router
  .route('/register')
  .get((req, res) => {
    res.render('register', {
      user: req.session?.user || null,
      currentPage: 'register',
    });
  })
  .post(register);

/* -------------------- LOGIN (LOCAL) -------------------- */
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

/* -------------------- GOOGLE OAUTH LOGIN -------------------- */
router.get("/login/google", async (req, res) => {
  try {
    const supabase = createSupabase(req, res);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5000/auth/callback",
      },
    });

    if (error) {
      console.error(error);
      return res.redirect("/login?error=oauth_failed");
    }

    return res.redirect(data.url);
  } catch (err) {
    console.error("Unexpected /login/google error:", err);
    return res.redirect("/login?error=server_error");
  }
});

/* -------------------- OAUTH CALLBACK -------------------- */
/**
 * Behaviour change:
 *  - After exchanging the code, we *check our app DB's profiles table*.
 *  - If a profile exists, create session and redirect to `next`.
 *  - If no profile exists, redirect to an access-request / registration page
 *    so you can decide whether to allow this OAuth user (no silent registration).
 */
router.get("/auth/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const next = req.query.next ?? "/profile";

    if (!code) return res.redirect(next);

    const supabase = createSupabase(req, res);

    // exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error("OAuth callback session exchange error:", exchangeError);
      return res.redirect("/login?error=oauth_failed");
    }

    // now fetch the user
    const { data: userData, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr) {
      console.error("Failed to get user after OAuth exchange:", getUserErr);
      return res.redirect("/login?error=oauth_failed");
    }

    const user = userData?.user;
    if (!user) {
      console.error("No user returned after OAuth exchange");
      return res.redirect("/login?error=oauth_failed");
    }

    // --- CHECK IF APP PROFILE EXISTS ---
    // Adjust table name 'profiles' if you store users elsewhere.
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id) // if you use auth uuid as PK in profiles
      .single();

    // handle DB errors
    if (profileErr && profileErr.code !== 'PGRST116') { // PGRST116 = no rows? (varies by client)
      // log but do not leak DB error to client
      console.error("Error querying profiles table:", profileErr);
      return res.redirect("/login?error=server_error");
    }

    if (!profile) {
      // No app-level profile was found — don't create a session automatically.
      // Redirect user to an onboarding / request-access page where you can approve them.
      // Pass email and a flag so the page knows this came from OAuth.
      const email = encodeURIComponent(user.email || '');
      return res.redirect(`/request-access?email=${email}&source=oauth`);
    }

    // If profile exists, create session as before
    const isAdmin = user.email === process.env.ADMIN_EMAIL;
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || profile.name || "User",
      phone: user.user_metadata?.phone || profile.phone || null,
      address: user.user_metadata?.address || profile.address || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || profile.avatar_url || null,
      is_admin: isAdmin,
    };

    req.session.save(() => res.redirect(303, next));
  } catch (err) {
    console.error("Callback error:", err);
    return res.status(500).send("Internal server error");
  }
});

/* -------------------- SESSION ENDPOINT -------------------- */
router.get("/auth/session", async (req, res) => {
  try {
    if (req.session?.user) {
      return res.json(req.session.user);
    }

    const supabase = createSupabase(req, res);
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return res.json(null);
    }

    const user = data.user;
    const isAdmin = user.email === process.env.ADMIN_EMAIL;
    return res.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
      phone: user.user_metadata?.phone || null,
      address: user.user_metadata?.address || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      is_admin: isAdmin,
    });
  } catch (err) {
    console.error(err);
    return res.json(null);
  }
});

/* -------------------- LOGOUT -------------------- */
router.get("/logout", async (req, res) => {
  try {
    const supabase = createSupabase(req, res);
    // signOut doesn't need { scope: "global" } here
    await supabase.auth.signOut();
    req.session.destroy(() => res.redirect("/?logout_success=true"));
  } catch (err) {
    console.error("/logout error:", err);
    req.session.destroy(() => res.redirect("/?logout_success=true"));
  }
});

export default router;
