// models/trade.model.js
const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  strategy_id: { type: mongoose.Schema.Types.ObjectId, ref: "Strategy", required: true },
  side: { type: String, enum: ["buy", "sell"], required: true },
  entry: { type: Number, required: true },
  exit: { type: Number, required: true },
  stop_loss: { type: Number, required: true },
  shares: { type: Number, required: true },
  charges: { type: Number, required: true },
  target: { type: Number },
  notes: { type: String },
  day: { type: String, required: true },
  time: { type: String },
  entry_date: { type: Date, required: true },
  exit_date: { type: Date },
  duration: { type: String },
  screenshot: { type: String },
  mistakes: [{ type: String }],
  emojis: [{ type: String }],
  // Calculated fields
  capital: { type: Number },
  gross_pnl: { type: Number },
  net_pnl: { type: Number },
  percent_pnl: { type: Number },
  roi: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Trade", tradeSchema);
