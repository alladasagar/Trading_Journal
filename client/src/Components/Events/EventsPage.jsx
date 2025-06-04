import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEvents, deleteEvent } from "../../Apis/Events";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../ui/ConfirmModal"; //  Import the ConfirmModal component

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Fetch events on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const res = await fetchEvents();
        if (res.success) {
          setEvents(res.events || []);
        } else {
          addToast(res.message || "Failed to fetch events", "error");
        }
      } catch (error) {
        addToast("Error fetching events", "error");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [addToast]);

  // Handle delete confirmation
  const handleDeleteClick = (id) => {
    setEventToDelete(id);
    setShowDeleteModal(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    try {
      const res = await deleteEvent(eventToDelete);
      if (res.success) {
        setEvents(events.filter((event) => event._id !== eventToDelete));
        addToast("Event deleted successfully", "success");
      } else {
        addToast(res.message || "Failed to delete event", "error");
      }
    } catch (error) {
      addToast("Error deleting event", "error");
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  // Render loading
  if (loading) return <div className="text-center py-8">Loading events...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Events</h2>
        <button
          onClick={() => navigate("/events/addEvent")}
          className="bg-[#27c284] text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No events found. Click "Add Event" to create one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="py-3 px-4">{event.name}</td>
                  <td className="py-3 px-4">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/events/${event._id}/edit`)}
                        className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(event._id)}
                        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
};

export default EventsPage;