import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTradesByStrategy } from "../../Apis/Trades";
import { useToast } from "../context/ToastContext";

const TradesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrades = async () => {
      setLoading(true);
      const result = await fetchTradesByStrategy(id);
      if (result.success) {
        setTrades(result.data);
      } else {
        addToast(result.message || "Failed to fetch trades", "error");
      }
      setLoading(false);
    };

    loadTrades();
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#27c284]">
          Trades for Strategy ID: {id}
        </h2>
        <button
          onClick={() => navigate(`/strategies/${id}/add-trade`)}
          className="px-4 py-2 bg-[#27c284] text-white font-medium rounded-lg shadow-md hover:bg-[#1ea970] transition-all duration-200"
        >
          + Add Trade
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-300 p-4">Loading trades...</div>
      ) : trades.length === 0 ? (
        <div className="text-center text-gray-300 p-4">
          <h2 className="text-lg font-medium">No trades available for this strategy.</h2>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                {["Entry", "Exit", "P&L", "Date", "Notes"].map((header) => (
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
              {trades.map((trade, index) => (
                <tr key={index} className="hover:bg-gray-750">
                  <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">{trade.entry}</td>
                  <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">{trade.exit}</td>
                  <td
                    className={`px-4 py-4 text-sm font-medium sm:px-6 ${
                      trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {trade.pnl} RS
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400 sm:px-6">{trade.date}</td>
                  <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">{trade.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradesPage;
