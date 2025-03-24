const express = require("express");
const { authenticatePenghuni } = require("../../middleware/authPenghuni");
const router = express.Router();
const {emergency} = require("../../controllers/penghuni/emergencyController");

const {
  getFamilyData,
  createFamilyData,
  updateFamilyData,
  deleteFamilyData,
} = require("../../controllers/penghuni/dataKeluargaController");

const {
  getKendala,
  createKendala,
  updateKendala,
  deleteKendala,
} = require("../../controllers/penghuni/kendalaController");

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

// kendala
router.get("/user/:user_id/kendala", authenticatePenghuni, getKendala);
router.post("/user/:user_id/kendala", authenticatePenghuni, createKendala);
router.put("/user/:user_id/kendala/:id", authenticatePenghuni, updateKendala);
router.delete("/user/:user_id/kendala/:id",authenticatePenghuni,deleteKendala);

// Broadcast
router.get("/user/broadcast", authenticatePenghuni, getAllBroadcast);
router.get("/user/:user_id/broadcast", authenticatePenghuni, getBroadcast);
router.post("/user/:user_id/broadcast",authenticatePenghuni, createBroadcast);
router.put("/user/:user_id/broadcast/:id",authenticatePenghuni, updateBroadcast);
router.delete("/user/:user_id/broadcast/:id",authenticatePenghuni, deleteBroadcast);

// emergency
router.post("/user/emergency/:user_id",authenticatePenghuni, emergency);

module.exports = router;
