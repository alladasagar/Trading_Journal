import express from "express";

import Trade from "../Models/Trade.js";
import Strategy from "../Models/Strategy.js";
import dayjs from "dayjs";

const router = express.Router();
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
    const wins = trades.filter(t => t.net_pnl > 0).length;

    strategy.net_pnl = trades.reduce((sum, t) => sum + t.net_pnl, 0);
    strategy.win_rate = +((wins / trades.length) * 100).toFixed(2);
    strategy.max_win = Math.max(...trades.map(t => t.net_pnl));
    strategy.max_loss = Math.min(...trades.map(t => t.net_pnl));
    strategy.number_of_trades = trades.length;
    strategy.trades = trades.map(t => t._id); 
  }

  await strategy.save();
};

//  Add Trade
router.post("/strategy/:strategyId/trades", async (req, res) => {
  const { strategyId } = req.params;
  let tradeData = req.body;

  try {
    const strategy = await Strategy.findById(strategyId);
    if (!strategy) {
      return res.status(404).json({ success: false, message: "Strategy not found" });
    }
    if (!tradeData.day || tradeData.day.trim() === "") {
      return res.status(400).json({ success: false, message: "Field 'day' is required" });
    }

    const normalizedTrade = {
      ...tradeData,
      screenshots: Array.isArray(tradeData.screenshots) ? tradeData.screenshots : [],
      entry_rules: Array.isArray(tradeData.entry_rules) ? tradeData.entry_rules : [],
      exit_rules: Array.isArray(tradeData.exit_rules) ? tradeData.exit_rules : []
    };

    console.log("Processing trade with screenshots:", {
      screenshotCount: normalizedTrade.screenshots.length,
      firstScreenshot: normalizedTrade.screenshots[0] || 'none'
    });

    const newTrade = new Trade({
      name: normalizedTrade.name,
      strategyId,
      side: normalizedTrade.side,
      entry: normalizedTrade.entry,
      exit: normalizedTrade.exit,
      stop_loss: normalizedTrade.stop_loss,
      shares: normalizedTrade.shares,
      charges: normalizedTrade.charges,
      target: normalizedTrade.target,
      notes: normalizedTrade.notes,
      day: normalizedTrade.day,
      time: normalizedTrade.time,
      entry_date: new Date(normalizedTrade.entry_date),
      exit_date: normalizedTrade.exit_date ? new Date(normalizedTrade.exit_date) : null,
      duration: normalizedTrade.duration,
      screenshots: normalizedTrade.screenshots,
      mistakes: normalizedTrade.mistakes || [],
      emojis: normalizedTrade.emojis || '',
      entry_rules: normalizedTrade.entry_rules,
      exit_rules: normalizedTrade.exit_rules,
      capital: normalizedTrade.capital,
      gross_pnl: normalizedTrade.gross_pnl,
      net_pnl: normalizedTrade.net_pnl,
      percent_pnl: normalizedTrade.percent_pnl,
      roi: normalizedTrade.roi
    });

    const savedTrade = await newTrade.save();
    console.log("Saved trade screenshots:", savedTrade.screenshots);

    await updateStrategyStats(strategyId);

    return res.status(201).json({
      success: true,
      message: "Trade added successfully",
      data: savedTrade
    });

  } catch (error) {
    console.error("Error adding trade:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// ✏️ Update Trade
router.put('/trades/:id', async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    const fieldsToUpdate = [
      'name', 'side', 'entry', 'exit', 'stop_loss', 'target', 'shares',
      'charges', 'notes', 'day', 'time', 'entry_date', 'exit_date',
      'duration', 'screenshots', 'mistakes', 'emojis', 'entry_rules',
      'exit_rules', 'capital', 'gross_pnl', 'net_pnl', 'percent_pnl', 'roi'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        trade[field] = req.body[field];
      }
    });

    await trade.save();
    await updateStrategyStats(trade.strategyId);

    res.json({ success: true, trade });
  } catch (error) {
    console.error("Error updating trade:", error);
    res.status(500).json({ success: false, message: 'Failed to update trade' });
  }
});


//  Delete Trade
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

//  Get all trades for strategy
router.get("/strategies/:strategyId/trades", async (req, res) => {
  const { strategyId } = req.params;

  try {
    const trades = await Trade.find(
      { strategyId },
      {
        name: 1,
        entry_date: 1,
        day: 1,
        side: 1,
        net_pnl: 1,
        percent_pnl: 1,
        roi: 1,
        emojis: 1,
        leverage: 1,
        notes: 1,
        _id: 1, // keep _id for React key
      }
    ).lean();

    const formatted = trades.map((t) => ({
      _id: t._id,
      name: t.name,
      date: t.entry_date,
      day: t.day,
      side: t.side,
      net_pnl: t.net_pnl,
      percent_pnl: t.percent_pnl,
      roi: t.roi,
      emoji: t.emojis,
      leverage: t.leverage || "—",
      note: t.notes || "",
    }));

    return res.status(200).json({
      success: true,
      message: "Trades fetched successfully",
      trades: formatted,
    });
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trades",
    });
  }
});

//  Get a single trade
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


router.get("/trades", async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    let query = {};
    let start, end;

    if (startDate && endDate) {
      start = dayjs(startDate).startOf("day").toDate();
      end = dayjs(endDate).endOf("day").toDate();

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: "startDate cannot be after endDate",
        });
      }

      query.entry_date = { $gte: start, $lte: end };
    } else {
      const oneMonthAgo = dayjs().subtract(1, "month").startOf("day").toDate();
      query.entry_date = { $gte: oneMonthAgo };
    }

    const trades = await Trade.find(query, {
      entry_date: 1,
      net_pnl: 1,
      _id: 0,
    }).sort({ entry_date: 1 }).lean(); 

    res.json({
      success: true,
      trades,
    });
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trades",
      error: error.message,
    });
  }
});


export default router;
