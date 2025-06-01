import express from "express";
import Premarket from "../Models/Premarket.js";

const router = express.Router();

// Add or Edit Premarket
router.post('/addpremarket', async (req, res) => {
  try {
    const { id, day, date, expected_movement, note } = req.body;

    let premarket;
    if (id) {
      // Update
      premarket = await Premarket.findByIdAndUpdate(id, {
        day, date, expected_movement, note
      }, { new: true });
    } else {
      // Add
      premarket = new Premarket({ day, date, expected_movement, note });
      await premarket.save();
    }

    res.status(200).json(premarket);
  } catch (error) {
    console.error("Error saving premarket:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all premarket entries
router.get('/getpremarket', async (req, res) => {
  try {
    const all = await Premarket.find().sort({ createdAt: -1 });
    res.status(200).json(all);
  } catch (error) {
    res.status(500).json({ message: "Error fetching premarket data" });
  }
});

// Get single premarket entry
router.get('/getpremarket/:id', async (req, res) => {
    try {
        const entry = await Premarket.findById(req.params.id);
        res.status(200).json(entry);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch premarket" });
    }
});

// Update premarket entry
router.put('/updatepremarket/:id', async (req, res) => {
    try {
        await Premarket.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update premarket" });
    }
});

// Delete
router.delete('/deletepremarket/:id', async (req, res) => {
  try {
    await Premarket.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
