import React from "react";
import { FaWifiOff, FaArrowLeft } from "react-icons/fa";
import offlineImage from "../assets/offline.svg"; // You can use any small SVG image here

const OfflinePage = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
        {/* Image - Replace with your own small SVG or use an icon */}
        <div className="flex justify-center mb-6">
          <img 
            src={offlineImage} 
            alt="Offline" 
            className="h-32 w-32" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2327c284'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z'/%3E%3C/svg%3E";
            }}
          />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          <FaWifiOff className="inline mr-2 text-[#27c284]" />
          You're Offline
        </h1>
        
        <p className="text-gray-300 mb-6">
          Oops! It seems you've lost your internet connection. Please check your network settings and try again.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-[#27c284] hover:bg-[#1fa769] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <FaArrowLeft className="mr-2" />
            Retry Connection
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Go Back
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