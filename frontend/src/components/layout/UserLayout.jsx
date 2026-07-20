// import React, { useEffect, useState } from "react";
// import api from "../../api/axios"; 
// import TopNav from "../navbar/TopNav";
// import Sidebar from "../sidebar/Sidebar";
// import { useAuth } from "../../context/AuthContext";

// // QUICK ACTIONS & MODALS
// import QuickActions from "../dashboard/QuickActions"; 
// import DepositModal from "../modals/DepositModal";
// import TopUpModal from "../modals/TopUpModalWithInput"; 
// import WalletTransferModal from "../modals/WalletTransferModal";
// import WithdrawalModal from "../modals/WithdrawalModal";
// import CreditToWalletModal from "../modals/CreditToWalletModal";
// import TransferCctModal from "../modals/TransferCctModal";
// import UsdtBep20TransferModal from "../modals/UsdtBep20TransferModal"; 

// const UserLayout = ({ children }) => {
//   const { user } = useAuth(); 
//   const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024); 

//   const [modalState, setModalState] = useState({
//     showDeposit: false,
//     showTopUpForm: false,
//     showWalletTransfer: false, // ✅ Seedha yehi khulega
//     showUsdtBep20Transfer: false, 
//     showWithdrawalModal: false,
//     showCreditToWallet: false,
//     showCctTransfer: false, 
//   });

//   const [liveCctBalance, setLiveCctBalance] = useState(0);

//   useEffect(() => {
//     if (modalState.showCctTransfer) {
//       api.get('/staking/stats')
//         .then(res => {
//           if (res.data && res.data.data) {
//             setLiveCctBalance(res.data.data.cctBalance || 0);
//           }
//         })
//         .catch(err => console.error("Failed to fetch fresh CCT balance:", err));
//     }
//   }, [modalState.showCctTransfer]);

//   return (
//     <div className="bg-[#f8fafc] min-h-screen text-slate-900 font-sans flex flex-col w-full selection:bg-teal-500/20 selection:text-teal-900">
      
//       {/* TOP NAVBAR */}
//       <div className="fixed top-0 left-0 w-full z-[100]">
//         <TopNav onHamburgerClick={() => setSidebarOpen(!sidebarOpen)} />
//       </div>

//       <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

//       {/* MAIN BODY */}
//       <div className="flex flex-1 pt-16 md:pt-20 w-full min-h-screen">
        
//         {/* MAIN CONTENT - pb adjust kiya hai taaki niche gap na rahe */}
//         <main className={`flex-1 w-full min-w-0 relative pb-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
//           <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-10%,_rgba(13,148,136,0.06),_transparent_50%)] z-0"></div>

//           <div className="relative z-10 p-3 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
//             {React.Children.map(children, child => {
//               if (React.isValidElement(child)) {
//                 return React.cloneElement(child, { modalState, setModalState });
//               }
//               return child;
//             })}
//           </div>
//         </main>
//       </div>

//       {/* GLOBAL BOTTOM BAR - padding kam ki hai */}
//       <div className={`fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 z-[90] py-2 px-2 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
//         <div className="max-w-7xl mx-auto"> 
//           <QuickActions
//             onDepositClick={() => setModalState((prev) => ({ ...prev, showDeposit: true }))}
//             onTopUpClick={() => setModalState((prev) => ({ ...prev, showTopUpForm: true }))}
//             // ✅ Transfer click karte hi direct WalletTransferModal khulega
//             onWalletTransferClick={() => setModalState((prev) => ({ ...prev, showWalletTransfer: true }))}
//             onWithdrawClick={() => setModalState((prev) => ({ ...prev, showWithdrawalModal: true }))}
//             onCreditToWalletClick={() => setModalState((prev) => ({ ...prev, showCreditToWallet: true }))}
//           />
//         </div>
//       </div>

//       {/* GLOBAL MODALS */}
//       {modalState.showDeposit && <DepositModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showDeposit: false }))} />}
//       {modalState.showTopUpForm && <TopUpModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showTopUpForm: false }))} />}
      
//       {/* Transfer Modal - Direct Access */}
//       {modalState.showWalletTransfer && <WalletTransferModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showWalletTransfer: false }))} />}
//       {modalState.showUsdtBep20Transfer && <UsdtBep20TransferModal onClose={() => setModalState(prev => ({ ...prev, showUsdtBep20Transfer: false }))} />}
      
//       {/* CCT Modal */}
//       {modalState.showCctTransfer && <TransferCctModal cctBalance={liveCctBalance} onClose={() => setModalState(prev => ({ ...prev, showCctTransfer: false }))} onSuccess={() => window.location.reload()} />}

//       {/* Others */}
//       {modalState.showWithdrawalModal && <WithdrawalModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showWithdrawalModal: false }))} />}
//       {modalState.showCreditToWallet && <CreditToWalletModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showCreditToWallet: false }))} />}
      
//       <style>{`
//         ::-webkit-scrollbar { width: 0px; height: 0px; display: none; }
//         html, body { overflow-x: hidden !important; width: 100%; margin: 0; padding: 0; background-color: #f8fafc; }
//       `}</style>
//     </div>
//   );
// };

// export default UserLayout;

import React, { useEffect, useState } from "react";
import api from "../../api/axios"; 
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
    showCctTransfer: false, 
  });

  const [liveCctBalance, setLiveCctBalance] = useState(0);

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
        
        {/* MAIN CONTENT - pb adjust kiya hai taaki niche gap na rahe */}
        <main className={`flex-1 w-full min-w-0 relative pb-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
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

      {/* GLOBAL BOTTOM BAR - padding kam ki hai */}
      <div className={`fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 z-[90] py-2 px-2 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="max-w-7xl mx-auto"> 
          <QuickActions
            // 🔥 Yahan sab functions empty kar diye gaye hain. Click karne par kuch open nahi hoga.
            onDepositClick={() => {}}
            onTopUpClick={() => {}}
            onWalletTransferClick={() => {}}
            onWithdrawClick={() => {}}
onCreditToWalletClick={() => {}}
          />
        </div>
      </div>

      {/* GLOBAL MODALS */}
      {modalState.showDeposit && <DepositModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showDeposit: false }))} />}
      {modalState.showTopUpForm && <TopUpModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showTopUpForm: false }))} />}
      
      {/* Transfer Modal - Direct Access */}
      {modalState.showWalletTransfer && <WalletTransferModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showWalletTransfer: false }))} />}
      {modalState.showUsdtBep20Transfer && <UsdtBep20TransferModal onClose={() => setModalState(prev => ({ ...prev, showUsdtBep20Transfer: false }))} />}
      
      {/* CCT Modal */}
      {modalState.showCctTransfer && <TransferCctModal cctBalance={liveCctBalance} onClose={() => setModalState(prev => ({ ...prev, showCctTransfer: false }))} onSuccess={() => window.location.reload()} />}

      {/* Others */}
      {modalState.showWithdrawalModal && <WithdrawalModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showWithdrawalModal: false }))} />}
      {modalState.showCreditToWallet && <CreditToWalletModal user={user} userId={user?.userId} onClose={() => setModalState(prev => ({ ...prev, showCreditToWallet: false }))} />}
      
      <style>{`
        ::-webkit-scrollbar { width: 0px; height: 0px; display: none; }
        html, body { overflow-x: hidden !important; width: 100%; margin: 0; padding: 0; background-color: #f8fafc; }
      `}</style>
    </div>
  );
};

export default UserLayout;