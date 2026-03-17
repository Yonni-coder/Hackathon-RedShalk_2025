const db = require("../db/connectDB");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Inscription
exports.signup = async (req, res) => {
  try {
    const { email, password, role, fullname, phone, company_id } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }
    if (!role) {
      return res.status(400).json({ message: "Role requis" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Déterminer le statut is_active en fonction du rôle
    let is_active = 1; // Actif par défaut pour les clients

    // Les managers et employés sont inactifs jusqu'à validation
    if (role === "employee" || role === "manager") {
      is_active = 0;
    }

    // Insérer l'utilisateur avec le company_id
    const [rows] = await db.query(
      "INSERT INTO users (email, password, role, fullname, phone, company_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        email,
        hashedPassword,
        role,
        fullname,
        phone,
        company_id || null,
        is_active,
      ]
    );

    const userId = rows.insertId;

    res.status(201).json({
      message:
        "Inscription réussie. Votre compte doit être validé avant activation.",
      userId,
      requiresValidation: role === "employee" || role === "manager",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors de l'inscription" });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Vérifier les credentials
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier que le compte est actif (sauf pour les clients qui sont toujours actifs)
    if (!user.is_active && user.role !== "client") {
      return res.status(401).json({
        message:
          "Compte en attente de validation. Contactez votre administrateur.",
      });
    }

    // Récupérer les informations de l'entreprise si company_id existe
    let companyInfo = null;
    if (user.company_id) {
      const [companyRows] = await db.query(
        "SELECT id, name, email, phone, address FROM companies WHERE id = ?",
        [user.company_id]
      );

      if (companyRows.length > 0) {
        companyInfo = companyRows[0];
      }
    }

    // Générer un token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
      process.env.JWT_SECRET || "votre_secret_jwt",
      { expiresIn: "24h" }
    );

    // Définir le cookie HttpOnly
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // en production, utilisez HTTPS
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    });

    // Préparer la réponse
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullname: user.fullname,
      phone: user.phone,
      company_id: user.company_id,
      company: companyInfo, // Inclure les infos complètes de l'entreprise
      is_active: user.is_active,
      created_at: user.created_at,
    };

    res.json({
      message: "Connexion réussie",
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// Déconnexion
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Déconnexion réussie" });
};
