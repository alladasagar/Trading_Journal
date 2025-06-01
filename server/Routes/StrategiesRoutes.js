// backend/Routes/StrategiesRoutes.js
import express from "express";
import Strategy from "../Models/Strategy.js";

const router = express.Router();


// Use consistent base path for all strategy routes
router.route('/strategies')
  .get(async (req, res) => { 
    try {
      console.log("Request Reached to backend");
      const strategies = await Strategy.find();
      console.log("Backend response:", strategies);
      res.status(200).json({ strategies });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
  .post(async (req, res) => { 
    try {
      const strategy = new Strategy(req.body);
      await strategy.save();
      res.status(201).json({ message: "Strategy created successfully", strategy });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

router.route('/strategies/:id')
  .get(async (req, res) => { 
    try {
      const strategy = await Strategy.findById(req.params.id);
      res.status(200).json(strategy);
    } catch (err) {
      res.status(500).json({ error: "Error fetching strategy" });
    }
  })
  .put(async (req, res) => { 
    try {
      const strategy = await Strategy.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true }
      );
      res.status(200).json(strategy);
    } catch (err) {
      res.status(500).json({ error: "Error updating strategy" });
    }
  })
  .delete(async (req, res) => { 
    try {
      await Strategy.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Strategy deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete strategy" });
    }
  });

  router.post('/addstrategy', async (req, res) => {
  try {
    const strategy = new Strategy(req.body);
    await strategy.save();
    res.status(201).json({ message: "Strategy created successfully", strategy });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
