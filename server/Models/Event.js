import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  }
});

//Indexing date to fetch quickly
EventSchema.index({ date: 1 });

export default mongoose.model('Event', EventSchema);
