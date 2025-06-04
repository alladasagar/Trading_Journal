import axios from "axios";

const BASE_URL = "http://localhost:5000";

// Add a trade for a given strategy ID
export const addTrade = async (strategyId, data) => {
  try {
    const res = await axios.post(`${BASE_URL}/strategy/${strategyId}/trades`, data);
    return res.data;
  } catch (error) {
    console.error("API error in addTrade:", error);
    return { success: false, message: error.message };
  }
};

// Fetch all trades for a strategy
export const fetchTradesByStrategy = async (strategyId) => {
  try {
    const res = await axios.get(`${BASE_URL}/strategies/${strategyId}/trades`);
    return res.data;
  } catch (error) {
    return { success: false, message: "Something went wrong while fetching trades" };
  }
};

// Fetch trade by ID
export const fetchTradeById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/trades/${id}`);
    return res.data;
  } catch (error) {
    return { success: false, message: "Error fetching trade" };
  }
};


// Update trade by ID
export const updateTrade = async (tradeId, tradeData) => {
  try {
    const res = await axios.put(`${BASE_URL}/trades/${tradeId}`, tradeData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating trade:", error);
    return { success: false, message: "Failed to update trade" };
  }
};

// Delete trade by ID
export const deleteTrade = async (tradeId) => {
  try {
    const res = await axios.delete(`${BASE_URL}/trades/${tradeId}`, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting trade:", error);
    return { success: false, message: "Failed to delete trade" };
  }
};
