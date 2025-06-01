import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStrategyById } from "../../Apis/Strategies";
import { useToast } from "../context/ToastContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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

    const graphData = [
        { name: "Net P&L", value: strategy.net_pnl || 0 },
        { name: "Max Win", value: strategy.max_win || 0 },
        { name: "Max Loss", value: strategy.max_loss || 0 },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 text-white">
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
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rules Section */}
                <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                        <h2 className="font-semibold text-lg text-gray-300 mb-3 border-b border-gray-700 pb-2">
                            Entry Rules
                        </h2>
                        <ul className="space-y-2">
                            {strategy.entry_rules.map((rule, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-[#27c284] mr-2">•</span>
                                    <span className="text-gray-200">{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                        <h2 className="font-semibold text-lg text-gray-300 mb-3 border-b border-gray-700 pb-2">
                            Exit Rules
                        </h2>
                        <ul className="space-y-2">
                            {strategy.exit_rules.map((rule, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-[#27c284] mr-2">•</span>
                                    <span className="text-gray-200">{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                        <h2 className="font-semibold text-lg text-gray-300 mb-3 border-b border-gray-700 pb-2">
                            Performance Metrics
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-750 p-3 rounded">
                                <p className="text-gray-400 text-sm">Win Rate</p>
                                <p className="text-xl font-semibold">
                                    {strategy.win_rate}%
                                    <span className={`ml-2 text-xs ${strategy.win_rate > 50 ? 'text-green-400' : 'text-red-400'}`}>
                                        ({strategy.win_rate > 50 ? 'Good' : 'Needs Improvement'})
                                    </span>
                                </p>
                            </div>
                            <div className="bg-gray-750 p-3 rounded">
                                <p className="text-gray-400 text-sm">Net P&L</p>
                                <p className={`text-xl font-semibold ${strategy.net_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ₹{strategy.net_pnl}
                                </p>
                            </div>
                            <div className="bg-gray-750 p-3 rounded">
                                <p className="text-gray-400 text-sm">Max Win</p>
                                <p className="text-green-400 text-xl font-semibold">
                                    ₹{strategy.max_win}
                                </p>
                            </div>
                            <div className="bg-gray-750 p-3 rounded">
                                <p className="text-gray-400 text-sm">Max Loss</p>
                                <p className="text-red-400 text-xl font-semibold">
                                    ₹{strategy.max_loss}
                                </p>
                            </div>
                            <div className="bg-gray-750 p-3 rounded sm:col-span-2">
                                <p className="text-gray-400 text-sm">Total Trades</p>
                                <p className="text-xl font-semibold">
                                    {strategy.number_of_trades}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                        <h2 className="font-semibold text-lg text-gray-300 mb-3 border-b border-gray-700 pb-2">
                            Performance Chart
                        </h2>
                        <div className="h-64 sm:h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData}>
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#6b7280" 
                                        tick={{ fill: '#9ca3af' }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280" 
                                        tick={{ fill: '#9ca3af' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            borderColor: '#374151',
                                            borderRadius: '0.5rem',
                                        }}
                                        itemStyle={{ color: '#f3f4f6' }}
                                        labelStyle={{ color: '#9ca3af' }}
                                    />
                                    <Bar 
                                        dataKey="value" 
                                        fill="#27c284" 
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewStrategy;