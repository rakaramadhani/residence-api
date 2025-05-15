// middleware/multer.js
const multer = require("multer");

const storage = multer.memoryStorage(); // simpan di RAM (bukan disk)
const upload = multer({ storage });

module.exports = upload;
