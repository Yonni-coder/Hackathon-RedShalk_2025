const db = require("../db/connectDB");

const checkReservation = async (req, res, next) => {
  try {
    const { resource_id, start_date, end_date } = req.body;

    // Vérification des champs obligatoires pour la création
    if (req.method === "POST") {
      if (!resource_id || !start_date || !end_date) {
        return res.status(400).json({
          message:
            "Les champs resource_id, start_date et end_date sont obligatoires",
        });
      }
    }

    // Vérification du format des dates
    if (start_date && isNaN(Date.parse(start_date))) {
      return res
        .status(400)
        .json({ message: "Format de date de début invalide" });
    }

    if (end_date && isNaN(Date.parse(end_date))) {
      return res
        .status(400)
        .json({ message: "Format de date de fin invalide" });
    }

    // Vérification que la date de fin est après la date de début
    if (start_date && end_date && new Date(end_date) <= new Date(start_date)) {
      return res.status(400).json({
        message: "La date de fin doit être après la date de début",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la validation de la réservation" });
  }
};

module.exports = checkReservation;
