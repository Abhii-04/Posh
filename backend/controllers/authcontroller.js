import supabase from "../config/supabase.js";

// -------------------- REGISTER --------------------
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password)
      return res.status(400).render("register", { error: "All fields required" });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone, address },
      },
    });

    if (error) return res.status(400).render("register", { error: error.message });

    return res.redirect("/login?msg=verify");
  } catch (err) {
    console.error(err);
    return res.status(500).render("register", { error: "Internal server error" });
  }
};

// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error)
      return res.status(400).render("login", { error: "Invalid credentials" });

    const { user, session } = data;

    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
      phone: user.user_metadata?.phone || null,
      address: user.user_metadata?.address || null,
    };

    req.session.tokens = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    };

    req.session.save(() => res.redirect("/profile"));
  } catch (err) {
    console.error(err);
    return res.status(500).render("login", { error: "Login failed" });
  }
};

// -------------------- LOGOUT --------------------
export const logout = async (req, res) => {
  try {
    req.session.destroy(() => res.redirect("/"));
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Logout failed" });
  }
};
