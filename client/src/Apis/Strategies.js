// src/Apis/Strategies.js
import axios from "axios";

// const BASE_URL = "http://localhost:5000"; // Or use import.meta.env.VITE_API_URL
const BASE_URL = "https://trading-journal-pi.vercel.app";

// ✅ Add a new strategy
export const addStrategy = async (strategyName, entryRules, exitRules) => {
  try {
    const response = await axios.post(`${BASE_URL}/addstrategy`, {
      name: strategyName,
      entry_rules: entryRules,
      exit_rules: exitRules,
    });
    return {
      status: response.status,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Strategy add error:", error.response?.data || error.message);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Server error",
    };
  }
};

// ✅ Fetch all strategies
export const fetchStrategies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/strategies`);
    console.log("API Response:", response.data);
    return { success: true, data: response.data.strategies };
  } catch (error) {
    console.error("Error fetching strategies:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.error || "Failed to load strategies" 
    };
  }
};

// ✅ Delete a strategy by ID
export const deleteStrategy = async (strategyId) => {
  try {
    await axios.delete(`${BASE_URL}/strategies/${strategyId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, message: "Failed to delete strategy" };
  }
};

export const getStrategyById = async (id) => {
    try {
        const res = await axios.get(`${BASE_URL}/strategies/${id}`); 
        return { success: true, data: res.data };
    } catch (error) {
        return { success: false };
    }
};



export const updateStrategy = async (id, updatedData) => {
  try {
    const response = await axios.put(`${BASE_URL}/strategies/${id}`, updatedData);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error("Update strategy error:", error);
    return { status: 500, message: "Failed to update strategy" };
  }
};
