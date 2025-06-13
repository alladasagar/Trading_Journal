import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTradeById } from "../../Apis/Trades";
import { useToast } from "../context/ToastContext";
import Loader from "../ui/Loader";

const ViewTrade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);

  const EMOJI_OPTIONS = [
    { value: "😊", label: "Happy" },
    { value: "😢", label: "Sad" },
    { value: "😎", label: "Cool" },
    { value: "🤯", label: "Mind blown" },
    { value: "💰", label: "Money" },
    { value: "📈", label: "Chart up" },
    { value: "📉", label: "Chart down" },
    { value: "🎯", label: "Target" },
    { value: "🔥", label: "Fire" },
    { value: "💎", label: "Diamond" },
  ]

  useEffect(() => {
    const loadTrade = async () => {
      try {
        const result = await fetchTradeById(id);
        if (result.success) {
          setTrade(result.trade);
        } else {
          addToast(result.message || "Failed to fetch trade", "error");
          navigate(-1);
        }
      } catch (error) {
        addToast("An error occurred while fetching trade", "error");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadTrade();
  }, [id, addToast, navigate]);

  if (loading) return <Loader message="Loading trade details..." />;

  if (!trade) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Trade Not Found</h2>
        <p className="mb-4">The requested trade could not be loaded.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white transition-colors"
        >
          ← Back to Trades
        </button>
      </div>
    </div>
  );

  // Format currency values
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-400">Trade Details</h2>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Trades
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trade Overview Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold mb-4 text-blue-300">Trade Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="font-medium">{trade.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Strategy</span>
                <span className="font-medium">{trade.strategyId?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Side</span>
                <span className={`font-medium ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.side}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Day</span>
                <span className="font-medium capitalize">{trade.day?.toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Entry Rules Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-emerald-500">
            <h3 className="text-xl font-semibold mb-4 text-emerald-300">Entry Rules</h3>
            {trade.entry_rules?.length > 0 ? (
              <ul className="space-y-2">
                {trade.entry_rules.map((rule, index) => (
                  <li key={`entry-rule-${index}`} className="flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    <span className="text-gray-300">{rule}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No entry rules recorded</p>
            )}
          </div>

          {/* Exit Rules Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-red-500">
            <h3 className="text-xl font-semibold mb-4 text-red-300">Exit Rules</h3>
            {trade.exit_rules?.length > 0 ? (
              <ul className="space-y-2">
                {trade.exit_rules.map((rule, index) => (
                  <li key={`exit-rule-${index}`} className="flex items-start">
                    <span className="text-red-400 mr-2">✗</span>
                    <span className="text-gray-300">{rule}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No exit rules recorded</p>
            )}
          </div>

          {/* Financial Details Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">Financials</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Entry</span>
                <span className="font-medium">{formatCurrency(trade.entry)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Exit</span>
                <span className="font-medium">{formatCurrency(trade.exit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stop Loss</span>
                <span className="font-medium">{formatCurrency(trade.stop_loss)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target</span>
                <span className="font-medium">{formatCurrency(trade.target)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shares</span>
                <span className="font-medium">{trade.shares}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Capital</span>
                <span className="font-medium">{formatCurrency(trade.capital)}</span>
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <h3 className="text-xl font-semibold mb-4 text-green-300">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Gross P&L</span>
                <span className="font-medium">{formatCurrency(trade.gross_pnl)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Net P&L</span>
                <span className={`font-medium ${trade.net_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(trade.net_pnl)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ROI</span>
                <span className={`font-medium ${trade.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.roi}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">% P&L</span>
                <span className={`font-medium ${trade.percent_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.percent_pnl}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Charges</span>
                <span className="font-medium">{formatCurrency(trade.charges)}</span>
              </div>
            </div>
          </div>

          {/* Timing Details Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
            <h3 className="text-xl font-semibold mb-4 text-yellow-300">Timing</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Entry Date</span>
                <span className="font-medium">{formatDate(trade.entry_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Exit Date</span>
                <span className="font-medium">{formatDate(trade.exit_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="font-medium">{trade.duration || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time</span>
                <span className="font-medium">{trade.time || "-"}</span>
              </div>
            </div>
          </div>

          {/* Notes & Mistakes Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-red-500">
            <h3 className="text-xl font-semibold mb-4 text-red-300">Review</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400 mb-1">Mistakes</h4>
                {trade.mistakes?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {trade.mistakes.map((mistake, index) => (
                      <li key={index}>{mistake}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No mistakes recorded</p>
                )}
              </div>
              <div>
                <h4 className="text-gray-400 mb-1">Notes</h4>
                <p className="text-gray-300 whitespace-pre-line">
                  {trade.notes || <span className="text-gray-500 italic">No notes available</span>}
                </p>
              </div>
              <div>
                <h4 className="text-gray-400 mb-1">Emojis</h4>
                {trade.emojis && (Array.isArray(trade.emojis) ? trade.emojis.length > 0 : trade.emojis.length > 0) ? (
                  <div className="flex flex-wrap gap-3 text-2xl">
                    {(Array.isArray(trade.emojis) ? trade.emojis : [trade.emojis]).map((emoji, index) => {
                      const emojiObj = EMOJI_OPTIONS.find((obj) => obj.value === emoji); // example function, if you have one
                      return (
                        <div key={index} className="flex flex-col items-center text-center select-none">
                          <span>{emoji}</span>
                          <small className="text-xs text-gray-400">{emojiObj ? emojiObj.label : "Unknown"}</small>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-2xl">😐</p>
                )}
              </div>
            </div>
          </div>

          {/* Screenshot Card */}
          {trade.screenshot && (
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
              <h3 className="text-xl font-semibold mb-4 text-indigo-300">Screenshot</h3>
              <div className="flex justify-center">
                <img
                  src={trade.screenshot}
                  alt="Trade Screenshot"
                  className="rounded-lg max-h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(trade.screenshot, '_blank')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTrade;
