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
          title: 'CrowdOne Referral',
          text: 'Join CrowdOne using my invitation link:',
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
    // 🔥 CROWDONE DARK / AMBER THEME CARD
    <div className="relative overflow-hidden bg-[#131b2f] p-4 sm:p-6 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl group w-full font-sans">
      
      {/* Subtle Amber Glow in background */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full group-hover:bg-amber-500/20 transition-all duration-500 pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* HEADER */}
        <h3 className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
            <Share2 size={16} className="text-amber-400" />
          </div>
          CrowdOne Invitation Link
        </h3>

        {/* 🔥 FIXED: HAMESHA EK HI LINE ME RAHNE KE LIYE 'flex-row' AUR 'shrink-0' */}
        <div className="flex flex-row items-center gap-2">
          
          <div className="flex-1 min-w-0 relative">
            <input
              type="text"
              readOnly
              value={link}
              onFocus={(e) => e.target.select()}
              className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner truncate"
            />
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Copy Button */}
            <button 
              onClick={handleCopy}
              className={`flex items-center justify-center gap-1.5 font-black px-3 sm:px-5 py-3 sm:py-3.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0 ${
                copied 
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                  : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-[0_4px_15px_-5px_rgba(251,191,36,0.4)]"
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
              className="flex items-center justify-center gap-1.5 font-black px-3 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-[#1a233a] hover:bg-[#232f4e] border border-slate-700 text-amber-400 transition-all shadow-md active:scale-95 shrink-0"
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