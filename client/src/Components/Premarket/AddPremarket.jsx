import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addPremarket, getPremarketById, updatePremarket } from "../../Apis/Premarket";
import { useToast } from "../context/ToastContext";

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
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      (async () => {
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
          } else {
            addToast("Failed to load premarket data", "error");
          }
        } catch {
          addToast("Error loading premarket data", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.day || !form.date || !form.expected_movement || !form.note) {
      return addToast("All fields are required", "error");
    }

    setFormLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await updatePremarket(id, form);
      } else {
        res = await addPremarket(form);
      }

      if (res.success) {
        addToast(`Premarket ${isEdit ? "updated" : "added"} successfully`, "success");
        navigate("/premarket", { state: { reload: true } });
      } else {
        addToast(res.message || "Operation failed", "error");
      }
    } catch (error) {
      console.error("Error saving premarket:", error);
      addToast("Failed to save premarket data", "error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Premarket
      </button>

      <h1 className="text-2xl text-white font-semibold">
        {isEdit ? "Edit Premarket" : "Add Premarket"}
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="text-gray-300">Day</label>
          <input
            name="day"
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
            value={form.day}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-gray-300">Date</label>
          <input
            type="date"
            name="date"
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
            value={form.date}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-gray-300">Expected Movement</label>
          <input
            name="expected_movement"
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
            value={form.expected_movement}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-gray-300">Note</label>
          <textarea
            name="note"
            className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
            value={form.note}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || formLoading}
          className="w-full bg-[#27c284] hover:bg-[#1fa769] text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer"
        >
          {formLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEdit ? "Updating..." : "Saving..."}
            </>
          ) : (
            isEdit ? "Update Premarket" : "Save Premarket Note"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddPremarket;