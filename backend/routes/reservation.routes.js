const express = require("express");
const router = express.Router();
const {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getReservationsByRessource,
  getRessourceAvailability,
  getUserReservations,
} = require("../controller/reservation.controller");
const authMiddleware = require("../middleware/auth");
const {
  checkReservationAccess,
  checkCompanyManager,
} = require("../middleware/reservationAuth");

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Obtenir toutes les réservations (avec filtrage par rôle)
router.get("/", getAllReservations);

// Obtenir une réservation par ID
router.get("/:id", checkReservationAccess, getReservationById);

// Créer une nouvelle réservation
router.post("/", createReservation);

// Mettre à jour le statut d'une réservation (validation par le manager)
router.patch(
  "/:id/status",
  checkReservationAccess,
  checkCompanyManager,
  updateReservation
);

// Supprimer une réservation
router.delete("/:id", checkReservationAccess, deleteReservation);

// Obtenir les réservations d'une ressource spécifique
router.get("/ressource/:ressourceId", getReservationsByRessource);

// Obtenir les disponibilités d'une ressource
router.get("/availability/:ressourceId", getRessourceAvailability);

// Obtenir les réservations d'un utilisateur
router.get("/user/:userId", getUserReservations);

module.exports = router;
