// ========================================================
// 🚀 FRONTEND: DepositModal.js
// ========================================================
import React, { useEffect, useState } from "react";
import api from "../../api/axios"; 
import { QRCodeCanvas } from "qrcode.react";
import { Copy, CheckCircle2, AlertTriangle, X, Wallet, QrCode, RefreshCcw, Timer, ShieldCheck, DollarSign, ArrowRight, ChevronLeft } from "lucide-react";
import Swal from 'sweetalert2';
import SuccessModal from "./SuccessModal"; 

export default function DepositModal({ onClose, user, userId }) {
  // 🔥 Flow Control States
  const [step, setStep] = useState(1); // Step 1: Enter Amount, Step 2: Show QR & Timer
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false); 

  const [isSuccessMode, setIsSuccessMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 🔥 15 Minutes Countdown Timer
  const [timeLeft, setTimeLeft] = useState(15 * 60); 

  // Timer tabhi chalega jab QR Code dikhega (Step 2)
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [step, timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Step 1 -> Step 2 transition
  const handleProceed = () => {
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < 10) {
      setAmountError("Minimum deposit is 10 USDT.");
      return;
    }
    setAmountError("");
    setStep(2);
    setTimeLeft(15 * 60); // Reset timer to 15 mins
    fetchDepositAddress();
  };

  const fetchDepositAddress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await api.get("/deposit/get-address", {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      
      setAddress(res.data.address);
    } catch (err) {
      console.error("Failed to fetch address", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Could not load deposit address. Please try again.",
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#06b6d4'
      });
      setStep(1); // Error aane par wapas step 1 par bhej do
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (!address) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        const ta = document.createElement("textarea");
        ta.value = address;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  const handleVerifyDeposit = async () => {
    try {
      setVerifying(true);
      const token = localStorage.getItem('token');

      const response = await api.post('/deposit/verify-deposit', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setIsSuccessMode(true);
      }
    } catch (error) {
      Swal.fire({
        icon: 'info',
        title: 'Pending...',
        text: error.response?.data?.message || "Deposit not found yet. Please wait 1-2 minutes.",
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#06b6d4'
      });
    } finally {
      setVerifying(false);
    }
  };

  if (isSuccessMode) {
    return (
      <SuccessModal 
        isOpen={true}
        onClose={() => {
          onClose(); 
          window.location.reload(); 
        }}
        customTitle="Payment Verified! 🎉"
        customMessage={successMessage}
        zIndex={2050} 
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[1000] flex justify-center items-center p-4 animate-in fade-in duration-300">
      
      {/* 🟢 Premium Glassmorphism Modal Container */}
      <div className="bg-[#0f172a]/80 backdrop-blur-2xl w-full max-w-sm rounded-[32px] border border-cyan-500/20 shadow-[0_0_50px_-12px_rgba(34,211,238,0.3)] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]">
        
        {/* 🟢 Ambient Glow Effects */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/20 blur-[60px] pointer-events-none rounded-full"></div>

        {/* 🟢 Header */}
        <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center relative z-10 shrink-0">
           <div className="flex items-center gap-4">
              {step === 2 && (
                 <button onClick={() => setStep(1)} className="p-2 bg-white/5 rounded-full border border-white/10 text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-all active:scale-95">
                    <ChevronLeft size={16} strokeWidth={3} />
                 </button>
              )}
              {step === 1 && (
                <div className="p-2.5 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <Wallet size={20} strokeWidth={2.5} />
                </div>
              )}
              <div>
                <h2 className="text-white font-black text-base md:text-lg tracking-tight flex items-center gap-2">
                  Deposit USDT
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest">
                    BEP-20
                  </span>
                  <span className="text-slate-400 text-[10px] font-bold tracking-wider">Network Only</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="bg-white/5 hover:bg-rose-500/20 p-2 rounded-full transition-all border border-white/10 hover:border-rose-500/30 shadow-sm cursor-pointer active:scale-95 group">
              <X size={16} className="text-slate-400 group-hover:text-rose-400" strokeWidth={2.5} />
           </button>
        </div>

        {/* 🟢 Body */}
        <div className="p-5 md:p-6 relative z-10 flex flex-col items-center bg-transparent overflow-y-auto custom-scroll">
          
          {/* ========================================================
              STEP 1: ENTER AMOUNT
              ======================================================== */}
          {step === 1 && (
            <div className="w-full animate-in slide-in-from-left-4 duration-300">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 mx-auto bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mb-3 border border-cyan-500/20 relative">
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping opacity-30"></div>
                    <DollarSign size={32} strokeWidth={2.5} className="relative z-10" />
                 </div>
                 <h3 className="font-black text-white text-xl tracking-tight">Enter Amount</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Specify how much you want to deposit</p>
              </div>

              <div className="mb-6 relative group">
                 <label className="block text-[10px] font-black text-cyan-400 mb-2 uppercase tracking-widest ml-1">
                   USDT Amount
                 </label>
                 <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                       <DollarSign size={20} strokeWidth={3} />
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (e.target.value && parseFloat(e.target.value) >= 10) setAmountError("");
                      }}
                      placeholder="Miminum $10"
                      className={`w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-16 text-xl font-black text-white font-mono tracking-tight outline-none transition-all shadow-inner placeholder-slate-700
                        ${amountError ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10'}`}
                    />
                    <div className="absolute right-4 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                      USDT
                    </div>
                 </div>
                 {amountError && (
                    <p className="text-rose-400 text-[10px] font-bold mt-2 ml-1 flex items-center gap-1">
                      <AlertTriangle size={12} /> {amountError}
                    </p>
                 )}
              </div>

              <button 
                onClick={handleProceed}
                disabled={!amount || parseFloat(amount) < 10}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] overflow-hidden relative group
                    ${(!amount || parseFloat(amount) < 10)
                      ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' 
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] active:scale-95'}`}
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 ease-out skew-x-12 hidden group-hover:block"></div>
                Initialize Secure Vault <ArrowRight size={18} />
              </button>

              <div className="mt-5 bg-cyan-500/10 border border-cyan-500/20 p-3.5 rounded-xl flex items-start gap-2 shadow-inner">
                <ShieldCheck className="text-cyan-400 shrink-0 w-4 h-4 mt-0.5" />
                <p className="text-slate-300 text-[10px] font-bold leading-relaxed">
                  Minimum deposit is <span className="text-cyan-400 font-black">10 USDT</span>. Your funds are secured by smart contract infrastructure.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: SHOW QR CODE & VERIFY
              ======================================================== */}
          {step === 2 && loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 w-full animate-in fade-in">
               <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-cyan-500/50 animate-[spin_3s_linear_infinite]"></div>
                  <div className="absolute inset-2 rounded-full border-[3px] border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-[spin_1s_cubic-bezier(0.5,0.1,0.5,0.9)_infinite]"></div>
               </div>
               <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Establishing Secure Connection...</p>
            </div>
          )}

          {step === 2 && !loading && (
            <div className="w-full animate-in slide-in-from-right-4 duration-300">
              
              {/* Timer & Requested Amount */}
              <div className="flex items-center justify-between bg-black/40 border border-white/10 p-3.5 rounded-2xl mb-6 shadow-inner">
                <div className="flex items-center gap-3">
                   <div className="bg-rose-500/20 border border-rose-500/30 p-2 rounded-xl text-rose-400 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                     <Timer size={16} strokeWidth={2.5} />
                   </div>
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time Remaining</p>
                     <p className="text-rose-400 font-black text-sm font-mono tracking-wider">{formatTime(timeLeft)}</p>
                   </div>
                </div>
                <div className="text-right border-l border-white/10 pl-4">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Amount to Pay</p>
                   <p className="text-white font-black text-sm tracking-tight">{parseFloat(amount).toFixed(2)} <span className="text-cyan-400">USDT</span></p>
                </div>
              </div>

              {/* QR Code Container (Kept white for Scanner Compatibility) */}
              <div className="flex justify-center mb-6 relative group">
                 <div className="absolute inset-0 bg-cyan-400 rounded-3xl blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                 <div className="relative p-4 bg-white rounded-2xl border-4 border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col items-center transform transition-transform group-hover:scale-105 duration-300">
                   <QRCodeCanvas value={address} size={140} level="H" />
                   
                 </div>
              </div>

              {/* Address Display & Copy */}
              <div className="w-full mb-6">
                <label className="block text-[10px] font-black text-cyan-400 mb-2 ml-1 uppercase tracking-widest">
                  Deposit Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    readOnly
                    value={address}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-cyan-100 text-[11px] font-mono tracking-wider focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all text-center sm:text-left shadow-inner"
                  />
                  <button 
                    onClick={copyText} 
                    className={`flex items-center justify-center gap-1.5 py-3.5 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm shrink-0 active:scale-95 ${
                        copied 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    {copied ? <><CheckCircle2 size={14} /> COPIED</> : <><Copy size={14} /> COPY</>}
                  </button>
                </div>
              </div>

              {/* VERIFY PAYMENT BUTTON */}
              <div className="w-full">
                  <button 
                    onClick={handleVerifyDeposit}
                    disabled={verifying}
                    className={`w-full py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative overflow-hidden group shadow-[0_0_15px_rgba(34,211,238,0.2)]
                        ${verifying 
                          ? 'bg-cyan-500/50 text-white cursor-wait' 
                          : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] active:scale-95'}`}
                  >
                    {!verifying && (
                       <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 ease-out skew-x-12"></div>
                    )}
                    
                    {verifying ? (
                    <><RefreshCcw size={18} className="animate-spin" /> Scanning Blockchain...</>
                  ) : (
                    <><ShieldCheck size={18} className="relative z-10" /> Confirm & Validate Deposit</>
                  )}
                  </button>
              </div>

              {/* Warning Note */}
              <div className="mt-5 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-2 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                <AlertTriangle className="text-amber-400 shrink-0 w-4 h-4 mt-0.5" />
                <p className="text-amber-200/70 text-[9px] md:text-[10px] font-bold leading-relaxed">
                  <span className="text-amber-400 font-black uppercase">Warning:</span> Send exactly <span className="text-amber-400 font-black">{parseFloat(amount).toFixed(2)} USDT</span> via <span className="text-amber-400 font-black">BNB Smart Chain (BEP-20)</span>. Any other asset will be lost.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}