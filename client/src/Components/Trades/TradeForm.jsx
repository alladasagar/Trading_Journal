import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addTrade, fetchTradeById, updateTrade } from "../../Apis/Trades";
import { getStrategyById as fetchStrategyById } from "../../Apis/Strategies";
import { useToast } from "../context/ToastContext";
import Loader from "../ui/Loader";

const TradeForm = ({ isEdit = false }) => {
  const { strategyId, tradeId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(isEdit);

  const [strategy, setStrategy] = useState({
    entry_rules: [],
    exit_rules: []
  });

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

  const [form, setForm] = useState({
    name: "",
    side: "Short",
    entry: "",
    exit: "",
    stop_loss: "",
    shares: "",
    charges: "",
    entry_date: new Date().toISOString().split("T")[0],
    exit_date: "",
    target: "",
    notes: "",
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    time: "",
    duration: "",
    screenshot: "",
    mistakes: [""],
    emojis: "",
    strategyId: strategyId,
    entry_rules: [],
    exit_rules: []
  });

  const [calculated, setCalculated] = useState({
    capital: 0,
    gross_pnl: 0,
    net_pnl: 0,
    percent_pnl: 0,
    roi: 0,
  });

  const [errors, setErrors] = useState({});

  // Load trade data if in edit mode
  useEffect(() => {
    if (!isEdit) return;

    const loadTrade = async () => {
      try {
        const result = await fetchTradeById(tradeId);
        if (result.success) {
          const trade = result.trade;
          const entryDate = trade.entry_date ? new Date(trade.entry_date).toISOString().split('T')[0] : '';
          const exitDate = trade.exit_date ? new Date(trade.exit_date).toISOString().split('T')[0] : '';

          setForm(prev => ({
            ...prev,
            name: trade.name || "",
            side: trade.side || "Short",
            entry: trade.entry != null ? trade.entry.toString() : "",
            exit: trade.exit != null ? trade.exit.toString() : "",
            stop_loss: trade.stop_loss != null ? trade.stop_loss.toString() : "",
            shares: trade.shares != null ? trade.shares.toString() : "",
            charges: trade.charges != null ? trade.charges.toString() : "",
            entry_date: entryDate,
            exit_date: exitDate,
            target: trade.target != null ? trade.target.toString() : "",
            notes: trade.notes || "",
            day: trade.day || (entryDate ? new Date(entryDate).toLocaleDateString("en-US", { weekday: "long" }) : ""),
            time: trade.time || "",
            duration: trade.duration || "",
            screenshot: trade.screenshot || "",
            mistakes: Array.isArray(trade.mistakes) && trade.mistakes.length > 0 ? trade.mistakes : [""],
            emojis: trade.emojis || "",
            entry_rules: Array.isArray(trade.entry_rules) ? trade.entry_rules : [],
            exit_rules: Array.isArray(trade.exit_rules) ? trade.exit_rules : []
          }));

          setPreviewImage(trade.screenshot || "");
        } else {
          addToast(result.message || "Failed to load trade", "error");
          navigate(-1);
        }
      } catch (error) {
        addToast("An error occurred while loading trade", "error");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadTrade();
  }, [isEdit, tradeId, addToast, navigate, strategyId]);

  useEffect(() => {
    const loadStrategy = async () => {
      try {
        const result = await fetchStrategyById(strategyId);
        if (result.success) {
          setStrategy({
            entry_rules: result.data?.entry_rules || [],
            exit_rules: result.data?.exit_rules || []
          });
        }
      } catch (error) {
        console.error("Failed to load strategy", error);
      }
    };

    loadStrategy();
  }, [strategyId]);

  // Calculate derived values
  useEffect(() => {
    if (form.entry_date) {
      const weekday = new Date(form.entry_date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      setForm(prev => ({ ...prev, day: weekday }));
    }

    const entry = parseFloat(form.entry) || 0;
    const exit = parseFloat(form.exit) || 0;
    const shares = parseFloat(form.shares) || 0;
    const stopLoss = parseFloat(form.stop_loss) || 0;
    const charges = parseFloat(form.charges) || 0;

    const capital = parseFloat((entry * shares).toFixed(2));
    const grossPnl = parseFloat((
      form.side === "Short" ? (exit - entry) * shares : (entry - exit) * shares
    ).toFixed(2));
    const netPnl = parseFloat((grossPnl - charges).toFixed(2));
    const percentPnl = parseFloat((capital ? (netPnl / capital) * 100 : 0).toFixed(2));

    let roi = 0;
    if (form.side === "Short" && entry - stopLoss !== 0) {
      roi = parseFloat(((exit - entry) / (entry - stopLoss)).toFixed(2));
    } else if (form.side === "Long" && stopLoss - entry !== 0) {
      roi = parseFloat(((entry - exit) / (stopLoss - entry)).toFixed(2));
    }

    let duration = "";
    if (form.entry_date && form.exit_date) {
      const start = new Date(form.entry_date);
      const end = new Date(form.exit_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      duration = `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    }

    setCalculated({
      capital,
      gross_pnl: grossPnl,
      net_pnl: netPnl,
      percent_pnl: percentPnl,
      roi,
    });

    if (duration) {
      setForm(prev => ({ ...prev, duration }));
    }
  }, [
    form.entry,
    form.exit,
    form.shares,
    form.stop_loss,
    form.charges,
    form.side,
    form.entry_date,
    form.exit_date,
  ]);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'name',
      'side',
      'entry',
      'stop_loss',
      'shares',
      'charges',
      'entry_date'
    ];

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!form[field]) {
        newErrors[field] = `${field.replace(/_/g, ' ')} is required`;
      }
    });

    // Validate array fields
    if (!form.entry_rules || form.entry_rules.length === 0) {
      newErrors.entry_rules = 'At least one entry rule must be selected';
    }

    if (!form.exit_rules || form.exit_rules.length === 0) {
      newErrors.exit_rules = 'At least one exit rule must be selected';
    }

    // Validate number fields
    const numberFields = ['entry', 'exit', 'stop_loss', 'shares', 'charges', 'target'];
    numberFields.forEach((field) => {
      if (form[field] && isNaN(form[field])) {
        newErrors[field] = `${field.replace(/_/g, ' ')} must be a valid number`;
      } else if (form[field] && parseFloat(form[field]) < 0) {
        newErrors[field] = `${field.replace(/_/g, ' ')} must be positive`;
      }
    });

    // Validate shares is a whole number
    if (form.shares && !Number.isInteger(parseFloat(form.shares))) {
      newErrors.shares = 'Shares must be a whole number';
    }

    // Validate dates
    if (form.entry_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const entryDate = new Date(form.entry_date);

      // Set both dates to midnight for accurate comparison
      const entryDateAtMidnight = new Date(entryDate);
      entryDateAtMidnight.setHours(0, 0, 0, 0);

      if (entryDateAtMidnight > today) {
        newErrors.entry_date = 'Entry date cannot be in the future';
      }
    }

    if (form.exit_date && form.entry_date) {
      const entryDate = new Date(form.entry_date);
      const exitDate = new Date(form.exit_date);

      if (exitDate < entryDate) {
        newErrors.exit_date = 'Exit date must be after entry date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm(prev => ({ ...prev, [field]: updated }));
  };

  const addArrayField = (field) => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayField = (field, index) => {
    const updated = form[field].filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, [field]: updated }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      addToast("Please upload a valid image (JPEG, PNG, GIF)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size should be less than 5MB", "error");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Trading_Journal");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dmtzqbef2/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setForm(prev => ({ ...prev, screenshot: data.secure_url }));
        setPreviewImage(data.secure_url);
        addToast("Screenshot uploaded successfully", "success");
      } else {
        addToast("Failed to upload screenshot", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      addToast("Error uploading screenshot", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast("Please fill all required fields correctly", "error");
      return;
    }

    try {
      const tradeData = {
        ...form,
        ...calculated,
        strategyId: strategyId,
        entry: parseFloat(form.entry),
        exit: form.exit ? parseFloat(form.exit) : null,
        stop_loss: parseFloat(form.stop_loss),
        shares: parseFloat(form.shares),
        charges: parseFloat(form.charges),
        target: form.target ? parseFloat(form.target) : null,
        mistakes: form.mistakes.filter((m) => m !== ""),
        emojis: form.emojis,
        entry_rules: form.entry_rules,
        exit_rules: form.exit_rules,
        entry_date: new Date(form.entry_date).toISOString(),
        exit_date: form.exit_date ? new Date(form.exit_date).toISOString() : null,
      };

      let result;
      if (isEdit) {
        result = await updateTrade(tradeId, tradeData);
      } else {
        result = await addTrade(strategyId, tradeData);
      }

      if (result.success) {
        addToast(`Trade ${isEdit ? "updated" : "added"} successfully`, "success");
        navigate(`/strategies/${strategyId}/trades`);
      } else {
        addToast(result.message || `Failed to ${isEdit ? "update" : "add"} trade`, "error");
      }
    } catch (error) {
      console.error("Trade submission error:", error);
      addToast(`An error occurred while ${isEdit ? "updating" : "saving"} the trade`, "error");
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">
        {isEdit ? "Edit Trade" : "Add Trade"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trade Name */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Trade Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="My Awesome Trade"
            className={`w-full p-2 rounded bg-gray-800 border ${errors.name ? "border-red-500" : "border-gray-700"}`}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Day */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Day</label>
          <input
            type="text"
            value={form.day}
            readOnly
            className="w-full p-2 rounded bg-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Side */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Side *</label>
          <select
            name="side"
            value={form.side}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="Short">Short</option>
            <option value="Long">Long</option>
          </select>
        </div>

        {/* Entry Rules */}
        <div className="col-span-2 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-emerald-400">Entry Rules</h3>
          {errors.entry_rules && <p className="text-red-400 text-xs mb-2">{errors.entry_rules}</p>}
          {strategy.entry_rules.length > 0 ? (
            <ul className="space-y-2">
              {strategy.entry_rules.map((rule, index) => (
                <li key={`entry-${index}`} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`entry-rule-${index}`}
                    checked={form.entry_rules.includes(rule)}
                    onChange={() => {
                      const newRules = form.entry_rules.includes(rule)
                        ? form.entry_rules.filter(r => r !== rule)
                        : [...form.entry_rules, rule];
                      setForm(prev => ({ ...prev, entry_rules: newRules }));
                    }}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor={`entry-rule-${index}`} className="text-sm">
                    {rule}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No entry rules defined for this strategy</p>
          )}
        </div>

        {/* Exit Rules */}
        <div className="col-span-2 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-emerald-400">Exit Rules</h3>
          {errors.exit_rules && <p className="text-red-400 text-xs mb-2">{errors.exit_rules}</p>}
          {strategy.exit_rules.length > 0 ? (
            <ul className="space-y-2">
              {strategy.exit_rules.map((rule, index) => (
                <li key={`exit-${index}`} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`exit-rule-${index}`}
                    checked={form.exit_rules.includes(rule)}
                    onChange={() => {
                      const newRules = form.exit_rules.includes(rule)
                        ? form.exit_rules.filter(r => r !== rule)
                        : [...form.exit_rules, rule];
                      setForm(prev => ({ ...prev, exit_rules: newRules }));
                    }}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor={`exit-rule-${index}`} className="text-sm">
                    {rule}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No exit rules defined for this strategy</p>
          )}
        </div>

        {/* Entry Price */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Entry Price *</label>
          <input
            type="number"
            step="0.01"
            name="entry"
            value={form.entry}
            onChange={handleChange}
            placeholder="100.50"
            className={`w-full p-2 rounded bg-gray-800 border ${errors.entry ? "border-red-500" : "border-gray-700"}`}
          />
          {errors.entry && <p className="text-red-400 text-xs mt-1">{errors.entry}</p>}
        </div>

        {/* Exit Price */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Exit Price *</label>
          <input
            type="number"
            step="0.01"
            name="exit"
            value={form.exit}
            onChange={handleChange}
            placeholder="105.75"
            className={`w-full p-2 rounded bg-gray-800 border ${errors.exit ? "border-red-500" : "border-gray-700"}`}
          />
          {errors.exit && <p className="text-red-400 text-xs mt-1">{errors.exit}</p>}
        </div>

        {/* Stop Loss */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Stop Loss *</label>
          <input
            type="number"
            step="0.01"
            name="stop_loss"
            value={form.stop_loss}
            onChange={handleChange}
            placeholder="95.25"
            className={`w-full p-2 rounded bg-gray-800 border ${errors.stop_loss ? "border-red-500" : "border-gray-700"}`}
          />
          {errors.stop_loss && <p className="text-red-400 text-xs mt-1">{errors.stop_loss}</p>}
        </div>

        {/* Shares */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Shares *</label>
          <input
            type="number"
            name="shares"
            value={form.shares}
            onChange={handleChange}
            placeholder="100"
            className={`w-full p-2 rounded bg-gray-800 border ${errors.shares ? "border-red-500" : "border-gray-700"}`}
          />
          {errors.shares && <p className="text-red-400 text-xs mt-1">{errors.shares}</p>}
        </div>

        {/* Charges */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Charges *</label>
          <input
            type="number"
            step="0.01"
            name="charges"
            value={form.charges}
            onChange={handleChange}
            placeholder="20.50"
            className={`w-full p-2 rounded bg-gray-800 border ${errors.charges ? "border-red-500" : "border-gray-700"}`}
          />
          {errors.charges && <p className="text-red-400 text-xs mt-1">{errors.charges}</p>}
        </div>

        {/* Target */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Target</label>
          <input
            type="number"
            step="0.01"
            name="target"
            value={form.target}
            onChange={handleChange}
            placeholder="110.00"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Entry Date */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Entry Date *</label>
          <input
            type="date"
            name="entry_date"
            value={form.entry_date}
            onChange={handleChange}
            className={`w-full p-2 rounded bg-gray-800 border ${errors.entry_date ? "border-red-500" : "border-gray-700"}`}
          />
          {errors.entry_date && <p className="text-red-400 text-xs mt-1">{errors.entry_date}</p>}
        </div>

        {/* Exit Date */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Exit Date</label>
          <input
            type="date"
            name="exit_date"
            value={form.exit_date}
            onChange={handleChange}
            className={`w-full p-2 rounded bg-gray-800 border ${errors.exit_date ? "border-red-500" : "border-gray-700"}`}
          />
          {errors.exit_date && <p className="text-red-400 text-xs mt-1">{errors.exit_date}</p>}
        </div>

        {/* Time */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Duration */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Duration</label>
          <input
            type="text"
            value={form.duration}
            readOnly
            placeholder="Calculated automatically"
            className="w-full p-2 rounded bg-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any additional notes about the trade..."
            rows="3"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Screenshot Upload */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Screenshot</label>
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <div className="bg-gray-800 border border-gray-700 rounded p-4 text-center cursor-pointer hover:bg-gray-700 transition">
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <span className="text-emerald-400">Choose File</span>
                    <span className="text-gray-400 text-sm block mt-1">
                      {previewImage ? "Change image" : "JPEG, PNG (max 5MB)"}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            </label>
            {previewImage && (
              <div className="flex-1">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-32 object-contain border border-gray-700 rounded"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mistakes */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Mistakes</label>
          {form.mistakes.map((m, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={m}
                onChange={(e) => handleArrayChange("mistakes", i, e.target.value)}
                placeholder={`Mistake ${i + 1}`}
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-700"
              />
              {form.mistakes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField("mistakes", i)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 rounded"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField("mistakes")}
            className="text-sm text-emerald-400 hover:text-emerald-300 mt-2"
          >
            + Add Mistake
          </button>
        </div>

        {/* Emojis */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Mood Emoji</label>
          <select
            name="emojis"
            value={form.emojis}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="">Select an emoji...</option>
            {EMOJI_OPTIONS.map((emoji) => (
              <option key={emoji.value} value={emoji.value}>
                {emoji.value} {emoji.label}
              </option>
            ))}
          </select>
          {form.emojis && (
            <div className="mt-2 text-2xl">
              Selected: {form.emojis}
            </div>
          )}
        </div>

        {/* Calculations */}
        <div className="col-span-2 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-emerald-400">
            Trade Calculations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Capital</div>
              <div className="font-bold">₹{calculated.capital.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Gross P&L</div>
              <div className={`font-bold ${calculated.gross_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                ₹{calculated.gross_pnl.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Net P&L</div>
              <div className={`font-bold ${calculated.net_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                ₹{calculated.net_pnl.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">% P&L</div>
              <div className={`font-bold ${calculated.percent_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {calculated.percent_pnl.toFixed(2)}%
              </div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">ROI</div>
              <div className={`font-bold ${calculated.roi >= 0 ? "text-green-400" : "text-red-400"}`}>
                {calculated.roi.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="col-span-2 flex justify-center">
          <button
            type="submit"
            disabled={isUploading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg w-full md:w-1/2 transition duration-200"
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              isEdit ? "Update Trade" : "Save Trade"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeForm;