import React from "react";

const Toast = ({ message, type = 'success', onClose }) => {
  const getShadowColor = () => {
    switch (type) {
      case 'success': return 'shadow-[0_8px_12px_rgba(39,194,132,0.3)]';
      case 'error': return 'shadow-[0_8px_12px_rgba(239,68,68,0.3)]';
      case 'info': return 'shadow-[0_8px_12px_rgba(59,130,246,0.3)]';
      default: return 'shadow-[0_4px_12px_rgba(39,194,132,0.3)]';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border border-[#27c284]';
      case 'error': return 'border border-red-500';
      case 'info': return 'border border-blue-500';
      default: return 'border border-[#27c284]';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-[#27c284]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`${getShadowColor()} ${getBorderColor()} bg-gray-900 text-white px-6 py-4 rounded-md flex items-center animate-fade-in`}>
      <div className="mr-2">
        {getIcon()}
      </div>
      <div className="flex-1">
        {message}
      </div>
      <button 
        onClick={onClose} 
        className="ml-4 text-gray-400 hover:text-white focus:outline-none"
        aria-label="Close toast"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;