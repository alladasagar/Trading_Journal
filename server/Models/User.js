// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./db.js";
import authRoutes from "./Routes/authRoutes.js";
import strategyRoutes from "./Routes/StrategiesRoutes.js";
import premarketRoutes from "./Routes/PremarketRoutes.js";
import tradeRoutes from "./Routes/tradeRoutes.js";
import EventRoutes from "./Routes/EventRoutes.js";
import User from "./Models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://trading-journal-pi.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

app.use("/", authRoutes);
app.use("/", strategyRoutes);
app.use("/", premarketRoutes);
app.use("/", tradeRoutes);
app.use("/", EventRoutes);
app.use("/trades", tradeRoutes);

// ✅ Create predefined user after DB connection
const createPredefinedUser = async () => {
  try {
    const existingUser = await User.findOne({ email: "admin@example.com" });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const newUser = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
      });
      await newUser.save();
      console.log("✅ Predefined user created");
    } else {
      console.log("ℹ️ Predefined user already exists");
    }
  } catch (error) {
    console.error("❌ Error creating predefined user:", error);
  }
};

mongoose.connection.once("open", () => {
  createPredefinedUser();
});

app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
