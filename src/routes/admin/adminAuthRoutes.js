const express = require("express");
const { adminLogin, logout, userDetails, forgotPassword, resetPassword } = require("../../controllers/adminAuthController");
const { authenticateAdmin } = require("../../middleware/authAdmin");

const router = express.Router();

//admin auth
router.post("/admin/login", adminLogin);
router.post("/admin/logout", logout);
router.get("/admin/details",authenticateAdmin, userDetails);

// Admin password reset
router.post("/admin/forgot-password", forgotPassword);
router.post("/admin/reset-password", resetPassword);

module.exports = router;
