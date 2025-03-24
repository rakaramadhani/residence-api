const express = require("express");
const { authenticateAdmin } = require("../../middleware/authAdmin");
const { users, createUser, detail, verifikasiUser } = require("../../controllers/admin/usersController");
const { kendala, updateKendala } = require("../../controllers/admin/pengaduanController");
const { broadcast, updateBroadcast} = require("../../controllers/admin/broadcastController");
const { getEmergency } = require("../../controllers/admin/emergencyController");

const router = express.Router();

// Users
router.get("/admin/users", authenticateAdmin, users);
router.post("/admin/create-user", authenticateAdmin, createUser);
router.get("/admin/user/:user_id",authenticateAdmin, detail);
router.put("/admin/user/:user_id",authenticateAdmin, verifikasiUser);

// Kendala
router.get("/admin/kendala", authenticateAdmin, kendala);
router.put("/admin/kendala/:id", authenticateAdmin, updateKendala);

// broadcast
router.get("/admin/broadcast", authenticateAdmin, broadcast);
router.put("/admin/broadcast/:id", authenticateAdmin, updateBroadcast);

// emergency
router.get("/admin/emergency", authenticateAdmin, getEmergency);
module.exports = router;
