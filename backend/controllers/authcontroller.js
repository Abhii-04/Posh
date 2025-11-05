import express from "express";
import bcrypt from "bcrypt";
import supabase from "../config/supabase.js";

// -------------------- REGISTER --------------------



export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    // Clean phone number
    let phoneValue = null;
    if (phone) {
      const numericPhone = phone.toString().replace(/\D/g, "");
      if (!numericPhone) {
        return res.status(400).json({ error: "Invalid phone number" });
      }
      phoneValue = numericPhone;
    }

    // Supabase signup (handles email verification)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone: phoneValue, address } },
    });

    if (error) {
      console.error("Supabase signup error:", error);
      return res.status(400).render("register", { error: error.message });
    }
    const userloggedin=true;
    // Redirect to login with message
    res.redirect("/login?msg=verify");
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).render("register", { error: "Internal server error" });
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

    if (error) {
      console.error("Supabase login error:", error);
      return res.status(400).render("login", { error: "Invalid credentials" });
    }

    const user = data.user;

    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || "User",
      phone: user.user_metadata?.phone || null,
      address: user.user_metadata?.address || null,
    };
    const userloggedin=true;

    req.session.save((saveErr) => {
      if (saveErr) {
        console.error("Session save error:", saveErr);
      }
      res.redirect("/");
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("login", { error: "Login failed" });
  }
};
 


// -------------------- OAUTH CALLBACK --------------------
export const oauthcallback = async (req, res) => {
  try {
    const { access_token } = req.query;

    if (!access_token) {
      return res.status(400).json({ message: "Access token missing" });
    }

    const { data, error } = await supabase.auth.getUser(access_token);

    if (error || !data?.user) {
      console.error("OAuth error:", error);
      return res.status(400).json({ message: "OAuth failed" });
    }

    const user = data.user;

    // ✅ Store in session
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || "Google User",
    };
    const userloggedin=true;

    res.redirect("/");
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).json({ message: "OAuth failed" });
  }
};



// -------------------- LOGOUT --------------------
export const logout = async (req, res) => {
  try {
    await supabase.auth.signOut();

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
      const userloggedin=false;
      res.redirect("/");
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
};
