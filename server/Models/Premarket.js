import mongoose from "mongoose"

const premarketSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
  },
  date: {
    type: String, // or use Date if you want to work with date objects
    required: true,
  },
  expected_movement: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
});

premarketSchema.index({ createdAt: -1 }); 
premarketSchema.index({ date: 1 });     
premarketSchema.index({ day: 1 }); 
export default mongoose.model("Premarket",premarketSchema)
