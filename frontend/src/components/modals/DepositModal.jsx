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
        confirmButtonColor: '#0b1c3c'
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
        confirmButtonColor: '#0b1c3c'
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex justify-center items-center p-4 animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="bg-white/95 backdrop-blur-3xl w-full max-w-sm rounded-[32px] border border-white/50 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]">
        
        {/* Ambient Glow Effects */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-400/20 blur-[50px] pointer-events-none rounded-full"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-400/20 blur-[50px] pointer-events-none rounded-full"></div>

        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center relative z-10 shrink-0">
           <div className="flex items-center gap-4">
              {step === 2 && (
                 <button onClick={() => setStep(1)} className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-[#0b1c3c] shadow-sm transition-all active:scale-95">
                    <ChevronLeft size={16} strokeWidth={3} />
                 </button>
              )}
              {step === 1 && (
                <div className="p-3 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-2xl border border-emerald-100 text-emerald-500">
                    <Wallet size={20} strokeWidth={2.5} />
                </div>
              )}
              <div>
                <h2 className="text-[#0b1c3c] font-black text-base md:text-lg tracking-tight flex items-center gap-2">
                  Deposit USDT
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest">
                    BEP-20
                  </span>
                  <span className="text-slate-400 text-[10px] font-bold tracking-wider">Network Only</span>
                </div>
              </div>
           </div>
           <button onClick={onClose} className="bg-white hover:bg-rose-50 p-2 rounded-full transition-all border border-slate-200 hover:border-rose-200 shadow-sm cursor-pointer active:scale-95">
              <X size={16} className="text-slate-400 hover:text-rose-500" strokeWidth={2.5} />
           </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 relative z-10 flex flex-col items-center bg-transparent overflow-y-auto custom-scroll">
          
          {/* ========================================================
              STEP 1: ENTER AMOUNT
              ======================================================== */}
          {step === 1 && (
            <div className="w-full animate-in slide-in-from-left-4 duration-300">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-[inset_0_4px_10px_rgba(16,185,129,0.1)] border border-emerald-100">
                    <DollarSign size={32} strokeWidth={2.5} />
                 </div>
                 <h3 className="font-black text-[#0b1c3c] text-xl">Enter Amount</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Specify how much you want to deposit</p>
              </div>

              <div className="mb-6 relative group">
                 <label className="block text-[10px] font-black text-[#0b1c3c] mb-2 uppercase tracking-widest ml-1">
                   USDT Amount
                 </label>
                 <div className="relative flex items-center">
                    <div className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                       <DollarSign size={20} strokeWidth={3} />
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (e.target.value && parseFloat(e.target.value) >= 10) setAmountError("");
                      }}
                      placeholder="10.00"
                      className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-16 text-xl font-black text-[#0b1c3c] font-mono tracking-tight outline-none transition-all shadow-inner
                        ${amountError ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-100 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50'}`}
                    />
                    <div className="absolute right-4 bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                      USDT
                    </div>
                 </div>
                 {amountError && (
                    <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 flex items-center gap-1">
                      <AlertTriangle size={12} /> {amountError}
                    </p>
                 )}
              </div>

              <button 
                onClick={handleProceed}
                disabled={!amount || parseFloat(amount) < 10}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)]
                    ${(!amount || parseFloat(amount) < 10)
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                      : 'bg-[#0b1c3c] hover:bg-blue-800 text-white hover:shadow-[0_8px_25px_rgba(11,28,60,0.3)] active:scale-95'}`}
              >
                Generate Secure Vault <ArrowRight size={18} />
              </button>

              <div className="mt-5 bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-start gap-2">
                <ShieldCheck className="text-blue-500 shrink-0 w-4 h-4 mt-0.5" />
                <p className="text-slate-600 text-[10px] font-bold leading-relaxed">
                  Minimum deposit is <span className="text-blue-700 font-black">10 USDT</span>. Your funds are secured by smart contract infrastructure.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: SHOW QR CODE & VERIFY
              ======================================================== */}
          {step === 2 && loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 w-full animate-in fade-in">
               <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Establishing Secure Connection...</p>
            </div>
          )}

          {step === 2 && !loading && (
            <div className="w-full animate-in slide-in-from-right-4 duration-300">
              
              {/* Timer & Requested Amount */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-[16px] mb-5 shadow-sm">
                <div className="flex items-center gap-2">
                   <div className="bg-rose-100 p-1.5 rounded-lg text-rose-600 animate-pulse">
                     <Timer size={14} strokeWidth={3} />
                   </div>
                   <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Time Remaining</p>
                     <p className="text-rose-600 font-black text-sm font-mono tracking-wider">{formatTime(timeLeft)}</p>
                   </div>
                </div>
                <div className="text-right border-l border-slate-200 pl-3">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount to Pay</p>
                   <p className="text-[#0b1c3c] font-black text-sm tracking-tight">{parseFloat(amount).toFixed(2)} USDT</p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex justify-center mb-5 relative group">
                 <div className="absolute inset-0 bg-emerald-300 rounded-[32px] blur-[25px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                 <div className="relative p-3 bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] flex flex-col items-center transform transition-transform group-hover:scale-105 duration-300">
                   <QRCodeCanvas value={address} size={130} level="H" />
                   <div className="mt-2 text-slate-400 font-black text-[9px] tracking-[0.2em] uppercase flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                      <QrCode size={12} /> Scan to Pay
                   </div>
                 </div>
              </div>

              {/* Address Display & Copy */}
              <div className="w-full mb-6">
                <label className="block text-[10px] font-black text-[#0b1c3c] mb-1.5 ml-1 uppercase tracking-widest">
                  Deposit Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    readOnly
                    value={address}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-700 text-[11px] font-mono tracking-wider focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all text-center sm:text-left shadow-inner"
                  />
                  <button 
                    onClick={copyText} 
                    className={`flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm shrink-0 active:scale-95 ${
                        copied 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-[#0b1c3c] hover:bg-blue-800 text-white border border-transparent'
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
                    className={`w-full py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)]
                        ${verifying 
                          ? 'bg-emerald-400 text-white cursor-wait' 
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-95'}`}
                  >
                    {verifying ? (
                    <><RefreshCcw size={18} className="animate-spin" /> Scanning Blockchain...</>
                  ) : (
                    <><ShieldCheck size={18} /> Confirm & Validate Deposite</>
                  )}
                  </button>
              </div>

              {/* Warning Note */}
              <div className="mt-5 bg-rose-50/50 border border-rose-100 p-3 rounded-xl flex items-start gap-2">
                <AlertTriangle className="text-rose-500 shrink-0 w-4 h-4 mt-0.5" />
                <p className="text-slate-600 text-[9px] md:text-[10px] font-bold leading-relaxed">
                  <span className="text-rose-600 font-black">WARNING:</span> Send exactly <span className="text-rose-600 font-black">{parseFloat(amount).toFixed(2)} USDT</span> via <span className="text-rose-600 font-black">BNB Smart Chain (BEP-20)</span>. Any other asset will be lost.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}