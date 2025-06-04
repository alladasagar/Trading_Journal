// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";
import authRoutes from "./Routes/authRoutes.js";
import strategyRoutes from "./Routes/StrategiesRoutes.js";
import premarketRoutes from "./Routes/PremarketRoutes.js";
import tradeRoutes from "./Routes/tradeRoutes.js"

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173", // your frontend origin
  credentials: true
}));
app.use(express.json());

app.use("/", authRoutes);
app.use("/", strategyRoutes); // ✅ Add this line
app.use("/", premarketRoutes);
app.use("/",tradeRoutes);

app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
