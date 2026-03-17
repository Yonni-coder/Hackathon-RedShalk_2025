// routes/panier.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const panierCtrl = require("../controller/panier.controller");

// Toutes routes exigent auth
router.use(auth);

// CRUD panier
router.post("/items", panierCtrl.addToCart);         // ajouter un item
router.get("/", panierCtrl.getCart);                // voir panier
router.delete("/items/:id", panierCtrl.removeCartItem); // supprimer item
router.post("/checkout", panierCtrl.checkoutCart);  // checkout (création reservations + PaymentIntent)

module.exports = router;
