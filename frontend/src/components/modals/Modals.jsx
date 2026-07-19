import React, { useState, useEffect } from "react";
import api from "../../api/axios"; 
import DepositModal from "./DepositModal";
import WalletTransferModal from "./WalletTransferModal";
import WithdrawalModal from "./WithdrawalModal";
import TopUpModalWithInput from "./TopUpModalWithInput";
import CreditToWalletModal from "./CreditToWalletModal";
import InstantWithdrawModal from "./InstantWithdrawModal"; 
import SuccessModal from "./SuccessModal";
import SpinButton from "./SpinButton";
import TransferCctModal from "./TransferCctModal";
import UsdtBep20TransferModal from "./UsdtBep20TransferModal";

// 🔥 NAYA: ArrowRight icon add kiya premium buttons ke liye
import { X, DollarSign, Coins, Wallet, ArrowRight } from "lucide-react"; 

const Modals = ({ user, modalState, setModalState, setUser }) => {
  const [successData, setSuccessData] = useState(null);
  const [adminWalletAddress, setAdminWalletAddress] = useState(""); 

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const res = await api.get("/wallet/admin-address");
        if (res.data.address) {
          setAdminWalletAddress(res.data.address);
          console.log("✅ Admin Wallet Loaded:", res.data.address);
        }
      } catch (err) {
        console.error("❌ Failed to load admin wallet:", err);
      }
    };

    fetchWalletAddress();
  }, []);

  const closeModal = (modalName) =>
    setModalState((prev) => ({ ...prev, [modalName]: false }));

  const updateUserAndSuccess = (updatedUser, amount, type) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setSuccessData({ userId: updatedUser.userId, amount, type });
  };

  return (
    <>
      <div className="flex gap-2 items-center mb-4">
        <SpinButton className="text-sm" />
      </div>

      {/* ========================================================
          🚀 PREMIUM NEO-BANKING TRANSFER SELECTION MODAL
          Theme: Teal / Amber / Rose
          ======================================================== */}
      {modalState.showTransferSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] p-6 md:p-8 animate-in zoom-in-95 duration-300 relative border border-slate-100 overflow-hidden">
            
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-50 to-white pointer-events-none"></div>

            <button 
              onClick={() => closeModal("showTransferSelection")} 
              className="absolute top-5 right-5 bg-white border border-slate-200 hover:bg-slate-50 p-2 rounded-full transition-all text-slate-400 hover:text-slate-600 shadow-sm z-20 active:scale-95"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="relative z-10">
              <h2 className="text-2xl font-black text-[#0b1c3c] text-center tracking-tight mb-1">
                Select Transfer
              </h2>
              <p className="text-[10px] md:text-xs text-slate-400 text-center font-bold uppercase tracking-widest mb-6">
                Choose the asset you want to send
              </p>

              <div className="flex flex-col gap-3">

                {/* 1. USDT BEP20 TRANSFER BUTTON (Amber Theme) */}
                <button
                  onClick={() => {
                    closeModal("showTransferSelection");
                    setModalState((prev) => ({ ...prev, showUsdtBep20Transfer: true }));
                  }}
                  className="w-full flex items-center gap-4 bg-white hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 p-4 rounded-[20px] transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 w-20 h-20 bg-amber-100 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  <div className="bg-amber-50 border border-amber-100 text-amber-600 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <DollarSign size={24} strokeWidth={2.5} />
                  </div>
                  <div className="text-left relative z-10 flex-1">
                    <div className="font-black text-slate-800 text-sm sm:text-base group-hover:text-amber-700 transition-colors">USDT BEP20</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Transfer Deposit Balance</div>
                  </div>
                  <ArrowRight size={18} className="text-amber-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all relative z-10" />
                </button>
                
                {/* 2. TOP-UP WALLET TRANSFER BUTTON (Teal Theme) */}
                <button
                  onClick={() => {
                    closeModal("showTransferSelection");
                    setModalState((prev) => ({ ...prev, showWalletTransfer: true }));
                  }}
                  className="w-full flex items-center gap-4 bg-white hover:bg-teal-50/50 border border-slate-100 hover:border-teal-200 p-4 rounded-[20px] transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 w-20 h-20 bg-teal-100 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  <div className="bg-teal-50 border border-teal-100 text-teal-600 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <Wallet size={24} strokeWidth={2.5} />
                  </div>
                  <div className="text-left relative z-10 flex-1">
                    <div className="font-black text-slate-800 text-sm sm:text-base group-hover:text-teal-700 transition-colors">Internal Wallet</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Transfer Top-up Balance</div>
                  </div>
                  <ArrowRight size={18} className="text-teal-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all relative z-10" />
                </button>

                {/* 3. CCT TRANSFER BUTTON (Rose Theme) */}
                <button
                  onClick={() => {
                    closeModal("showTransferSelection");
                    setModalState((prev) => ({ ...prev, showCctTransfer: true }));
                  }}
                  className="w-full flex items-center gap-4 bg-white hover:bg-rose-50/50 border border-slate-100 hover:border-rose-200 p-4 rounded-[20px] transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 w-20 h-20 bg-rose-100 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <Coins size={24} strokeWidth={2.5} />
                  </div>
                  <div className="text-left relative z-10 flex-1">
                    <div className="font-black text-slate-800 text-sm sm:text-base group-hover:text-rose-700 transition-colors">CCT Token</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Send CCT to Downline</div>
                  </div>
                  <ArrowRight size={18} className="text-rose-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all relative z-10" />
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODALS LIST 
          ======================================================== */}

      {/* Deposit Modal */}
      {modalState.showDeposit && (
        <DepositModal
          isOpen={modalState.showDeposit}
          onClose={() => closeModal("showDeposit")}
          userId={user.userId}
          walletAddress={adminWalletAddress || ""} 
          onDepositSuccess={(amount) => {
            closeModal("showDeposit");
            setSuccessData({ userId: user.userId, amount, type: "deposit" });
          }}
        />
      )}

      {/* USDT Wallet Transfer Modal */}
      {modalState.showWalletTransfer && (
        <WalletTransferModal
          onClose={() => closeModal("showWalletTransfer")}
          onSuccess={(userId, amount) =>
            setSuccessData({ userId, amount, type: "transfer" })
          }
        />
      )}

      {/* USDT BEP20 Transfer Modal */}
      {modalState.showUsdtBep20Transfer && (
        <UsdtBep20TransferModal
          onClose={() => closeModal("showUsdtBep20Transfer")}
          onSuccess={(userId, amount) =>
            setSuccessData({ userId, amount, type: "transfer" })
          }
        />
      )}

      {/* CCT Transfer Modal */}
      {modalState.showCctTransfer && (
        <TransferCctModal
          onClose={() => closeModal("showCctTransfer")}
          cctBalance={user?.cctBalance || 0} 
          onSuccess={(userId, amount) =>
            setSuccessData({ userId, amount, type: "transfer" }) 
          }
        />
      )}

      {/* Standard Withdrawal Modal */}
      {modalState.showWithdrawalModal && (
        <WithdrawalModal
          userId={user.userId}
          onClose={() => closeModal("showWithdrawalModal")}
          onSuccess={(updatedUser, amount) =>
            updateUserAndSuccess(updatedUser, amount, "withdrawal")
          }
        />
      )}

      {/* Instant Withdraw Modal */}
      {modalState.showInstantWithdraw && (
        <InstantWithdrawModal
          userId={user.userId}
          onClose={() => closeModal("showInstantWithdraw")}
          onSuccess={(updatedUser, amount) =>
            updateUserAndSuccess(updatedUser, amount, "instant-withdraw")
          }
        />
      )}

      {/* Top-Up Modal */}
      {modalState.showTopUpForm && (
        <TopUpModalWithInput
          onClose={() => closeModal("showTopUpForm")}
          onTopUpSuccess={(updatedUser, amount) =>
            updateUserAndSuccess(updatedUser, amount, "topup")
          }
        />
      )}

      {/* Credit To Wallet Modal */}
      {modalState.showCreditToWallet && (
        <CreditToWalletModal
          userId={user.userId}
          onClose={() => closeModal("showCreditToWallet")}
          onSuccess={(updatedUser, amount) =>
            updateUserAndSuccess(updatedUser, amount, "credit")
          }
        />
      )}

      {/* Success Modal */}
      {successData && (
        <SuccessModal
          isOpen={!!successData}
          onClose={() => setSuccessData(null)}
          type={successData.type}
          userId={successData.userId}
          amount={successData.amount}
        />
      )}
    </>
  );
};

export default Modals;