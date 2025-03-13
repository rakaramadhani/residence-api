const express = require("express");
const { adminLogin, logout } = require("../controllers/adminAuthController");
const { authenticateAdmin } = require("../middleware/authAdmin");
const { users } = require("../controllers/admin/usersController");
const { kendala } = require("../controllers/admin/pengaduanController");

const router = express.Router();

//admin auth
router.post("/admin/login", adminLogin);
router.post("/admin/logout", logout);

// Admin access
router.get("/admin/users", authenticateAdmin, users);
router.get("/admin/kendala", authenticateAdmin, kendala);

module.exports = router;
