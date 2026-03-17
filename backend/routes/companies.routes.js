const express = require("express");
const router = express.Router();
const db = require("../db/connectDB");

// Obtenir la liste des entreprises (accessible sans authentification)
router.get("/companies", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM companies WHERE is_active = 1"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des entreprises" });
  }
});

module.exports = router;
