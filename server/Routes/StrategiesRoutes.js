// backend/Routes/StrategiesRoutes.js
import express from "express";
import Strategy from "../Models/Strategy.js";
import Trade from "../Models/Trade.js";

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
      res.status(201).json(strategy);
    } catch (err) {
      res.status(500).json({ error: "Error updating strategy" });
    }
  })
 .delete(async (req, res) => {
  try {
    const strategyId = req.params.id;

    // Delete the strategy
    await Strategy.findByIdAndDelete(strategyId);

    // Delete all trades that reference this strategy
    await Trade.deleteMany({ strategyId: strategyId });

    res.status(200).json({ message: "Strategy and associated trades deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete strategy and associated trades" });
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
