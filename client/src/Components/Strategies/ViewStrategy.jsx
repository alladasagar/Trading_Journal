import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStrategyById } from "../../Apis/Strategies";
import { useToast } from "../context/ToastContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FaArrowLeft } from "react-icons/fa";
import Loader from "../ui/Loader";

const ViewStrategy = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [strategy, setStrategy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await getStrategyById(id);
                if (res.success) {
                    setStrategy(res.data);
                } else {
                    addToast("Failed to fetch strategy data", "error");
                }
            } catch {
                addToast("Error fetching strategy data", "error");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return <Loader />;
    }

    if (!strategy) {
        return <p className="text-center text-gray-300 p-6">Failed to load strategy data</p>;
    }

    // Create data for the net P&L chart with monthly/weekly/daily breakdown
    const pnlData = [
        { period: "Week 1", pnl: 1200 },
        { period: "Week 2", pnl: -800 },
        { period: "Week 3", pnl: 2100 },
        { period: "Week 4", pnl: 1500 },
        // In a real app, you would use actual time series data from your backend
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-white">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-[#27c284] hover:text-[#1fa769] transition-colors"
                >
                    <FaArrowLeft className="mr-2" />
                    Back
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-[#27c284]">
                    {strategy.name}
                </h1>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                    strategy.net_pnl >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                }`}>
                    {strategy.net_pnl >= 0 ? 'Profitable' : 'Losing'}
                </span>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rules Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 shadow-lg">
                        <h2 className="font-semibold text-lg text-gray-300 mb-3 border-b border-gray-700 pb-2 flex items-center">
                            <span className="bg-[#27c284]/20 p-1 rounded mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#27c284]" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                </svg>
                            </span>
                            Entry Rules
                        </h2>
                        <ul className="space-y-3">
                            {strategy.entry_rules.map((rule, index) => (
                                <li key={index} className="flex items-start bg-gray-750/50 p-3 rounded-lg">
                                    <span className="text-[#27c284] mr-2 mt-0.5">•</span>
                                    <span className="text-gray-200">{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 shadow-lg">
                        <h2 className="font-semibold text-lg text-gray-300 mb-3 border-b border-gray-700 pb-2 flex items-center">
                            <span className="bg-red-500/20 p-1 rounded mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </span>
                            Exit Rules
                        </h2>
                        <ul className="space-y-3">
                            {strategy.exit_rules.map((rule, index) => (
                                <li key={index} className="flex items-start bg-gray-750/50 p-3 rounded-lg">
                                    <span className="text-red-400 mr-2 mt-0.5">•</span>
                                    <span className="text-gray-200">{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Stats and Chart Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Performance Overview */}
                    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 shadow-lg">
                        <h2 className="font-semibold text-lg text-gray-300 mb-4 border-b border-gray-700 pb-2 flex items-center">
                            <span className="bg-blue-500/20 p-1 rounded mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                </svg>
                            </span>
                            Performance Overview
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                                <p className="text-gray-400 text-sm flex items-center">
                                    <span className="w-2 h-2 bg-[#27c284] rounded-full mr-2"></span>
                                    Net P&L
                                </p>
                                <p className={`text-2xl font-bold mt-1 ${strategy.net_pnl >= 0 ? 'text-[#27c284]' : 'text-red-400'}`}>
                                    ₹{strategy.net_pnl?.toLocaleString() || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Total profit/loss</p>
                            </div>
                            
                            <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                                <p className="text-gray-400 text-sm flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                    Win Rate
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {strategy.win_rate}%
                                    <span className={`ml-2 text-xs ${strategy.win_rate > 50 ? 'text-green-400' : 'text-red-400'}`}>
                                        ({strategy.win_rate > 50 ? 'Good' : 'Needs Improvement'})
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Success ratio</p>
                            </div>
                            
                            <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
                                <p className="text-gray-400 text-sm flex items-center">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                                    Total Trades
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {strategy.number_of_trades}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Executed trades</p>
                            </div>
                        </div>
                        
                        {/* P&L Chart */}
                        <div className="mt-6">
                            <h3 className="text-md font-medium text-gray-300 mb-3">Net P&L Over Time</h3>
                            <div className="h-64 sm:h-80 bg-gray-850 rounded-lg p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={pnlData}>
                                        <XAxis 
                                            dataKey="period" 
                                            stroke="#6b7280" 
                                            tick={{ fill: '#9ca3af' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis 
                                            stroke="#6b7280" 
                                            tick={{ fill: '#9ca3af' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: '#1f2937',
                                                borderColor: '#374151',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            }}
                                            itemStyle={{ color: '#f3f4f6' }}
                                            labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                                            formatter={(value) => [`₹${value}`, 'Net P&L']}
                                        />
                                        <Bar 
                                            dataKey="pnl" 
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {pnlData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.pnl >= 0 ? '#27c284' : '#ef4444'} 
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    
                    {/* Additional Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 shadow-lg">
                            <h3 className="font-medium text-gray-300 mb-3 flex items-center">
                                <span className="bg-green-500/20 p-1 rounded mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                Best Trade
                            </h3>
                            <p className="text-2xl font-bold text-green-400">
                                ₹{strategy.max_win?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Maximum profit in a single trade</p>
                        </div>
                        
                        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 shadow-lg">
                            <h3 className="font-medium text-gray-300 mb-3 flex items-center">
                                <span className="bg-red-500/20 p-1 rounded mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                Worst Trade
                            </h3>
                            <p className="text-2xl font-bold text-red-400">
                                ₹{strategy.max_loss?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Maximum loss in a single trade</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewStrategy;