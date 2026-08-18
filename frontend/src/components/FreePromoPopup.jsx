// import React, { useState, useEffect } from "react";
// import api from "../api/axios"; 
// import { useAuth } from "../context/AuthContext"; 
// import { Gift, X, KeyRound } from "lucide-react";
//  import SuccessModal from "./modals/SuccessModal";

// function FreePromoPopup() {
//   const { user, token } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);
//   const [txPassword, setTxPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
  
//   // Naya state Grand Success Modal dikhane ke liye
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   useEffect(() => {
//     if (user) {
//       const alreadyClaimed = user?.packages?.some(
//         (p) => p.plan === "Free-100-Promo"
//       );
      
//       if (!alreadyClaimed) {
//         const timer = setTimeout(() => setIsOpen(true), 1000);
//         return () => clearTimeout(timer);
//       }
//     }
//   }, [user]);

//   const handleClaim = async () => {
//     if (!txPassword) {
//       setError("Please enter Transaction Password");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
      
//       const res = await api.put(
//         `/user/topup-free-100/${user.userId}`, 
//         { transactionPassword: txPassword },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // Package Activate Hote Hi Grand Modal Open Hoga
//       setShowSuccessModal(true);
      
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to claim package");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Jab user certificate ko close karega tab page reload hoga
//   const handleCloseSuccess = () => {
//     setShowSuccessModal(false);
//     setIsOpen(false);
//     window.location.reload();
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       {/* Jab tak Success Modal open nahi hai, tab tak ye main popup dikhega */}
//       {!showSuccessModal && (
//         <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
//           <div className="relative w-full max-w-[24rem] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
            
//             {/* Close Button */}
//             <button 
//               onClick={() => setIsOpen(false)}
//               className="absolute top-3 right-3 z-10 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors"
//             >
//               <X size={18} />
//             </button>

//             {/* Header */}
//             <div className="bg-[#2a64f6] pt-6 pb-4 px-5 text-center">
//               <div className="flex justify-center mb-3">
//                 <div className="bg-white px-2 py-1 rounded-xl shadow-lg w-40 h-12 flex items-center justify-center overflow-hidden">
//                     <img 
//                       src="/logo.jpg" 
//                       alt="CrowdOne Logo" 
//                       className="w-full h-full object-contain scale-125" 
//                     />
//                 </div>
//               </div>

//               <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#487aff] mb-2 shadow-inner ring-2 ring-white/10">
//                 <Gift size={24} className="text-white animate-bounce" />
//               </div>
              
//               <h2 className="text-2xl font-black text-white tracking-widest drop-shadow-md mb-1 leading-tight">
//                 CLAIM FREE <br />
//                 <span className="text-[#facc15] font-extrabold text-[34px] drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)]">$100</span>
//               </h2>
//               <p className="text-[13px] text-white/90 font-medium leading-tight px-2">
//                 Exclusive Offer! Activate your free $100 package and get 5% daily ROI.
//               </p>
//             </div>

//             {/* Form Body */}
//             <div className="p-5">
//               {error && (
//                 <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 mb-4 rounded-lg text-xs text-center shadow-sm">
//                   {error}
//                 </div>
//               )}

//               <div className="mb-5">
//                 <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
//                   Transaction Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <KeyRound size={16} className="text-slate-400" />
//                   </div>
//                   <input
//                     type="password"
//                     value={txPassword}
//                     onChange={(e) => setTxPassword(e.target.value)}
//                     placeholder="Enter transaction password"
//                     className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a64f6] focus:border-transparent transition-all"
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={handleClaim}
//                 disabled={loading}
//                 className={`w-full py-3 rounded-lg font-black text-[14px] uppercase tracking-widest transition-all shadow-md ${
//                   loading 
//                     ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
//                     : "bg-[#2a64f6] hover:bg-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
//                 }`}
//               >
//                 {loading ? "Processing..." : "Claim Now!"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🔥 GRAND SUCCESS MODAL (CERTIFICATE) 🔥 */}
//       {showSuccessModal && (
//         <SuccessModal
//           isOpen={showSuccessModal}
//           onClose={handleCloseSuccess}
//           type="credit" // UI layout style ke liye
//           userId={user?.userId}
//           userName={user?.name || "Valued Member"}
//           amount={100}
//           customTitle="ACTIVATED"
//           customMessage="has successfully activated"
//           zIndex={1050}
//         />
//       )}
//     </>
//   );
// }

// export default FreePromoPopup;




import React, { useState, useEffect } from "react";
import api from "../api/axios"; 
import { useAuth } from "../context/AuthContext"; 
import { Gift, X, KeyRound } from "lucide-react";
import SuccessModal from "./modals/SuccessModal";

function FreePromoPopup() {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [txPassword, setTxPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user || !user.userId) return;

      // 1. Strict Local Check: Agar local storage me pehle se claimed likha hai toh turant return ho jao
      const localClaimKey = `promoClaimed_${user.userId}`;
      if (localStorage.getItem(localClaimKey) === "true") {
        return;
      }

      // 2. AuthContext Check (Jaisa pehle tha)
      const alreadyClaimedInState = user?.packages?.some(
        (p) => p.plan === "Free-100-Promo"
      );

      if (alreadyClaimedInState) {
        // Auth context me hai, matlab claim ho chuka hai, localStorage me set kardo taki next time API call bhi na ho
        localStorage.setItem(localClaimKey, "true");
        return;
      }

      try {
        // 3. Strict Backend Check (Safest): DB se fresh data lo ki sach me claim hua hai ya nahi
        const res = await api.get(`/user/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const freshUser = res.data.user || res.data;
        const definitelyClaimed = freshUser?.packages?.some(
          (p) => p.plan === "Free-100-Promo"
        );

        if (definitelyClaimed) {
           // Database me hai, isliye dobara nahi dikhayenge
           localStorage.setItem(localClaimKey, "true");
        } else {
           // Database me nahi hai, iska matlab ise dikhana chahiye
           const timer = setTimeout(() => setIsOpen(true), 1500);
           return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Error checking promo eligibility:", err);
      }
    };

    checkEligibility();
  }, [user, token]);

  const handleClaim = async () => {
    if (!txPassword) {
      setError("Please enter Transaction Password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await api.put(
        `/user/topup-free-100/${user.userId}`, 
        { transactionPassword: txPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Package Activate Hote Hi Grand Modal Open Hoga
      setShowSuccessModal(true);
      
      // Strict Lock: Successful claim hone ke baad localStorage me flag set kar do
      localStorage.setItem(`promoClaimed_${user.userId}`, "true");

    } catch (err) {
      setError(err.response?.data?.message || "Failed to claim package");
      // Agar backend bole ki already bought (400 error me message check karo), tab bhi lock kardo
      if (err.response?.data?.message?.includes("already") || err.response?.data?.message?.includes("le chuke hain")) {
         localStorage.setItem(`promoClaimed_${user.userId}`, "true");
         setIsOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Jab user certificate ko close karega tab page reload hoga
  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setIsOpen(false);
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Jab tak Success Modal open nahi hai, tab tak ye main popup dikhega */}
      {!showSuccessModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="relative w-full max-w-[24rem] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-10 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="bg-[#2a64f6] pt-6 pb-4 px-5 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-white px-2 py-1 rounded-xl shadow-lg w-40 h-12 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/logo.jpg" 
                      alt="CrowdOne Logo" 
                      className="w-full h-full object-contain scale-125" 
                    />
                </div>
              </div>

              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#487aff] mb-2 shadow-inner ring-2 ring-white/10">
                <Gift size={24} className="text-white animate-bounce" />
              </div>
              
              <h2 className="text-2xl font-black text-white tracking-widest drop-shadow-md mb-1 leading-tight">
                CLAIM FREE <br />
                <span className="text-[#facc15] font-extrabold text-[34px] drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)]">$100</span>
              </h2>
              <p className="text-[13px] text-white/90 font-medium leading-tight px-2">
                Exclusive Offer! Activate your free $100 package and get 5% daily ROI.
              </p>
            </div>

            {/* Form Body */}
            <div className="p-5">
              
              {/* 🔥 FIX: Yahan ')' miss ho gaya tha */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 mb-4 rounded-lg text-xs text-center shadow-sm">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                  Transaction Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={txPassword}
                    onChange={(e) => setTxPassword(e.target.value)}
                    placeholder="Enter transaction password"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-3 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a64f6] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-black text-[14px] uppercase tracking-widest transition-all shadow-md ${
                  loading 
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
                    : "bg-[#2a64f6] hover:bg-blue-700 text-white hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {loading ? "Processing..." : "Claim Now!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 GRAND SUCCESS MODAL (CERTIFICATE) 🔥 */}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccess}
          type="credit" 
          userId={user?.userId}
          userName={user?.name || "Valued Member"}
          amount={100}
          customTitle="ACTIVATED"
          customMessage="has successfully activated"
          zIndex={1050}
        />
      )}
    </>
  );
}

export default FreePromoPopup;