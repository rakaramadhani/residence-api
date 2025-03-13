const express =  require("express");
const { login, userDetails } = require("../controllers/penghuniAuthController");
const { authenticatePenghuni } = require("../middleware/authPenghuni");
const router = express.Router();

router.post("/login", login);
router.get("/user/profile", authenticatePenghuni, userDetails);

module.exports = router;