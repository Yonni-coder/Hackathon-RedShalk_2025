const db = require("../db/connectDB");

const checkSignup = async (req, res, next) => {
  try {
    const { email, role, company_id } = req.body; // Changer compagnie_id en company_id

    // Vérifier les champs obligatoires
    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    // Vérifier que le rôle est autorisé
    const allowedRoles = ["client", "employee", "manager", "admin"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle valide requis" });
    }

    // Empêcher l'inscription directe en tant qu'admin
    // if (role === "admin") {
    //   return res
    //     .status(403)
    //     .json({ message: "Inscription en tant qu'admin non autorisée" });
    // }

    // Vérifier si l'email existe déjà
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }

    // Vérifier que company_id est fourni pour les rôles autres que client
    if (role !== "client" && !company_id) {
      return res
        .status(400)
        .json({ message: "company_id requis pour ce rôle" });
    }

    // Vérifier que la company existe si company_id est fourni
    if (company_id) {
      const [companyRows] = await db.query(
        "SELECT * FROM companies WHERE id = ? AND is_active = 1",
        [company_id]
      );
      if (companyRows.length === 0) {
        return res
          .status(400)
          .json({ message: "company_id invalide ou entreprise inactive" });
      }
    }

    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors de la vérification" });
  }
};

module.exports = checkSignup;
