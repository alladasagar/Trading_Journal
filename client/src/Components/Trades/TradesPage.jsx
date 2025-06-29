import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTradesByStrategy, deleteTrade } from "../../Apis/Trades";
import { graphCache } from "../../utilities/Cache/GraphCache";
import { calendarCache } from "../../utilities/Cache/CalendarCache";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../ui/ConfirmModal";
import Loader from "../ui/Loader";
import { FaEye, FaEdit, FaTrash, FaStickyNote } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const TradesPage = () => {
  const { id } = useParams();
  const strategyId = id;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [leverageOverrides, setLeverageOverrides] = useState({});
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);

  useEffect(() => {
    const loadTrades = async () => {
      setLoading(true);
      const result = await fetchTradesByStrategy(id);

      if (result.success) {
        setTrades(result.trades);
        console.log(result.trades);
      } else {
        addToast(result.message || "Failed to fetch trades", "error");
      }
      setLoading(false);
    };

    loadTrades();
  }, [addToast, id]);

  const handledelete = async (trade_id) => {
    const res = await deleteTrade(trade_id);
    if (res.success) {
      graphCache.invalidate();
      calendarCache.invalidate();
      addToast(res.message || "Trade deleted successfully", "success");
      setTrades((prev) => prev.filter((trade) => trade._id !== trade_id));
    } else {
      addToast(res.message || "Failed to delete trade", "error");
    }
    setIsModalOpen(false);
    setTradeToDelete(null);
  };

  const openDeleteModal = (trade_id) => {
    setTradeToDelete(trade_id);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTradeToDelete(null);
    setIsModalOpen(false);
  };

  const toggleLeverage = (tradeId) => {
    setLeverageOverrides((prevOverrides) => {
      const current = prevOverrides[tradeId] || "default";
      const newLeverage = current === "1x" ? "5x" : "1x";
      return {
        ...prevOverrides,
        [tradeId]: newLeverage,
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white order-2 sm:order-1">Trades</h2>

        <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
          <button
            onClick={() => navigate(`/strategies/${id}/add-trade`)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex-1 sm:flex-none cursor-pointer"
          >
            + Add Trade
          </button>
          <button
            onClick={() => navigate("/strategies")}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white transition-colors cursor-pointer text-xs sm:text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Back to Strategies</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </div>

      {/* Trades Table */}
      {trades.length === 0 ? (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg text-center text-gray-400">
          No trades taken yet.
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
          <div className="block sm:hidden">
            {/* Mobile Cards View */}
            {trades.map((trade) => {
              const currentLeverage = leverageOverrides[trade._id] ||
                (trade.capital && trade.capital < 20000 ? "1x" : "5x");
              const adjustedPercent = currentLeverage === "1x"
                ? (trade.percent_pnl / 5).toFixed(2)
                : trade.percent_pnl.toFixed(2);

              return (
                <div key={trade._id} className="p-3 border-b border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{trade.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(trade.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })} • {trade.day}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${trade.side === 'long' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                      {trade.side}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-400">Net P&L</p>
                      <p className={`text-sm ${trade.net_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{trade.net_pnl}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">% P&L</p>
                      <p className="text-sm text-white">
                        {adjustedPercent}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">ROI</p>
                      <p className="text-sm text-white">{trade.roi}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Leverage</p>
                      <button
                        onClick={() => toggleLeverage(trade._id)}
                        className="text-sm bg-gray-700 px-2 py-0.5 rounded hover:bg-gray-600"
                      >
                        {currentLeverage}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div>
                      {trade.emojis && (
                        <span className="text-sm mr-2">{trade.emojis}</span>
                      )}
                      {trade.note && (
                        <>
                          <div
                            data-tooltip-id={`note-tooltip-${trade._id}`}
                            data-tooltip-content={trade.note}
                            className="inline-block"
                          >
                            <FaStickyNote
                              className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
                              size={14}
                            />
                          </div>
                          <Tooltip
                            id={`note-tooltip-${trade._id}`}
                            place="top"
                            className="max-w-xs z-50"
                          />
                        </>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/trades/${trade._id}`)}
                        className="text-[#27c284] hover:text-[#1fa769]"
                        title="View"
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/strategies/${strategyId}/trades/${trade._id}/edit`)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(trade._id)}
                        className="text-red-500 hover:text-red-400"
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <table className="hidden sm:table min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                {["Name", "Date", "Day", "Side", "Net P&L", "% P&L", "ROI", "Emoji", "Leverage", "Note", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 sm:px-4 sm:py-3 text-xs font-semibold text-[#27c284] uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {trades.map((trade) => {
                const currentLeverage = leverageOverrides[trade._id] ||
                  (trade.capital && trade.capital < 20000 ? "1x" : "5x");
                const adjustedPercent = currentLeverage === "1x"
                  ? (trade.percent_pnl / 5).toFixed(2)
                  : trade.percent_pnl.toFixed(2);

                return (
                  <tr key={trade._id} className="hover:bg-gray-750">
                    <td className="px-3 py-3 text-sm text-gray-300 sm:px-4">
                      {trade.name}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-400 sm:px-4">
                      {new Date(trade.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300 sm:px-4">
                      {trade.day}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300 sm:px-4 capitalize">
                      {trade.side}
                    </td>
                    <td className={`px-3 py-3 text-sm font-medium sm:px-4 ${trade.net_pnl >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                      ₹{trade.net_pnl}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300 sm:px-4">
                      {adjustedPercent}%
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300 sm:px-4">
                      {trade.roi}%
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300 sm:px-4">
                      {trade.emojis || "-"}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300 sm:px-4">
                      <button
                        onClick={() => toggleLeverage(trade._id)}
                        className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
                      >
                        {currentLeverage}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-300 sm:px-4">
                      {trade.note ? (
                        <>
                          <div
                            data-tooltip-id={`note-tooltip-${trade._id}`}
                            data-tooltip-content={trade.note}
                            className="inline-block"
                          >
                            <FaStickyNote
                              className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
                              size={16}
                            />
                          </div>
                          <Tooltip
                            id={`note-tooltip-${trade._id}`}
                            place="top"
                            className="max-w-xs z-50"
                          />
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm sm:px-4">
                      <div className="flex space-x-2 sm:space-x-3">
                        <button
                          onClick={() => navigate(`/trades/${trade._id}`)}
                          className="text-[#27c284] hover:text-[#1fa769]"
                          title="View"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/strategies/${strategyId}/trades/${trade._id}/edit`)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(trade._id)}
                          className="text-red-500 hover:text-red-400"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handledelete(tradeToDelete)}
        title="Confirm Delete"
        message="Are you sure you want to delete this trade? This action cannot be undone."
      />
    </div>
  );
};

export default TradesPage;