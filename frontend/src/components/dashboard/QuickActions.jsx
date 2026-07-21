import React from "react";
import { 
  Wallet, 
  ArrowUpCircle, 
  Send, 
  Download 
} from "lucide-react";

const QuickActions = ({
  onDepositClick,
  onTopUpClick,
  onWalletTransferClick,
  onWithdrawClick,
  disabled = false,
}) => {

  const actions = [
    {
      label: "Add Funds",
      subLabel: "Top up",
      icon: Wallet,
      onClick: onDepositClick,
      iconColor: "text-emerald-400",
      glowBg: "bg-emerald-500/20",
    },
    {
      label: "Donate",
      subLabel: "Upgrade",
      icon: ArrowUpCircle,
      onClick: onTopUpClick,
      iconColor: "text-amber-400",
      glowBg: "bg-amber-500/20",
    },
    {
      label: "P2P",
      subLabel: "Transfer",
      icon: Send,
      onClick: onWalletTransferClick,
      iconColor: "text-fuchsia-400",
      glowBg: "bg-fuchsia-500/20",
    },
    {
      label: "Withdraw",
      subLabel: "Payout",
      icon: Download,
      onClick: onWithdrawClick,
      iconColor: "text-rose-400",
      glowBg: "bg-rose-500/20",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => !disabled && action.onClick && action.onClick()}
            disabled={disabled}
            className={`
              relative flex flex-col items-center justify-center p-2 py-3 md:p-4
              bg-gradient-to-b from-[#162540] to-[#0A1120] 
              border border-sky-500/30 rounded-xl md:rounded-2xl
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_4px_10px_rgba(0,0,0,0.4)]
              transition-all duration-300 ease-out group overflow-hidden w-full
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 hover:border-sky-400/80 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),_0_0_20px_rgba(56,189,248,0.5)]'}
            `}
          >
            {/* 🔥 Light Blue Top Shine (Glassy effect) */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-sky-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl"></div>

            {/* Icon ke pichhe ka glow */}
            <div 
              className={`absolute top-2 w-8 h-8 md:w-10 md:h-10 rounded-full blur-[10px] ${action.glowBg} group-hover:scale-150 transition-transform duration-500`}
            ></div>

            {/* Icon */}
            <div className="relative z-10 mb-1 md:mb-2 mt-0.5">
              <action.icon 
                size={20} 
                strokeWidth={1.5} 
                className={`${action.iconColor} md:w-6 md:h-6 transition-transform duration-300 group-hover:scale-110 drop-shadow-lg`} 
              />
            </div>

            {/* Texts */}
            <div className="relative z-10 flex flex-col items-center gap-0 w-full">
              <span className="text-[10px] md:text-[13px] font-semibold text-white tracking-wide whitespace-nowrap group-hover:text-sky-100 transition-colors">
                {action.label}
              </span>
              <span className="text-[8px] md:text-[10px] text-sky-200/60 font-medium whitespace-nowrap hidden sm:block group-hover:text-sky-200/90 transition-colors">
                {action.subLabel}
              </span>
            </div>
            
          </button>
        ))}

      </div>
    </div>
  );
};

export default QuickActions;