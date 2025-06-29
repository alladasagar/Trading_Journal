import axios from "axios";
import { data } from "react-router-dom";

const BASE_URL = "https://trading-journal-zv1a.onrender.com";

//Api for fetch All Events
export const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/events`);
      return { 
        success: true, 
        data: Array.isArray(response.data.events) ? response.data.events : [] 
      };
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
};

//Api for Add New Event
export const addEvent = async (data) => {
    try {
        console.log("api received data:", data);
        const response = await axios.post(`${BASE_URL}/events/addEvent`, data);
        return {success:true , data:response.data};
    } catch (error) {
        console.error("Error adding event:", error);
        return {success:false,data:null};
    }
    
}

//Api For Delete Event
export const deleteEvent = async (eventId) => {
  try {
    const res = await axios.delete(`${BASE_URL}/events/${eventId}`);
    return {success:true,data:res.data};
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, message: "Failed to delete event" }
  }
};

//Api Update Event
export const updateEvent = async (eventId, eventData) => {
  try {
    const res = await axios.put(`${BASE_URL}/events/${eventId}`, eventData);
    return {success:true,data:res.data};
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, message: "Failed to update event" }
  }
};

//Api for Ferch event by id 
export const fetchEventById = async (eventId) => {
  console.log("request received for fetch event with id", eventId);
  try {
    const response = await axios.get(`${BASE_URL}/events/${eventId}`);
    return {
      success: response.data.success,
      message: response.data.message || '',
      event: response.data.event || null  
    };
  } catch (error) {
    return { 
      success: false,
      message: error.response?.data?.message || "Failed to fetch event",
      event: null
    };
  }
};


