// Recuperer cart et cart items
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getAchat } = require("../controller/achat.controller");

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);
// Obtenir le panier de l'utilisateur
router.get("/", getAchat);
module.exports = router;
