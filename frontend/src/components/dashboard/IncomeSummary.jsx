import React, { useEffect, useState } from "react";
import { 
  UserPlus, Globe, Network, Ticket, RefreshCw 
} from "lucide-react";

// ✅ Global Pool Config for "Crowd Donation Earning" Calculation
const globalPoolConfig = {
  levels: [
    { level: 1, globalTeam: 20, earning: 10 },
    { level: 2, globalTeam: 40, earning: 20 },
    { level: 3, globalTeam: 100, earning: 40 },
    { level: 4, globalTeam: 200, earning: 80 },
    { level: 5, globalTeam: 400, earning: 150 },
    { level: 6, globalTeam: 1600, earning: 200 },
    { level: 7, globalTeam: 2000, earning: 500 },
    { level: 8, globalTeam: 3000, earning: 700 },
    { level: 9, globalTeam: 4000, earning: 1000 },
    { level: 10, globalTeam: 5000, earning: 1500 },
    { level: 11, globalTeam: 7500, earning: 3000 },
    { level: 12, globalTeam: 10000, earning: 5000 }
  ]
};

const IncomeSummary = ({ income = {}, user = {} }) => {
  const [globalGrowthIncome, setGlobalGrowthIncome] = useState(0); 

  // 1. Direct Earning
  const directIncome = Number(income.totalDirectIncome) || Number(income.directIncome) || 0;
  
  // 3. Level Earning
  const levelIncome = Number(income.totalLevelIncome) || Number(income.levelIncome) || 0;
  
  // 4. Get Pass Earning (Mapped from fast track or actual getPass variable)
  const getPassIncome = Number(income.getPassIncome) || Number(income.totalFastTrackIncome) || Number(income.fastTrackIncome) || 0;
  
  // 5. Upgrade Bounce Back Earning (Mapped from reward or actual bounce back variable)
  const upgradeBounceBackIncome = Number(income.upgradeBounceBackIncome) || Number(income.totalRewardIncome) || Number(income.rewardIncome) || Number(user.rewardIncome) || 0;

  // 2. Crowd Donation Earning (Calculated)
  useEffect(() => {
    if (!user) return;
    
    const realGlobalTeamCount = Number(user?.globalTeamCount) || 0;
    let totalFrontendAchieved = 0;
    let cumulative = 0;

    globalPoolConfig.levels.forEach((lvl) => {
      cumulative += lvl.globalTeam; 
      if (realGlobalTeamCount >= cumulative) {
        totalFrontendAchieved += lvl.earning;
      }
    });
    
    setGlobalGrowthIncome(totalFrontendAchieved);
  }, [user]);

  // 🔥 STATEMENT LEDGER THEME — one entry per row, ruled like a passbook
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
        

            {/* Icon */}
            <div
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border"
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