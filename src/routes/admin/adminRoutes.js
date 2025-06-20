const express = require("express");
const { authenticateAdmin } = require("../../middleware/authAdmin");
const upload = require("../../middleware/multer");
const { users, createUser, detail, verifikasiUser, updateUser, getClustersForDropdown, deleteUser } = require("../../controllers/admin/usersController");
const { pengaduan, updatePengaduan, getPengaduanById } = require("../../controllers/admin/pengaduanController");
const { broadcast, updateBroadcast,createBroadcast, deleteBroadcast} = require("../../controllers/admin/broadcastController");
const { getEmergency, getEmergencyAlert, updateEmergency, deleteEmergency, getEmergencyById, markEmergencyAsHandled} = require("../../controllers/admin/emergencyController");
const { getPenghuni, getPenghuniById } = require("../../controllers/admin/penghuniController");
const { getCluster, createCluster, updateCluster, deleteCluster } = require("../../controllers/admin/clusterController");       
const { createPeraturan, deletePeraturan, updatePeraturan, getPeraturan } = require("../../controllers/admin/peraturanController");
const { getTagihan, getTagihanSummary, updateTagihan, generateTagihanManual, deleteTagihan} = require("../../controllers/admin/tagihanController");
const { getSurat, updateSurat, getDetailSurat, downloadSurat, debugSurat, testSupabaseConnection } = require("../../controllers/admin/suratController");
const {sendNotification, notifikasiTagihan} = require("../../controllers/admin/notificationController");
const { getAllTransaksi, getTransaksiById } = require("../../controllers/admin/transaksiController");
const {  getGuestPermissionHistory} = require("../../controllers/guest/guestController");

const router = express.Router();

// Users
router.get("/admin/users", authenticateAdmin, users);
router.post("/admin/create-user", authenticateAdmin, createUser);
router.get("/admin/user/:user_id",authenticateAdmin, detail);
router.put("/admin/user/:user_id",authenticateAdmin, verifikasiUser);
router.put("/admin/user/:user_id/update",authenticateAdmin, updateUser);
router.delete('/admin/users/:user_id',authenticateAdmin, deleteUser);
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
router.post("/admin/:user_id/broadcast", upload.single("foto"), authenticateAdmin, createBroadcast);
router.put("/admin/broadcast/:id", authenticateAdmin, updateBroadcast);
router.delete("/admin/broadcast/:id", authenticateAdmin, deleteBroadcast);

// emergency
router.get("/admin/emergency", authenticateAdmin, getEmergency);
router.get("/admin/emergency/alert", authenticateAdmin, getEmergencyAlert);
router.put("/admin/emergency/:id", authenticateAdmin, updateEmergency);
router.put("/admin/emergency/:id/handle", authenticateAdmin, markEmergencyAsHandled);
router.delete("/admin/emergency/:id", authenticateAdmin, deleteEmergency);
router.get("/admin/emergency/:id", authenticateAdmin, getEmergencyById);

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
router.delete("/admin/tagihan/:id",authenticateAdmin, deleteTagihan);

// surat
router.get("/admin/surat", authenticateAdmin, getSurat);
router.get("/admin/surat/:id", authenticateAdmin, getDetailSurat);
router.put("/admin/surat/:id", authenticateAdmin, updateSurat);
router.get("/admin/surat/:id/download", authenticateAdmin, downloadSurat);
router.get("/admin/surat/:id/debug", authenticateAdmin, debugSurat);
router.get("/admin/test/supabase", authenticateAdmin, testSupabaseConnection);

// notification
router.post("/admin/notification", authenticateAdmin, sendNotification);
router.post("/admin/notification/tagihan", notifikasiTagihan);

// transaksi
router.get("/admin/transaksi", authenticateAdmin, getAllTransaksi);
router.get("/admin/transaksi/:id", authenticateAdmin, getTransaksiById);

// guest permission history
router.get("/admin/guest-permission/history", authenticateAdmin, getGuestPermissionHistory);

module.exports = router;
