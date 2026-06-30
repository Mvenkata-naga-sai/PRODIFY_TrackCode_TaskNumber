const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

const { verifyToken, authorizeRole } = require("./middleware/authMiddleware");

// Protected route
app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({ msg: "Welcome to dashboard", user: req.user });
});

// Admin route (RBAC)
app.get("/api/admin", verifyToken, authorizeRole("admin"), (req, res) => {
  res.json({ msg: "Admin access granted" });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);