import mongoose from 'mongoose';

const strategySchema = new mongoose.Schema({
  name: { type: String, required: true },
  entry_rules: { type: [String], default: [] },
  exit_rules: { type: [String], default: [] },
  win_rate: { type: Number, default: 0.0 },
  net_pnl: { type: Number, default: 0.0 },
  max_win: { type: Number, default: 0.0 },
  max_loss: { type: Number, default: 0.0 },
  number_of_trades: { type: Number, default: 0 },
  trades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trade' }],  // Add this line
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Strategy', strategySchema);
