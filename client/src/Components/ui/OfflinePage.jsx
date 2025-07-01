import React, { useEffect } from "react";
import { FaWifi, FaArrowLeft, FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OfflinePage = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (navigator.onLine) {
      navigate(-1); 
    } else {
      window.location.reload(); 
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      navigate(-1);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <FaWifi className="text-red-500 text-6xl animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-[#27c284] opacity-10"></div>
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          You're Offline
        </h1>
        
        <p className="text-gray-300 mb-6">
          Oops! It seems you've lost your internet connection. 
          Please check your network settings and try again.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-[#27c284] hover:bg-[#1fa769] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <FaSyncAlt className="mr-2 animate-spin" />
            Retry Connection
          </button>
          
        </div>
        
        <p className="text-gray-500 text-sm mt-6">
          Some features may be limited while offline
        </p>
      </div>
    </div>
  );
};

export default OfflinePage;