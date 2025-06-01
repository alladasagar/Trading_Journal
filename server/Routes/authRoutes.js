// authRoutes.js
import express from "express";
import bcrypt from "bcryptjs"; // ✅ bcryptjs
import User from "../Models/User.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  console.log("Backend reached data:", req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
