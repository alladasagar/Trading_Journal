import React, { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../ui/ConfirmModal";
import { fetchStrategies, deleteStrategy } from "../../Apis/Strategies";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const DisplayStrategy = () => {
  const [strategies, setStrategies] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadStrategies = async () => {
    const result = await fetchStrategies();
    if (result.success) {
      setStrategies(result.data);
    } else {
      addToast(result.message || "Failed to load strategies", "error");
    }
  };

  const confirmDeleteStrategy = (strategyId) => {
    setStrategyToDelete(strategyId);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    const result = await deleteStrategy(strategyToDelete);
    setIsConfirmOpen(false);
    setStrategyToDelete(null);
    if (result.success) {
      addToast("Strategy deleted successfully", "success");
      setStrategies((prev) => prev.filter((s) => s._id !== strategyToDelete));
    } else {
      addToast(result.message || "Failed to delete strategy", "error");
    }
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  if (strategies.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 text-center">
        <h3 className="text-lg sm:text-xl font-medium text-gray-300 mb-2">
          No Trading Strategies Yet
        </h3>
        <p className="text-gray-400 mb-4 sm:mb-6">
          Start by adding your first trading strategy.
        </p>
        <button
          className="bg-[#27c284] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-[#1fa769] flex items-center mx-auto"
          onClick={() => navigate("/add-strategy")}
        >
          <FaPlus className="mr-2" />
          Add Your First Strategy
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className={isConfirmOpen ? "blur-sm pointer-events-none" : ""}>
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          {/* Fixed height container with overflow */}
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr>
                  {["Strategy Name", "Win Rate", "Net P&L", "Max Win", "Max Loss", "Trades", "Actions"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-xs font-medium text-[#27c284] uppercase tracking-wider sm:px-6"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {strategies.map((strategy) => (
                  <tr
                    key={strategy._id}
                    className="hover:bg-gray-750 cursor-pointer"
                    onClick={(e) => {
                      // Prevent row navigation if action icon is clicked
                      if (e.target.closest("button")) return;
                      navigate(`/strategies/${strategy._id}/trades`);
                    }}
                  >
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">
                      {strategy.name}
                    </td>
                    <td className="px-4 py-4 text-sm sm:px-6">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${strategy.win_rate > 50
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                          }`}
                      >
                        {strategy.win_rate || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-green-400 sm:px-6">
                      {(strategy.net_pnl || 0).toLocaleString()} RS
                    </td>
                    <td className="px-4 py-4 text-sm text-green-400 sm:px-6">
                      {(strategy.max_win || 0).toLocaleString()} RS
                    </td>
                    <td className="px-4 py-4 text-sm text-red-400 sm:px-6">
                      {(strategy.max_loss || 0).toLocaleString()} RS
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 sm:px-6">
                      {strategy.number_of_trades || 0}
                    </td>
                    <td className="px-4 py-4 text-sm sm:px-6">
                      <div
                        className="flex space-x-2 sm:space-x-3"
                        onClick={(e) => e.stopPropagation()} // Prevent triggering row click
                      >
                        <button
                          onClick={() => navigate(`/strategies/${strategy._id}`)}
                          className="text-[#27c284] hover:text-[#1fa769] transition-colors"
                          title="View"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/edit-strategy/${strategy._id}`)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => confirmDeleteStrategy(strategy._id)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setStrategyToDelete(null);
        }}
        onConfirm={handleDeleteConfirmed}
        title="Delete Strategy?"
        message="Are you sure you want to delete this strategy? This action cannot be undone."
      />
    </div>
  );
};

export default DisplayStrategy;