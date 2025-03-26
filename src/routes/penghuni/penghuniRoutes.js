const express = require("express");
const { authenticatePenghuni } = require("../../middleware/authPenghuni");
const router = express.Router();
const {emergency} = require("../../controllers/penghuni/emergencyController");
const {tokenizer, checkTransaksi} = require("../../controllers/midtrans/midtransController");

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
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
} = require("../../controllers/penghuni/broadcastController");

// data keluarga
router.get("/user/:user_id/data-keluarga", authenticatePenghuni, getFamilyData);
router.post("/user/:user_id/data-keluarga",authenticatePenghuni,createFamilyData);
router.put("/user/:user_id/data-keluarga/:id",authenticatePenghuni,updateFamilyData);
router.delete("/user/:user_id/data-keluarga/:id",authenticatePenghuni,deleteFamilyData);

// Pengaduan
router.get("/user/:user_id/pengaduan", authenticatePenghuni, getPengaduan);
router.post("/user/:user_id/pengaduan", authenticatePenghuni, createPengaduan);
router.put("/user/:user_id/pengaduan/:id", authenticatePenghuni, updatePengaduan);
router.delete("/user/:user_id/pengaduan/:id",authenticatePenghuni, deletePengaduan);

// Broadcast
router.get("/user/broadcast", authenticatePenghuni, getAllBroadcast);
router.get("/user/:user_id/broadcast", authenticatePenghuni, getBroadcast);
router.post("/user/:user_id/broadcast",authenticatePenghuni, createBroadcast);
router.put("/user/:user_id/broadcast/:id",authenticatePenghuni, updateBroadcast);
router.delete("/user/:user_id/broadcast/:id",authenticatePenghuni, deleteBroadcast);

// emergency
router.post("/user/emergency/:user_id",authenticatePenghuni, emergency);

// midtrans 
router.post("/user/payment/tokenizer",authenticatePenghuni, tokenizer);
router.get("/user/payment/check-status/:orderId",authenticatePenghuni, checkTransaksi);

module.exports = router;
