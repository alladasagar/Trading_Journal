import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchEvents, deleteEvent } from "../../Apis/Events";
import { useToast } from "../context/ToastContext";
import Loader from "../ui/Loader";
import ConfirmModal from "../ui/ConfirmModal";
import { FaEdit, FaTrash, FaPlus, FaEye } from "react-icons/fa";

// Cache object with methods to manage events cache
const createEventsCache = () => {
  let cache = {
    data: null,
    timestamp: null,
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
  };

  return {
    get: () => cache,
    set: (data) => {
      cache = {
        ...cache,
        data,
        timestamp: Date.now()
      };
    },
    isValid: () => {
      return cache.data && 
             cache.timestamp && 
             (Date.now() - cache.timestamp) < cache.CACHE_DURATION;
    },
    invalidate: () => {
      cache = {
        ...cache,
        data: null,
        timestamp: null
      };
    }
  };
};

const eventsCache = createEventsCache();

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // Memoized fetch function with caching
  const loadEvents = useCallback(async (forceRefresh = false) => {
    try {
      // Use cache if valid and not forcing refresh
      if (eventsCache.isValid() && !forceRefresh) {
        setEvents(eventsCache.get().data);
        return;
      }

      setLoading(true);
      const res = await fetchEvents();
      
      if (res.success) {
        const eventsData = res.events || [];
        setEvents(eventsData);
        eventsCache.set(eventsData);
      } else {
        addToast(res.message || "Failed to fetch events", "error");
      }
    } catch (error) {
      addToast("Error fetching events", "error");
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Handle initial load and cache invalidation from navigation state
  useEffect(() => {
    const loadData = async () => {
      if (location.state?.dataModified) {
        eventsCache.invalidate();
        await loadEvents(true);
        // Clear the state to prevent infinite refreshes
        navigate(location.pathname, { replace: true, state: {} });
      } else {
        await loadEvents();
      }
    };

    loadData();
  }, [loadEvents, location.state, location.pathname, navigate]);

  // Handle confirmed delete
  const handleConfirmDelete = useCallback(async () => {
    try {
      const res = await deleteEvent(eventToDelete);
      if (res.success) {
        // Optimistic UI update
        setEvents(prev => prev.filter(event => event._id !== eventToDelete));
        eventsCache.invalidate();
        addToast("Event deleted successfully", "success");
      } else {
        addToast(res.message || "Failed to delete event", "error");
        // Re-fetch to ensure consistency if delete failed
        loadEvents(true);
      }
    } catch (error) {
      addToast("Error deleting event", "error");
      console.error("Error deleting event:", error);
      loadEvents(true); // Re-fetch on error
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  }, [eventToDelete, addToast, loadEvents]);

  const handleEditEvent = (eventId) => {
    navigate(`/events/${eventId}`, { state: { fromList: true } });
  };

  const handleAddEvent = () => {
    navigate("/events/addEvent", { state: { fromList: true } });
  };

  // Render loading only when actually loading from server
  if (loading && !eventsCache.get().data) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Events</h2>
        <button
          onClick={handleAddEvent}
          className="bg-[#27c284] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <FaPlus size={16} /> Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          {loading ? "Loading events..." : "No events found. Click 'Add Event' to create one."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full bg-gray-800 text-white">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-750 transition-colors">
                  <td className="py-3 px-4">{event.name}</td>
                  <td className="py-3 px-4">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleEditEvent(event._id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit"
                        aria-label="Edit event"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEventToDelete(event._id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        title="Delete"
                        aria-label="Delete event"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
};

export default EventsPage;