import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { addStrategy, getStrategyById, updateStrategy } from "../../Apis/Strategies";
import { strategyCache } from "../../utilities/Cache/StrategyCache";
import Loader from "../ui/Loader";
import { FaArrowLeft, FaPlus, FaTimes, FaSave } from "react-icons/fa";

const AddStrategy = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [strategyName, setStrategyName] = useState("");
  const [entryRules, setEntryRules] = useState([]);
  const [exitRules, setExitRules] = useState([]);
  const [newEntryRule, setNewEntryRule] = useState("");
  const [newExitRule, setNewExitRule] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      (async () => {
        setLoading(true);
        
        // Check cache first for this specific strategy
        const cachedStrategies = strategyCache.get().data;
        if (cachedStrategies) {
          const cachedStrategy = cachedStrategies.find(s => s._id === id);
          if (cachedStrategy) {
            setStrategyName(cachedStrategy.name || "");
            setEntryRules(cachedStrategy.entry_rules || []);
            setExitRules(cachedStrategy.exit_rules || []);
            setLoading(false);
            return;
          }
        }

        try {
          const res = await getStrategyById(id);
          if (res.success) {
            const data = res.data;
            setStrategyName(data.name || "");
            setEntryRules(data.entry_rules || []);
            setExitRules(data.exit_rules || []);
          } else {
            addToast("Failed to fetch strategy", "error");
          }
        } catch {
          addToast("Failed to fetch strategy", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  const handleAddRule = (type) => {
    if (type === "entry" && newEntryRule.trim()) {
      setEntryRules([...entryRules, newEntryRule]);
      setNewEntryRule("");
    }
    if (type === "exit" && newExitRule.trim()) {
      setExitRules([...exitRules, newExitRule]);
      setNewExitRule("");
    }
  };

  const handleRemoveRule = (index, type) => {
    if (type === "entry") setEntryRules(entryRules.filter((_, i) => i !== index));
    else setExitRules(exitRules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!strategyName.trim()) return addToast("Strategy name is required", "error");
    if (!entryRules.length || !exitRules.length) return addToast("Both rules are required", "error");

    try {
      setLoading(true);
      const payload = {
        name: strategyName,
        entry_rules: entryRules,
        exit_rules: exitRules
      };

      const res = isEdit
        ? await updateStrategy(id, payload)
        : await addStrategy(strategyName, entryRules, exitRules);

      if (res.status === 201 || res.success) {
        addToast(`Strategy ${isEdit ? "updated" : "saved"}`, "success");
        // Invalidate cache after save/update
        strategyCache.invalidate();
        setTimeout(() => navigate("/strategies"), 800);
      } else {
        addToast(res.message || "Failed to save strategy", "error");
      }
    } catch {
      addToast("Failed to save strategy", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-[#27c284] hover:text-[#1fa769] transition-colors cursor-pointer"
        >
          <FaArrowLeft className="mr-2" />
          Back to Strategies
        </button>
        <h1 className="text-lg sm:text-xl text-white font-semibold">
          {isEdit ? "Edit Strategy" : "Create New Strategy"}
        </h1>
        <div className="w-10"></div> 
      </div>

      <div className="space-y-2">
        <label className="block text-sm sm:text-base text-gray-300">Strategy Name</label>
        <input
          className="w-full p-2 sm:p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-[#27c284] focus:outline-none"
          value={strategyName}
          onChange={(e) => setStrategyName(e.target.value)}
          placeholder="Enter strategy name"
        />
      </div>

      {/* Entry Rules */}
      <div className="space-y-2">
        <label className="block text-sm sm:text-base text-gray-300">Entry Rules</label>
        <div className="flex gap-2">
          <input
            value={newEntryRule}
            onChange={(e) => setNewEntryRule(e.target.value)}
            className="flex-1 p-2 sm:p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-[#27c284] focus:outline-none"
            placeholder="Add entry rule"
          />
          <button 
            className="bg-[#27c284] hover:bg-[#1fa769] px-3 sm:px-4 py-2 rounded flex items-center transition-colors"
            onClick={() => handleAddRule("entry")}
          >
            <FaPlus className="sm:mr-1" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
        <ul className="mt-2 space-y-2">
          {entryRules.map((rule, i) => (
            <li key={i} className="flex justify-between items-center p-2 sm:p-3 bg-gray-750 rounded">
              <span className="text-white text-sm sm:text-base">{rule}</span>
              <button 
                onClick={() => handleRemoveRule(i, "entry")} 
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Remove rule"
              >
                <FaTimes />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Exit Rules */}
      <div className="space-y-2">
        <label className="block text-sm sm:text-base text-gray-300">Exit Rules</label>
        <div className="flex gap-2">
          <input
            value={newExitRule}
            onChange={(e) => setNewExitRule(e.target.value)}
            className="flex-1 p-2 sm:p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-[#27c284] focus:outline-none"
            placeholder="Add exit rule"
          />
          <button 
            className="bg-[#27c284] hover:bg-[#1fa769] px-3 sm:px-4 py-2 rounded flex items-center transition-colors"
            onClick={() => handleAddRule("exit")}
          >
            <FaPlus className="sm:mr-1" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
        <ul className="mt-2 space-y-2">
          {exitRules.map((rule, i) => (
            <li key={i} className="flex justify-between items-center p-2 sm:p-3 bg-gray-750 rounded">
              <span className="text-white text-sm sm:text-base">{rule}</span>
              <button 
                onClick={() => handleRemoveRule(i, "exit")} 
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Remove rule"
              >
                <FaTimes />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={handleSave} 
        className="w-full bg-[#27c284] hover:bg-[#1fa769] p-3 rounded text-white font-medium flex items-center justify-center transition-colors cursor-pointer"
      >
        <FaSave className="mr-2" />
        {isEdit ? "Update Strategy" : "Save Strategy"}
      </button>
    </div>
  );
};

export default AddStrategy;