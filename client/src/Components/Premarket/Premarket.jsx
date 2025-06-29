import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DisplayPremarket from "./DisplayPremarket";
import Loader from "../ui/Loader";
import { AiOutlinePlus } from "react-icons/ai";
import { fetchPremarket } from "../../Apis/Premarket";
import { premarketCache } from "../../utilities/Cache/PremarketCache";

const Premarket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);

  const loadPlans = useCallback(async (forceReload = false) => {
    setLoading(true);
    try {
      if (!forceReload && premarketCache.isValid()) {
        setPlans(premarketCache.get().data);
      } else {
        const res = await fetchPremarket();
        console.log("API Response:", res);
        
        if (res?.success) {
          const data = Array.isArray(res.data) ? res.data : [];
          console.log("Data to display:", data);
          premarketCache.set(data);
          setPlans(data);
        } else {
          console.error("API Error:", res?.message);
          setPlans([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch premarket entries:", error);
      setPlans([]);
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (location.state?.reload && !isReloading) {
      setIsReloading(true);
      loadPlans(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, loadPlans, navigate, location.pathname, isReloading]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#27c284] mb-4 sm:mb-6">
        Premarket Plans
      </h1>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/addpremarket")}
          className="flex items-center gap-2 bg-[#27c284] hover:bg-[#1fa769] text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
        >
          <AiOutlinePlus className="text-lg" />
          Add Premarket Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <DisplayPremarket plans={plans} onReload={() => loadPlans(true)} />
      )}
    </div>
  );
};

export default Premarket;