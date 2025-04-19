const express = require("express");
const { authenticatePenghuni } = require("../../middleware/authPenghuni");
const { checkVerified } = require("../../middleware/verified");
const router = express.Router();
const {emergency} = require("../../controllers/penghuni/emergencyController");
const {tokenizer, checkTransaksi, handleNotification} = require("../../controllers/midtrans/midtransController");
const { getSurat, createSurat } = require("../../controllers/penghuni/suratController");
const { getTagihan } = require("../../controllers/penghuni/tagihanController");
const {
  getFamilyData,
  createFamilyData,
  updateFamilyData,
  deleteFamilyData,
} = require("../../controllers/penghuni/dataKeluargaController");

const {
  getPengaduan,
  createPengaduan,
  updatePengaduan,
  deletePengaduan,
} = require("../../controllers/penghuni/pengaduanController");

const{
  getAllBroadcast,
  getBroadcast,
  getAdminBroadcast,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
} = require("../../controllers/penghuni/broadcastController");

// data keluarga
router.get("/user/:user_id/data-keluarga", authenticatePenghuni, checkVerified, getFamilyData);
router.post("/user/:user_id/data-keluarga",authenticatePenghuni,checkVerified, createFamilyData);
router.put("/user/:user_id/data-keluarga/:id",authenticatePenghuni,checkVerified, updateFamilyData);
router.delete("/user/:user_id/data-keluarga/:id",authenticatePenghuni, checkVerified, deleteFamilyData);

// Pengaduan
router.get("/user/:user_id/pengaduan", authenticatePenghuni,checkVerified, getPengaduan);
router.post("/user/:user_id/pengaduan", authenticatePenghuni,checkVerified, createPengaduan);
router.put("/user/:user_id/pengaduan/:id", authenticatePenghuni,checkVerified, updatePengaduan);
router.delete("/user/:user_id/pengaduan/:id",authenticatePenghuni,checkVerified, deletePengaduan);

// Broadcast
router.get("/user/broadcast", authenticatePenghuni,checkVerified, getAllBroadcast);
router.get("/user/broadcast/admin", authenticatePenghuni,checkVerified, getAdminBroadcast);
router.get("/user/:user_id/broadcast", authenticatePenghuni,checkVerified, getBroadcast);
router.post("/user/:user_id/broadcast",authenticatePenghuni,checkVerified, createBroadcast);
router.put("/user/:user_id/broadcast/:id",authenticatePenghuni,checkVerified, updateBroadcast);
router.delete("/user/:user_id/broadcast/:id",authenticatePenghuni,checkVerified, deleteBroadcast);

// emergency
router.post("/user/:user_id/emergency",authenticatePenghuni,checkVerified, emergency);

// midtrans 
router.post("/user/payment/tokenizer",authenticatePenghuni,checkVerified, tokenizer);
router.get("/user/payment/check-status/:orderId",authenticatePenghuni,checkVerified, checkTransaksi);
router.post("/user/payment/notification", handleNotification);



// tagihan
router.get("/user/:user_id/tagihan", authenticatePenghuni,checkVerified,getTagihan);


// surat
router.get("/user/:user_id/surat", authenticatePenghuni,checkVerified, getSurat);
router.post("/user/:user_id/surat", authenticatePenghuni, checkVerified,createSurat);

module.exports = router;
