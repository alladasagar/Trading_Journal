// src/components/ui/Loader.jsx
import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-3 text-green-400 text-sm font-medium"></span>
    </div>
  );
};

export default Loader;
