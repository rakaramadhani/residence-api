const express = require('express');

const dotenv = require('dotenv');
dotenv.config();
const  cors = require('cors')
const app = express();

app.use(express.json())
app.use(cors())

const adminAuthRoutes = require("./routes/adminAuthRoutes");
const userAuthRoutes = require("./routes/penghuni/penghuniAuthRoutes");
const userRoutes = require("./routes/penghuni/penghuniRoutes");

app.use("/api", adminAuthRoutes);
app.use("/api",userAuthRoutes);
app.use("/api",userRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});