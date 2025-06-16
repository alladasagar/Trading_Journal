import React, { useState } from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Very light overlay - barely visible */}
      <div className="fixed inset-0  backdrop-blur-[2px] z-40" />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-lg mx-4">
          <h2 className="text-xl font-semibold text-[#27c284] mb-2">{title}</h2>
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700 transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md bg-[#27c284] text-white hover:bg-[#1fa769] transition flex items-center justify-center min-w-[100px] ${
                isSubmitting ? "opacity-80 cursor-wait" : "cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;