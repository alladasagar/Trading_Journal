import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { deletePremarket } from "../../Apis/Premarket";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import {
  FiEdit,
  FiTrash2,
  FiX,
  FiCalendar,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import ConfirmModal from "../ui/ConfirmModal";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { premarketCache } from "../../utilities/Cache/PremarketCache";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const DisplayPremarket = ({ plans = [], onReload = () => { } }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [premarketToDelete, setPremarketToDelete] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [expandedNotes, setExpandedNotes] = useState({});
  const { addToast } = useToast();
  const navigate = useNavigate();

  const listRef = useRef();
  const itemHeights = useRef({});

  const toggleNoteExpansion = (id) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sortedPlans = [...plans].sort((a, b) =>
    dayjs(b.date).isBefore(dayjs(a.date)) ? -1 : 1
  );

  const filteredPlans =
    dateRange.startDate && dateRange.endDate
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

  const Row = useCallback(
    ({ index, style }) => {
      const item = filteredPlans[index];

      const ref = useCallback(
        (node) => {
          if (node !== null) {
            const height = node.getBoundingClientRect().height;
            if (itemHeights.current[index] !== height) {
              itemHeights.current[index] = height;
              setTimeout(() => listRef.current?.resetAfterIndex(index), 0);
            }
          }
        },
        [index]
      );

      return (
        <div style={style}>
          <div ref={ref} className="px-2 sm:px-4 pb-3 sm:pb-4">
            <div className="border border-gray-700 p-3 sm:p-5 rounded-lg bg-gray-800 hover:bg-gray-800/70 transition-all shadow-sm group relative">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-[#27c284]/20 text-[#27c284] px-2 py-1 rounded-full text-xs font-medium">
                      {item.day}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm">
                      {dayjs(item.date).format("MMM D, YYYY")}
                    </span>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {item.expected_movement && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-400">Expected Movement</h4>
                        <p className="text-gray-200 mt-1 text-sm sm:text-base">{item.expected_movement}</p>
                      </div>
                    )}

                    {item.note && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-400">Analysis Note</h4>
                        <div className="mt-1">
                          <p
                            className={`text-gray-200 text-sm sm:text-base whitespace-pre-line ${!expandedNotes[item._id] ? "line-clamp-2" : ""
                              }`}
                          >
                            {item.note}
                          </p>
                          {item.note.split("\n").length > 2 || item.note.length > 150 ? (
                            <button
                              onClick={() => toggleNoteExpansion(item._id)}
                              className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm mt-1 flex items-center gap-1"
                            >
                              {expandedNotes[item._id] ? (
                                <>
                                  <FiChevronUp size={14} className="sm:w-4" /> Show less
                                </>
                              ) : (
                                <>
                                  <FiChevronDown size={14} className="sm:w-4" /> View more
                                </>
                              )}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity justify-end sm:justify-start">
                  <button
                    onClick={() => navigate(`/edit-premarket/${item._id}`)}
                    className="text-blue-400 hover:text-blue-300 p-1 sm:p-2 rounded-full hover:bg-blue-900/20 transition-colors"
                    title="Edit note"
                  >
                    <FiEdit size={16} className="sm:w-[18px]" />
                  </button>
                  <button
                    onClick={() => {
                      setPremarketToDelete(item._id);
                      setIsConfirmOpen(true);
                    }}
                    className="text-red-400 hover:text-red-300 p-1 sm:p-2 rounded-full hover:bg-red-900/20 transition-colors"
                    title="Delete note"
                  >
                    <FiTrash2 size={16} className="sm:w-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [filteredPlans, expandedNotes, navigate]
  );

  useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [expandedNotes]);

  const getItemSize = (index) => itemHeights.current[index] || 100;

  if (!Array.isArray(plans) || plans.length === 0) {
    return <div className="text-center py-8 text-gray-300">No premarket notes available</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Date Filter */}
      <div className="bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-base sm:text-lg font-semibold text-gray-300 mb-3 sm:mb-4 flex items-center gap-2">
          <FiCalendar className="text-blue-400" />
          Filter Notes by Date Range
        </h2>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <label className="block text-gray-300 mb-1 text-xs sm:text-sm font-medium">Start Date:</label>
            <DatePicker
              selected={dateRange.startDate ? dayjs(dateRange.startDate).toDate() : null}
              onChange={(date) =>
                setDateRange((prev) => ({
                  ...prev,
                  startDate: date ? dayjs(date).format("YYYY-MM-DD") : "",
                  ...(date &&
                    prev.endDate &&
                    dayjs(date).isAfter(dayjs(prev.endDate)) && {
                    endDate: dayjs(date).format("YYYY-MM-DD"),
                  }),
                }))
              }
              selectsStart
              startDate={dateRange.startDate ? dayjs(dateRange.startDate).toDate() : null}
              endDate={dateRange.endDate ? dayjs(dateRange.endDate).toDate() : null}
              maxDate={new Date()}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm sm:text-base text-gray-300"
              placeholderText="Select start date"
              isClearable
            />
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-gray-300 mb-1 text-xs sm:text-sm font-medium">End Date:</label>
            <DatePicker
              selected={dateRange.endDate ? dayjs(dateRange.endDate).toDate() : null}
              onChange={(date) =>
                setDateRange((prev) => ({
                  ...prev,
                  endDate: date ? dayjs(date).format("YYYY-MM-DD") : "",
                }))
              }
              selectsEnd
              startDate={dateRange.startDate ? dayjs(dateRange.startDate).toDate() : null}
              endDate={dateRange.endDate ? dayjs(dateRange.endDate).toDate() : null}
              minDate={dateRange.startDate ? dayjs(dateRange.startDate).toDate() : null}
              maxDate={new Date()}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm sm:text-base text-gray-300"
              placeholderText="Select end date"
              isClearable
            />
          </div>

          <button
            onClick={clearDateFilter}
            disabled={!dateRange.startDate && !dateRange.endDate}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-colors disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
          >
            <FiX size={14} className="sm:w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Virtualized List */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="h-[calc(100vh-250px)] sm:h-[calc(100vh-300px)] p-2 sm:p-4">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-8 sm:py-12 border border-dashed border-gray-700 h-full flex flex-col items-center justify-center rounded-lg">
              <FiFileText className="text-3xl sm:text-4xl text-gray-500 mb-2 sm:mb-3" />
              <h3 className="text-sm sm:text-lg font-medium text-gray-400 mb-1">
                {dateRange.startDate || dateRange.endDate
                  ? "No notes found for selected date range"
                  : "No premarket notes available"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {!dateRange.startDate && !dateRange.endDate &&
                  "Create your first premarket note to get started"}
              </p>
            </div>
          ) : (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  ref={listRef}
                  height={height}
                  width={width}
                  itemCount={filteredPlans.length}
                  itemSize={getItemSize}
                  itemKey={(index) => filteredPlans[index]._id}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
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