import express from "express";
import { register, login, logout } from "../controllers/authcontroller.js";

const router = express.Router();

// REGISTER
router
  .route("/register")
  .get((req, res) =>
    res.render("register", {
      user: req.session?.user || null,
      currentPage: "register",
    })
  )
  .post(register);

// LOGIN
router
  .route("/login")
  .get((req, res) =>
    res.render("login", {
      user: req.session?.user || null,
      currentPage: "login",
      msg: req.query.msg || null,
      error: null,
    })
  )
  .post(login);

// LOGOUT
router.get("/logout", logout);

export default router;
