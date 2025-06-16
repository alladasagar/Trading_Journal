import axios from "axios";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://trading-journal-zv1a.onrender.com";

export const fetchEvents = async () => {
    try {
      console.log("EventsRequest received to Api and sent to backend");
        const response = await axios.get(`${BASE_URL}/events`);
        return response.data;
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
};

export const addEvent = async (data) => {
    try {
        console.log("api received data:", data);
        const response = await axios.post(`${BASE_URL}/events/addEvent`, data);
        return response.data;
    } catch (error) {
        console.error("Error adding event:", error);
        return null;
    }
    
}

export const deleteEvent = async (eventId) => {
  try {
    const res = await axios.delete(`${BASE_URL}/events/${eventId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, message: "Failed to delete event" }
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const res = await axios.put(`${BASE_URL}/events/${eventId}`, eventData);
    return res.data;
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, message: "Failed to update event" }
  }
};

export const fetchEventById = async (eventId) => {
  try {
    const res = await axios.get(`${BASE_URL}/events/${eventId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    return { success: false, message: "Failed to fetch event" }
  }
};


