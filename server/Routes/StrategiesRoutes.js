// backend/Routes/StrategiesRoutes.js
import express from "express";
import Strategy from "../Models/Strategy.js";
import Trade from "../Models/Trade.js";

const router = express.Router();

// fetch all trades
router.get('/strategies', async (req, res) => {
  try {
    console.log("Request Reached to backend");
    const strategies = await Strategy.find(
      {},
      {
        name: 1,
        win_rate: 1,
        net_pnl: 1,
        max_win: 1,
        max_loss: 1,
        number_of_trades: 1
      }
    ).lean();

    console.log("Backend response:", strategies);
    res.status(200).json({ strategies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// creates a new strategy

router.post('/strategies', async (req, res) => {
  try {
    const strategy = new Strategy(req.body);
    await strategy.save();
    res.status(201).json({ message: "Strategy created successfully", strategy });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//fetch strategy by ID

router.get('/strategies/:id', async (req, res) => {
  try {
    const strategy = await Strategy.findById(req.params.id);
    res.status(200).json(strategy);
  } catch (err) {
    res.status(500).json({ error: "Error fetching strategy" });
  }
});

//update strategy

router.put('/strategies/:id', async (req, res) => {
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
});

//delete strategy
router.delete('/strategies/:id', async (req, res) => {
  try {
    const strategyId = req.params.id;

    await Strategy.findByIdAndDelete(strategyId);
    await Trade.deleteMany({ strategyId });

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
