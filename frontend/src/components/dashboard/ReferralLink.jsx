import React, { useState } from "react";
import { ClipboardCopy, Check, Share2, Send } from "lucide-react";

const ReferralLinkBox = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2s
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitation Link',
          text: 'Join using my exclusive invitation link:',
          url: link,
        });
      } catch (err) {
        console.log('Sharing failed', err);
      }
    } else {
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }
  };

  return (
    // ✅ LIGHT NEO-BANKING THEME CARD
    <div className="relative overflow-hidden bg-white p-4 sm:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] group w-full font-sans transition-all duration-300 hover:shadow-[0_15px_40px_-15px_rgba(37,99,235,0.15)]">
      
      {/* Subtle Blue Glow in background */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* HEADER */}
        <h3 className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-xl border border-blue-100 shadow-sm">
            <Share2 size={16} className="text-blue-600" />
          </div>
          Your Invitation Link
        </h3>

        {/* 🔥 FIXED: HAMESHA EK HI LINE ME RAHNE KE LIYE 'flex-row' AUR 'shrink-0' */}
        <div className="flex flex-row items-center gap-2">
          
          {/* Link Input Field */}
          <div className="flex-1 min-w-0 relative">
            <input
              type="text"
              readOnly
              value={link}
              onFocus={(e) => e.target.select()}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-mono font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner truncate"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Copy Button */}
            <button 
              onClick={handleCopy}
              className={`flex items-center justify-center gap-1.5 font-black px-3 sm:px-5 py-3 sm:py-3.5 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 ${
                copied 
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-600" 
                  : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:shadow-md"
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} strokeWidth={3} />
                  <span className="hidden sm:inline text-xs uppercase tracking-wider">Copied</span>
                </>
              ) : (
                <>
                  <ClipboardCopy size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline text-xs uppercase tracking-wider">Copy</span>
                </>
              )}
            </button>

            {/* Share Button */}
            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 font-black px-3 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Send size={15} strokeWidth={2.5} />
              <span className="hidden sm:inline text-xs uppercase tracking-wider">Share</span>
            </button>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default ReferralLinkBox;