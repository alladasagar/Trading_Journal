import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DisplayPremarket from "./DisplayPremarket";
import Loader from "../ui/Loader";
import { AiOutlinePlus } from "react-icons/ai";
import { fetchPremarketPlans } from "../../Apis/Premarket";

const Premarket = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      const result = await fetchPremarketPlans();
      if (result.success) setPlans(result.data);
      else setPlans([]);
      setLoading(false);
    };
    loadPlans();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#27c284] mb-4 sm:mb-6">
        Premarket Plans
      </h1>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <button
          className="flex items-center justify-center gap-2 bg-[#27c284] text-white px-4 py-2 rounded-md hover:bg-[#1fa769] transition-all text-sm sm:text-base"
          onClick={() => navigate("/addpremarket")}
        >
          <AiOutlinePlus className="text-lg" />
          <span>Add Premarket Plan</span>
        </button>
      </div>

      <div className="border-t border-gray-700 pt-4 sm:pt-6">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader />
          </div>
        ) : (
          <DisplayPremarket plans={plans} />
        )}
      </div>
    </div>
  );
};

export default Premarket;
