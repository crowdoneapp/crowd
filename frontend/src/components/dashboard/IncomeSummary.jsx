// // // import React, { useEffect, useState } from "react";
// // // import { 
// // //   UserPlus, Globe, Network, Ticket, RefreshCw, Zap
// // // } from "lucide-react";

// // // // 🔥 PACKAGES AUR LEVELS CONFIG 
// // // const PACKAGES = [30, 100, 300, 500, 1000];
// // // const TOTAL_LEVELS = 50;

// // // const IncomeSummary = ({ income = {}, user = {} }) => {
// // //   const [globalGrowthIncome, setGlobalGrowthIncome] = useState(0); 

// // //   // 1. Direct Earning
// // //   const directIncome = Number(income.totalDirectIncome) || Number(income.directIncome) || 0;
  
// // //   // 3. Level Earning
// // //   const levelIncome = Number(income.totalLevelIncome) || Number(income.levelIncome) || 0;
  
// // //   // 4. Get Pass Earning 
// // //   const getPassIncome = Number(income.getPassIncome) || Number(income.totalFastTrackIncome) || Number(income.fastTrackIncome) || 0;
  
// // //   // 5. Upgrade Bounce Back Earning 
// // //   const upgradeBounceBackIncome = Number(income.upgradeBounceBackIncome) || Number(income.totalRewardIncome) || Number(income.rewardIncome) || Number(user.rewardIncome) || 0;

// // //   // 🔥 6. NAYA: ROI Earning (Free $100 Package ka 5% & Matching)
// // //   const roiIncome = Number(income.totalRoiIncome) || Number(income.roiIncome) || Number(user.roiIncome) || 0;

// // //   // 🔥 2. Crowd Donation Earning (TOTAL POTENTIAL LOGIC - ONLY DEPENDS ON TEAM CROWD NOW)
// // //   useEffect(() => {
// // //     if (!user) return;
    
// // //     let totalFrontendAchieved = 0;

// // //     const purchased = user.purchasedPackages || [];
// // //     const highestPkg = user.highestPackage || user.topUpAmount || 0;
    
// // //     // Sirf un packages ko check karo jo active hain
// // //     const activePkgs = PACKAGES.filter(p => purchased.includes(p) || highestPkg >= p);

// // //     activePkgs.forEach(pkg => {
// // //         // Har package ki apni crowd nikalo
// // //         const currentPackageYourCrowd = user?.packageStats?.[String(pkg)]?.globalTeamCount || user?.globalTeamCount || 0;

// // //         // 50 Levels ka check
// // //         for (let i = 1; i <= TOTAL_LEVELS; i++) {
// // //             const unlockTeamReq = i * 100; // Level 1 = 100, Level 2 = 200

// // //             // 🔥 UPDATE: Direct wali condition hata di gayi hai. Ab sirf "Your Crowd" check hoga.
// // //             if (currentPackageYourCrowd >= unlockTeamReq) {
// // //                 // Agar Your Crowd ne requirement meet kar li, toh earning add kar do
// // //                 totalFrontendAchieved += (pkg * 2);
// // //             }
// // //         }
// // //     });
    
// // //     // Final total set kar diya (Example: 60 + 60 = $120)
// // //     setGlobalGrowthIncome(totalFrontendAchieved);
    
// // //   }, [user]);

// // //   // 🔥 STATEMENT LEDGER THEME (Sabhi Incomes list kardi hain)
// // //   const earningsList = [
// // //     { num: "01", label: "Direct Earning", value: directIncome, icon: UserPlus, accent: "#2563eb" },
// // //     { num: "02", label: "Crowd Donation Earning", value: globalGrowthIncome, icon: Globe, accent: "#7c3aed" },
// // //     { num: "03", label: "Level Earning", value: levelIncome, icon: Network, accent: "#c026d3" },
// // //     { num: "04", label: "ROI Earning (5%)", value: roiIncome, icon: RefreshCw, accent: "#eab308" },
// // //     { num: "05", label: "Bounce Back Earning", value: upgradeBounceBackIncome, icon: Ticket, accent: "#10b981" },
// // //     { num: "06", label: "Get Pass Earning", value: getPassIncome, icon: Zap, accent: "#f43f5e" }
// // //   ];

// // //   const totalOfAll = earningsList.reduce((sum, item) => sum + item.value, 0);

// // //   return (
// // //     <div className="w-full mb-6">

// // //       {/* Header — passbook style */}
// // //       <div className="flex items-end justify-between mb-4 px-1">
// // //         <div>
// // //           <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0b1c3c] tracking-tight">
// // //             Earnings
// // //           </h2>
// // //         </div>
// // //         <p className="text-slate-400 text-[10px] sm:text-xs font-mono font-bold hidden sm:block">
// // //           {earningsList.length} categories
// // //         </p>
// // //       </div>

// // //       {/* Single-column ledger: one row = one box, ruled edges */}
// // //       <div className="bg-white rounded-[18px] border border-slate-100 shadow-[0_4px_24px_-12px_rgba(15,27,51,0.08)] overflow-hidden divide-y divide-slate-100">
// // //         {earningsList.map((item, index) => (
// // //           <div
// // //             key={index}
// // //             className="relative flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 group hover:bg-slate-50/60 transition-colors duration-300"
// // //           >
// // //             {/* Accent rail — the row's own color, left edge */}
// // //             <span
// // //               className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
// // //               style={{ backgroundColor: item.accent }}
// // //             ></span>

// // //             {/* Number tag */}
// // //             <span className="text-slate-300 font-mono font-bold text-sm sm:text-base mr-1 sm:mr-2">
// // //               {item.num}
// // //             </span>

// // //             {/* Icon */}
// // //             <div
// // //               className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
// // //               style={{ backgroundColor: `${item.accent}0d`, borderColor: `${item.accent}33`, color: item.accent }}
// // //             >
// // //               <item.icon size={16} strokeWidth={2.5} />
// // //             </div>

// // //             {/* Label */}
// // //             <h3 className="flex-1 font-bold text-slate-700 text-[11px] sm:text-sm md:text-[15px] uppercase tracking-wide leading-snug group-hover:text-[#0b1c3c] transition-colors">
// // //               {item.label}
// // //             </h3>

// // //             {/* Value */}
// // //             <p
// // //               className="shrink-0 font-black text-base sm:text-lg md:text-xl font-mono tracking-tight text-right"
// // //               style={{ color: item.accent }}
// // //             >
// // //               ${item.value.toFixed(2)}
// // //             </p>
// // //           </div>
// // //         ))}

// // //         {/* Ledger total footer */}
// // //         <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0b1c3c]">
// // //           <span className="text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em]">
// // //             Combined Total
// // //           </span>
// // //           <span className="text-white font-black text-base sm:text-lg md:text-xl font-mono tracking-tight">
// // //             ${totalOfAll.toFixed(2)}
// // //           </span>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default IncomeSummary;






// // import React, { useEffect, useState } from "react";
// // import { 
// //   UserPlus, Globe, Network 
// // } from "lucide-react";

// // // 🔥 PACKAGES AUR LEVELS CONFIG 
// // const PACKAGES = [30, 100, 300, 500, 1000];
// // const TOTAL_LEVELS = 50;

// // const IncomeSummary = ({ income = {}, user = {} }) => {
// //   const [globalGrowthIncome, setGlobalGrowthIncome] = useState(0); 

// //   // 1. Direct Earning
// //   const directIncome = Number(income.totalDirectIncome) || Number(income.directIncome) || 0;
  
// //   // 2. Level Earning
// //   const levelIncome = Number(income.totalLevelIncome) || Number(income.levelIncome) || 0;
  
// //   // 3. ROI Earning (Backend se aane wala 5% aur matching)
// //   const roiIncome = Number(income.totalRoiIncome) || Number(income.roiIncome) || Number(user.roiIncome) || 0;

// //   // 🔥 Crowd Donation Earning (TOTAL POTENTIAL LOGIC)
// //   useEffect(() => {
// //     if (!user) return;
    
// //     let totalFrontendAchieved = 0;

// //     const purchased = user.purchasedPackages || [];
// //     const highestPkg = user.highestPackage || user.topUpAmount || 0;
    
// //     // Sirf un packages ko check karo jo active hain
// //     const activePkgs = PACKAGES.filter(p => purchased.includes(p) || highestPkg >= p);

// //     activePkgs.forEach(pkg => {
// //         // Har package ki apni crowd nikalo
// //         const currentPackageYourCrowd = user?.packageStats?.[String(pkg)]?.globalTeamCount || user?.globalTeamCount || 0;

// //         // 50 Levels ka check
// //         for (let i = 1; i <= TOTAL_LEVELS; i++) {
// //             const unlockTeamReq = i * 100; // Level 1 = 100, Level 2 = 200

// //             if (currentPackageYourCrowd >= unlockTeamReq) {
// //                 // Agar Your Crowd ne requirement meet kar li, toh earning add kar do
// //                 totalFrontendAchieved += (pkg * 2);
// //             }
// //         }
// //     });
    
// //     setGlobalGrowthIncome(totalFrontendAchieved);
    
// //   }, [user]);

// //   // 🔥 MAIN UPDATE: ROI aur Crowd Donation ko merge kar diya gaya hai
// //   const combinedCrowdDonation = globalGrowthIncome + roiIncome;

// //   // 🔥 STATEMENT LEDGER THEME (Ab sirf 3 Incomes bachi hain)
// //   const earningsList = [
// //     { num: "01", label: "Direct Earning", value: directIncome, icon: UserPlus, accent: "#2563eb" },
// //     { num: "02", label: "Crowd Donation Earning", value: combinedCrowdDonation, icon: Globe, accent: "#7c3aed" },
// //     { num: "03", label: "Level Earning", value: levelIncome, icon: Network, accent: "#c026d3" }
// //   ];

// //   // Combined Total ab sirf in 3 categories ka calculate hoga
// //   const totalOfAll = earningsList.reduce((sum, item) => sum + item.value, 0);

// //   return (
// //     <div className="w-full mb-6">

// //       {/* Header — passbook style */}
// //       <div className="flex items-end justify-between mb-4 px-1">
// //         <div>
// //           <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0b1c3c] tracking-tight">
// //             Earnings
// //           </h2>
// //         </div>
// //         <p className="text-slate-400 text-[10px] sm:text-xs font-mono font-bold hidden sm:block">
// //           {earningsList.length} categories
// //         </p>
// //       </div>

// //       {/* Single-column ledger */}
// //       <div className="bg-white rounded-[18px] border border-slate-100 shadow-[0_4px_24px_-12px_rgba(15,27,51,0.08)] overflow-hidden divide-y divide-slate-100">
// //         {earningsList.map((item, index) => (
// //           <div
// //             key={index}
// //             className="relative flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 group hover:bg-slate-50/60 transition-colors duration-300"
// //           >
// //             {/* Accent rail */}
// //             <span
// //               className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
// //               style={{ backgroundColor: item.accent }}
// //             ></span>

// //             {/* Number tag */}
// //             <span className="text-slate-300 font-mono font-bold text-sm sm:text-base mr-1 sm:mr-2">
// //               {item.num}
// //             </span>

// //             {/* Icon */}
// //             <div
// //               className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
// //               style={{ backgroundColor: `${item.accent}0d`, borderColor: `${item.accent}33`, color: item.accent }}
// //             >
// //               <item.icon size={16} strokeWidth={2.5} />
// //             </div>

// //             {/* Label */}
// //             <h3 className="flex-1 font-bold text-slate-700 text-[11px] sm:text-sm md:text-[15px] uppercase tracking-wide leading-snug group-hover:text-[#0b1c3c] transition-colors">
// //               {item.label}
// //             </h3>

// //             {/* Value */}
// //             <p
// //               className="shrink-0 font-black text-base sm:text-lg md:text-xl font-mono tracking-tight text-right"
// //               style={{ color: item.accent }}
// //             >
// //               ${item.value.toFixed(2)}
// //             </p>
// //           </div>
// //         ))}

// //         {/* Ledger total footer */}
// //         <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0b1c3c]">
// //           <span className="text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em]">
// //             Combined Total
// //           </span>
// //           <span className="text-white font-black text-base sm:text-lg md:text-xl font-mono tracking-tight">
// //             ${totalOfAll.toFixed(2)}
// //           </span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default IncomeSummary;














// import React, { useEffect, useState } from "react";
// import { 
//   UserPlus, Globe, Network 
// } from "lucide-react";

// // 🔥 PACKAGES AUR LEVELS CONFIG 
// const PACKAGES = [30, 100, 300, 500, 1000];
// const TOTAL_LEVELS = 50;

// const IncomeSummary = ({ income = {}, user = {} }) => {
//   const [globalGrowthIncome, setGlobalGrowthIncome] = useState(0); 

//   // 1. Direct Earning
//   const directIncome = Number(income.totalDirectIncome) || Number(user.totalDirectIncome) || Number(user.directIncome) || 0;
  
//   // 2. Level Earning
//   const levelIncome = Number(income.totalLevelIncome) || Number(user.totalLevelIncome) || Number(user.levelIncome) || 0;
  
//   // 3. Actual ROI Earning (Backend se aane wala 5% aur matching)
//   const roiIncome = Number(income.totalRoiIncome) || Number(user.totalRoiIncome) || Number(user.roiIncome) || 0;

//   // 4. Actual Pool Earning (Jo pehle se backend me tha)
//   const actualPoolIncome = Number(income.totalPoolIncome) || Number(user.totalPoolIncome) || Number(user.poolIncome) || 0;

//   // 🔥 Crowd Donation Earning (TOTAL POTENTIAL LOGIC)
//   useEffect(() => {
//     if (!user) return;
    
//     let totalFrontendAchieved = 0;

//     const purchased = user.purchasedPackages || [];
//     const highestPkg = user.highestPackage || user.topUpAmount || 0;
    
//     // Sirf un packages ko check karo jo active hain
//     const activePkgs = PACKAGES.filter(p => purchased.includes(p) || highestPkg >= p);

//     activePkgs.forEach(pkg => {
//         // Har package ki apni crowd nikalo
//         const currentPackageYourCrowd = user?.packageStats?.[String(pkg)]?.globalTeamCount || user?.globalTeamCount || 0;

//         // 50 Levels ka check
//         for (let i = 1; i <= TOTAL_LEVELS; i++) {
//             const unlockTeamReq = i * 100; // Level 1 = 100, Level 2 = 200

//             if (currentPackageYourCrowd >= unlockTeamReq) {
//                 // Agar Your Crowd ne requirement meet kar li, toh earning add kar do
//                 totalFrontendAchieved += (pkg * 2);
//             }
//         }
//     });
    
//     setGlobalGrowthIncome(totalFrontendAchieved);
    
//   }, [user]);

//   // 🔥 MAIN UPDATE: Ab Potential Income + Actual Pool Income + ROI Income tino mila kar dikhega!
//   const combinedCrowdDonation = globalGrowthIncome + actualPoolIncome + roiIncome;

//   // 🔥 STATEMENT LEDGER THEME 
//   const earningsList = [
//     { num: "01", label: "Direct Earning", value: directIncome, icon: UserPlus, accent: "#2563eb" },
//     { num: "02", label: "Crowd Donation Earning", value: combinedCrowdDonation, icon: Globe, accent: "#7c3aed" },
//     { num: "03", label: "Level Earning", value: levelIncome, icon: Network, accent: "#c026d3" }
//   ];

//   // Combined Total ab sirf in 3 categories ka calculate hoga
//   const totalOfAll = earningsList.reduce((sum, item) => sum + item.value, 0);

//   return (
//     <div className="w-full mb-6">

//       {/* Header — passbook style */}
//       <div className="flex items-end justify-between mb-4 px-1">
//         <div>
//           <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0b1c3c] tracking-tight">
//             Earnings
//           </h2>
//         </div>
//         <p className="text-slate-400 text-[10px] sm:text-xs font-mono font-bold hidden sm:block">
//           {earningsList.length} categories
//         </p>
//       </div>

//       {/* Single-column ledger */}
//       <div className="bg-white rounded-[18px] border border-slate-100 shadow-[0_4px_24px_-12px_rgba(15,27,51,0.08)] overflow-hidden divide-y divide-slate-100">
//         {earningsList.map((item, index) => (
//           <div
//             key={index}
//             className="relative flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 group hover:bg-slate-50/60 transition-colors duration-300"
//           >
//             {/* Accent rail */}
//             <span
//               className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//               style={{ backgroundColor: item.accent }}
//             ></span>

//             {/* Number tag */}
//             <span className="text-slate-300 font-mono font-bold text-sm sm:text-base mr-1 sm:mr-2">
//               {item.num}
//             </span>

//             {/* Icon */}
//             <div
//               className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
//               style={{ backgroundColor: `${item.accent}0d`, borderColor: `${item.accent}33`, color: item.accent }}
//             >
//               <item.icon size={16} strokeWidth={2.5} />
//             </div>

//             {/* Label */}
//             <h3 className="flex-1 font-bold text-slate-700 text-[11px] sm:text-sm md:text-[15px] uppercase tracking-wide leading-snug group-hover:text-[#0b1c3c] transition-colors">
//               {item.label}
//             </h3>

//             {/* Value */}
//             <p
//               className="shrink-0 font-black text-base sm:text-lg md:text-xl font-mono tracking-tight text-right"
//               style={{ color: item.accent }}
//             >
//               ${item.value.toFixed(2)}
//             </p>
//           </div>
//         ))}

//         {/* Ledger total footer */}
//         <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0b1c3c]">
//           <span className="text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em]">
//             Combined Total
//           </span>
//           <span className="text-white font-black text-base sm:text-lg md:text-xl font-mono tracking-tight">
//             ${totalOfAll.toFixed(2)}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IncomeSummary;











import React, { useEffect, useState } from "react";
import { 
  UserPlus, Globe, Network, TrendingUp, Users
} from "lucide-react";

// 🔥 PACKAGES AUR LEVELS CONFIG 
const PACKAGES = [30, 100, 300, 500, 1000];
const TOTAL_LEVELS = 50;

const IncomeSummary = ({ income = {}, user = {} }) => {
  const [globalGrowthIncome, setGlobalGrowthIncome] = useState(0); 

  // 1. Direct Earning
  const directIncome = Number(income.totalDirectIncome) || Number(user.totalDirectIncome) || Number(user.directIncome) || 0;
  
  // 2. Level Earning
  const levelIncome = Number(income.totalLevelIncome) || Number(user.totalLevelIncome) || Number(user.levelIncome) || 0;
  
  // 3. Daily Trade Income (Pehle ROI tha)
  const roiIncome = Number(income.totalRoiIncome) || Number(user.totalRoiIncome) || Number(user.roiIncome) || 0;

  // 4. Team Compounding Income (Matching ROI)
  const matchingRoiIncome = Number(income.totalMatchingRoiIncome) || Number(user.totalMatchingRoiIncome) || Number(user.matchingRoiIncome) || 0;

  // 5. Actual Pool Earning (Backend se)
  const actualPoolIncome = Number(income.totalPoolIncome) || Number(user.totalPoolIncome) || Number(user.poolIncome) || 0;

  // 🔥 Old Crowd Donation Earning (50 Levels Potential)
  useEffect(() => {
    if (!user) return;
    
    let totalFrontendAchieved = 0;

    const purchased = user.purchasedPackages || [];
    const highestPkg = user.highestPackage || user.topUpAmount || 0;
    
    const activePkgs = PACKAGES.filter(p => purchased.includes(p) || highestPkg >= p);

    activePkgs.forEach(pkg => {
        const currentPackageYourCrowd = user?.packageStats?.[String(pkg)]?.globalTeamCount || user?.globalTeamCount || 0;

        for (let i = 1; i <= TOTAL_LEVELS; i++) {
            const unlockTeamReq = i * 100; 

            if (currentPackageYourCrowd >= unlockTeamReq) {
                totalFrontendAchieved += (pkg * 2);
            }
        }
    });
    
    setGlobalGrowthIncome(totalFrontendAchieved);
    
  }, [user]);

  // 🔥 OLD CROWD DONATION TOTAL (Only visible if > 0)
  const oldCrowdDonation = globalGrowthIncome + actualPoolIncome;

  // 🔥 DYNAMIC EARNINGS LIST (Sab Alag-Alag)
  let rawEarningsList = [
    { label: "Daily Trade Income", value: roiIncome, icon: TrendingUp, accent: "#10b981" }, // Emerald
    { label: "Team Compounding", value: matchingRoiIncome, icon: Users, accent: "#8b5cf6" }, // Violet
    { label: "Direct Earning", value: directIncome, icon: UserPlus, accent: "#2563eb" }, // Blue
    { label: "Level Earning", value: levelIncome, icon: Network, accent: "#c026d3" } // Fuchsia
  ];

  // Agar purane user ke paas Crowd Donation income hai, tabhi ye list me add hoga
  // if (oldCrowdDonation > 0) {
  //     rawEarningsList.push({ 
  //         label: "Crowd Donation ", 
  //         value: oldCrowdDonation, 
  //         icon: Globe, 
  //         accent: "#f59e0b" // Amber
  //     });
  // }

  // Numbering dynamically assign kar rahe hain (01, 02, 03...)
  const earningsList = rawEarningsList.map((item, index) => ({
      ...item,
      num: String(index + 1).padStart(2, '0')
  }));

  // Combined Total
  const totalOfAll = earningsList.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full mb-6">

      {/* Header — passbook style */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0b1c3c] tracking-tight">
            Earnings
          </h2>
        </div>
        <p className="text-slate-400 text-[10px] sm:text-xs font-mono font-bold hidden sm:block">
          {earningsList.length} categories
        </p>
      </div>

      {/* Single-column ledger */}
      <div className="bg-white rounded-[18px] border border-slate-100 shadow-[0_4px_24px_-12px_rgba(15,27,51,0.08)] overflow-hidden divide-y divide-slate-100">
        {earningsList.map((item, index) => (
          <div
            key={index}
            className="relative flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 group hover:bg-slate-50/60 transition-colors duration-300"
          >
            {/* Accent rail */}
            <span
              className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundColor: item.accent }}
            ></span>

            {/* Number tag */}
            <span className="text-slate-300 font-mono font-bold text-sm sm:text-base mr-1 sm:mr-2">
              {item.num}
            </span>

            {/* Icon */}
            <div
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${item.accent}0d`, borderColor: `${item.accent}33`, color: item.accent }}
            >
              <item.icon size={16} strokeWidth={2.5} />
            </div>

            {/* Label */}
            <h3 className="flex-1 font-bold text-slate-700 text-[11px] sm:text-sm md:text-[15px] uppercase tracking-wide leading-snug group-hover:text-[#0b1c3c] transition-colors">
              {item.label}
            </h3>

            {/* Value */}
            <p
              className="shrink-0 font-black text-base sm:text-lg md:text-xl font-mono tracking-tight text-right"
              style={{ color: item.accent }}
            >
              ${item.value.toFixed(2)}
            </p>
          </div>
        ))}

        {/* Ledger total footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0b1c3c]">
          <span className="text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em]">
            Combined Total
          </span>
          <span className="text-white font-black text-base sm:text-lg md:text-xl font-mono tracking-tight">
            ${totalOfAll.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IncomeSummary;