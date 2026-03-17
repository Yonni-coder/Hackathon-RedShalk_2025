const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  checkoutCart,
} = require("../controller/cart.controller");

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Obtenir le panier de l'utilisateur
router.get("/", getCart);

// Ajouter un élément au panier
router.post("/items", addToCart);

// Supprimer un élément du panier
router.delete("/items/:id", removeFromCart);

// Vider le panier
router.delete("/clear", clearCart);

// Valider le panier et créer les réservations
router.post("/checkout", checkoutCart);

module.exports = router;
