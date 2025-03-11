const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.json())


const adminAuthRoutes = require("./routes/adminAuthRoutes");
const userAuthRoutes = require("./routes/penghuniAuthRoutes");

app.use("/api", adminAuthRoutes);
app.use("/api",userAuthRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});