import React, { memo, useState } from "react";
import { deletePremarket } from "../../Apis/Premarket";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiX, FiCalendar, FiFileText } from "react-icons/fi";
import ConfirmModal from "../ui/ConfirmModal";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { premarketCache } from "../../utilities/Cache/PremarketCache";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Extend dayjs with plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
          itemDate.isSameOrAfter(dayjs(dateRange.startDate)) &&
          itemDate.isSameOrBefore(dayjs(dateRange.endDate))
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
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      {/* Date Filter Controls */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <FiCalendar className="text-blue-400" />
          Filter Notes by Date Range
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-300 mb-1 text-sm font-medium">
              Start Date:
            </label>
            <DatePicker
              selected={dateRange.startDate ? dayjs(dateRange.startDate).toDate() : null}
              onChange={(date) => setDateRange(prev => ({ 
                ...prev, 
                startDate: date ? dayjs(date).format("YYYY-MM-DD") : "",
                ...(date && prev.endDate && dayjs(date).isAfter(dayjs(prev.endDate))) && {
                  endDate: dayjs(date).format("YYYY-MM-DD")
                }
              }))}
              selectsStart
              startDate={dateRange.startDate ? dayjs(dateRange.startDate).toDate() : null}
              endDate={dateRange.endDate ? dayjs(dateRange.endDate).toDate() : null}
              maxDate={new Date()}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholderText="Select start date"
              isClearable
              clearButtonClassName="text-gray-400 hover:text-gray-300 mr-10"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-300 mb-1 text-sm font-medium">
              End Date:
            </label>
            <DatePicker
              selected={dateRange.endDate ? dayjs(dateRange.endDate).toDate() : null}
              onChange={(date) => setDateRange(prev => ({ 
                ...prev, 
                endDate: date ? dayjs(date).format("YYYY-MM-DD") : "" 
              }))}
              selectsEnd
              startDate={dateRange.startDate ? dayjs(dateRange.startDate).toDate() : null}
              endDate={dateRange.endDate ? dayjs(dateRange.endDate).toDate() : null}
              minDate={dateRange.startDate ? dayjs(dateRange.startDate).toDate() : null}
              maxDate={new Date()}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholderText="Select end date"
              isClearable
              clearButtonClassName="text-gray-400 hover:text-gray-300 mr-10"
            />
          </div>
          
          <button
            onClick={clearDateFilter}
            disabled={!dateRange.startDate && !dateRange.endDate}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiX />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Plans List Container */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-dashed border-gray-700">
              <FiFileText className="mx-auto text-4xl text-gray-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-400 mb-1">
                {dateRange.startDate || dateRange.endDate 
                  ? "No notes found for selected date range" 
                  : "No premarket notes available"}
              </h3>
              <p className="text-sm text-gray-500">
                {!dateRange.startDate && !dateRange.endDate && "Create your first premarket note to get started"}
              </p>
            </div>
          ) : (
            filteredPlans.map((item) => (
              <div
                key={item._id}
                className="border border-gray-700 p-5 rounded-lg bg-gray-800 hover:bg-gray-800/70 transition-all shadow-sm group relative"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-[#27c284]/20 text-[#27c284] px-2 py-1 rounded-full text-xs font-medium">
                        {item.day}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {dayjs(item.date).format("MMM D, YYYY")}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {item.expected_movement && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Expected Movement</h4>
                          <p className="text-gray-200 mt-1">{item.expected_movement}</p>
                        </div>
                      )}
                      
                      {item.note && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-400">Analysis Note</h4>
                          <p className="text-gray-200 mt-1 whitespace-pre-line">{item.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/edit-premarket/${item._id}`)}
                      className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-blue-900/20 transition-colors"
                      title="Edit note"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setPremarketToDelete(item._id);
                        setIsConfirmOpen(true);
                      }}
                      className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-900/20 transition-colors"
                      title="Delete note"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Premarket Note?"
        message="Are you sure you want to delete this premarket note? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  );
};

export default memo(DisplayPremarket);