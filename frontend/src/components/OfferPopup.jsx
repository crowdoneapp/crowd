import React from "react";

const OfferPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative bg-[#0b0b0b] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border-2 border-[#eab308]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold transition shadow-lg"
        >
          ✕
        </button>

        {/* Offer Image */}
        <img
          src="/offer.jpg"
          alt="Boosting Bonanza Offer"
          className="w-full max-h-[80vh] object-contain"
        />
      </div>
    </div>
  );
};

export default OfferPopup;