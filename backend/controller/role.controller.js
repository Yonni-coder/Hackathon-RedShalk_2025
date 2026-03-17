//Controller pour recupere les roles
const db = require("../db/connectDB");
// Recuperer tous les roles
exports.getAllRoles = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM roles");
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Une erreur s'est produite lors de la récupération des rôles",
      });
  }
};
