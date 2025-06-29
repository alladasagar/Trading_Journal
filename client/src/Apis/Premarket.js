import axios from "axios";

const BASE_URL = "https://trading-journal-zv1a.onrender.com";

//Add premarket
export const addPremarket = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/addpremarket`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: "Failed to save premarket" };
  }
};

//fetch Premarket

 export const fetchPremarket = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/getpremarket`);
    return {success: true,data: response.data};
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch premarket data",
      data: []
    };
  }
};

// get Premarket details by id

export const getPremarketById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/getpremarket/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: "Failed to fetch premarket by ID" };
  }
};

//update the premarket
export const updatePremarket = async (id, updatedData) => {
    try {
        const response = await axios.put(`${BASE_URL}/updatepremarket/${id}`, updatedData);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

//delete the premarket
export const deletePremarket = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/deletepremarket/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};


