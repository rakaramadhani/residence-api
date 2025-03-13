const express =  require("express");
const { login, userDetails , logout} = require("../controllers/penghuniAuthController");
const { authenticatePenghuni } = require("../middleware/authPenghuni");
const router = express.Router();

router.post("/login", login);
router.get("/user/profile", authenticatePenghuni, userDetails);

router.post("/logout", logout);

module.exports = router;