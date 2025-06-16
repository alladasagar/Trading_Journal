import React, { memo, useState, useEffect } from "react";
import { deletePremarket, fetchPremarket } from "../../Apis/Premarket";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";
import ConfirmModal from "../ui/ConfirmModal";
import dayjs from "dayjs";

const DisplayPremarket = ({ onReload }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [premarketToDelete, setPremarketToDelete] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all premarket plans on component mount
  useEffect(() => {
    const fetchAllPlans = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPremarket();
        setPlans(data || []);
      } catch (error) {
        addToast("Failed to fetch premarket entries", "error");
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPlans();
  }, [addToast, onReload]);

  // Sort plans by date (newest first)
  const sortedPlans = [...plans].sort((a, b) => {
    return dayjs(b.date).isBefore(dayjs(a.date)) ? -1 : 1;
  });

  // Filter plans by date range
  // Filter plans by date range
const filteredPlans = dateRange.startDate && dateRange.endDate
  ? sortedPlans.filter(item => {
      const itemDate = dayjs(item.date);
      return (
        itemDate.isAfter(dayjs(dateRange.startDate).subtract(1, 'day')) && 
        itemDate.isBefore(dayjs(dateRange.endDate).add(1, 'day'))
      );
    })
  : sortedPlans;

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
        // Refetch all plans after deletion
        const data = await fetchPremarket();
        setPlans(data || []);
      } else {
        addToast("Failed to delete premarket entry", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      addToast("Error deleting premarket entry", "error");
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: "",
      endDate: ""
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-gray-300 mb-1 text-sm font-medium">
                  Start Date:
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  max={dateRange.endDate || dayjs().format("YYYY-MM-DD")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#27c284]"
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-gray-300 mb-1 text-sm font-medium">
                  End Date:
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  min={dateRange.startDate}
                  max={dayjs().format("YYYY-MM-DD")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#27c284]"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={clearDateFilter}
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition-colors h-[42px]"
                disabled={(!dateRange.startDate && !dateRange.endDate) || isLoading}
              >
                <FiX className="text-lg" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-300">Loading premarket notes...</p>
        </div>
      </div>
    );
  }

  if (filteredPlans.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-gray-300 mb-1 text-sm font-medium">
                  Start Date:
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  max={dateRange.endDate || dayjs().format("YYYY-MM-DD")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#27c284]"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-gray-300 mb-1 text-sm font-medium">
                  End Date:
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  min={dateRange.startDate}
                  max={dayjs().format("YYYY-MM-DD")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#27c284]"
                />
              </div>
              <button
                onClick={clearDateFilter}
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition-colors h-[42px]"
                disabled={!dateRange.startDate && !dateRange.endDate}
              >
                <FiX className="text-lg" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-300 text-center py-8">
            {dateRange.startDate || dateRange.endDate 
              ? "No premarket notes found in the selected date range" 
              : "No premarket notes available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-300 mb-1 text-sm font-medium">
                Start Date:
              </label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                max={dateRange.endDate || dayjs().format("YYYY-MM-DD")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#27c284]"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-300 mb-1 text-sm font-medium">
                End Date:
              </label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                min={dateRange.startDate}
                max={dayjs().format("YYYY-MM-DD")}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#27c284]"
              />
            </div>
            <button
              onClick={clearDateFilter}
              className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition-colors h-[42px]"
              disabled={!dateRange.startDate && !dateRange.endDate}
            >
              <FiX className="text-lg" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {filteredPlans.map((item) => (
            <div
              key={item._id}
              className="border border-gray-600 p-4 rounded text-white shadow-sm hover:shadow-md transition-shadow bg-gray-800"
            >
              <h2 className="text-lg sm:text-xl font-bold text-[#27c284] mb-1">
                {item.day.charAt(0).toUpperCase() + item.day.slice(1)} - {dayjs(item.date).format("MMM D, YYYY")}
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
          ))}
        </div>
      </div>

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

export default memo(DisplayPremarket);