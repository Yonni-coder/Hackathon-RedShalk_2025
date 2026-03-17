//Routes pour recuperer les roles
const express = require("express");
const router = express.Router();

const { getAllRoles } = require("../controller/role.controller");
router.get("/", getAllRoles);
module.exports = router;
