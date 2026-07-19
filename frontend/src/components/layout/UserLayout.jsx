import React, { useState, useEffect } from "react";
import api from "../../api/axios"; // 🔥 API Import kiya live balance ke liye
import TopNav from "../navbar/TopNav";
import Sidebar from "../sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";

// QUICK ACTIONS & MODALS
import QuickActions from "../dashboard/QuickActions"; 
import DepositModal from "../modals/DepositModal";
import TopUpModal from "../modals/TopUpModalWithInput"; 
import WalletTransferModal from "../modals/WalletTransferModal";
import WithdrawalModal from "../modals/WithdrawalModal";
import CreditToWalletModal from "../modals/CreditToWalletModal";
import TransferCctModal from "../modals/TransferCctModal";
import UsdtBep20TransferModal from "../modals/UsdtBep20TransferModal"; 

// 🔥 NAYE, UNIQUE ICONS IMPORT KIYE HAIN
import { X, ArrowRight, CircleDollarSign, WalletCards, Orbit } from "lucide-react";

const UserLayout = ({ children }) => {
  const { user } = useAuth(); 
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024); 

  const [modalState, setModalState] = useState({
    showDeposit: false,
    showTopUpForm: false,
    showWalletTransfer: false,
    showUsdtBep20Transfer: false, 
    showWithdrawalModal: false,
    showCreditToWallet: false,
    showTransferSelection: false, 
    showCctTransfer: false, 
  });

  // 🔥 Live CCT Balance store karne ke liye
  const [liveCctBalance, setLiveCctBalance] = useState(0);

  // 🔥 Jab CCT modal khulega, tabhi fresh balance aayega
  useEffect(() => {
    if (modalState.showCctTransfer) {
      api.get('/staking/stats')
        .then(res => {
          if (res.data && res.data.data) {
            setLiveCctBalance(res.data.data.cctBalance || 0);
          }
        })
        .catch(err => console.error("Failed to fetch fresh CCT balance:", err));
    }
  }, [modalState.showCctTransfer]);

  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-sans flex flex-col w-full selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* TOP NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-[100]">
        <TopNav onHamburgerClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* MAIN BODY */}
      <div className="flex flex-1 pt-16 md:pt-20 w-full min-h-screen">
        
        {/* MAIN CONTENT */}
        <main className={`flex-1 w-full min-w-0 relative pb-28 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          {/* Subtle Background Glow */}
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-10%,_rgba(13,148,136,0.06),_transparent_50%)] z-0"></div>

          <div className="relative z-10 p-3 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { modalState, setModalState });
              }
              return child;
            })}
          </div>
        </main>
      </div>

      {/* GLOBAL BOTTOM BAR */}
      <div className={`fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-5px_30px_rgba(0,0,0,0.03)] z-[90] pt-2 pb-4 px-2 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="max-w-7xl mx-auto"> 
          <QuickActions
            onDepositClick={() => setModalState((prev) => ({ ...prev, showDeposit: true }))}
            onTopUpClick={() => setModalState((prev) => ({ ...prev, showTopUpForm: true }))}
            onWalletTransferClick={() => setModalState((prev) => ({ ...prev, showTransferSelection: true }))}
            onWithdrawClick={() => setModalState((prev) => ({ ...prev, showWithdrawalModal: true }))}
            onCreditToWalletClick={() => setModalState((prev) => ({ ...prev, showCreditToWallet: true }))}
          />
        </div>
      </div>

      {/* ========================================================
          🚀 PREMIUM NEO-BANKING ASSET SELECTION MODAL (UNIQUE ICONS)
          Theme: Teal / Amber / Rose
          ======================================================== */}
      {modalState.showTransferSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-3xl w-full max-w-md rounded-[32px] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)] p-6 md:p-8 animate-in zoom-in-95 duration-300 relative border border-white/50 overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-teal-400/20 rounded-full blur-[40px] pointer-events-none"></div>
           <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-amber-400/20 rounded-full blur-[40px] pointer-events-none"></div>

            <button 
              onClick={() => setModalState((prev) => ({ ...prev, showTransferSelection: false }))} 
              className="absolute top-5 right-5 bg-white border border-slate-200 hover:bg-rose-50 p-2 rounded-full transition-all text-slate-400 hover:text-rose-500 shadow-sm z-20 active:scale-95"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="relative z-10">
              <div className="inline-block bg-slate-100 px-3 py-1 rounded-full mb-3 mx-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Asset Router</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#0b1c3c] tracking-tight mb-1">
                Select Transfer
              </h2>
              <p className="text-xs text-slate-500 font-bold mb-8">
                Securely route your assets across the network
              </p>

              <div className="flex flex-col gap-4">

 
                {/* 2. WALLET TRANSFER BUTTON (Teal Theme) */}
                <button
                  onClick={() => setModalState((prev) => ({ ...prev, showTransferSelection: false, showWalletTransfer: true }))}
                  className="w-full flex items-center gap-5 bg-slate-50/50 backdrop-blur-sm hover:bg-teal-50/80 border border-slate-200 hover:border-teal-300 p-4 rounded-[20px] transition-all duration-300 shadow-sm hover:shadow-[0_8px_25px_-5px_rgba(13,148,136,0.2)] group relative overflow-hidden text-left"
                >
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-teal-200/50 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  
                  {/* Unique Icon: WalletCards */}
                  <div className="bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-teal-100 text-teal-600 p-3.5 rounded-[16px] group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 relative z-10">
                    <WalletCards size={26} strokeWidth={2} />
                  </div>
                  <div className="relative z-10 flex-1">
                    <div className="font-black text-[#0b1c3c] text-base group-hover:text-teal-700 transition-colors">Internal Wallet</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Earning Balance Router</div>
                  </div>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1.5 transition-all relative z-10" />
                </button>
 
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          GLOBAL MODALS 
          ======================================================== */}
      {modalState.showDeposit && <DepositModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showDeposit: false }))} />}
      {modalState.showTopUpForm && <TopUpModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showTopUpForm: false }))} />}
      
      {/* Transfers */}
      {modalState.showWalletTransfer && <WalletTransferModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showWalletTransfer: false }))} />}
      {modalState.showUsdtBep20Transfer && <UsdtBep20TransferModal onClose={() => setModalState(prev => ({ ...prev, showUsdtBep20Transfer: false }))} />}
      
      {/* CCT Modal */}
      {modalState.showCctTransfer && <TransferCctModal cctBalance={liveCctBalance} onClose={() => setModalState(prev => ({ ...prev, showCctTransfer: false }))} onSuccess={() => window.location.reload()} />}

      {/* Others */}
      {modalState.showWithdrawalModal && <WithdrawalModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showWithdrawalModal: false }))} />}
      {modalState.showCreditToWallet && <CreditToWalletModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showCreditToWallet: false }))} />}
      
      {/* GLOBAL CSS */}
      <style>{`
        ::-webkit-scrollbar { width: 0px; height: 0px; display: none; }
        html, body { overflow-x: hidden !important; width: 100%; margin: 0; padding: 0; scrollbar-width: none; -ms-overflow-style: none; background-color: #f8fafc; }
        #root { width: 100%; overflow-x: hidden; }
        @media (max-width: 768px) { .p-2 { padding: 8px 4px !important; } }
      `}</style>
    </div>
  );
};

export default UserLayout;