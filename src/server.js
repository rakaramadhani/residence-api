const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.json())


const adminAuthRoutes = require("./routes/adminAuthRoutes");

app.use("/api", adminAuthRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});