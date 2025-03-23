const express = require("express");
const { authenticateAdmin } = require("../../middleware/authAdmin");
const { users, createUser } = require("../../controllers/admin/usersController");
const { kendala, updateKendala } = require("../../controllers/admin/pengaduanController");
const { broadcast, updateBroadcast} = require("../../controllers/admin/broadcastController");

const router = express.Router();

// Users
router.get("/admin/users", authenticateAdmin, users);
router.post("/admin/create-user", authenticateAdmin, createUser);

// Kendala
router.get("/admin/kendala", authenticateAdmin, kendala);
router.put("/admin/kendala/:id", authenticateAdmin, updateKendala);

// broadcast
router.get("/admin/broadcast", authenticateAdmin, broadcast);
router.put("/admin/broadcast/:id", authenticateAdmin, updateBroadcast);
module.exports = router;
