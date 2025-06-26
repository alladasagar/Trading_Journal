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
    <div className="p-4 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-end mb-4">


        <button
          onClick={() => navigate(`/strategies/${id}/add-trade`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Trade
        </button>
        <h2 className="text-xl font-semibold text-white">Trades</h2>
        <button
          onClick={() => navigate(-1)}
          className="flex items-end bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Strategies
        </button>

      </div>


      {trades.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
          No trades taken yet.
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                {[
                  "Name",
                  "Date",
                  "Day",
                  "Side",
                  "Net P&L",
                  "% P&L",
                  "ROI",
                  "Emoji",
                  "Leverage",
                  "Note",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-xs font-semibold text-[#27c284] uppercase tracking-wider sm:px-6"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {trades.map((trade) => {
                const leverage =
                  trade.capital && trade.capital < 20000 ? "1x" : "5x";

                return (
                  <tr key={trade._id} className="hover:bg-gray-750">
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">
                      {trade.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400 sm:px-6">
                      {new Date(trade.entry_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">
                      {trade.day}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6 capitalize">
                      {trade.side}
                    </td>
                    <td
                      className={`px-4 py-4 text-sm font-medium sm:px-6 ${trade.net_pnl >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                    >
                      ₹{trade.net_pnl}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">
                      {(() => {
                        const currentLeverage =
                          leverageOverrides[trade._id] ||
                          (trade.capital && trade.capital < 20000 ? "1x" : "5x");
                        const adjustedPercent =
                          currentLeverage === "1x"
                            ? (trade.percent_pnl / 5).toFixed(2)
                            : trade.percent_pnl.toFixed(2);
                        return `${adjustedPercent}%`;
                      })()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">
                      {trade.roi}%
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">
                      {trade.emojis || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">
                      <button
                        onClick={() => toggleLeverage(trade._id)}
                        className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
                      >
                        {leverageOverrides[trade._id] ||
                          (trade.capital && trade.capital < 20000 ? "1x" : "5x")}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">
                      {trade.notes && (
                        <>
                          <div
                            data-tooltip-id={`note-tooltip-${trade._id}`}
                            data-tooltip-content={trade.notes}
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
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm sm:px-6">
                      <div
                        className="flex space-x-2 sm:space-x-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => navigate(`/trades/${trade._id}`)}
                          className="text-[#27c284] hover:text-[#1fa769] transition-colors"
                          title="View"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/strategies/${strategyId}/trades/${trade._id}/edit`)
                          }
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(trade._id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
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