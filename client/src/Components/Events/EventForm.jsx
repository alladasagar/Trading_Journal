import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addEvent, updateEvent, fetchEventById } from "../../Apis/Events";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  name: "",
  date: ""
};

const EventForm = ({ isEdit = false }) => {
  const { eventId } = useParams();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false); // Separate state for form submission loading
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Load event data if editing
  useEffect(() => {
    if (!isEdit || !eventId) return;

    const loadEvent = async () => {
      setLoading(true);
      try {
        const res = await fetchEventById(eventId);
        if (res.success) {
          setForm({
            name: res.event.name || "",
            date: res.event.date ? res.event.date.split("T")[0] : ""
          });
        } else {
          addToast(res.message || "Failed to load event", "error");
          navigate(-1);
        }
      } catch (error) {
        addToast("Error loading event", "error");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [isEdit, eventId, addToast, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      addToast("Event name is required", "error");
      return false;
    }
    if (!form.date) {
      addToast("Event date is required", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true); // Set form submission loading state
    try {
      let res;
      if (isEdit) {
        res = await updateEvent(eventId, form);
      } else {
        res = await addEvent(form);
      }

      if (res.success) {
        addToast(`Event ${isEdit ? "updated" : "added"} successfully`, "success");
        navigate("/events");
      } else {
        addToast(res.message || "Operation failed", "error");
      }
    } catch (error) {
      addToast("Error submitting form", "error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-[#27c284]">
          {isEdit ? "Edit Event" : "Create Event"}
        </h2>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Event Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-[#27c284] focus:ring-1 focus:ring-[#27c284] outline-none transition"
            placeholder="Enter event name"
            required
            disabled={loading} // Disable during initial load
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Date *</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-[#27c284] focus:ring-1 focus:ring-[#27c284] outline-none transition"
            required
            disabled={loading} // Disable during initial load
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || formLoading} // Disable during both initial load and form submission
            className="w-full bg-[#27c284] hover:bg-[#1fa769] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer"
          >
            {formLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEdit ? "Update Event" : "Create Event"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;