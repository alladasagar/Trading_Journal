import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addTrade, fetchTradeById, updateTrade } from "../../Apis/Trades";
import { getStrategyById as fetchStrategyById } from "../../Apis/Strategies";
import { graphCache } from "../../utilities/Cache/GraphCache";
import { calendarCache } from "../../utilities/Cache/CalendarCache";
import { useToast } from "../context/ToastContext";
import Loader from "../ui/Loader";

const TradeForm = ({ isEdit = false }) => {
  const { strategyId, tradeId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
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
    shares: 0,
    charges: "",
    entry_date: new Date().toISOString().split("T")[0],
    exit_date: "",
    target: "",
    notes: "",
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    time: "",
    duration: "",
    screenshots: [],
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
            charges: trade.charges != null ? trade.charges.toString() : "0",
            entry_date: entryDate,
            exit_date: exitDate,
            target: trade.target != null ? trade.target.toString() : "",
            notes: trade.notes || "",
            day: trade.day || (entryDate ? new Date(entryDate).toLocaleDateString("en-US", { weekday: "long" }) : ""),
            time: trade.time || "",
            duration: trade.duration || "",
            screenshots: trade.screenshots || [],
            mistakes: Array.isArray(trade.mistakes) && trade.mistakes.length > 0 ? trade.mistakes : [""],
            emojis: trade.emojis || "",
            entry_rules: Array.isArray(trade.entry_rules) ? trade.entry_rules : [],
            exit_rules: Array.isArray(trade.exit_rules) ? trade.exit_rules : []
          }));
        } else {
          addToast(result.message || "Failed to load trade", "error");
        }
      } catch (error) {
        addToast("An error occurred while loading trade", "error");
        console.error("Error loading trade:", error);
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
      form.side === "Long" ? (exit - entry) * shares : (entry - exit) * shares
    ).toFixed(2));
    const netPnl = parseFloat((grossPnl - charges).toFixed(2));
    const percentPnl = parseFloat((capital ? (netPnl / capital) * 100 : 0).toFixed(2));

    let roi = 0;
    if (form.side === "Long" && entry - stopLoss !== 0) {
      roi = parseFloat(((exit - entry) / (entry - stopLoss)).toFixed(2));
    } else if (form.side === "Short" && stopLoss - entry !== 0) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        image.src = e.target.result;
      };

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleFactor = maxWidth / image.width;
        const width = maxWidth;
        const height = image.height * scaleFactor;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      reader.onerror = reject;
      image.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      addToast("Please upload only valid images (JPEG, PNG, GIF)", "error");
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      addToast("Some images exceed 5MB limit", "error");
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const compressed = await compressImage(file); 
        const formData = new FormData();
        formData.append("file", compressed);
        formData.append("upload_preset", "Trading_Journal");

        return fetch("https://api.cloudinary.com/v1_1/dmtzqbef2/image/upload", {
          method: "POST",
          body: formData,
        }).then(response => response.json());
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.secure_url);

      if (successfulUploads.length > 0) {
        const newUrls = successfulUploads.map(result => result.secure_url);
        setForm(prev => ({
          ...prev,
          screenshots: [...prev.screenshots, ...newUrls]
        }));
        addToast(`Uploaded ${successfulUploads.length} image(s) successfully`, "success");
      } else {
        addToast("Failed to upload images", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      addToast("Error uploading images", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (form.entry_date) {
      const dayOfWeek = new Date(form.entry_date).toLocaleDateString("en-US", {
        weekday: "long"
      });
      setForm(prev => ({ ...prev, day: dayOfWeek }));
    }
  }, [form.entry_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tradeData = {
        ...form,
        ...calculated,
        strategyId: strategyId,
        entry: form.entry ? parseFloat(form.entry) : 0,
        exit: form.exit ? parseFloat(form.exit) : 0,
        stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : 0,
        shares: form.shares ? parseFloat(form.shares) : 0,
        charges: form.charges ? parseFloat(form.charges) : 0, 
        target: form.target ? parseFloat(form.target) : 0,
        mistakes: form.mistakes.filter((m) => m !== ""),
        emojis: form.emojis,
        screenshots: form.screenshots,
        entry_rules: form.entry_rules,
        exit_rules: form.exit_rules,
        entry_date: form.entry_date ? new Date(form.entry_date).toISOString() : null,
        exit_date: form.exit_date ? new Date(form.exit_date).toISOString() : null,
      };

      let result;
      if (isEdit) {
        result = await updateTrade(tradeId, tradeData);
      } else {
        result = await addTrade(strategyId, tradeData);
      }

      if (result.success) {
        graphCache.invalidate();
        calendarCache.invalidate();
        addToast(`Trade ${isEdit ? "updated" : "added"} successfully`, "success");
        navigate(`/strategies/${strategyId}/trades`);
      } else {
        addToast(result.message || `Failed to ${isEdit ? "update" : "add"} trade`, "error");
      }
    } catch (error) {
      console.error("Trade submission error:", error);
      addToast(`An error occurred while ${isEdit ? "updating" : "saving"} the trade`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-900 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-4 sm:mb-6 text-center">
        {isEdit ? "Edit Trade" : "Add Trade"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Trade Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="My Awesome Trade"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
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
          <label className="block text-sm font-medium mb-1">Side</label>
          <select
            name="side"
            value={form.side}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="Short">Short</option>
            <option value="Long">Long</option>
          </select>
        </div>

        {/* Entry Rules */}
        <div className="col-span-2 bg-gray-800 p-3 sm:p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-emerald-400">Entry Rules</h3>
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
        <div className="col-span-2 bg-gray-800 p-3 sm:p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-emerald-400">Exit Rules</h3>
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
          <label className="block text-sm font-medium mb-1">Entry Price</label>
          <input
            type="number"
            step="0.01"
            name="entry"
            value={form.entry}
            onChange={handleChange}
            placeholder="100.50"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Exit Price */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Exit Price</label>
          <input
            type="number"
            step="0.01"
            name="exit"
            value={form.exit}
            onChange={handleChange}
            placeholder="105.75"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Stop Loss */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Stop Loss</label>
          <input
            type="number"
            step="0.01"
            name="stop_loss"
            value={form.stop_loss}
            onChange={handleChange}
            placeholder="95.25"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Shares */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Shares</label>
          <input
            type="number"
            name="shares"
            value={form.shares}
            onChange={handleChange}
            placeholder="100"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Charges */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Charges</label>
          <input
            type="number"
            step="0.01"
            name="charges"
            value={form.charges}
            onChange={handleChange}
            placeholder="20.50"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
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
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Entry Date */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Entry Date</label>
          <input
            type="date"
            name="entry_date"
            value={form.entry_date}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Exit Date */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Exit Date</label>
          <input
            type="date"
            name="exit_date"
            value={form.exit_date}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Time */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Screenshot Upload */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Screenshots</label>
          <div className="flex flex-col gap-4">
            <label>
              <div className="bg-gray-800 border border-gray-700 rounded p-3 sm:p-4 text-center cursor-pointer hover:bg-gray-700 transition">
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <span className="text-emerald-400">Choose Files</span>
                    <span className="text-gray-400 text-xs sm:text-sm block mt-1">
                      {form.screenshots.length > 0
                        ? "Add more images"
                        : "JPEG, PNG (max 5MB each, multiple allowed)"}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                  multiple
                />
              </div>
            </label>

            {form.screenshots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {form.screenshots.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-contain border border-gray-700 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
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
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {form.mistakes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField("mistakes", i)}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 rounded text-sm sm:text-base"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField("mistakes")}
            className="text-sm text-emerald-400 hover:text-emerald-300 mt-2 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Mistake
          </button>
        </div>

        {/* Emojis */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Mood Emoji</label>
          <select
            name="emojis"
            value={form.emojis}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
        <div className="col-span-2 bg-gray-800 p-3 sm:p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 sm:mb-3 text-emerald-400">
            Trade Calculations
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-xs sm:text-sm">
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
            disabled={isUploading || loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg w-full md:w-1/2 transition duration-200 flex items-center justify-center gap-2"
          >
            {isUploading || loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
              </>
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