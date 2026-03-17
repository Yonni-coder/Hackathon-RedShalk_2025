const jwt = require("jsonwebtoken");
const db = require("../db/connectDB");
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token; // le nom de ton cookie
    if (!token) return res.status(401).json({ message: "Token manquant" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "votre_secret_jwt"
    );

    // Vérifier utilisateur dans DB
    const [rows] = await db.query(
      "SELECT id, email, role, company_id, is_active, fullname, phone FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return res
        .status(401)
        .json({ message: "Utilisateur invalide ou compte désactivé" });
    }

    const user = rows[0];

    // Infos entreprise
    let companyInfo = null;
    if (user.company_id) {
      const [companyRows] = await db.query(
        "SELECT id, name, email, phone, address FROM companies WHERE id = ?",
        [user.company_id]
      );
      if (companyRows.length > 0) companyInfo = companyRows[0];
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      fullname: user.fullname,
      phone: user.phone,
      is_active: user.is_active,
      company: companyInfo,
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token invalide" });
  }
};
