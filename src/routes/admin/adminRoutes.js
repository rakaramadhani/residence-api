const express = require("express");
const { authenticateAdmin } = require("../../middleware/authAdmin");
const { users, createUser, detail, verifikasiUser, updateUser, getClustersForDropdown } = require("../../controllers/admin/usersController");
const { pengaduan, updatePengaduan, getPengaduanById } = require("../../controllers/admin/pengaduanController");
const { broadcast, updateBroadcast,createBroadcast} = require("../../controllers/admin/broadcastController");
const { getEmergency } = require("../../controllers/admin/emergencyController");
const { getPenghuni, getPenghuniById } = require("../../controllers/admin/penghuniController");
const { getCluster, createCluster, updateCluster, deleteCluster } = require("../../controllers/admin/clusterController");       
const { createPeraturan, deletePeraturan, updatePeraturan, getPeraturan } = require("../../controllers/admin/peraturanController");
const { getTagihan, getTagihanSummary, updateTagihan, generateTagihanManual} = require("../../controllers/admin/tagihanController");
const { getSurat, updateSurat } = require("../../controllers/admin/suratController");

const router = express.Router();

// Users
router.get("/admin/users", authenticateAdmin, users);
router.post("/admin/create-user", authenticateAdmin, createUser);
router.get("/admin/user/:user_id",authenticateAdmin, detail);
router.put("/admin/user/:user_id",authenticateAdmin, verifikasiUser);
router.put("/admin/user/:user_id/update",authenticateAdmin, updateUser);
// Tambahkan route baru untuk dropdown cluster
router.get("/admin/options/clusters", authenticateAdmin, getClustersForDropdown);

// Pengaduan
router.get("/admin/pengaduan", authenticateAdmin, pengaduan);
router.put("/admin/pengaduan/:id", authenticateAdmin, updatePengaduan);
router.get("/admin/pengaduan/:id", authenticateAdmin, getPengaduanById);

// Penghuni
router.get("/admin/penghuni", authenticateAdmin, getPenghuni);
router.get("/admin/penghuni/:id", authenticateAdmin, getPenghuniById);

// Peraturan
router.post("/admin/peraturan", authenticateAdmin, createPeraturan);
router.get("/admin/peraturan", authenticateAdmin, getPeraturan);
router.put("/admin/peraturan/:id", authenticateAdmin, updatePeraturan);
router.delete("/admin/peraturan/:id", authenticateAdmin, deletePeraturan);

// broadcast
router.get("/admin/broadcast", authenticateAdmin, broadcast);
router.post("/admin/:user_id/broadcast", authenticateAdmin, createBroadcast);
router.put("/admin/broadcast/:id", authenticateAdmin, updateBroadcast);

// emergency
router.get("/admin/emergency", authenticateAdmin, getEmergency);

// cluster
router.get("/admin/cluster", authenticateAdmin, getCluster);
router.post("/admin/cluster", authenticateAdmin, createCluster);
router.put("/admin/cluster/:id", authenticateAdmin, updateCluster);
router.delete("/admin/cluster/:id", authenticateAdmin, deleteCluster);

// tagihan
router.get("/admin/tagihan",authenticateAdmin, getTagihan);
router.put("/admin/tagihan/:id",authenticateAdmin, updateTagihan);
router.get("/admin/tagihan/summary", authenticateAdmin, getTagihanSummary);
router.post("/admin/tagihan/generate",authenticateAdmin, generateTagihanManual);

// surat
router.get("/admin/surat", authenticateAdmin, getSurat);
router.put("/admin/surat/:id", authenticateAdmin, updateSurat);

module.exports = router;
