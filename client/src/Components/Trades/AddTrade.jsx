import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addTrade } from "../../Apis/Trades";
import { useToast } from "../context/ToastContext";

const AddTrade = () => {
  const { id: strategyId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [form, setForm] = useState({
    name: "",
    side: "buy",
    entry: "",
    exit: "",
    stop_loss: "",
    shares: "",
    charges: "",
    entry_date: new Date().toISOString().split("T")[0],
    exit_date: "",
    target: "",
    notes: "",
    day: "",
    time: "",
    duration: "",
    screenshot: "",
    mistakes: [""],
    emojis: [""],
  });

  // Auto-calculated fields
  const [calculated, setCalculated] = useState({
    capital: 0,
    gross_pnl: 0,
    net_pnl: 0,
    percent_pnl: 0,
    roi: 0,
  });

  // Calculate whenever relevant fields change
  useEffect(() => {
    const entry = parseFloat(form.entry) || 0;
    const exit = parseFloat(form.exit) || 0;
    const shares = parseFloat(form.shares) || 0;
    const stopLoss = parseFloat(form.stop_loss) || 0;
    const charges = parseFloat(form.charges) || 0;

    // Capital calculation
    const capital = entry * shares;

    // Gross P&L calculation
    let grossPnl = 0;
    if (form.side === "buy") {
      grossPnl = (exit - entry) * shares;
    } else {
      grossPnl = (entry - exit) * shares;
    }

    // Net P&L calculation
    const netPnl = grossPnl - charges;

    // % P&L calculation
    const percentPnl = capital ? (netPnl / capital) * 100 : 0;

    // ROI calculation
    let roi = 0;
    if (form.side === "buy" && entry - stopLoss !== 0) {
      roi = (exit - entry) / (entry - stopLoss);
    } else if (form.side === "sell" && stopLoss - entry !== 0) {
      roi = (entry - exit) / (stopLoss - entry);
    }

    // Duration calculation if both dates exist
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

    // Update duration in form
    if (duration) {
      setForm((prev) => ({ ...prev, duration }));
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const addArrayField = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const removeArrayField = (field, index) => {
    const updated = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: updated });
  };

  // Handle screenshot upload with Cloudinary or similar
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Prepare form data for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Trading_Journal"); // Replace with your Cloudinary preset

      // Upload image to Cloudinary or your image hosting service
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dmtzqbef2/image/upload", // Replace YOUR_CLOUD_NAME
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setForm((prev) => ({ ...prev, screenshot: data.secure_url }));
        setPreviewImage(data.secure_url);
        console.log(data.secure_url);
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

    // Prepare the trade data according to schema
    const tradeData = {
      ...form,
      ...calculated,
      strategy_id: strategyId,
      entry_date: new Date(form.entry_date),
      exit_date: form.exit_date ? new Date(form.exit_date) : undefined,
      entry: parseFloat(form.entry),
      exit: parseFloat(form.exit),
      stop_loss: parseFloat(form.stop_loss),
      shares: parseFloat(form.shares),
      charges: parseFloat(form.charges),
      target: form.target ? parseFloat(form.target) : undefined,
    };

    try {
      const result = await addTrade(tradeData);
      if (result.success) {
        addToast("Trade added successfully", "success");
        navigate(`/strategies/${strategyId}/trades`);
      } else {
        addToast(result.message || "Failed to add trade", "error");
      }
    } catch (error) {
      addToast("An error occurred while saving the trade", "error");
      console.error("Trade submission error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Add Trade</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Trade Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Side *</label>
            <select
              name="side"
              value={form.side}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
              required
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Entry Price *</label>
              <input
                name="entry"
                type="number"
                step="0.01"
                value={form.entry}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Exit Price *</label>
              <input
                name="exit"
                type="number"
                step="0.01"
                value={form.exit}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Stop Loss *</label>
              <input
                name="stop_loss"
                type="number"
                step="0.01"
                value={form.stop_loss}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Shares *</label>
              <input
                name="shares"
                type="number"
                value={form.shares}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Charges</label>
            <input
              name="charges"
              type="number"
              step="0.01"
              value={form.charges}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Entry Date *</label>
            <input
              name="entry_date"
              type="date"
              value={form.entry_date}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Exit Date</label>
            <input
              name="exit_date"
              type="date"
              value={form.exit_date}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Target Price</label>
            <input
              name="target"
              type="number"
              step="0.01"
              value={form.target}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
              rows={3}
            />
          </div>

          {/* Mistakes Fields */}
          <div>
            <label className="block text-gray-300 mb-2">Mistakes</label>
            {form.mistakes.map((m, i) => (
              <div key={i} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={m}
                  onChange={(e) => handleArrayChange("mistakes", i, e.target.value)}
                  className="flex-grow bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
                />
                {form.mistakes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("mistakes", i)}
                    className="bg-red-600 hover:bg-red-700 px-3 rounded text-white"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField("mistakes")}
              className="mt-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
            >
              Add Mistake
            </button>
          </div>

          {/* Emojis Fields */}
          <div>
            <label className="block text-gray-300 mb-2">Emojis</label>
            {form.emojis.map((e, i) => (
              <div key={i} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={e}
                  onChange={(ev) => handleArrayChange("emojis", i, ev.target.value)}
                  className="flex-grow bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-emerald-500 focus:outline-none"
                />
                {form.emojis.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("emojis", i)}
                    className="bg-red-600 hover:bg-red-700 px-3 rounded text-white"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField("emojis")}
              className="mt-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
            >
              Add Emoji
            </button>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label
              htmlFor="screenshot-upload"
              className="cursor-pointer inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
            >
              {isUploading ? "Uploading..." : "Upload Screenshot"}
            </label>
            <input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Screenshot Preview"
                className="mt-2 max-h-48 rounded shadow-lg"
              />
            )}
          </div>
        </div>

        {/* Display Calculated Values */}
        <div className="space-y-6 bg-gray-800 p-4 rounded">
          <h3 className="text-xl font-semibold text-emerald-400">Calculated Metrics</h3>
          <div>
            <span className="font-semibold text-gray-300">Capital:</span>{" "}
            <span className="text-white">${calculated.capital.toFixed(2)}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-300">Gross P&L:</span>{" "}
            <span className={`text-white ${calculated.gross_pnl >= 0 ? "text-emerald-400" : "text-red-500"}`}>
              ${calculated.gross_pnl.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-300">Net P&L:</span>{" "}
            <span className={`text-white ${calculated.net_pnl >= 0 ? "text-emerald-400" : "text-red-500"}`}>
              ${calculated.net_pnl.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-300">% P&L:</span>{" "}
            <span className={`text-white ${calculated.percent_pnl >= 0 ? "text-emerald-400" : "text-red-500"}`}>
              {calculated.percent_pnl.toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-300">ROI:</span>{" "}
            <span className={`text-white ${calculated.roi >= 0 ? "text-emerald-400" : "text-red-500"}`}>
              {calculated.roi.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="font-semibold text-gray-300">Duration:</span>{" "}
            <span className="text-white">{form.duration || "-"}</span>
          </div>
        </div>

        {/* Submit button spanning full width */}
        <div className="md:col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            disabled={isUploading}
            className={`bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded shadow-lg ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? "Saving..." : "Add Trade"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTrade;
