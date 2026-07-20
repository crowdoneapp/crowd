// // import React from "react";
// // import { CheckCircle2, Zap, Landmark, ArrowRightLeft, Gift, ShieldCheck, ArrowDownLeft, User, CalendarDays, ArrowUpCircle, Wallet } from "lucide-react";

// // const SuccessModal = ({
// //   isOpen,
// //   onClose,
// //   type = "credit",
// //   userId = "",
// //   userName = "",
// //   amount = 0,
// //   reward = 0,
// //   spinQuantity = 0,
// //   customTitle = "",
// //   customMessage = "",
// //   source = "",
// //   zIndex = 2000,
// // }) => {
// //   if (!isOpen) return null;

// //   const currentDate = new Date().toLocaleDateString("en-GB", {
// //     day: "2-digit", month: "short", year: "numeric"
// //   });

// //   // Premium Neo-Banking Layout
// //   const SuccessLayout = ({ title, icon: Icon, children }) => (
// //     <div className="flex flex-col items-center w-full relative z-10">
      
// //       {/* Premium Icon Container */}
// //       <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-5 shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] border border-white/50 bg-gradient-to-br from-blue-500 to-indigo-600 text-white transform rotate-3">
// //         <div className="transform -rotate-3">
// //           <Icon size={36} strokeWidth={2.5} />
// //         </div>
// //       </div>
      
// //       <h2 className="text-[#0b1c3c] text-xl sm:text-2xl font-black uppercase tracking-tight text-center mb-1">
// //         {title}
// //       </h2>
      
// //       <div className="w-full">
// //         {children}
// //       </div>
      
// //       {/* Footer Trust Badges */}
// //       <div className="mt-6 flex flex-col items-center justify-center gap-2 w-full border-t border-slate-100 pt-5">
// //         <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
// //           <CalendarDays size={14} /> {currentDate}
// //         </span>
// //         <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
// //           <ShieldCheck size={14} /> 256-Bit Secured Transaction
// //         </span>
// //       </div>
// //     </div>
// //   );

// //   const UserInfoBlock = ({ idLabel }) => (
// //     <div className="bg-slate-50 border border-slate-200/60 rounded-[16px] p-3.5 mb-4 shadow-inner">
// //       <div className="flex justify-between items-center mb-2">
// //         <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{idLabel}</span>
// //         <span className="text-[#0b1c3c] font-black font-mono text-sm">{userId}</span>
// //       </div>
// //       {userName && userName !== "N/A" && (
// //         <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 mt-1">
// //           <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
// //             <User size={12} /> Name
// //           </span>
// //           <span className="text-indigo-600 font-black text-xs uppercase tracking-wider">{userName}</span>
// //         </div>
// //       )}
// //     </div>
// //   );

// //   const renderContent = () => {

// //     if (customTitle || customMessage) {
// //       return (
// //         <SuccessLayout title={customTitle} icon={CheckCircle2}>
// //           <p className="text-sm text-slate-500 font-bold leading-relaxed px-4 text-center mt-3">
// //             {customMessage}
// //           </p>
// //         </SuccessLayout>
// //       );
// //     }

// //     switch (type) {
// //       case "withdrawal": {
// //         const isPlan = source && source.toLowerCase().startsWith("plan");
// //         const wTitle = isPlan ? "Withdrawal Verified" : "Withdrawal Verified";

// //         return (
// //           <SuccessLayout title={wTitle} icon={Landmark}>
// //             <div className="w-full mt-4">
// //               <UserInfoBlock idLabel="Account ID" />
// //               <div className="flex flex-col items-center pt-2">
// //                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount Processed</span>
// //                 <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter drop-shadow-sm">
// //                   ${amount}
// //                 </span>
// //               </div>
// //             </div>
// //           </SuccessLayout>
// //         );
// //       }

// //       case "convert":
// //         return (
// //           <SuccessLayout title="Conversion Done" icon={ArrowRightLeft}>
// //             <div className="w-full mt-4">
// //               <UserInfoBlock idLabel="Account ID" />
// //               <div className="flex flex-col items-center pt-2">
// //                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Converted Value</span>
// //                 <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter">
// //                   {amount} CCT
// //                 </span>
// //               </div>
// //             </div>
// //           </SuccessLayout>
// //         );

// //       case "stake":
// //         return (
// //           <SuccessLayout title="Staking Locked" icon={ShieldCheck}>
// //             <div className="w-full mt-4">
// //               <UserInfoBlock idLabel="Target ID" />
// //               <div className="flex flex-col items-center pt-2">
// //                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Staked Amount</span>
// //                 <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter">
// //                   {amount} CCT
// //                 </span>
// //               </div>
// //             </div>
// //           </SuccessLayout>
// //         );

// //       case "deposit":
// //         return (
// //           <SuccessLayout title="Deposit Successful" icon={ArrowDownLeft}>
// //             <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 w-full mt-5 text-center shadow-inner">
// //               <span className="text-emerald-600/70 text-[10px] font-black uppercase tracking-widest block mb-2">Vault Funded</span>
// //               <span className="text-4xl sm:text-5xl font-black text-emerald-600 font-mono tracking-tighter">
// //                 + ${amount}
// //               </span>
// //             </div>
// //           </SuccessLayout>
// //         );

// //       case "credit":
// //         return (
// //           <SuccessLayout title="Funds Credited" icon={Wallet}>
// //             <div className="w-full mt-4">
// //               {source && (
// //                 <div className="flex justify-between items-center bg-blue-50 p-3.5 rounded-[16px] border border-blue-100 mb-4 shadow-sm">
// //                   <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Source</span>
// //                   <span className="text-blue-700 font-black text-xs uppercase tracking-wider">{source}</span>
// //                 </div>
// //               )}
// //               <div className="flex flex-col items-center pt-1">
// //                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount Added</span>
// //                 <span className="text-4xl sm:text-5xl font-black text-emerald-500 font-mono tracking-tighter">
// //                   + ${amount}
// //                 </span>
// //               </div>
// //             </div>
// //           </SuccessLayout>
// //         );

// //       case "transfer":
// //       case "usdt_transfer":
// //         return (
// //           <SuccessLayout title="Transfer Completed" icon={ArrowRightLeft}>
// //             <div className="w-full mt-4">
// //               <UserInfoBlock idLabel="Sent To ID" />
// //               <div className="flex flex-col items-center pt-2">
// //                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Transfer Amount</span>
// //                 <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter">
// //                   ${amount}
// //                 </span>
// //               </div>
// //             </div>
// //           </SuccessLayout>
// //         );

// //       case "cct_transfer":
// //         return (
// //           <SuccessLayout title="CCT Transfer Done" icon={ArrowRightLeft}>
// //             <div className="w-full mt-4">
// //               <UserInfoBlock idLabel="Sent To ID" />
// //               <div className="flex flex-col items-center pt-2">
// //                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Transfer Amount</span>
// //                 <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 font-mono tracking-tighter">
// //                   {amount} CCT
// //                 </span>
// //               </div>
// //             </div>
// //           </SuccessLayout>
// //         );

// //        case "topup":
// //         return (
// //           <SuccessLayout title="Tier Elevated" icon={ArrowUpCircle}>
// //             <div className="w-full mt-4">
// //               <UserInfoBlock idLabel="Recipient ID" />
// //               <div className="flex flex-col items-center pt-2">
// //                 <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Package Value</span>
// //                 <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-tighter drop-shadow-sm">
// //                   ${amount}
// //                 </span>
// //               </div>
// //             </div>
// //           </SuccessLayout>
// //         );

// //       case "buy":
// //         return (
// //           <SuccessLayout title="Spins Purchased" icon={Gift}>
// //             <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 w-full mt-5 text-center shadow-inner">
// //               <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest block mb-2">Total Cost: ${amount}</span>
// //               <span className="text-4xl font-black text-indigo-600 font-mono tracking-tighter">
// //                 {spinQuantity} Spins
// //               </span>
// //             </div>
// //           </SuccessLayout>
// //         );

// //       case "spin":
// //         return (
// //           <SuccessLayout title="Spin Reward" icon={Gift}>
// //             <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 w-full mt-5 text-center shadow-inner">
// //               <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest block mb-2">You Won</span>
// //               <span className="text-5xl font-black text-amber-500 font-mono tracking-tighter drop-shadow-sm">
// //                 ${reward}
// //               </span>
// //             </div>
// //           </SuccessLayout>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <div
// //       className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 font-sans"
// //       style={{ zIndex }}
// //     >
// //       <div className="bg-white/95 backdrop-blur-3xl border border-white/50 rounded-[32px] p-6 sm:p-8 w-full max-w-sm shadow-[0_30px_80px_-15px_rgba(0,0,0,0.4)] relative overflow-hidden animate-in zoom-in-95 duration-300">

// //         {/* Ambient Glows */}
// //         <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-400/20 blur-[50px] pointer-events-none rounded-full"></div>
// //         <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-400/20 blur-[50px] pointer-events-none rounded-full"></div>

// //         {renderContent()}

// //         <div className="mt-6 flex justify-center w-full relative z-10">
// //           <button
// //             onClick={onClose}
// //             className="w-full bg-[#0b1c3c] hover:bg-blue-900 text-white transition-all font-black uppercase tracking-widest text-[10px] sm:text-xs px-6 py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(11,28,60,0.5)] hover:shadow-[0_10px_30px_-10px_rgba(11,28,60,0.7)] hover:-translate-y-0.5 active:scale-95 border border-transparent"
// //           >
// //             Close
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };


// // export default SuccessModal;



// import React from "react";
// import { CheckCircle2, Landmark,PartyPopper, ArrowRightLeft, Gift, ShieldCheck, ArrowDownLeft, User, CalendarDays, ArrowUpCircle, Wallet, Globe, Star, Crown, Clock, X } from "lucide-react";

// // Helper function to convert amount to words
// const numberToWords = (num) => {
//   const words = {
//     10: "TEN",
//     20: "TWENTY",
//     30: "THIRTY",
//     40: "FORTY",
//     50: "FIFTY",
//     100: "ONE HUNDRED",
//     200: "TWO HUNDRED",
//     300: "THREE HUNDRED",
//     400: "FOUR HUNDRED",
//     500: "FIVE HUNDRED",
//     600: "SIX HUNDRED",
//     700: "SEVEN HUNDRED",
//     800: "EIGHT HUNDRED",
//     900: "NINE HUNDRED",
//     1000: "ONE THOUSAND"
//   };
//   return words[Math.floor(num)] || num.toString();
// };

// const SuccessModal = ({
//   isOpen,
//   onClose,
//   type = "credit",
//   userId = "",
//   userName = "Valued Member",
//   amount = 0,
//   reward = 0,
//   spinQuantity = 0,
//   customTitle = "",
//   customMessage = "",
//   source = "",
//   zIndex = 2000,
// }) => {
//   if (!isOpen) return null;

//   const d = new Date();
//   const topUpDate = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
//   const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
  
//   // Generating a random TXN ID if not provided
//   const txnId = "TXN" + Math.floor(100000000 + Math.random() * 900000000);

//   // 🔥 DYNAMIC TEXT LOGIC BASED ON ACTION TYPE
//   let mainHeading = "DONATION";
//   let subHeading = "CERTIFICATE";
//   let headerLabel = "TOP-UP";
//   let actionText = "has successfully made a TOP-UP (Donation)\nof";
//   let displayAmount = `$${amount}`;
//   let ribbonText = `${numberToWords(amount)} USDT DOLLARS`;
//   let amountLabel = "AMOUNT";

//   switch (type) {
//     case "withdrawal":
//       mainHeading = "WITHDRAWAL";
//       subHeading = "RECEIPT";
//       headerLabel = "PAYOUT";
//       actionText = "has successfully processed a withdrawal\nof";
//       displayAmount = `$${amount}`;
//       ribbonText = `${numberToWords(amount)} USDT`;
//       amountLabel = "WITHDRAWN";
//       break;
//     case "convert":
//       mainHeading = "CONVERSION";
//       subHeading = "RECEIPT";
//       headerLabel = "SWAP";
//       actionText = "has successfully converted to CCT Token\nworth";
//       displayAmount = `${amount} CCT`;
//       ribbonText = `${numberToWords(amount)} TOKENS`;
//       amountLabel = "CCT AMOUNT";
//       break;
//     case "stake":
//       mainHeading = "STAKING";
//       subHeading = "CONTRACT";
//       headerLabel = "LOCKED";
//       actionText = "has successfully staked CCT Tokens\nof";
//       displayAmount = `${amount} CCT`;
//       ribbonText = `${numberToWords(amount)} TOKENS`;
//       amountLabel = "STAKED";
//       break;
//     case "transfer":
//     case "usdt_transfer":
//       mainHeading = "TRANSFER";
//       subHeading = "RECEIPT";
//       headerLabel = "FUND SEND";
//       actionText = "has successfully transferred funds\nworth";
//       displayAmount = `$${amount}`;
//       ribbonText = `${numberToWords(amount)} USDT`;
//       amountLabel = "TRANSFERRED";
//       break;
//     case "cct_transfer":
//       mainHeading = "TRANSFER";
//       subHeading = "RECEIPT";
//       headerLabel = "TOKEN SEND";
//       actionText = "has successfully transferred CCT Tokens\nworth";
//       displayAmount = `${amount} CCT`;
//       ribbonText = `${numberToWords(amount)} TOKENS`;
//       amountLabel = "TRANSFERRED";
//       break;
//     case "credit":
//       mainHeading = "CREDIT";
//       subHeading = "ACKNOWLEDGEMENT";
//       headerLabel = "RECEIVED";
//       actionText = `has successfully received a credit${source ? ` from ${source}` : ''}\nof`;
//       displayAmount = `$${amount}`;
//       ribbonText = `${numberToWords(amount)} USDT`;
//       amountLabel = "CREDITED";
//       break;
//     case "buy":
//       mainHeading = "PURCHASE";
//       subHeading = "RECEIPT";
//       headerLabel = "VOUCHER";
//       actionText = "has successfully purchased lucky spins\nworth";
//       displayAmount = `${spinQuantity} SPINS`;
//       ribbonText = `FOR ${amount} USDT`;
//       amountLabel = "SPINS BOUGHT";
//       break;
//     case "spin":
//       mainHeading = "REWARD";
//       subHeading = "CERTIFICATE";
//       headerLabel = "WINNER";
//       actionText = "has successfully won a spin reward\nof";
//       displayAmount = `$${reward}`;
//       ribbonText = `${numberToWords(reward)} USDT`;
//       amountLabel = "WON AMOUNT";
//       break;
//     default:
//       // Default keeps the Top-up Donation layout
//       break;
//   }

//   // Allow custom overrides if passed in props
//   if (customTitle) {
//      mainHeading = customTitle;
//      subHeading = "SUCCESS";
//   }
//   if (customMessage) {
//      actionText = customMessage;
//   }

//   return (
//     <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in duration-300 font-sans" style={{ zIndex }}>
      
//       {/* 🏆 UNIVERSAL CERTIFICATE LAYOUT FOR ALL ACTIONS */}
//       <div className="relative w-full max-w-2xl bg-[#020b1c] border-[2px] sm:border-[3px] border-[#d4af37] p-3 sm:p-8 text-white max-h-[98vh] overflow-y-auto hide-scroll shadow-[0_0_40px_rgba(212,175,55,0.15)] outline outline-1 outline-offset-2 outline-[#d4af37]">
        
//         {/* Close Button */}
//         <button onClick={onClose} className="absolute top-2 right-2 md:-top-3 md:-right-3 bg-red-600/20 hover:bg-red-600 text-white p-1.5 rounded-full transition-all border border-red-500/50 z-50">
//           <X size={16} />
//         </button>

//         {/* Left Ribbon */}
//         <div className="hidden sm:block absolute top-0 left-4 w-16 bg-gradient-to-b from-[#fceabb] via-[#f8b500] to-[#b38728] text-center p-1 pb-4 shadow-lg" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)" }}>
//           <p className="text-[6px] font-black text-[#4a3504] uppercase leading-tight tracking-wider mt-1">Thank You<br/>For trusting us<br/>and being a part<br/>of CrowdOne<br/>Family</p>
//           <Star size={8} className="mx-auto mt-1 text-[#4a3504] fill-[#4a3504]" />
//         </div>

//         {/* Right Trust Badge */}
//         <div className="hidden sm:flex absolute top-3 right-4 w-16 h-16 rounded-full border border-[#d4af37] border-dashed items-center justify-center p-0.5">
//           <div className="w-full h-full rounded-full border border-[#d4af37] flex flex-col items-center justify-center text-center p-0.5 bg-[#020b1c]">
//             <Crown size={10} className="text-[#d4af37] mb-0.5" />
//             <p className="text-[4px] font-bold text-[#d4af37] uppercase leading-tight tracking-widest">Your Trust<br/>Our Motivation<br/>Our Commitment</p>
//             <div className="flex gap-px mt-0.5"><Star size={4} className="fill-[#d4af37] text-[#d4af37]"/><Star size={4} className="fill-[#d4af37] text-[#d4af37]"/><Star size={4} className="fill-[#d4af37] text-[#d4af37]"/></div>
//           </div>
//         </div>

//         {/* Logo Area */}
//         <div className="text-center mt-1 sm:mt-0 mb-3">
//           <Globe size={24} className="mx-auto text-[#4da8da] mb-1 sm:mb-2" />
//           <h1 className="text-base sm:text-xl font-black tracking-widest text-white leading-none">CROWDONE</h1>
//           <p className="text-[6px] sm:text-[8px] text-[#4da8da] tracking-[0.3em] uppercase mt-0.5">Together, We Grow</p>
//         </div>

//         {/* Header Lines */}
//         <div className="flex items-center justify-center mb-3">
//            <div className="h-[1px] w-10 sm:w-16 bg-[#d4af37]"></div>
//            <div className="px-2 text-[#d4af37] tracking-[0.2em] text-[10px] sm:text-xs">{headerLabel}</div>
//            <div className="h-[1px] w-10 sm:w-16 bg-[#d4af37]"></div>
//         </div>

//         {/* Title */}
//         <div className="text-center mb-4">
//           <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#d4af37] mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide uppercase" style={{ textShadow: "1px 1px 2px #000, 0 0 1em #d4af37" }}>
//             {mainHeading}
//           </h2>
//           <h3 className="text-xs sm:text-lg font-serif tracking-[0.2em] text-white uppercase">{subHeading}</h3>
//           <div className="flex justify-center gap-1 mt-2 text-[#d4af37]">
//             <Star size={8} className="fill-[#d4af37]" /><Star size={10} className="fill-[#d4af37]" /><Star size={12} className="fill-[#d4af37]" /><Star size={10} className="fill-[#d4af37]" /><Star size={8} className="fill-[#d4af37]" />
//           </div>
//         </div>

//         {/* Body */}
//         <div className="text-center mb-4">
//           <p className="text-slate-300 text-[8px] sm:text-[10px] mb-1 tracking-widest">This is to certify that</p>
//           {/* Cursive Font for Name */}
 
// <div className="flex items-center justify-center my-4 gap-2 sm:gap-4 w-full overflow-hidden">
  
//   {/* 🔥 Left Decorative Line */}
//   <div className="h-[2px] sm:h-[3px] w-12 sm:w-24 md:w-32 bg-gradient-to-r from-transparent via-[#f8b500]/70 to-[#b8860b] rounded-full"></div>
  
//   {/* 🔥 Center Content: Name + Celebration Icon */}
//   <div className="flex items-center justify-center gap-2 sm:gap-3 shrink-0">
//     <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-b from-[#fceabb] via-[#f8b500] to-[#b8860b]">
//       {userName}
//     </h1>
    
   
//   </div>

//   {/* 🔥 Right Decorative Line */}
//   <div className="h-[2px] sm:h-[3px] w-12 sm:w-24 md:w-32 bg-gradient-to-l from-transparent via-[#f8b500]/70 to-[#b8860b] rounded-full"></div>
  
// </div>
//           <p className="text-slate-300 text-[8px] sm:text-[10px] tracking-wide leading-snug whitespace-pre-line">
//             {actionText}
//           </p>
//         </div>

//         {/* Amount Box */}
//         <div className="flex justify-center items-center mb-6 mt-2">
//           {/* Wreath Decoration Left */}
//           <div className="hidden sm:flex text-[#d4af37] mr-3 opacity-80 flex-col items-center">
//             <span className="text-3xl font-serif rotate-[-20deg]">🌿</span>
//           </div>

//           <div className="relative border-[2px] border-[#d4af37] px-8 sm:px-12 pt-3 pb-5 text-center min-w-[200px] sm:min-w-[260px] bg-[#020b1c] shadow-[inset_0_0_15px_rgba(212,175,55,0.1)]">
//             <span className="text-4xl sm:text-6xl font-bold text-[#d4af37] drop-shadow-md tracking-tighter">{displayAmount}</span>
//             {/* Overlapping Ribbon Text */}
//             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[110%] bg-gradient-to-r from-[#b38728] via-[#fceabb] to-[#b38728] text-[#4a3504] font-black py-1 sm:py-1.5 px-2 text-[7px] sm:text-[9px] whitespace-nowrap shadow-xl border border-[#8a6d1c]">
//               {ribbonText}
//             </div>
//           </div>

//           {/* Wreath Decoration Right */}
//           <div className="hidden sm:flex text-[#d4af37] ml-3 opacity-80 flex-col items-center">
//              <span className="text-3xl font-serif rotate-[20deg]" style={{ transform: "scaleX(-1) rotate(-20deg)" }}>🌿</span>
//           </div>
//         </div>

//         {/* Thank You Message */}
//         <div className="text-center mb-5">
//           <p className="text-slate-300 text-[8px] sm:text-[10px]">Thank you for your trust and support.</p>
//           <p className="text-[#4da8da] font-bold mt-0.5 text-[9px] sm:text-xs tracking-wide">Together, we grow stronger!</p>
//         </div>

//         {/* Glowing Stats Grid (Shrunk for mobile) */}
//         <div className="grid grid-cols-5 gap-1 md:gap-0 border border-cyan-500/40 bg-[#061838]/80 rounded-xl p-2 sm:p-3 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative backdrop-blur-md">
          
//           <div className="flex flex-col items-center justify-center border-r border-cyan-500/30 px-1 text-center">
//             <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-cyan-500/50 flex items-center justify-center mb-1"><User size={10} className="text-[#4da8da]" /></div>
//             <span className="text-slate-400 text-[5px] sm:text-[7px] font-bold uppercase tracking-widest mb-0.5">USER ID</span>
//             <span className="text-[#4da8da] font-mono font-bold text-[7px] sm:text-[9px]">{userId}</span>
//           </div>

//           <div className="flex flex-col items-center justify-center border-r border-cyan-500/30 px-1 text-center">
//             <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-cyan-500/50 flex items-center justify-center mb-1"><Wallet size={10} className="text-[#4da8da]" /></div>
//             <span className="text-slate-400 text-[5px] sm:text-[7px] font-bold uppercase tracking-widest mb-0.5 overflow-hidden whitespace-nowrap text-ellipsis max-w-[50px]">{amountLabel}</span>
//             <span className="text-[#4da8da] font-mono font-bold text-[7px] sm:text-[9px]">{displayAmount.replace(" SPINS", "")}</span>
//           </div>

//           <div className="flex flex-col items-center justify-center border-r border-cyan-500/30 px-1 text-center">
//             <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-cyan-500/50 flex items-center justify-center mb-1"><CalendarDays size={10} className="text-[#4da8da]" /></div>
//             <span className="text-slate-400 text-[5px] sm:text-[7px] font-bold uppercase tracking-widest mb-0.5">DATE</span>
//             <span className="text-[#4da8da] font-mono font-bold text-[6px] sm:text-[8px] whitespace-nowrap">{topUpDate}</span>
//           </div>

//           <div className="flex flex-col items-center justify-center border-r border-cyan-500/30 px-1 text-center">
//             <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-cyan-500/50 flex items-center justify-center mb-1"><Clock size={10} className="text-[#4da8da]" /></div>
//             <span className="text-slate-400 text-[5px] sm:text-[7px] font-bold uppercase tracking-widest mb-0.5">TIME</span>
//             <span className="text-[#4da8da] font-mono font-bold text-[6px] sm:text-[8px] whitespace-nowrap">{time}</span>
//           </div>

//           <div className="flex flex-col items-center justify-center px-1 text-center">
//             <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-cyan-500/50 flex items-center justify-center mb-1"><ArrowRightLeft size={10} className="text-[#4da8da]" /></div>
//             <span className="text-slate-400 text-[5px] sm:text-[7px] font-bold uppercase tracking-widest mb-0.5">TXN ID</span>
//             <span className="text-[#4da8da] font-mono font-bold text-[6px] sm:text-[8px] whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-[40px]">{txnId}</span>
//           </div>
//         </div>

//         {/* Footer Area (Compact) */}
//         <div className="flex justify-between items-center mt-2 px-2">
          
//           {/* Signature Area */}
//           <div className="text-left w-1/3">
//             <p className="text-lg sm:text-xl text-slate-300 opacity-90" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", fontStyle: "italic" }}>Team CrowdOne</p>
//             <div className="w-16 sm:w-24 h-[1px] bg-slate-600 mt-1 mb-0.5"></div>
//             <p className="text-[5px] sm:text-[7px] text-slate-400 uppercase tracking-widest">Authorized Signature</p>
//           </div>

//           {/* Verified Badge */}
//           <div className="flex flex-col items-center relative w-1/3">
//             <div className="bg-gradient-to-b from-[#fceabb] to-[#b38728] p-1 rounded-t-full border border-black shadow-xl relative z-0">
//                 <div className="bg-[#020b1c] rounded-full p-1.5">
//                    <ShieldCheck size={16} className="text-[#d4af37]" />
//                 </div>
//             </div>
//             <div className="bg-gradient-to-r from-[#b38728] via-[#fceabb] to-[#b38728] text-[#4a3504] font-black text-[6px] sm:text-[7px] px-2 py-1 uppercase min-w-[80px] sm:min-w-[100px] text-center -mt-2 relative z-10 border border-[#8a6d1c] shadow-lg">
//                 VERIFIED & SECURE
//             </div>
//           </div>

//           {/* Thank You Note */}
//           <div className="text-right w-1/3">
//             <p className="text-sm sm:text-lg text-[#4da8da] mb-0.5" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", fontStyle: "italic" }}>Thank You!</p>
//             <p className="text-[6px] sm:text-[8px] text-slate-400 leading-tight tracking-wide">Your support helps us<br/>build a strong<br/>community.</p>
//           </div>
//         </div>

//         {/* Very Bottom Border Text */}
//         <div className="mt-4 text-center border-t border-white/10 pt-2">
//            <p className="text-[6px] sm:text-[8px] text-[#d4af37] tracking-[0.4em] uppercase opacity-80">• TOGETHER, WE GROW •</p>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default SuccessModal;


import React from "react";
import { CheckCircle2, Landmark, PartyPopper, ArrowRightLeft, Gift, ShieldCheck, ArrowDownLeft, User, CalendarDays, ArrowUpCircle, Wallet, Globe, Star, Crown, Clock, X } from "lucide-react";

// Helper function to convert amount to words
const numberToWords = (num) => {
  const words = {
    10: "TEN",
    20: "TWENTY",
    30: "THIRTY",
    40: "FORTY",
    50: "FIFTY",
    100: "ONE HUNDRED",
    200: "TWO HUNDRED",
    300: "THREE HUNDRED",
    400: "FOUR HUNDRED",
    500: "FIVE HUNDRED",
    600: "SIX HUNDRED",
    700: "SEVEN HUNDRED",
    800: "EIGHT HUNDRED",
    900: "NINE HUNDRED",
    1000: "ONE THOUSAND"
  };
  return words[Math.floor(num)] || num.toString();
};

const SuccessModal = ({
  isOpen,
  onClose,
  type = "credit",
  userId = "",
  userName = "Valued Member",
  amount = 0,
  reward = 0,
  spinQuantity = 0,
  customTitle = "",
  customMessage = "",
  source = "",
  zIndex = 2000,
}) => {
  if (!isOpen) return null;

  const d = new Date();
  // Sirf Date rakhi hai yaha
  const topUpDate = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  
  // Generating a random TXN ID if not provided
  const txnId = "TXN" + Math.floor(100000000 + Math.random() * 900000000);

  // 🔥 DYNAMIC TEXT LOGIC BASED ON ACTION TYPE
  let mainHeading = "DONATION";
  let subHeading = "CERTIFICATE";
  let headerLabel = "TOP-UP";
  let actionText = "has successfully made a TOP-UP (Donation)\nof";
  let displayAmount = `$${amount}`;
  let ribbonText = `${numberToWords(amount)} USDT DOLLARS`;

  switch (type) {
    case "withdrawal":
      mainHeading = "WITHDRAWAL";
      subHeading = "RECEIPT";
      headerLabel = "PAYOUT";
      actionText = "has successfully processed a withdrawal\nof";
      displayAmount = `$${amount}`;
      ribbonText = `${numberToWords(amount)} USDT`;
      break;
    case "convert":
      mainHeading = "CONVERSION";
      subHeading = "RECEIPT";
      headerLabel = "SWAP";
      actionText = "has successfully converted to CCT Token\nworth";
      displayAmount = `${amount} CCT`;
      ribbonText = `${numberToWords(amount)} TOKENS`;
      break;
    case "stake":
      mainHeading = "STAKING";
      subHeading = "CONTRACT";
      headerLabel = "LOCKED";
      actionText = "has successfully staked CCT Tokens\nof";
      displayAmount = `${amount} CCT`;
      ribbonText = `${numberToWords(amount)} TOKENS`;
      break;
    case "transfer":
    case "usdt_transfer":
      mainHeading = "TRANSFER";
      subHeading = "RECEIPT";
      headerLabel = "FUND SEND";
      actionText = "has successfully transferred funds\nworth";
      displayAmount = `$${amount}`;
      ribbonText = `${numberToWords(amount)} USDT`;
      break;
    case "cct_transfer":
      mainHeading = "TRANSFER";
      subHeading = "RECEIPT";
      headerLabel = "TOKEN SEND";
      actionText = "has successfully transferred CCT Tokens\nworth";
      displayAmount = `${amount} CCT`;
      ribbonText = `${numberToWords(amount)} TOKENS`;
      break;
    case "credit":
      mainHeading = "CREDIT";
      subHeading = "ACKNOWLEDGEMENT";
      headerLabel = "RECEIVED";
      actionText = `has successfully received a credit${source ? ` from ${source}` : ''}\nof`;
      displayAmount = `$${amount}`;
      ribbonText = `${numberToWords(amount)} USDT`;
      break;
    case "buy":
      mainHeading = "PURCHASE";
      subHeading = "RECEIPT";
      headerLabel = "VOUCHER";
      actionText = "has successfully purchased lucky spins\nworth";
      displayAmount = `${spinQuantity} SPINS`;
      ribbonText = `FOR ${amount} USDT`;
      break;
    case "spin":
      mainHeading = "REWARD";
      subHeading = "CERTIFICATE";
      headerLabel = "WINNER";
      actionText = "has successfully won a spin reward\nof";
      displayAmount = `$${reward}`;
      ribbonText = `${numberToWords(reward)} USDT`;
      break;
    default:
      break;
  }

  if (customTitle) {
     mainHeading = customTitle;
     subHeading = "SUCCESS";
  }
  if (customMessage) {
     actionText = customMessage;
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in duration-300 font-sans" style={{ zIndex }}>
      
      {/* 🏆 UNIVERSAL CERTIFICATE LAYOUT */}
      <div className="relative w-full max-w-2xl bg-[#020b1c] border-[2px] sm:border-[3px] border-[#d4af37] p-3 sm:p-8 text-white max-h-[98vh] overflow-y-auto hide-scroll shadow-[0_0_40px_rgba(212,175,55,0.15)] outline outline-1 outline-offset-2 outline-[#d4af37]">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-2 right-2 md:-top-3 md:-right-3 bg-red-600/20 hover:bg-red-600 text-white p-1.5 rounded-full transition-all border border-red-500/50 z-50">
          <X size={16} />
        </button>

        {/* Left Ribbon */}
        <div className="hidden sm:block absolute top-0 left-4 w-16 bg-gradient-to-b from-[#fceabb] via-[#f8b500] to-[#b38728] text-center p-1 pb-4 shadow-lg" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)" }}>
          <p className="text-[6px] font-black text-[#4a3504] uppercase leading-tight tracking-wider mt-1">Thank You<br/>For trusting us<br/>and being a part<br/>of CrowdOne<br/>Family</p>
          <Star size={8} className="mx-auto mt-1 text-[#4a3504] fill-[#4a3504]" />
        </div>

        {/* Right Trust Badge */}
        <div className="hidden sm:flex absolute top-3 right-4 w-16 h-16 rounded-full border border-[#d4af37] border-dashed items-center justify-center p-0.5">
          <div className="w-full h-full rounded-full border border-[#d4af37] flex flex-col items-center justify-center text-center p-0.5 bg-[#020b1c]">
            <Crown size={10} className="text-[#d4af37] mb-0.5" />
            <p className="text-[4px] font-bold text-[#d4af37] uppercase leading-tight tracking-widest">Your Trust<br/>Our Motivation<br/>Our Commitment</p>
            <div className="flex gap-px mt-0.5"><Star size={4} className="fill-[#d4af37] text-[#d4af37]"/><Star size={4} className="fill-[#d4af37] text-[#d4af37]"/><Star size={4} className="fill-[#d4af37] text-[#d4af37]"/></div>
          </div>
        </div>

        {/* Logo Area */}
        <div className="text-center mt-1 sm:mt-0 mb-3">
          <Globe size={24} className="mx-auto text-[#4da8da] mb-1 sm:mb-2" />
          <h1 className="text-base sm:text-xl font-black tracking-widest text-white leading-none">CROWDONE</h1>
          <p className="text-[6px] sm:text-[8px] text-[#4da8da] tracking-[0.3em] uppercase mt-0.5">Together, We Grow</p>
        </div>

        {/* Header Lines */}
        <div className="flex items-center justify-center mb-3">
           <div className="h-[1px] w-10 sm:w-16 bg-[#d4af37]"></div>
           <div className="px-2 text-[#d4af37] tracking-[0.2em] text-[10px] sm:text-xs">{headerLabel}</div>
           <div className="h-[1px] w-10 sm:w-16 bg-[#d4af37]"></div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#d4af37] mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide uppercase" style={{ textShadow: "1px 1px 2px #000, 0 0 1em #d4af37" }}>
            {mainHeading}
          </h2>
          <h3 className="text-xs sm:text-lg font-serif tracking-[0.2em] text-white uppercase">{subHeading}</h3>
          <div className="flex justify-center gap-1 mt-2 text-[#d4af37]">
            <Star size={8} className="fill-[#d4af37]" /><Star size={10} className="fill-[#d4af37]" /><Star size={12} className="fill-[#d4af37]" /><Star size={10} className="fill-[#d4af37]" /><Star size={8} className="fill-[#d4af37]" />
          </div>
        </div>

        {/* Body */}
        <div className="text-center mb-4">
          <p className="text-slate-300 text-[8px] sm:text-[10px] mb-1 tracking-widest">This is to certify that</p>
          
          {/* 🔥 Name and ID Section */}
          <div className="flex items-center justify-center my-4 gap-2 sm:gap-4 w-full overflow-hidden">
            <div className="h-[2px] sm:h-[3px] w-12 sm:w-24 md:w-32 bg-gradient-to-r from-transparent via-[#f8b500]/70 to-[#b8860b] rounded-full"></div>
            
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-b from-[#fceabb] via-[#f8b500] to-[#b8860b]">
                  {userName}
                </h1>
               </div>
              {/* ID Niche yaha add ki hai */}
              <p className="text-[#4da8da] font-mono font-bold text-xs sm:text-sm mt-1 tracking-widest bg-[#020b1c] px-3 py-0.5 rounded-full border border-cyan-900/50">
                ID: {userId}
              </p>
            </div>

            <div className="h-[2px] sm:h-[3px] w-12 sm:w-24 md:w-32 bg-gradient-to-l from-transparent via-[#f8b500]/70 to-[#b8860b] rounded-full"></div>
          </div>

          <p className="text-slate-300 text-[8px] sm:text-[10px] tracking-wide leading-snug whitespace-pre-line">
            {actionText}
          </p>
        </div>

        {/* Amount Box */}
        <div className="flex justify-center items-center mb-6 mt-2">
          <div className="hidden sm:flex text-[#d4af37] mr-3 opacity-80 flex-col items-center">
            <span className="text-3xl font-serif rotate-[-20deg]">🌿</span>
          </div>

          <div className="relative border-[2px] border-[#d4af37] px-8 sm:px-12 pt-3 pb-5 text-center min-w-[200px] sm:min-w-[260px] bg-[#020b1c] shadow-[inset_0_0_15px_rgba(212,175,55,0.1)]">
            <span className="text-4xl sm:text-6xl font-bold text-[#d4af37] drop-shadow-md tracking-tighter">{displayAmount}</span>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[110%] bg-gradient-to-r from-[#b38728] via-[#fceabb] to-[#b38728] text-[#4a3504] font-black py-1 sm:py-1.5 px-2 text-[7px] sm:text-[9px] whitespace-nowrap shadow-xl border border-[#8a6d1c]">
              {ribbonText}
            </div>
          </div>

          <div className="hidden sm:flex text-[#d4af37] ml-3 opacity-80 flex-col items-center">
             <span className="text-3xl font-serif rotate-[20deg]" style={{ transform: "scaleX(-1) rotate(-20deg)" }}>🌿</span>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mb-5">
          <p className="text-slate-300 text-[8px] sm:text-[10px]">Thank you for your trust and support.</p>
          <p className="text-[#4da8da] font-bold mt-0.5 text-[9px] sm:text-xs tracking-wide">Together, we grow stronger!</p>
        </div>

        {/* 🔥 Sirf Date dikhai hai (Bada box hata diya) */}
        <div className="flex justify-center items-center mb-6">
           <div className="flex items-center gap-2 text-[#4da8da] bg-[#061838]/80 border border-cyan-500/30 px-5 py-2 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-md">
             <CalendarDays size={14} />
             <span className="font-mono font-bold text-[10px] sm:text-xs tracking-widest">{topUpDate}</span>
           </div>
        </div>

        {/* Footer Area */}
        <div className="flex justify-between items-center mt-2 px-2">
          
          <div className="text-left w-1/3">
            <p className="text-lg sm:text-xl text-slate-300 opacity-90" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", fontStyle: "italic" }}>Team CrowdOne</p>
            <div className="w-16 sm:w-24 h-[1px] bg-slate-600 mt-1 mb-0.5"></div>
            <p className="text-[5px] sm:text-[7px] text-slate-400 uppercase tracking-widest">Authorized Signature</p>
          </div>

          <div className="flex flex-col items-center relative w-1/3">
            <div className="bg-gradient-to-b from-[#fceabb] to-[#b38728] p-1 rounded-t-full border border-black shadow-xl relative z-0">
                <div className="bg-[#020b1c] rounded-full p-1.5">
                   <ShieldCheck size={16} className="text-[#d4af37]" />
                </div>
            </div>
            <div className="bg-gradient-to-r from-[#b38728] via-[#fceabb] to-[#b38728] text-[#4a3504] font-black text-[6px] sm:text-[7px] px-2 py-1 uppercase min-w-[80px] sm:min-w-[100px] text-center -mt-2 relative z-10 border border-[#8a6d1c] shadow-lg">
                VERIFIED & SECURE
            </div>
          </div>

          <div className="text-right w-1/3">
            <p className="text-sm sm:text-lg text-[#4da8da] mb-0.5" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", fontStyle: "italic" }}>Thank You!</p>
            <p className="text-[6px] sm:text-[8px] text-slate-400 leading-tight tracking-wide">Your support helps us<br/>build a strong<br/>community.</p>
          </div>
        </div>

        {/* Very Bottom Border Text */}
        <div className="mt-4 text-center border-t border-white/10 pt-2">
           <p className="text-[6px] sm:text-[8px] text-[#d4af37] tracking-[0.4em] uppercase opacity-80">• TOGETHER, WE GROW •</p>
        </div>

      </div>
    </div>
  );
};

export default SuccessModal;