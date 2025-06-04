import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTradesByStrategy, deleteTrade } from "../../Apis/Trades";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../ui/ConfirmModal"; // adjust path as needed

const TradesPage = () => {
  const { id } = useParams();
  const strategyId = id;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [leverageOverrides, setLeverageOverrides] = useState({});

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for confirmation modal
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
      addToast(res.message || "Trade deleted successfully", "success");
      setTrades((prev) => prev.filter((trade) => trade._id !== trade_id));
    } else {
      addToast(res.message || "Failed to delete trade", "error");
    }
    setIsModalOpen(false);
    setTradeToDelete(null);
  };

  // Open modal and set the trade to delete
  const openDeleteModal = (trade_id) => {
    setTradeToDelete(trade_id);
    setIsModalOpen(true);
  };

  // Close modal without deleting
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

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Trades</h2>
        <button
          onClick={() => navigate(`/strategies/${id}/add-trade`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Trade
        </button>
      </div>

      {loading ? (
        <p className="text-gray-300">Loading trades...</p>
      ) : trades.length === 0 ? (
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
                          leverageOverrides[trade._id] || (trade.capital && trade.capital < 20000 ? "1x" : "5x");
                        const adjustedPercent = currentLeverage === "1x"
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
                        {leverageOverrides[trade._id] || (trade.capital && trade.capital < 20000 ? "1x" : "5x")}
                      </button>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6 space-x-2">
                      <button
                        onClick={() => navigate(`/trades/${trade._id}`)}
                        className="text-blue-400 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/strategies/${strategyId}/trades/${trade._id}/edit`
                          )
                        }
                        className="text-yellow-400 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(trade._id)}
                        className="text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Modal */}
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
