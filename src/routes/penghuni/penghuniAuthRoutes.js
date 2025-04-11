const express =  require("express");
const { login, userDetails , logout ,resetPassword,changePassword,updateDataUser, checkUsername} = require("../../controllers/penghuniAuthController");
const { authenticatePenghuni } = require("../../middleware/authPenghuni");
const router = express.Router();

// auth user
router.post("/login", login);
router.get("/user/profile", authenticatePenghuni, userDetails);
router.post("/logout", logout);
router.post("/reset-password", resetPassword); 
router.post("/change-password", changePassword); 
router.post("/check-username", checkUsername); 

// lengkapi data user
router.put("/user/profile/:user_id",authenticatePenghuni, updateDataUser);

module.exports = router;