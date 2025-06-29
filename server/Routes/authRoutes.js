// authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 
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
    const payload = {
      userId: user._id,
      email: user.email,
    };

    // Sign token
    const token = jwt.sign(payload,process.env.JWT_SECRET, { expiresIn: "2h" });

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
