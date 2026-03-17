// routes/ressources.routes.js — debug build
const express = require("express");
const router = express.Router();

// IMPORTS
const authMiddleware = require("../middleware/auth");
const controllers = require("../controller/ressources.controller");

// Debug: afficher ce qu'on a importé
console.log(">>> routes/ressources.routes.js chargé");
console.log("authMiddleware type:", typeof authMiddleware);
console.log("authMiddleware value:", authMiddleware);
console.log("controllers type:", typeof controllers);
console.log("controllers keys:", controllers && Object.keys(controllers));

// Liste des handlers attendus
const expected = [
  "createRessource",
  "updateRessource",
  "deleteRessource",
  "getAllRessources",
  "getRessourceById",
  "getRessourcesByCompany",
  "addPhotosToRessource",
  "deletePhotoFromRessource",
  "updateTarifs",
];

// Vérifier que chaque handler existe et est une fonction
for (const name of expected) {
  if (!controllers || typeof controllers[name] !== "function") {
    console.error(
      `ERREUR: handler attendu manquant ou non-fonction -> ${name}`
    );
  } else {
    console.log(`OK: handler trouvé -> ${name}`);
  }
}

// Vérifier authMiddleware
if (typeof authMiddleware !== "function") {
  console.error(
    "ERREUR: authMiddleware n'est pas une fonction. Valeur:",
    authMiddleware
  );
  // optional: throw to fail fast — utile en dev
  throw new TypeError(
    "authMiddleware doit être une fonction middleware. Vérifie l'export du fichier middleware/auth.js"
  );
}

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Bind des controllers (on extrait pour lisibilité)
const {
  createRessource,
  updateRessource,
  deleteRessource,
  getAllRessources,
  getRessourceById,
  getRessourcesByCompany,
  addPhotosToRessource,
  deletePhotoFromRessource,
  updateTarifs,
} = controllers;

// Avant d'ajouter les routes, vérifier encore une fois
if (typeof createRessource !== "function") {
  throw new TypeError(
    "createRessource doit être une fonction. Vérifie ../controller/ressources.controller.js"
  );
}

// CRUD Ressources
router.post("/add", createRessource); // Création d'une ressource
router.put("/:id", updateRessource); // Mise à jour complète
router.delete("/:id", deleteRessource); // Suppression
router.get("/", getAllRessources); // Liste toutes les ressources
router.get("/:id", getRessourceById); // Récupérer une ressource précise

router.get("/company/:companyId", getRessourcesByCompany); // Récupérer toutes les ressources d'une entreprise
router.post("/:id/photos", addPhotosToRessource); // Ajouter des photos à une ressource
router.delete("/photos/:photoId", deletePhotoFromRessource); // Supprimer une photo spécifique
router.put("/:id/tarifs", updateTarifs); // Mise à jour des tarifs

console.log("Routes /api/ressources montées correctement.");
module.exports = router;
