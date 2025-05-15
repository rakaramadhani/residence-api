const express = require("express");
const { authenticatePenghuni } = require("../../middleware/authPenghuni");
const { checkVerified } = require("../../middleware/verified");
const upload = require("../../middleware/multer");
const router = express.Router();
const {tokenizer, checkTransaksi, handleNotification} = require("../../controllers/midtrans/midtransController");
const { getSurat, createSurat } = require("../../controllers/user/suratController");
const { getTagihan, getRiwayatTagihan } = require("../../controllers/user/tagihanController");
const { getPeraturan } = require("../../controllers/user/peraturanController");
const { createEmergency, getEmergency } = require("../../controllers/user/emergencyController");
const {
  getFamilyData,
  createFamilyData,
  updateFamilyData,
  deleteFamilyData,
} = require("../../controllers/user/penghuniController");

const {
  getPengaduan,
  createPengaduan,
  updatePengaduan,
  deletePengaduan,
} = require("../../controllers/user/pengaduanController");

const{
  getAllBroadcast,
  getBroadcast,
  getAdminBroadcast,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
} = require("../../controllers/user/broadcastController");

// data keluarga
router.get("/user/:user_id/penghuni", authenticatePenghuni, checkVerified, getFamilyData);
router.post("/user/:user_id/penghuni",authenticatePenghuni,checkVerified, createFamilyData);
router.put("/user/:user_id/penghuni/:id",authenticatePenghuni,checkVerified, updateFamilyData);
router.delete("/user/:user_id/penghuni/:id",authenticatePenghuni, checkVerified, deleteFamilyData);

// Pengaduan
router.get("/user/:user_id/pengaduan", authenticatePenghuni,checkVerified, getPengaduan);
router.post("/user/:user_id/pengaduan", upload.single("foto"), authenticatePenghuni,checkVerified, createPengaduan);
router.put("/user/:user_id/pengaduan/:id",upload.single("foto"), authenticatePenghuni,checkVerified, updatePengaduan);
router.delete("/user/:user_id/pengaduan/:id",authenticatePenghuni,checkVerified, deletePengaduan);

// Broadcast
router.get("/user/broadcast", authenticatePenghuni,checkVerified, getAllBroadcast);
router.get("/user/broadcast/admin", authenticatePenghuni, getAdminBroadcast);
router.get("/user/:user_id/broadcast", authenticatePenghuni,checkVerified, getBroadcast);
router.post("/user/:user_id/broadcast",authenticatePenghuni, upload.single("foto"), checkVerified, createBroadcast);
router.put("/user/:user_id/broadcast/:id",authenticatePenghuni, upload.single("foto"), checkVerified, updateBroadcast);
router.delete("/user/:user_id/broadcast/:id",authenticatePenghuni,checkVerified, deleteBroadcast);

// emergency
router.post("/user/:user_id/emergency",authenticatePenghuni,checkVerified, createEmergency);
router.get("/user/emergency", authenticatePenghuni,checkVerified, getEmergency);
 
// midtrans 
router.post("/user/payment/tokenizer",authenticatePenghuni,checkVerified, tokenizer);
router.get("/user/payment/check-status/:orderId",authenticatePenghuni,checkVerified, checkTransaksi);
router.post("/user/payment/notification", handleNotification);

// tagihan
router.get("/user/:user_id/tagihan", authenticatePenghuni,checkVerified,getTagihan);
router.get("/user/:user_id/riwayat", authenticatePenghuni,checkVerified,getRiwayatTagihan);

// peraturan
router.get("/user/peraturan", authenticatePenghuni,checkVerified,getPeraturan);

// surat
router.get("/user/:user_id/surat", authenticatePenghuni,checkVerified, getSurat);
router.post("/user/:user_id/surat", authenticatePenghuni, checkVerified,createSurat);

module.exports = router;
