import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios"; 
import SuccessModal from "./SuccessModal";
import MessageModal from "./MessageModal";
import { useAuth } from "../../context/AuthContext";
import { Wallet, Zap, Users, Trophy, X, UserCog, Eye, EyeOff, AlertTriangle, CheckCircle2, Layers } from "lucide-react"; 
import { Link } from "react-router-dom"; 

const WithdrawalModal = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const [balances, setBalances] = useState({
    walletBalance: 0, 
    direct: 0, 
    level: 0, 
    reward: 0, 
    pool: 0, 
    getPass: 0, 
    upgradeBounceBack: 0, 
    isUserToppedUp: false
  });
  
  const [withdrawals, setWithdrawals] = useState({
    direct: "", 
    level: "", 
    reward: "",
    pool: "", 
    getPass: "",
    upgradeBounceBack: ""
  });
  
  const [transactionPassword, setTransactionPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState(""); 
  const [isAddressMissing, setIsAddressMissing] = useState(false);
  
  const [confirmData, setConfirmData] = useState(null);
  
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState({ userId: "", userName: "", amount: 0, source: "" });
  const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

  const { user: loggedInUser, token } = useAuth();
  const isPromo = loggedInUser?.role === "promo";
  const isLeader = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";
  const isSetupUser = loggedInUser?.role === "setup" || loggedInUser?.role === "super_setup";

  const showMessage = (title, message, type = "error") =>
    setMessageModal({ open: true, title, message, type });

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/wallet/withdrawable/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const profileRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data) {
        setBalances({
          walletBalance: Number(res.data.walletBalance) || 0,
          direct: Number(res.data.direct) || 0, 
          level: Number(res.data.level) || 0,
          reward: Number(res.data.reward) || 0,
          pool: Number(res.data.pool) || 0,
          getPass: Number(res.data.getPass) || 0,
          upgradeBounceBack: Number(res.data.upgradeBounceBack) || 0,
          isUserToppedUp: res.data.isUserToppedUp || false
        });
      }

      const u = profileRes.data?.user || profileRes.data;

      if (u) {
        const addr = (u.walletAddress || "").trim();
        setWalletAddress(addr);
        setIsAddressMissing(!addr);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAvailableToWithdraw = 
    balances.direct + balances.level + balances.reward + balances.pool + balances.getPass + balances.upgradeBounceBack;
  
  const hasMainIncome = totalAvailableToWithdraw > 0;

  const totalEnteredAmount = useMemo(() => {
    let sum = 0;
    Object.values(withdrawals).forEach(val => {
      sum += Number(val) || 0;
    });
    return sum;
  }, [withdrawals]);

  const handleInputChange = (e, source) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setWithdrawals((prev) => ({ ...prev, [source]: value }));
    }
  };

  const handlePreWithdrawCheck = async () => {
    if (isLeader || isSetupUser) return showMessage("Action Denied", "System roles cannot withdraw funds directly from here.");
    if (!balances.isUserToppedUp && !isPromo) return showMessage("UserID Inactive", "You must initialize your UserID to withdraw funds.");
    if (!walletAddress.trim() && isAddressMissing && !isPromo) return showMessage("Address Missing", "Please configure your BEP-20 withdrawal address in your Profile.");

    let items = [];
    let totalRequested = 0;
    let successMessages = [];

    const checkAndPush = (sourceName, inputVal, availableBal, displayName) => {
        const amt = Number(inputVal);
        if (amt > 0) {
            if (!isPromo && amt > availableBal) throw new Error(`Insufficient funds in ${displayName}.`);
            items.push({ source: sourceName, amount: amt });
            totalRequested += amt;
            successMessages.push(displayName);
        }
    };

    try {
      checkAndPush("direct", withdrawals.direct, balances.direct, "Direct Reward");
      checkAndPush("level", withdrawals.level, balances.level, "Level Yield");
       checkAndPush("pool", withdrawals.pool, balances.pool, "Crowd Donation");
      checkAndPush("getPass", withdrawals.getPass, balances.getPass, "Get pass Income");
      checkAndPush("upgradeBounceBack", withdrawals.upgradeBounceBack, balances.upgradeBounceBack, "UserID Roll-up");

      if (totalRequested === 0) return showMessage("Invalid Request", "Enter an amount to withdraw.");
      if (totalRequested % 10 !== 0) return showMessage("Invalid Format", `Withdrawal must be in multiples of $10. Your total is $${totalRequested}.`);
      if (!isPromo && totalRequested < 10) return showMessage("Limit Error", "Minimum withdrawal threshold is $10.");
      if (!transactionPassword.trim()) return showMessage("Security Alert", "Enter your Tx-PIN.");

      setLoading(true);
      const endpoint = isPromo ? "/wallet/promo-withdraw" : "/wallet/withdraw";

      const response = await api.post(endpoint, {
        transactionPassword, items, dryRun: true 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const rep = response.data.report;

      setConfirmData({
        items,
        totalRequested: rep.totalRequested,
        expectedUSDT: rep.totalNetUSDT,
        expectedTopup: rep.totalToTopupWallet,
        teamSizeTracked: rep.teamSizeTracked || 0,
        sources: [...new Set(successMessages)].join(", ")
      });

    } catch (err) {
      console.error(err);
      let errorMsg = "Blockchain network calculation failed.";
      if (err.response && err.response.data && err.response.data.message) errorMsg = err.response.data.message;
      else if (err.message) errorMsg = err.message;
      
      if (err.response?.status === 403) errorMsg = "Invalid Transaction PIN";
      showMessage("Validation Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const proceedWithdrawal = async () => {
    try {
      setLoading(true);
      const endpoint = isPromo ? "/wallet/promo-withdraw" : "/wallet/withdraw";

      const response = await api.post(endpoint, {
        transactionPassword, items: confirmData.items, dryRun: false 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const finalUserId = (isPromo && response.data.generatedId) ? response.data.generatedId : userId;
      const finalUserName = isPromo ? (response.data.name || "Test UserID") : (loggedInUser?.name || "");

      setSuccessData({ 
        userId: finalUserId, 
        userName: finalUserName, 
        amount: confirmData.totalRequested, 
        source: confirmData.sources 
      });
      
      setConfirmData(null);
      setSuccessOpen(true);
      setWithdrawals({ direct: "", level: "", reward: "", pool: "", getPass: "", upgradeBounceBack: "" }); 
      setTransactionPassword("");
      await fetchData();

    } catch (err) {
      console.error(err);
      let errorMsg = "Withdrawal failed due to a contract error.";
      if (err.response && err.response.data && err.response.data.message) errorMsg = err.response.data.message;
      
      setConfirmData(null);
      showMessage("Contract Error", errorMsg);
    } finally {
      setLoading(false); 
    }
  };

  // 🔥 FIX: Ye function JSX ke return se UPAR hona chahiye!
  const renderInputRow = (label, icon, iconColor, balance, stateKey) => (
    <div className="bg-black/40 p-3 rounded-2xl border border-white/5 shadow-inner transition-all hover:border-cyan-500/30">
        <div className="flex justify-between items-center mb-2.5 px-1">
            <h3 className="text-slate-300 text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
                {icon} {label}
            </h3>
        </div>
        <div className="flex flex-row gap-2 items-stretch">
            <div className="w-[35%] bg-white/5 p-2 rounded-xl border border-white/10 shadow-sm flex flex-col justify-center items-center">
                <span className={`text-[14px] font-black font-mono ${iconColor}`}>${Number(balance).toFixed(2)}</span>
            </div>
            <div className="w-[65%] flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner group focus-within:border-cyan-500/50">
                <span className={`${iconColor} font-bold text-sm pl-3`}>$</span>
                <input 
                    type="number" 
                    placeholder="0.00" 
                    className="flex-1 bg-transparent border-none text-white text-[14px] font-black font-mono outline-none w-full placeholder-slate-600 py-1.5 px-2 disabled:opacity-50"
                    value={withdrawals[stateKey] || ""} 
                    onChange={e => handleInputChange(e, stateKey)} 
                    disabled={isLeader || isSetupUser} 
                />
            </div>
        </div>
    </div>
  );

  return (
    <>
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(34,211,238,0.3) transparent; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 10px; }
      `}</style>

      {successOpen && (
        <SuccessModal 
           isOpen={successOpen} 
           onClose={() => { setSuccessOpen(false); onClose(); }} 
           type="withdrawal" 
           userId={successData.userId} 
           userName={successData.userName} 
           amount={successData.amount} 
           source={successData.source} 
        />
      )}

      {messageModal.open && (
         <MessageModal 
            isOpen={messageModal.open} 
            title={messageModal.title} 
            message={<pre className="font-sans whitespace-pre-wrap text-[12px] text-center text-slate-300">{messageModal.message}</pre>} 
            type={messageModal.type} 
            onClose={() => setMessageModal({ ...messageModal, open: false })} 
         />
      )}

      {!successOpen && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[1000] flex justify-center items-center p-4">
          
          <div className="bg-[#0f172a]/80 backdrop-blur-2xl w-full max-w-[480px] rounded-[24px] border border-cyan-500/20 shadow-[0_0_50px_-12px_rgba(34,211,238,0.3)] flex flex-col max-h-[85vh] relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 blur-[60px] pointer-events-none rounded-full"></div>

            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center z-10 shrink-0">
              <h2 className="text-[12px] md:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 m-0">
                <div className="bg-cyan-500/10 p-1.5 rounded-lg border border-cyan-500/20">
                  <Wallet size={16} className="text-cyan-400" /> 
                </div>
                Withdraw Assets
              </h2>
              <button onClick={() => confirmData ? setConfirmData(null) : onClose()} className="group bg-white/5 hover:bg-rose-500/20 p-2 rounded-full transition-all border border-white/10 hover:border-rose-500/30 shadow-sm cursor-pointer active:scale-95">
                 <X size={16} className="text-slate-400 group-hover:text-rose-400" />
              </button>
            </div>

            {/* 🔥 CONFIRMATION SCREEN */}
            {confirmData ? (
              <div className="p-6 flex flex-col gap-4 bg-transparent relative z-10 text-center animate-in fade-in duration-300 overflow-y-auto custom-scroll">
                  <div className="mx-auto bg-amber-500/10 border border-amber-500/30 p-4 rounded-full mb-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <AlertTriangle size={36} className="text-amber-400" />
                  </div>
                  <h3 className="text-xl font-black text-white">Review Contract Hash</h3>
                  <p className="text-xs text-slate-400 font-bold px-4">Please verify the withdrawal splits generated by the smart contract protocol.</p>
                  
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-left space-y-4 mt-2 shadow-inner">
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Requested</span>
                          <span className="font-black text-cyan-400 text-lg">${confirmData.totalRequested.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">To BEP-20 External</span>
                          <span className="font-black text-emerald-400 text-lg">${confirmData.expectedUSDT.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">To Internal Vault</span>
                          <span className="font-black text-indigo-400 text-lg">${confirmData.expectedTopup.toFixed(2)}</span>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                     <button 
                       onClick={() => setConfirmData(null)} 
                       disabled={loading}
                       className="w-1/2 py-3.5 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-slate-300 transition-colors uppercase tracking-wider border border-white/10"
                     >
                        Abort
                     </button>
                     <button 
                       onClick={proceedWithdrawal} 
                       disabled={loading} 
                       className="w-1/2 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-gradient-to-r from-cyan-500 to-indigo-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] text-white shadow-lg flex justify-center items-center gap-2 active:scale-95"
                     >
                       {loading ? "HASHING..." : <><CheckCircle2 size={16}/> Sign & Send</>}
                     </button>
                  </div>
              </div>
            ) : (
              /* 🔥 REGULAR INPUT SCREEN */
              <>
                <div className="p-4 overflow-y-auto custom-scroll flex-1 flex flex-col gap-4 bg-transparent relative z-10">
                  
                  <div className="bg-black/40 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-inner">
                     <div className="text-right w-full">
                        <p className="text-cyan-400/80 text-[10px] font-bold uppercase tracking-widest mb-1">Total Available Yield</p>
                        <h3 className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] font-mono">${totalAvailableToWithdraw.toFixed(2)}</h3>
                     </div>
                  </div>

                  {isAddressMissing && !isPromo ? (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                      <p className="text-[10px] md:text-xs text-rose-300 font-bold m-0 w-3/5 leading-relaxed">
                        No external wallet linked! Bind an address before withdrawing.
                      </p>
                      <Link 
                        to="/profile" 
                        onClick={onClose}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                      >
                        <UserCog size={14} /> Link UserID
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col shadow-sm">
                      <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest mb-1">Linked BEP-20 UserID</p>
                      <p className="text-xs font-mono text-emerald-300 font-black truncate">{isPromo ? "Wallet Address (Demo Network)" : walletAddress}</p>
                    </div>
                  )}

                  {/* MAIN INCOMES */}
                  {(hasMainIncome || isPromo) && (
                      <div className="flex flex-col gap-3">
                        {renderInputRow("Direct Reward", <Zap size={14} className="text-amber-400" />, "text-amber-400", balances.direct, "direct")}
                        {renderInputRow("Level Yield", <Users size={14} className="text-cyan-400" />, "text-cyan-400", balances.level, "level")}
                        {renderInputRow("Crowd Donation (Pool)", <Layers size={14} className="text-emerald-400" />, "text-emerald-400", balances.pool, "pool")}
                        {renderInputRow("Fast Track (Get Pass)", <Trophy size={14} className="text-indigo-400" />, "text-indigo-400", balances.getPass, "getPass")}
                        {renderInputRow("UserID Roll-up", <Zap size={14} className="text-purple-400" />, "text-purple-400", balances.upgradeBounceBack, "upgradeBounceBack")}
                       </div>
                  )}

                  <div className="bg-indigo-500/10 border border-indigo-500/30 p-3.5 rounded-xl flex items-center justify-between mt-2 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                     <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest m-0">Gross Hash Amount</p>
                     <h3 className="text-lg font-black text-indigo-400 m-0 font-mono">${totalEnteredAmount.toFixed(2)}</h3>
                  </div>

                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 mt-1 relative shadow-inner">
                      <label className="text-[9px] text-cyan-400 block mb-1.5 font-bold uppercase tracking-widest ml-1">SECURE TX-PIN</label>
                      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0 }}>
                          <input type="password" name="hidden_password" tabIndex="-1" autoComplete="current-password" />
                      </div>
                      <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            autoComplete="new-password"
                            placeholder="Enter Transaction PIN" 
                            className="w-full bg-white/5 border border-white/10 text-white p-3.5 pr-10 rounded-lg outline-none font-mono text-sm transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 placeholder-slate-600 shadow-inner"
                            value={transactionPassword} 
                            onChange={e => setTransactionPassword(e.target.value)} 
                            disabled={isLeader || isSetupUser} 
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                      </div>
                  </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20 z-10 shrink-0">
                  {isLeader || isSetupUser ? (
                     <button onClick={onClose} className="w-full py-3.5 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-slate-400 transition-colors shadow-sm uppercase tracking-wider border border-white/10">Close Interface</button>
                  ) : (
                     <div className="flex gap-3">
                       <button onClick={onClose} className="w-1/3 py-3.5 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-slate-400 transition-colors shadow-sm uppercase tracking-wider border border-white/10 active:scale-95">Abort</button>
                       <button 
                         onClick={handlePreWithdrawCheck} 
                         disabled={loading}
                         className="w-2/3 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-gradient-to-r from-cyan-500 to-indigo-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] text-white shadow-lg active:scale-95 disabled:opacity-50"
                       >
                         {loading ? "ANALYZING..." : "GENERATE HASH"}
                       </button>
                     </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default WithdrawalModal;