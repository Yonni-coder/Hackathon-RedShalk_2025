// Types
//Creer type
const { user } = require("../config/db.config");
const db = require("../db/connectDB");
//creer un type
//
exports.createType = async (req, res) => {
  const { name, description } = req.body;
  //Recuperer le company id a partir du token
  const company_id = req.user.company_id;
  //   console.log(company_id);
  //Verifier si le type du meme nom existe deja
  const [rows] = await db.query(
    "SELECT * FROM ressource_types WHERE name = ? AND company_id = ?",
    [name, company_id]
  );
  if (rows.length > 0) {
    return res.status(400).json({ message: "Le type existe deja" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO ressource_types (name, description, company_id) VALUES (?, ?, ?)`,
      [name, description, company_id]
    );
    const typeId = result.insertId;
    res.status(201).json({ message: "Type créé avec succès", typeId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création du type" });
  }
};
//Recuperer tous les types
exports.getAllTypes = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const [rows] = await db.query(
      "SELECT * FROM ressource_types where company_id=?",
      [company_id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la récupération des types",
    });
  }
};
