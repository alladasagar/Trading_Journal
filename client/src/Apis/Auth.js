import axios from "axios";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://trading-journal-pi.vercel.app";

export const login = async (data) => {
  console.log("Api reached data:", data);
  try {
    const response = await axios.post(`${BASE_URL}/login`, data);
    return {
      status: response.status,
      message: response.data.message,
      token: response.data.token, // ✅ return token
    };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    return {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Server error",
    };
  }
};

