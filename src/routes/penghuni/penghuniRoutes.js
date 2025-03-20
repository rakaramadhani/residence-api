const express = require('express');
const { authenticatePenghuni } = require("../../middleware/authPenghuni");
const {
    getFamilyData,
    createFamilyData,
    updateFamilyData,
    deleteFamilyData
} = require("../../controllers/penghuni/dataKeluargaController");

const router = express.Router();

router.get('/user/:user_id/data-keluarga', authenticatePenghuni, getFamilyData);
router.post('/user/:user_id/data-keluarga', authenticatePenghuni, createFamilyData);
router.put('/user/:user_id/data-keluarga/:family_id', authenticatePenghuni, updateFamilyData);
router.delete('/user/:user_id/data-keluarga/:family_id', authenticatePenghuni, deleteFamilyData);

module.exports = router;
