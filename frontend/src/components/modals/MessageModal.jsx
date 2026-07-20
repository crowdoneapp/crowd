import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const MessageModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  // Theme Logic based on message type
  const theme = {
    success: {
      bg: 'bg-emerald-500',
      glow: 'bg-emerald-400/20',
      icon: <CheckCircle2 size={32} className="text-white" strokeWidth={2.5} />,
      border: 'border-emerald-100',
      titleColor: 'text-emerald-900',
    },
    error: {
      bg: 'bg-rose-500',
      glow: 'bg-rose-400/20',
      icon: <AlertCircle size={32} className="text-white" strokeWidth={2.5} />,
      border: 'border-rose-100',
      titleColor: 'text-rose-900',
    },
    warning: {
      bg: 'bg-amber-500',
      glow: 'bg-amber-400/20',
      icon: <ShieldAlert size={32} className="text-white" strokeWidth={2.5} />,
      border: 'border-amber-100',
      titleColor: 'text-amber-900',
    },
    info: {
      bg: 'bg-blue-600',
      glow: 'bg-blue-400/20',
      icon: <Info size={32} className="text-white" strokeWidth={2.5} />,
      border: 'border-blue-100',
      titleColor: 'text-[#0b1c3c]',
    }
  }[type] || theme.info;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className={`relative w-full max-w-sm bg-white rounded-[24px] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)] border ${theme.border} overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col`}>
        
        {/* Ambient Glow */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] pointer-events-none ${theme.glow}`}></div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
        >
          <X size={16} strokeWidth={3} />
        </button>

        {/* Header Icon Area */}
        <div className={`w-full py-8 flex items-center justify-center relative overflow-hidden ${theme.bg}`}>
            {/* Inner Ring */}
            <div className="absolute inset-0 bg-white/10 rounded-full scale-150 blur-xl"></div>
            <div className="relative z-10 p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                {theme.icon}
            </div>
        </div>

        {/* Content Area */}
        <div className="p-6 text-center">
            <h3 className={`text-xl font-black mb-2 tracking-tight ${theme.titleColor}`}>
              {title}
            </h3>
            <p className="text-slate-500 text-xs md:text-sm font-bold leading-relaxed mb-6">
              {message}
            </p>

            <button 
              onClick={onClose}
              className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-md active:scale-95 transition-all ${theme.bg}`}
            >
              Close
            </button>
        </div>

      </div>
    </div>
  );
};

export default MessageModal;