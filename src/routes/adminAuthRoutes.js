const express = require("express");
const { adminLogin, users } = require("../controllers/adminAuthController");
const { authenticateAdmin } = require("../middleware/authAdmin");

const router = express.Router();

router.post("/admin/login", adminLogin);
router.get("/admin/users", authenticateAdmin, users);

module.exports = router;
