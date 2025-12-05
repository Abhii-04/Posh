import supabase from "../config/supabase.js";

export const protectRoute = async (req, res, next) => {
  try {
    if (!req.session?.tokens) return res.redirect("/login");

    const { access_token, refresh_token } = req.session.tokens;

    // validate or refresh tokens
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (error) return res.redirect("/login");

    // update refreshed tokens in session
    req.session.tokens = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };

    req.session.user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
    };

    next();
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};
