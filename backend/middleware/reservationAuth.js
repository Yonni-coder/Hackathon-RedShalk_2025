const db = require("../db/connectDB");

// Vérifier que l'utilisateur peut accéder à une réservation
const checkReservationAccess = async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userCompanyId = req.user.company_id;

    // Récupérer la réservation avec les informations de la ressource et de l'entreprise
    const [reservationRows] = await db.query(
      `SELECT r.*, res.company_id 
       FROM reservations r
       JOIN ressources res ON r.ressource_id = res.id
       WHERE r.id = ?`,
      [reservationId]
    );

    if (reservationRows.length === 0) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    const reservation = reservationRows[0];

    // Vérifier les permissions en fonction du rôle
    if (userRole === "admin") {
      // L'admin a accès à toutes les réservations
      req.reservation = reservation;
      return next();
    }

    if (userRole === "client") {
      // Un client ne peut accéder qu'à ses propres réservations
      if (reservation.user_id !== userId) {
        return res
          .status(403)
          .json({ message: "Accès non autorisé à cette réservation" });
      }
      req.reservation = reservation;
      return next();
    }

    if (userRole === "manager" || userRole === "employee") {
      // Manager et employé peuvent accéder aux réservations de leur entreprise
      if (reservation.company_id !== userCompanyId) {
        return res
          .status(403)
          .json({ message: "Accès non autorisé à cette réservation" });
      }
      req.reservation = reservation;
      return next();
    }

    return res.status(403).json({ message: "Rôle non autorisé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur de vérification des permissions" });
  }
};

// Vérifier que l'utilisateur est manager de l'entreprise
const checkCompanyManager = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userCompanyId = req.user.company_id;

    if (userRole !== "manager") {
      return res.status(403).json({
        message: "Accès refusé",
        details: "Seuls les managers peuvent effectuer cette action",
      });
    }

    if (!userCompanyId) {
      return res.status(403).json({
        message: "Accès refusé",
        details:
          "Vous devez être associé à une entreprise pour effectuer cette action",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur de vérification des permissions" });
  }
};

module.exports = {
  checkReservationAccess,
  checkCompanyManager,
};
