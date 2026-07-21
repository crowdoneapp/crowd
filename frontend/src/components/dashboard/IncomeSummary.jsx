import React, { useEffect, useState } from "react";
import { 
  UserPlus, Globe, Network, Ticket, RefreshCw 
} from "lucide-react";

// 🔥 PACKAGES AUR LEVELS CONFIG 
const PACKAGES = [30, 100, 300, 500, 1000];
const TOTAL_LEVELS = 50;

const IncomeSummary = ({ income = {}, user = {} }) => {
  const [globalGrowthIncome, setGlobalGrowthIncome] = useState(0); 

  // 1. Direct Earning
  const directIncome = Number(income.totalDirectIncome) || Number(income.directIncome) || 0;
  
  // 3. Level Earning
  const levelIncome = Number(income.totalLevelIncome) || Number(income.levelIncome) || 0;
  
  // 4. Get Pass Earning 
  const getPassIncome = Number(income.getPassIncome) || Number(income.totalFastTrackIncome) || Number(income.fastTrackIncome) || 0;
  
  // 5. Upgrade Bounce Back Earning 
  const upgradeBounceBackIncome = Number(income.upgradeBounceBackIncome) || Number(income.totalRewardIncome) || Number(income.rewardIncome) || Number(user.rewardIncome) || 0;

  // 🔥 2. Crowd Donation Earning (TOTAL POTENTIAL LOGIC - ONLY DEPENDS ON TEAM CROWD NOW)
  useEffect(() => {
    if (!user) return;
    
    let totalFrontendAchieved = 0;

    const purchased = user.purchasedPackages || [];
    const highestPkg = user.highestPackage || user.topUpAmount || 0;
    
    // Sirf un packages ko check karo jo active hain
    const activePkgs = PACKAGES.filter(p => purchased.includes(p) || highestPkg >= p);

    activePkgs.forEach(pkg => {
        // Har package ki apni crowd nikalo
        const currentPackageYourCrowd = user?.packageStats?.[String(pkg)]?.globalTeamCount || user?.globalTeamCount || 0;

        // 50 Levels ka check
        for (let i = 1; i <= TOTAL_LEVELS; i++) {
            const unlockTeamReq = i * 100; // Level 1 = 100, Level 2 = 200

            // 🔥 UPDATE: Direct wali condition hata di gayi hai. Ab sirf "Your Crowd" check hoga.
            if (currentPackageYourCrowd >= unlockTeamReq) {
                // Agar Your Crowd ne requirement meet kar li, toh earning add kar do
                totalFrontendAchieved += (pkg * 2);
            }
        }
    });
    
    // Final total set kar diya (Example: 60 + 60 = $120)
    setGlobalGrowthIncome(totalFrontendAchieved);
    
  }, [user]);

  // 🔥 STATEMENT LEDGER THEME 
  const earningsList = [
    { num: "01", label: "Direct Earning", value: directIncome, icon: UserPlus, accent: "#2563eb" },
    { num: "02", label: "Crowd Donation Earning", value: globalGrowthIncome, icon: Globe, accent: "#7c3aed" },
    { num: "03", label: "Level Earning", value: levelIncome, icon: Network, accent: "#c026d3" },
    { num: "04", label: "Get Pass Earning", value: getPassIncome, icon: Ticket, accent: "#0891b2" },
    { num: "05", label: "Upgrade Bounce Back Earning", value: upgradeBounceBackIncome, icon: RefreshCw, accent: "#059669" }
  ];

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
        <p className="text-slate-300 text-[10px] sm:text-xs font-mono font-bold hidden sm:block">
          5 categories
        </p>
      </div>

      {/* Single-column ledger: one row = one box, ruled edges */}
      <div className="bg-white rounded-[18px] border border-slate-100 shadow-[0_4px_24px_-12px_rgba(15,27,51,0.08)] overflow-hidden divide-y divide-slate-100">
        {earningsList.map((item, index) => (
          <div
            key={index}
            className="relative flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 group hover:bg-slate-50/60 transition-colors duration-300"
          >
            {/* Accent rail — the row's own color, left edge */}
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