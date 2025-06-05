import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addPremarket, getPremarketById, updatePremarket } from "../../Apis/Premarket";
import { useToast } from "../context/ToastContext";
import Loader from "../ui/Loader"; // Import Loader

const AddPremarket = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [expectedMovement, setExpectedMovement] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false); // loader state

  useEffect(() => {
    if (isEdit) {
      (async () => {
        setLoading(true);
        try {
          const res = await getPremarketById(id);
          if (res.success) {
            const data = res.data;
            setDay(data.day);
            setDate(data.date);
            setExpectedMovement(data.expected_movement);
            setNote(data.note);
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

  const handleSave = async () => {
    if (!day || !date || !expectedMovement || !note) {
      return addToast("All fields are required", "error");
    }

    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await updatePremarket(id, { day, date, expected_movement: expectedMovement, note });
        if (res.success) {
          addToast("Premarket updated successfully", "success");
        }
      } else {
        res = await addPremarket({ day, date, expected_movement: expectedMovement, note });
        if (res.success) {
          addToast("Premarket added successfully", "success");
        }
      }
      navigate("/premarket");
    } catch (error) {
      console.error("Error saving premarket:", error);
      addToast("Failed to save premarket data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-[#27c284] hover:underline mb-4"
      >
        &larr; Back
      </button>

      <h1 className="text-2xl text-white font-semibold">
        {isEdit ? "Edit Premarket" : "Add Premarket"}
      </h1>

      <div>
        <label className="text-gray-300">Day</label>
        <input
          className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
      </div>

      <div>
        <label className="text-gray-300">Date</label>
        <input
          type="date"
          className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <label className="text-gray-300">Expected Movement</label>
        <input
          className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
          value={expectedMovement}
          onChange={(e) => setExpectedMovement(e.target.value)}
        />
      </div>

      <div>
        <label className="text-gray-300">Note</label>
        <textarea
          className="w-full p-2 mt-1 rounded bg-gray-700 text-white"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-[#27c284] p-3 rounded text-white font-medium"
      >
        {isEdit ? "Update Premarket" : "Save Premarket Note"}
      </button>
    </div>
  );
};

export default AddPremarket;
