import axios from "axios";

const BASE_URL = "http://localhost:5000"; 4

// Add a trade for a given strategy ID
export const addTrade = async (strategyId, tradeData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/trades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ strategyId, ...tradeData }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, message: "Server error while adding trade" };
  }
};


export const fetchTradesByStrategy = async (strategyId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/strategies/${strategyId}/trades`);
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: "Something went wrong while fetching trades" };
  }
};
