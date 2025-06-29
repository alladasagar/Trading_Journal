import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addPremarket, getPremarketById, updatePremarket } from "../../Apis/Premarket";
import { useToast } from "../context/ToastContext";
import { premarketCache } from "../../utilities/Cache/PremarketCache";

const AddPremarket = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    day: "",
    date: "",
    expected_movement: "",
    note: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await getPremarketById(id);
          if (res.success) {
            setForm({
              day: res.data.day,
              date: res.data.date,
              expected_movement: res.data.expected_movement,
              note: res.data.note
            });
          }
        } catch (error) {
          addToast("Failed to load premarket data", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.day || !form.date || !form.expected_movement) {
      return addToast("Required fields are missing", "error");
    }

    setLoading(true);
    try {
      const res = isEdit 
        ? await updatePremarket(id, form)
        : await addPremarket(form);

      if (res.success) {
        premarketCache.invalidate();
        addToast(`Premarket ${isEdit ? "updated" : "added"} successfully`, "success");
        navigate("/premarket", { state: { reload: true } });
      } else {
        addToast(res.message || "Operation failed", "error");
      }
    } catch (error) {
      addToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer"
      >
        ← Back to Premarket
      </button>

      <h1 className="text-2xl text-white font-semibold">
        {isEdit ? "Edit Premarket" : "Add Premarket"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Day</label>
            <input
              name="day"
              value={form.day}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Expected Movement</label>
          <input
            name="expected_movement"
            value={form.expected_movement}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Note</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white min-h-[100px]"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#27c284] hover:bg-[#1fa769] text-white py-2 px-4 rounded-md disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Processing..." : isEdit ? "Update" : "Save"}
        </button>
      </form>
    </div>
  );
};

export default AddPremarket;