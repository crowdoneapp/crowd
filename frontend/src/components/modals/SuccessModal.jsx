import React from "react";
import { CheckCircle2, Zap, Landmark, ArrowRightLeft, Gift, ShieldCheck, ArrowDownLeft, User, CalendarDays, ArrowUpCircle, Wallet } from "lucide-react";

const SuccessModal = ({
  isOpen,
  onClose,
  type = "credit",
  userId = "",
  userName = "",
  amount = 0,
  reward = 0,
  spinQuantity = 0,
  customTitle = "",
  customMessage = "",
  source = "",
  zIndex = 2000,
}) => {
  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });

  // Premium Neo-Banking Layout
  const SuccessLayout = ({ title, icon: Icon, children }) => (
    <div className="flex flex-col items-center w-full relative z-10">
      
      {/* Premium Icon Container */}
      <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-5 shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] border border-white/50 bg-gradient-to-br from-blue-500 to-indigo-600 text-white transform rotate-3">
        <div className="transform -rotate-3">
          <Icon size={36} strokeWidth={2.5} />
        </div>
      </div>
      
      <h2 className="text-[#0b1c3c] text-xl sm:text-2xl font-black uppercase tracking-tight text-center mb-1">
        {title}
      </h2>
      
      <div className="w-full">
        {children}
      </div>
      
      {/* Footer Trust Badges */}
      <div className="mt-6 flex flex-col items-center justify-center gap-2 w-full border-t border-slate-100 pt-5">
        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
          <CalendarDays size={14} /> {currentDate}
        </span>
        <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
          <ShieldCheck size={14} /> 256-Bit Secured Transaction
        </span>
      </div>
    </div>
  );

  const UserInfoBlock = ({ idLabel }) => (
    <div className="bg-slate-50 border border-slate-200/60 rounded-[16px] p-3.5 mb-4 shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{idLabel}</span>
        <span className="text-[#0b1c3c] font-black font-mono text-sm">{userId}</span>
      </div>
      {userName && userName !== "N/A" && (
        <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 mt-1">
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <User size={12} /> Name
          </span>
          <span className="text-indigo-600 font-black text-xs uppercase tracking-wider">{userName}</span>
        </div>
      )}
    </div>
  );

  const renderContent = () => {

    if (customTitle || customMessage) {
      return (
        <SuccessLayout title={customTitle} icon={CheckCircle2}>
          <p className="text-sm text-slate-500 font-bold leading-relaxed px-4 text-center mt-3">
            {customMessage}
          </p>
        </SuccessLayout>
      );
    }

    switch (type) {
      case "withdrawal": {
        const isPlan = source && source.toLowerCase().startsWith("plan");
        const wTitle = isPlan ? "Withdrawal Verified" : "Withdrawal Verified";

        return (
          <SuccessLayout title={wTitle} icon={Landmark}>
            <div className="w-full mt-4">
              <UserInfoBlock idLabel="Account ID" />
              <div className="flex flex-col items-center pt-2">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount Processed</span>
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter drop-shadow-sm">
                  ${amount}
                </span>
              </div>
            </div>
          </SuccessLayout>
        );
      }

      case "convert":
        return (
          <SuccessLayout title="Conversion Done" icon={ArrowRightLeft}>
            <div className="w-full mt-4">
              <UserInfoBlock idLabel="Account ID" />
              <div className="flex flex-col items-center pt-2">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Converted Value</span>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter">
                  {amount} CCT
                </span>
              </div>
            </div>
          </SuccessLayout>
        );

      case "stake":
        return (
          <SuccessLayout title="Staking Locked" icon={ShieldCheck}>
            <div className="w-full mt-4">
              <UserInfoBlock idLabel="Target ID" />
              <div className="flex flex-col items-center pt-2">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Staked Amount</span>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter">
                  {amount} CCT
                </span>
              </div>
            </div>
          </SuccessLayout>
        );

      case "deposit":
        return (
          <SuccessLayout title="Deposit Successful" icon={ArrowDownLeft}>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 w-full mt-5 text-center shadow-inner">
              <span className="text-emerald-600/70 text-[10px] font-black uppercase tracking-widest block mb-2">Vault Funded</span>
              <span className="text-4xl sm:text-5xl font-black text-emerald-600 font-mono tracking-tighter">
                + ${amount}
              </span>
            </div>
          </SuccessLayout>
        );

      case "credit":
        return (
          <SuccessLayout title="Funds Credited" icon={Wallet}>
            <div className="w-full mt-4">
              {source && (
                <div className="flex justify-between items-center bg-blue-50 p-3.5 rounded-[16px] border border-blue-100 mb-4 shadow-sm">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Source</span>
                  <span className="text-blue-700 font-black text-xs uppercase tracking-wider">{source}</span>
                </div>
              )}
              <div className="flex flex-col items-center pt-1">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount Added</span>
                <span className="text-4xl sm:text-5xl font-black text-emerald-500 font-mono tracking-tighter">
                  + ${amount}
                </span>
              </div>
            </div>
          </SuccessLayout>
        );

      case "transfer":
      case "usdt_transfer":
        return (
          <SuccessLayout title="Transfer Completed" icon={ArrowRightLeft}>
            <div className="w-full mt-4">
              <UserInfoBlock idLabel="Sent To ID" />
              <div className="flex flex-col items-center pt-2">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Transfer Amount</span>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter">
                  ${amount}
                </span>
              </div>
            </div>
          </SuccessLayout>
        );

      case "cct_transfer":
        return (
          <SuccessLayout title="CCT Transfer Done" icon={ArrowRightLeft}>
            <div className="w-full mt-4">
              <UserInfoBlock idLabel="Sent To ID" />
              <div className="flex flex-col items-center pt-2">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Transfer Amount</span>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 font-mono tracking-tighter">
                  {amount} CCT
                </span>
              </div>
            </div>
          </SuccessLayout>
        );

      // 🔥 UPDATED TOPUP (No "Node Activated", Pure Premium Fintech feel)
      case "topup":
        return (
          <SuccessLayout title="Tier Elevated" icon={ArrowUpCircle}>
            <div className="w-full mt-4">
              <UserInfoBlock idLabel="Recipient ID" />
              <div className="flex flex-col items-center pt-2">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Package Value</span>
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter drop-shadow-sm">
                  ${amount}
                </span>
              </div>
            </div>
          </SuccessLayout>
        );

      case "buy":
        return (
          <SuccessLayout title="Spins Purchased" icon={Gift}>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 w-full mt-5 text-center shadow-inner">
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest block mb-2">Total Cost: ${amount}</span>
              <span className="text-4xl font-black text-indigo-600 font-mono tracking-tighter">
                {spinQuantity} Spins
              </span>
            </div>
          </SuccessLayout>
        );

      case "spin":
        return (
          <SuccessLayout title="Spin Reward" icon={Gift}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 w-full mt-5 text-center shadow-inner">
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest block mb-2">You Won</span>
              <span className="text-5xl font-black text-amber-500 font-mono tracking-tighter drop-shadow-sm">
                ${reward}
              </span>
            </div>
          </SuccessLayout>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 font-sans"
      style={{ zIndex }}
    >
      <div className="bg-white/95 backdrop-blur-3xl border border-white/50 rounded-[32px] p-6 sm:p-8 w-full max-w-sm shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)] relative overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-400/20 blur-[50px] pointer-events-none rounded-full"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-400/20 blur-[50px] pointer-events-none rounded-full"></div>

        {renderContent()}

        <div className="mt-6 flex justify-center w-full relative z-10">
          <button
            onClick={onClose}
            className="w-full bg-[#0b1c3c] hover:bg-blue-900 text-white transition-all font-black uppercase tracking-widest text-[10px] sm:text-xs px-6 py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(11,28,60,0.5)] hover:shadow-[0_10px_30px_-10px_rgba(11,28,60,0.7)] hover:-translate-y-0.5 active:scale-95 border border-transparent"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;