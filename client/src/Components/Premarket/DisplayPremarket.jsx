import React, { memo, useState } from "react";
import { deletePremarket } from "../../Apis/Premarket";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";
import ConfirmModal from "../ui/ConfirmModal";
import dayjs from "dayjs";
import { premarketCache } from "../../utilities/Cache/PremarketCache";

const DisplayPremarket = (props) => {
  const { plans = [], onReload = () => {} } = props;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [premarketToDelete, setPremarketToDelete] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Sort and filter logic
  const sortedPlans = [...plans].sort((a, b) => 
    dayjs(b.date).isBefore(dayjs(a.date)) ? -1 : 1
  );

  const filteredPlans = dateRange.startDate && dateRange.endDate
    ? sortedPlans.filter((item) => {
        const itemDate = dayjs(item.date);
        return (
          itemDate.isAfter(dayjs(dateRange.startDate).subtract(1, "day")) &&
          itemDate.isBefore(dayjs(dateRange.endDate).add(1, "day"))
        );
      })
    : sortedPlans;

  const handleDeleteConfirmed = async () => {
    try {
      const res = await deletePremarket(premarketToDelete);
      setIsConfirmOpen(false);

      if (res.success) {
        premarketCache.invalidate();
        onReload();
        addToast("Premarket entry deleted successfully", "success");
      } else {
        addToast(res.message || "Failed to delete premarket entry", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      addToast("Error deleting premarket entry", "error");
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: "", endDate: "" });
  };

  if (!Array.isArray(plans) || plans.length === 0) {
    return (
      <div className="text-center py-8 text-gray-300">
        No premarket notes available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filter Controls */}
      <div className="bg-gray-800 p-4 rounded-lg">
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
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
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
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300"
            />
          </div>
          <button
            onClick={clearDateFilter}
            disabled={!dateRange.startDate && !dateRange.endDate}
            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition-colors"
          >
            <FiX />
            Clear
          </button>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            {dateRange.startDate || dateRange.endDate 
              ? "No notes found for selected date range" 
              : "No premarket notes available"}
          </div>
        ) : (
          filteredPlans.map((item) => (
            <div
              key={item._id}
              className="border border-gray-600 p-4 rounded-lg bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-[#27c284]">
                    {item.day} - {dayjs(item.date).format("MMM D, YYYY")}
                  </h3>
                  <p className="mt-1">
                    <strong>Expected Movement:</strong> {item.expected_movement}
                  </p>
                  <p className="mt-1">
                    <strong>Note:</strong> {item.note}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/edit-premarket/${item._id}`)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => {
                      setPremarketToDelete(item._id);
                      setIsConfirmOpen(true);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Premarket Note?"
        message="Are you sure you want to delete this premarket note? This action cannot be undone."
      />
    </div>
  );
};

export default memo(DisplayPremarket);