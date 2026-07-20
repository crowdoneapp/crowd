import React from "react";
import { 
  Wallet, 
  ArrowUpCircle, 
  Send, 
  Download, 
  CreditCard, 
} from "lucide-react";

const QuickActions = ({
  onDepositClick,
  onTopUpClick,
  onWalletTransferClick,
  onWithdrawClick,
  onCreditToWalletClick,
  disabled = false,
}) => {

  // 🔥 DOCK THEME — each action is a gradient orb, ordered warm-to-cool across the bar
  const actions = [
    {
      label: "Add Funds",
      icon: Wallet,
      onClick: onDepositClick,
      gradient: "from-emerald-400 to-teal-500",
      glow: "shadow-[0_6px_18px_-6px_rgba(16,185,129,0.6)]",
    },
    {
      label: "Boost Wallet",
      icon: ArrowUpCircle,
      onClick: onTopUpClick,
      gradient: "from-amber-400 to-orange-500",
      glow: "shadow-[0_6px_18px_-6px_rgba(245,158,11,0.6)]",
    },
    {
      label: "Send",
      icon: Send,
      onClick: onWalletTransferClick,
      gradient: "from-fuchsia-400 to-purple-500",
      glow: "shadow-[0_6px_18px_-6px_rgba(217,70,239,0.6)]",
    },
    {
      label: "Cash Out",
      icon: Download,
      onClick: onWithdrawClick,
      gradient: "from-rose-400 to-red-500",
      glow: "shadow-[0_6px_18px_-6px_rgba(244,63,94,0.6)]",
    },
    // {
    //   label: "Move to Wallet",
    //   icon: CreditCard,
    //   onClick: onCreditToWalletClick,
    //   gradient: "from-sky-400 to-blue-500",
    //   glow: "shadow-[0_6px_18px_-6px_rgba(56,189,248,0.6)]",
    // },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-1 md:max-w-none md:px-0">
      {/* Dark dock bar */}
      <div className="bg-[#0d1526] rounded-[22px] md:rounded-[26px] p-2 md:p-3 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.35)] w-full">
        <div className="flex justify-between items-start w-full gap-1 md:gap-3 md:justify-start">

          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => !disabled && action.onClick && action.onClick()}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-start flex-1 md:flex-none md:w-24
                group transition-all duration-300 ease-out bg-transparent border-none py-1.5 md:py-2
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Gradient orb */}
              <div
                className={`
                  mb-1 md:mb-1 w-11 h-11 md:w-14 md:h-14 rounded-full
                  bg-gradient-to-br ${action.gradient} ${action.glow}
                  flex items-center justify-center relative
                  transition-all duration-200 group-hover:scale-105 group-active:scale-90
                `}
              >
                <action.icon size={20} strokeWidth={2.5} className="text-white md:w-6 md:h-6" />
              </div>

              {/* Label */}
              <span className="text-[8.5px] md:text-[11px] font-bold tracking-tight uppercase text-center text-slate-300 group-hover:text-white transition-colors leading-tight px-0.5">
                {action.label}
              </span>
            </button>
          ))}


        </div>
      </div>
    </div>
  );
};

export default QuickActions;