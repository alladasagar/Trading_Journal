import axios from "axios";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://trading-journal-zv1a.onrender.com";

export const addPremarket = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/addpremarket`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: "Failed to save premarket" };
  }
};

export const fetchPremarket = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/getpremarket`);
    return response.data; 
  } catch (error) {
    return []; 
  }
};


export const getPremarketById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/getpremarket/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: "Failed to fetch premarket by ID" };
  }
};

// Update premarket
export const updatePremarket = async (id, updatedData) => {
    try {
        const response = await axios.put(`${BASE_URL}/updatepremarket/${id}`, updatedData);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

export const deletePremarket = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/deletepremarket/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const fetchPremarketPlans = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/getpremarketplans`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: "Failed to fetch premarket plans" };
  }
  
}
