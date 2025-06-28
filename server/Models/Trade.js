// models/trade.model.js
import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  name: { type: String },
  strategyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Strategy"
  },
  side: { 
    type: String, 
    enum: ["Short", "Long"]
  },
  entry: { 
    type: Number,
    set: v => parseFloat(v.toFixed(2))
  },
  exit: { 
    type: Number,
    set: v => v ? parseFloat(v.toFixed(2)) : null
  },
  stop_loss: { 
    type: Number,
    set: v => parseFloat(v.toFixed(2))
  },
  shares: { 
    type: Number,
    set: v => parseFloat(v.toFixed(2))
  },
  charges: { 
    type: Number,
    set: v => parseFloat(v.toFixed(2))
  },
  target: { 
    type: Number,
    set: v => v ? parseFloat(v.toFixed(2)) : null
  },
  notes: { type: String },
  day: { type: String },
  time: { type: String },
  entry_date: { type: Date },
  exit_date: { type: Date },
  duration: { type: String },
  screenshots: {
    type: [String], // Array of strings (URLs)
    default: []
  },
  mistakes: [{ type: String }],
  emojis: { type: String },
  // Strategy rules at time of trade creation
  entry_rules: [{ 
    type: String,
    default: []
  }],
  exit_rules: [{ 
    type: String,
    default: []
  }],
  // Calculated fields
  capital: { 
    type: Number,
    set: v => parseFloat(v.toFixed(2))
  },
  gross_pnl: { 
    type: Number,
    set: v => parseFloat(v.toFixed(2))
  },
  net_pnl: { 
    type: Number,
    set: v => parseFloat(v.toFixed(2))
  },
  percent_pnl: { 
    type: Number,
    set: v => parseFloat(v.toFixed(2))
  },
  roi: { 
    type: Number,
    set: v => parseFloat(v.toFixed(2))
  },
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Round numbers when converting to JSON
      const numberFields = [
        'entry', 'exit', 'stop_loss', 'shares', 'charges', 'target',
        'capital', 'gross_pnl', 'net_pnl', 'percent_pnl', 'roi'
      ];
      
      numberFields.forEach(field => {
        if (ret[field] !== undefined && ret[field] !== null) {
          ret[field] = parseFloat(ret[field].toFixed(2));
        }
      });
      return ret;
    }
  }
});

export default mongoose.model("Trade", tradeSchema);