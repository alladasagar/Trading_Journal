import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStrategyById } from "../../Apis/Strategies";
import { fetchTradesByStrategy } from "../../Apis/Trades";
import { useToast } from "../context/ToastContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { FaArrowLeft } from "react-icons/fa";
import Loader from "../ui/Loader";

const ViewStrategy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [strategy, setStrategy] = useState(null);
  const [tradesData, setTradesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const strategyRes = await getStrategyById(id);
        console.log(strategyRes);

        if (strategyRes.success) {
          setStrategy(strategyRes.data);

          const tradesRes = await fetchTradesByStrategy(id);
          console.log(tradesRes);

          if (tradesRes.success) {
            const processedData = (tradesRes.trades || []).map(trade => ({
              date: trade.entry_date,
              roi: trade.roi
            }));
            setTradesData(processedData);
          }
          else {
            addToast(tradesRes.message || "No trades data received", "info");
          }
        } else {
          addToast("Failed to fetch strategy data", "error");
        }
      } catch (error) {
        addToast("Error fetching data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const processTradesData = (trades) => {
    if (!Array.isArray(trades)) return [];

    return trades
      .filter(trade => trade && trade.exit_date && (trade.roi !== undefined || trade.percent_pnl !== undefined))
      .sort((a, b) => new Date(a.exit_date) - new Date(b.exit_date))
      .map((trade, index) => ({
        id: trade._id || `trade-${index}`,
        period: `Trade ${index + 1}`,
        date: new Date(trade.exit_date).toLocaleDateString(),
        roi: Number(trade.roi !== undefined ? trade.roi : trade.percent_pnl) || 0,
        pnl: Number(trade.net_pnl) || 0,
        name: trade.name || 'Unknown',
        side: trade.side || 'N/A'
      }));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 border border-gray-700 p-2 sm:p-3 rounded shadow-lg text-xs sm:text-sm">
        <p className="font-bold text-[#27c284]">
          {data?.name ?? "Unknown"} ({data?.side ?? "N/A"})
        </p>
        <p className="text-gray-300">{data?.date ?? "Date not available"}</p>

        <p className={(Number(data?.pnl) ?? 0) >= 0 ? "text-green-400" : "text-red-400"}>
          <span className="font-bold">PNL:</span> ₹
          {typeof data?.pnl === 'number' ? data.pnl.toFixed(2) : "0.00"}
        </p>

        <p className={(Number(data?.roi) ?? 0) >= 0 ? "text-green-400" : "text-red-400"}>
          <span className="font-bold">ROI:</span>
          {typeof data?.roi === 'number' ? data.roi.toFixed(2) : "0.00"}%
        </p>
      </div>

    );
  };

  if (loading) {
    return <Loader />;
  }

  if (!strategy) {
    return <p className="text-center text-gray-300 p-4 sm:p-6">Failed to load strategy data</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 text-white">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#27c284] hover:text-[#1fa769] transition-colors text-sm sm:text-base"
        >
          <FaArrowLeft className="mr-1 sm:mr-2" size={14} />
          Back
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#27c284]">
          {strategy.name}
        </h1>
        <span className={`mt-1 sm:mt-0 sm:ml-auto px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${strategy.net_pnl >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
          }`}>
          {strategy.net_pnl >= 0 ? 'Profitable' : 'Losing'}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-4 sm:space-y-6">
        {/* Top Row - Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {/* Best Trade Card */}
          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700 shadow-lg h-28 sm:h-32">
            <h3 className="font-medium text-gray-300 mb-1 sm:mb-2 flex items-center text-xs sm:text-sm">
              <span className="bg-green-500/20 p-0.5 sm:p-1 rounded mr-1 sm:mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </span>
              Best Trade
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-green-400">
              ₹{strategy.max_win?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">Maximum profit in a single trade</p>
          </div>

          {/* Worst Trade Card */}
          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700 shadow-lg h-28 sm:h-32">
            <h3 className="font-medium text-gray-300 mb-1 sm:mb-2 flex items-center text-xs sm:text-sm">
              <span className="bg-red-500/20 p-0.5 sm:p-1 rounded mr-1 sm:mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
              </span>
              Worst Trade
            </h3>
            <p className="text-xl sm:text-2xl font-bold text-red-400">
              ₹{strategy.max_loss?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">Maximum loss in a single trade</p>
          </div>

          {/* Entry Rules Card */}
          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700 shadow-lg">
            <h2 className="font-semibold text-sm sm:text-base md:text-lg text-gray-300 mb-2 sm:mb-3 border-b border-gray-700 pb-1 sm:pb-2 flex items-center">
              <span className="bg-[#27c284]/20 p-0.5 sm:p-1 rounded mr-1 sm:mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#27c284]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </span>
              Entry Rules
            </h2>
            <ul className="space-y-1 sm:space-y-2">
              {strategy.entry_rules.slice(0, 2).map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[#27c284] mr-1 sm:mr-2 mt-0.5 text-xs sm:text-sm">•</span>
                  <span className="text-gray-200 text-xs sm:text-sm line-clamp-2">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exit Rules Card */}
          <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700 shadow-lg">
            <h2 className="font-semibold text-sm sm:text-base md:text-lg text-gray-300 mb-2 sm:mb-3 border-b border-gray-700 pb-1 sm:pb-2 flex items-center">
              <span className="bg-red-500/20 p-0.5 sm:p-1 rounded mr-1 sm:mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              Exit Rules
            </h2>
            <ul className="space-y-1 sm:space-y-2">
              {strategy.exit_rules.slice(0, 2).map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-400 mr-1 sm:mr-2 mt-0.5 text-xs sm:text-sm">•</span>
                  <span className="text-gray-200 text-xs sm:text-sm line-clamp-2">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Performance Overview Section */}
        <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-700 shadow-lg">
          <h2 className="font-semibold text-sm sm:text-base md:text-lg text-gray-300 mb-3 sm:mb-4 border-b border-gray-700 pb-1 sm:pb-2 flex items-center">
            <span className="bg-blue-500/20 p-0.5 sm:p-1 rounded mr-1 sm:mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </span>
            Performance Overview
          </h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <div className="bg-gray-750 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-xs sm:text-sm flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#27c284] rounded-full mr-1 sm:mr-2"></span>
                Net P&L
              </p>
              <p className={`text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1 ${strategy.net_pnl >= 0 ? 'text-[#27c284]' : 'text-red-400'
                }`}>
                ₹{strategy.net_pnl?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">Total profit/loss</p>
            </div>

            <div className="bg-gray-750 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-xs sm:text-sm flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full mr-1 sm:mr-2"></span>
                Win Rate
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">
                {strategy.win_rate}%
                <span className={`ml-1 sm:ml-2 text-xs ${strategy.win_rate > 50 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  ({strategy.win_rate > 50 ? 'Good' : 'Needs Improvement'})
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">Success ratio</p>
            </div>

            <div className="bg-gray-750 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-xs sm:text-sm flex items-center">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full mr-1 sm:mr-2"></span>
                Total Trades
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">
                {strategy.number_of_trades}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">Executed trades</p>
            </div>
          </div>

          {/* ROI Chart */}
          <div className="mt-4 sm:mt-6">
            <h3 className="text-sm sm:text-md font-medium text-gray-300 mb-2 sm:mb-3">ROI Over Time</h3>
            {tradesData.length > 0 ? (
              <div className="h-60 sm:h-72 md:h-80 bg-gray-850 rounded-lg p-1 sm:p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={tradesData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="period"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="roi"
                      name="ROI %"
                      stroke="#27c284"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5, fill: "#1a1f2c", stroke: "#27c284" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 sm:h-56 md:h-64 bg-gray-850 rounded-lg flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 text-sm sm:text-base">No valid trade data available</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center">
                  Trades must have exit dates and ROI values to be displayed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStrategy;