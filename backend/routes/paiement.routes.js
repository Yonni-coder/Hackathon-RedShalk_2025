// // routes/paiement.routes.js
// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const paiementCtrl = require("../controller/paiement.controller");
// const expressRaw = express.raw;

// // webhook doit être sans JSON parser — on exporte endpoint séparé
// router.post("/webhook", expressRaw({ type: "application/json" }), paiementCtrl.stripeWebhook);

// // routes sécurisées (utilisateur connecté)
// router.use(auth);

// // créer un PaymentIntent (optionnel pour appel direct)
// router.post("/create-intent", paiementCtrl.createPaymentIntent);

// // upload preuve paiement (multer)
// router.post("/upload-proof/:reservationId", paiementCtrl.uploadProof);

// // télécharger reçu pour réservation
// router.get("/receipt/:reservationId", paiementCtrl.getReceiptFile);

// module.exports = router;
