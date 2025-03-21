const express = require("express");
const { authenticatePenghuni } = require("../../middleware/authPenghuni");
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
const router = express.Router();

// data keluarga
router.get("/user/:user_id/data-keluarga", authenticatePenghuni, getFamilyData);
router.post(
  "/user/:user_id/data-keluarga",
  authenticatePenghuni,
  createFamilyData
);
router.put(
  "/user/:user_id/data-keluarga/:family_id",
  authenticatePenghuni,
  updateFamilyData
);
router.delete(
  "/user/:user_id/data-keluarga/:family_id",
  authenticatePenghuni,
  deleteFamilyData
);

// kendala
router.get("/user/:user_id/kendala", authenticatePenghuni, getKendala);
router.post("/user/kendala",authenticatePenghuni, createKendala);
router.put("/user/:user_id/kendala/:kendala_id",authenticatePenghuni, updateKendala);
router.delete("/user/:user_id/kendala/:kendala_id",authenticatePenghuni, deleteKendala);

module.exports = router;
