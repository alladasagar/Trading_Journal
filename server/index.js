// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./db.js";
import authRoutes from "./Routes/authRoutes.js";
import strategyRoutes from "./Routes/StrategiesRoutes.js";
import premarketRoutes from "./Routes/PremarketRoutes.js";
import tradeRoutes from "./Routes/tradeRoutes.js";
import EventRoutes from "./Routes/EventRoutes.js";
// import bcrypt from "bcryptjs";
// import User from "./Models/User.js"; // Adjust path if needed


dotenv.config();
connectDB();

// Create predefined user if not exists
// const createPredefinedUser = async () => {
//   const existingUser = await User.findOne({ email: "nallahimanth@gmail.com" });

//   if (!existingUser) {
//     const hashedPassword = await bcrypt.hash("Kuttna@1", 10);

//     const newUser = new User({
//       name: "Himanth Nalla",
//       email: "nallahimanth@gmail.com",
//       password: hashedPassword,
//     });

//     await newUser.save();
//     console.log("✅ Predefined user created: Himanth Nalla");
//   } else {
//     console.log("ℹ️ Predefined user already exists.");
//   }
// };

// createPredefinedUser().catch((err) =>
//   console.error("Error creating predefined user:", err)
// );

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",                      // Local Dev
  "https://trading-journal-pi.vercel.app",
  "https://trading-journal-zv1a.onrender.com",      // Production Vercel Frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security Headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/", authRoutes);
app.use("/", strategyRoutes); 
app.use("/", premarketRoutes);
app.use("/", tradeRoutes);
app.use("/", EventRoutes);
app.use('/trades', tradeRoutes);  // Optional duplicate? Consider removing

// Root Route

//uptime pinger automatic url hitter 
app.get("/ping", (req, res) => res.send("pong"));

app.get("/", (req, res) => {
  res.send("✅ Trading Journal Server is running...");
});

// Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
);
