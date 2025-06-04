import express from "express";
const router = express.Router();
import Trade from "../Models/Trade.js";
import Strategy from "../Models/Strategy.js";

// Utility to update strategy stats
const updateStrategyStats = async (strategyId) => {
  const strategy = await Strategy.findById(strategyId).populate("trades");
  if (!strategy) return;

  const trades = await Trade.find({ strategyId });

  if (trades.length === 0) {
    strategy.net_pnl = 0;
    strategy.win_rate = 0;
    strategy.max_win = 0;
    strategy.max_loss = 0;
    strategy.number_of_trades = 0;
  } else {
    const totalNetPnl = trades.reduce((sum, t) => sum + t.net_pnl, 0);
    const wins = trades.filter(t => t.net_pnl > 0).length;

    strategy.net_pnl = +(totalNetPnl / trades.length).toFixed(2);
    strategy.win_rate = +((wins / trades.length) * 100).toFixed(2);
    strategy.max_win = Math.max(...trades.map(t => t.net_pnl));
    strategy.max_loss = Math.min(...trades.map(t => t.net_pnl));
    strategy.number_of_trades = trades.length;
    strategy.trades = trades.map(t => t._id); // Sync trade list
  }

  await strategy.save();
};

// ✅ Add Trade
router.post("/strategy/:strategyId/trades", async (req, res) => {
  const { strategyId } = req.params;
  const tradeData = req.body;

  try {
    const strategy = await Strategy.findById(strategyId);
    if (!strategy) {
      return res.status(404).json({ success: false, message: "Strategy not found" });
    }

    if (!tradeData.day || tradeData.day.trim() === "") {
      return res.status(400).json({ success: false, message: "Field 'day' is required" });
    }

    const newTrade = new Trade({
      ...tradeData,
      strategyId,
      entry_date: new Date(tradeData.entry_date),
      exit_date: tradeData.exit_date ? new Date(tradeData.exit_date) : null
    });

    await newTrade.save();

    // Update strategy
    await updateStrategyStats(strategyId);

    res.status(201).json({
      success: true,
      message: "Trade added successfully",
      data: newTrade
    });
  } catch (error) {
    console.error("Error adding trade:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✏️ Update Trade
router.put('/trades/:id', async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    // Update fields
    Object.assign(trade, req.body);
    await trade.save();

    await updateStrategyStats(trade.strategyId);

    res.json({ success: true, trade });
  } catch (error) {
    console.error("Error updating trade:", error);
    res.status(500).json({ success: false, message: 'Failed to update trade' });
  }
});

// ❌ Delete Trade
router.delete('/trades/:id', async (req, res) => {
  try {
    const trade = await Trade.findByIdAndDelete(req.params.id);
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    await updateStrategyStats(trade.strategyId);

    res.json({ success: true, message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('Error deleting trade:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📥 Get all trades for strategy
router.get("/strategies/:strategyId/trades", async (req, res) => {
  const { strategyId } = req.params;

  try {
    const strategy = await Strategy.findById(strategyId).populate("trades");
    if (!strategy) {
      return res.status(404).json({ success: false, message: "Strategy not found" });
    }

    res.status(200).json({
      success: true,
      message: "Trades fetched successfully",
      trades: strategy.trades,
    });
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch trades",
    });
  }
});

// 📥 Get a single trade
router.get("/trades/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Request recievd to backend with trade id:", id, "id")
    const trade = await Trade.findById(id).populate("strategyId");

    if (!trade) {
      return res.status(404).json({ success: false, message: "Trade not found" });
    }

    res.status(200).json({
      success: true,
      message: "Trade fetched successfully",
      trade,
    });
  } catch (error) {
    console.error("Error fetching trade:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch trade"
    });
  }
});

export default router;
