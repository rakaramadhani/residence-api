const express = require('express');
const {createClient} = require('@supabase/supabase-js')
const dotenv = require('dotenv');
dotenv.config();
const  cors = require('cors')
const app = express();
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
const userAuthRoutes = require("./routes/penghuni/penghuniAuthRoutes");
const userRoutes = require("./routes/penghuni/penghuniRoutes");

const supabase = createClient(
  "https://lrubxwgdcidlxqyjjbsk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydWJ4d2dkY2lkbHhxeWpqYnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NDM2MzIsImV4cCI6MjA1NzIxOTYzMn0.Tos7GIZdn21TnuVo93PjAj9VImuJHqKWrGEAEX2lTqw"
);

app.use(express.json())
app.use(cors())


app.use("/api", adminAuthRoutes);
app.use("/api",userAuthRoutes);
app.use("/api",userRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});