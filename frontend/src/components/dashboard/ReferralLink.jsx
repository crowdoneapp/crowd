import React, { useState } from "react";
import { ClipboardCopy, Check, Share2 } from "lucide-react";

const ReferralLinkBox = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2s
  };

  return (
    // 🔥 NEO-BANKING THEME: Pure white background, soft borders and rounded corners
    <div className="relative overflow-hidden bg-white p-4 md:p-6 rounded-[20px] border border-slate-100 shadow-sm group w-full">
      
      {/* Subtle Blue Glow in background */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-50 blur-[40px] rounded-full group-hover:bg-blue-100 transition-all duration-500 pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* HEADER */}
        <h3 className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
            <Share2 size={16} className="text-blue-600" />
          </div>
          Your Referral Link
        </h3>

        {/* 🔥 FIXED: Hamesha ek line mein rakhne ke liye sirf 'flex-row' use kiya hai */}
        <div className="flex flex-row items-center gap-2">
          
          <div className="flex-1 min-w-0 relative">
            <input
              type="text"
              readOnly
              value={link}
              onFocus={(e) => e.target.select()}
              // 🔥 Input field styling
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
            />
          </div>
          
          <button 
            onClick={handleCopy}
            // 🔥 UPDATE: Button kabhi shrink nahi hoga (shrink-0) aur text chota rakha hai taaki fit aa jaye
            className={`flex items-center justify-center gap-1.5 font-black px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0 ${
              copied 
                ? "bg-emerald-50 border border-emerald-200 text-emerald-600" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-[0_4px_15px_-5px_rgba(37,99,235,0.4)]"
            }`}
          >
            {copied ? (
              <>
                <Check size={16} strokeWidth={3} />
                <span className="text-[10px] sm:text-xs uppercase tracking-wider">Copied</span>
              </>
            ) : (
              <>
                <ClipboardCopy size={16} strokeWidth={2.5} />
                <span className="text-[10px] sm:text-xs uppercase tracking-wider">Copy</span>
              </>
            )}
          </button>
          
        </div>

      </div>
    </div>
  );
};

export default ReferralLinkBox;