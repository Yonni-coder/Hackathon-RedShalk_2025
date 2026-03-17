//Routes pour les types
const express = require("express");
const router = express.Router();
const { getAllTypes, createType } = require("../controller/type.controller");
const authMiddleware = require("../middleware/auth");
router.use(authMiddleware);
router.get("/", getAllTypes);
router.post("/add", createType);
module.exports = router;
