const express = require("express");
const router = express.Router();
const db = require("../db/connectDB");
const authMiddleware = require("../middleware/auth");

// Valider un manager (admin seulement)
router.patch("/validate/manager/:id", authMiddleware, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé. Admin requis." });
    }

    const userId = req.params.id;

    // Vérifier que l'utilisateur existe et est un manager
    const [userRows] = await db.query(
      "SELECT * FROM users WHERE id = ? AND role = 'manager'",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Manager non trouvé" });
    }

    // Activer le compte manager
    await db.query("UPDATE users SET is_active = 1 WHERE id = ?", [userId]);

    res.json({ message: "Manager validé avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la validation du manager" });
  }
});

// Valider un employé (manager seulement)
router.patch("/validate/employee/:id", authMiddleware, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est un manager
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Accès refusé. Manager requis." });
    }

    const userId = req.params.id;

    // Vérifier que l'employé existe, est un employé et appartient à la même entreprise
    const [userRows] = await db.query(
      "SELECT * FROM users WHERE id = ? AND role = 'employee' AND company_id = ?",
      [userId, req.user.company_id]
    );

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Employé non trouvé dans votre entreprise" });
    }

    // Activer le compte employé
    await db.query("UPDATE users SET is_active = 1 WHERE id = ?", [userId]);

    res.json({ message: "Employé validé avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la validation de l'employé" });
  }
});

// Lister les comptes en attente de validation (pour admin et managers)
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    let query = "";
    let params = [];

    if (req.user.role === "admin") {
      // Admin voit tous les managers en attente
      query =
        "SELECT id, email, fullname, phone, created_at FROM users WHERE role = 'manager' AND is_active = 0";
    } else if (req.user.role === "manager") {
      // Manager voit les employés de son entreprise en attente
      query =
        "SELECT id, email, fullname, phone, created_at FROM users WHERE role = 'employee' AND company_id = ? AND is_active = 0";
      params = [req.user.company_id];
    } else {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération des comptes en attente",
      });
  }
});

module.exports = router;
