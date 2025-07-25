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
  const [selectedImage, setSelectedImage] = useState(null);

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
  ];

  useEffect(() => {
    const loadTrade = async () => {
      try {
        const result = await fetchTradeById(id);
        if (result.success) {
          setTrade(result.trade);
          console.log(result.trade);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center w-full max-w-md p-4 sm:p-6 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-2 sm:mb-3">
          Trade Not Found
        </h2>
        <p className="text-sm sm:text-base mb-4 sm:mb-5 text-gray-300">
          The requested trade could not be loaded.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm sm:text-base text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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

  // Handle screenshot display
  const renderScreenshots = () => {
    if (!trade.screenshots || trade.screenshots.length === 0) return null;

    return (
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-indigo-500 col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-indigo-300">Screenshots</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {trade.screenshots.map((screenshot, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(screenshot)}
            >
              <img
                src={screenshot}
                alt={`Trade Screenshot ${index + 1}`}
                className="rounded-lg w-full h-40 sm:h-48 object-cover hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-sm sm:text-lg font-medium">View</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-900 min-h-screen text-white">
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Enlarged Screenshot"
              className="max-h-[90vh] w-auto mx-auto"
            />
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
  {/* Header and buttons remain the same */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <h2 className="text-2xl sm:text-3xl font-bold text-blue-400">Trade Details</h2>
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <button
        onClick={() => navigate(`/strategies/${trade.strategyId?._id}/trades/${trade._id}/edit`)}
        className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 px-3 sm:px-4 py-2 rounded-lg text-white transition-colors cursor-pointer text-sm sm:text-base"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit Trade
      </button>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 px-3 sm:px-4 py-2 rounded-lg text-white transition-colors text-sm sm:text-base"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Trades
      </button>
    </div>
  </div>

  {/* Main grid layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {/* Trade Overview Card */}
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-blue-500">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-blue-300">Trade Overview</h3>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Name</span>
          <span className="text-sm sm:text-base font-medium truncate max-w-[150px] sm:max-w-none">{trade.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Strategy</span>
          <span className="text-sm sm:text-base font-medium truncate max-w-[150px] sm:max-w-none">
            {trade.strategyId?.name || "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Side</span>
          <span className={`text-sm sm:text-base font-medium ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
            {trade.side}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Day</span>
          <span className="text-sm sm:text-base font-medium capitalize">{trade.day?.toLowerCase()}</span>
        </div>
      </div>
    </div>

    {/* Entry Rules Card */}
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-emerald-500">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-emerald-300">Entry Rules</h3>
      {trade.entry_rules?.length > 0 ? (
        <ul className="space-y-1 sm:space-y-2">
          {trade.entry_rules.map((rule, index) => (
            <li key={`entry-rule-${index}`} className="flex items-start">
              <span className="text-emerald-400 mr-2 text-sm sm:text-base">✓</span>
              <span className="text-xs sm:text-sm text-gray-300">{rule}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs sm:text-sm text-gray-500 italic">No entry rules recorded</p>
      )}
    </div>

    {/* Exit Rules Card */}
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-red-500">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-red-300">Exit Rules</h3>
      {trade.exit_rules?.length > 0 ? (
        <ul className="space-y-1 sm:space-y-2">
          {trade.exit_rules.map((rule, index) => (
            <li key={`exit-rule-${index}`} className="flex items-start">
              <span className="text-red-400 mr-2 text-sm sm:text-base">✗</span>
              <span className="text-xs sm:text-sm text-gray-300">{rule}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs sm:text-sm text-gray-500 italic">No exit rules recorded</p>
      )}
    </div>

    {/* Financial Details Card */}
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-purple-500">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-purple-300">Financials</h3>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Entry</span>
          <span className="text-sm sm:text-base font-medium">{formatCurrency(trade.entry)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Exit</span>
          <span className="text-sm sm:text-base font-medium">{formatCurrency(trade.exit)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Stop Loss</span>
          <span className="text-sm sm:text-base font-medium">{formatCurrency(trade.stop_loss)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Target</span>
          <span className="text-sm sm:text-base font-medium">{formatCurrency(trade.target)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Shares</span>
          <span className="text-sm sm:text-base font-medium">{trade.shares}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Capital</span>
          <span className="text-sm sm:text-base font-medium">{formatCurrency(trade.capital)}</span>
        </div>
      </div>
    </div>

    {/* Performance Card */}
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-300">Performance</h3>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Gross P&L</span>
          <span className="text-sm sm:text-base font-medium">{formatCurrency(trade.gross_pnl)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Net P&L</span>
          <span className={`text-sm sm:text-base font-medium ${trade.net_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(trade.net_pnl)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">ROI</span>
          <span className={`text-sm sm:text-base font-medium ${trade.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trade.roi}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">% P&L</span>
          <span className={`text-sm sm:text-base font-medium ${trade.percent_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trade.percent_pnl}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Charges</span>
          <span className="text-sm sm:text-base font-medium">{formatCurrency(trade.charges)}</span>
        </div>
      </div>
    </div>

    {/* Timing Details Card */}
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-yellow-500">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-yellow-300">Timing</h3>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Entry Date</span>
          <span className="text-xs sm:text-sm font-medium">{formatDate(trade.entry_date)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Exit Date</span>
          <span className="text-xs sm:text-sm font-medium">{formatDate(trade.exit_date)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Duration</span>
          <span className="text-sm sm:text-base font-medium">{trade.duration || "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-400">Time</span>
          <span className="text-sm sm:text-base font-medium">{trade.time || "-"}</span>
        </div>
      </div>
    </div>

    {/* Combined Notes & Screenshots section */}
    <div className="md:col-span-2 lg:col-span-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Notes & Mistakes Card */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-red-500">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-red-300">Review</h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="text-xs sm:text-sm text-gray-400 mb-1">Mistakes</h4>
              {trade.mistakes?.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-300">
                  {trade.mistakes.map((mistake, index) => (
                    <li key={index}>{mistake}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 italic">No mistakes recorded</p>
              )}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm text-gray-400 mb-1">Emojis</h4>
              {trade.emojis && (Array.isArray(trade.emojis) ? trade.emojis.length > 0 : trade.emojis.length > 0) ? (
                <div className="flex flex-wrap gap-2 sm:gap-3 text-xl sm:text-2xl">
                  {(Array.isArray(trade.emojis) ? trade.emojis : [trade.emojis]).map((emoji, index) => {
                    const emojiObj = EMOJI_OPTIONS.find((obj) => obj.value === emoji);
                    return (
                      <div key={index} className="flex flex-col items-center text-center select-none">
                        <span>{emoji}</span>
                        <small className="text-xxs sm:text-xs text-gray-400">{emojiObj ? emojiObj.label : "Unknown"}</small>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xl sm:text-2xl">😐</p>
              )}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm text-gray-400 mb-1">Notes</h4>
              <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line">
                {trade.notes || <span className="text-gray-500 italic">No notes available</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Screenshots Section */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-indigo-500">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-indigo-300">Screenshots</h3>
          {renderScreenshots()}
        </div>
      </div>
    </div>
  </div>
</div>
     
      
    </div>
  );
};

export default ViewTrade;