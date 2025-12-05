import supabase from "../config/supabase.js";

// -------------------- REGISTER --------------------
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .render("register", { error: "Name, email, and password are required." });
    }

    let phoneValue = null;
    if (phone) {
      const numericPhone = phone.toString().replace(/\D/g, "");
      if (!numericPhone) {
        return res.status(400).render("register", { error: "Invalid phone number" });
      }
      phoneValue = numericPhone;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone: phoneValue, address },
      },
    });

    if (error) {
      return res.status(400).render("register", { error: error.message });
    }

    return res.redirect("/login?msg=verify");
  } catch (err) {
    console.error(err);
    return res.status(500).render("register", { error: "Internal server error" });
  }
};

// -------------------- LOGIN (EMAIL + PASSWORD) --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).render("login", { error: "Invalid credentials" });
    }

    const { user, session } = data;
    if (!user || !session) {
      return res
        .status(400)
        .render("login", { error: "Login failed. Try again." });
    }

    const isAdmin = user.email === process.env.ADMIN_EMAIL;
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
      phone: user.user_metadata?.phone || null,
      address: user.user_metadata?.address || null,
      is_admin: isAdmin,
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
    try {
      await supabase.auth.signOut();
    } catch (supErr) {
      console.warn("Supabase signOut warning:", supErr.message);
    }

    req.session.destroy(() => res.redirect("/?logout_success=true"));
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Logout failed" });
  }
};
