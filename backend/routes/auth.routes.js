const express = require("express");
const router = express.Router();
const { signup, login, logout } = require("../controller/auth.controller");
const checkSignup = require("../middleware/checksignup");
const { authenticate } = require("../middleware/authenticate");
const db = require("../db/connectDB");

router.post("/signup", checkSignup, signup);
router.post("/login", login);
router.get("/me", authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, fullname, email FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Erreur dans /me:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.post("/logout", logout);

module.exports = router;
