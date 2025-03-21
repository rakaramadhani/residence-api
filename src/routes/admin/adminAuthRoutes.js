const express = require("express");
const { adminLogin, logout, userDetails } = require("../../controllers/adminAuthController");
const { authenticateAdmin } = require("../../middleware/authAdmin");
const { users, addUser } = require("../../controllers/admin/usersController");
const { kendala } = require("../../controllers/admin/pengaduanController");

const router = express.Router();

//admin auth
router.post("/admin/login", adminLogin);
router.post("/admin/logout", logout);
router.get("/admin/details",authenticateAdmin, userDetails);



module.exports = router;
