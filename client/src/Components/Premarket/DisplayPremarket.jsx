import React, { useEffect, useState } from "react";
import { fetchPremarket, deletePremarket } from "../../Apis/Premarket";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import ConfirmModal from "../ui/ConfirmModal";
import Loader from "../ui/Loader"; // <-- import Loader

const DisplayPremarket = () => {
  const [premarkets, setPremarkets] = useState([]);
  const [loading, setLoading] = useState(false); // <-- loading state added
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [premarketToDelete, setPremarketToDelete] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadPremarkets = async () => {
    setLoading(true); // <-- start loading
    try {
      const data = await fetchPremarket();
      if (Array.isArray(data)) {
        setPremarkets(data);
      } else {
        addToast("Failed to fetch valid premarket data", "error");
      }
    } catch (error) {
      console.error("Error fetching premarket data:", error);
      addToast("Error loading premarket data", "error");
    } finally {
      setLoading(false); // <-- stop loading
    }
  };

  const confirmDeletePremarket = (id) => {
    setPremarketToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const res = await deletePremarket(premarketToDelete);
      setIsConfirmOpen(false);
      setPremarketToDelete(null);

      if (res.success) {
        addToast("Premarket entry deleted successfully", "success");
        loadPremarkets();
      } else {
        addToast("Failed to delete premarket entry", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      addToast("Error deleting premarket entry", "error");
    }
  };

  useEffect(() => {
    loadPremarkets();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
      {premarkets.length === 0 ? (
        <p className="text-gray-300 text-center">No premarket notes available</p>
      ) : (
        premarkets.map((item) => (
          <div
            key={item._id}
            className="border border-gray-600 p-4 rounded text-white shadow-sm hover:shadow-md transition-shadow bg-gray-800"
          >
            <h2 className="text-lg sm:text-xl font-bold text-[#27c284] mb-1">
              {item.day.charAt(0).toUpperCase() + item.day.slice(1)} - {item.date}
            </h2>
            <p className="text-sm sm:text-base">
              <strong>Expected Movement:</strong> {item.expected_movement}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Note:</strong> {item.note}
            </p>

            <div className="flex gap-4 mt-3 text-sm sm:text-base">
              <button
                onClick={() => navigate(`/edit-premarket/${item._id}`)}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FiEdit className="text-lg" />
                Edit
              </button>
              <button
                onClick={() => confirmDeletePremarket(item._id)}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <FiTrash2 className="text-lg" />
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPremarketToDelete(null);
        }}
        onConfirm={handleDeleteConfirmed}
        title="Delete Premarket Note?"
        message="Are you sure you want to delete this premarket note? This action cannot be undone."
      />
    </div>
  );
};

export default DisplayPremarket;
