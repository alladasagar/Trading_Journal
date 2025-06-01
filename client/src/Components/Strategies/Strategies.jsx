// src/Pages/Strategies.jsx
import { useNavigate } from "react-router-dom";
import DisplayStrategy from "./DisplayStrategy";

const Strategies = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#27c284] mb-4 sm:mb-6">Trading Strategies</h1>

      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <button
          className="bg-[#27c284] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-[#1fa769] transition-colors cursor-pointer text-sm sm:text-base"
          onClick={() => navigate("/addstrategy")}
        >
          Add Strategy
        </button>
      </div>

      <div className="border-t border-gray-700 pt-4 sm:pt-6">
        <DisplayStrategy />
      </div>
    </div>
  );
};

export default Strategies;