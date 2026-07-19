import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { TrendingUp } from "lucide-react";

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

const WalletBalance = ({ income = {} }) => {
  const { user } = useAuth();
  const [globalGrowthIncome, setGlobalGrowthIncome] = useState(0);

  // 1. Regular Incomes Fetching
  const directIncome = Number(income.totalDirectIncome) || Number(income.directIncome) || 0;
  const levelIncome = Number(income.totalLevelIncome) || Number(income.levelIncome) || 0;
  const rewardIncome = Number(income.totalRewardIncome) || Number(income.rewardIncome) || Number(user?.rewardIncome) || 0;
  const fastTrackIncome = Number(income.totalFastTrackIncome) || Number(income.fastTrackIncome) || Number(user?.totalFastTrackIncome) || 0;

  // 2. Staking Incomes 
  const cctStakingIncome = Number(income.cctStakingIncome) || Number(user?.cctStakingIncome) || 0;
  const cctStakingDirectIncome = Number(income.cctStakingDirectIncome) || Number(user?.cctStakingDirectIncome) || 0;
  const cctStakingLevelIncome = Number(income.cctStakingLevelIncome) || Number(user?.cctStakingLevelIncome) || 0;

  // 3.  Crowd Donation Earning (Global Growth) CALCULATION
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

  // 4. UPDATED TOTAL EARNING
  const totalEarning =
    directIncome +
    levelIncome +
    rewardIncome +
    globalGrowthIncome +
    fastTrackIncome +
    cctStakingIncome +
    cctStakingDirectIncome +
    cctStakingLevelIncome;

  const format = (val) => `$${(Math.floor(Number(val || 0) * 100) / 100).toFixed(2)}`;

  return (
    <div className="w-full mb-6">

      {/* TOTAL EARNING — Blue theme (only box) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b3a82] via-[#1450a8] to-[#1d63c9] p-5 sm:p-7 rounded-[20px] sm:rounded-[24px] shadow-[0_10px_30px_-10px_rgba(15,60,140,0.45)] hover:shadow-[0_14px_40px_-10px_rgba(15,60,140,0.55)] transition-all duration-300 group flex flex-col justify-center min-h-[130px] sm:min-h-[150px]">
        {/* Ambient glow */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-300/30 rounded-full blur-[35px] group-hover:bg-sky-200/40 transition-colors duration-500 pointer-events-none"></div>
        <div className="absolute -left-6 -bottom-8 w-28 h-28 bg-blue-400/20 rounded-full blur-[30px] pointer-events-none"></div>

        <div className="relative z-10">
          <p className="text-sky-200 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-sky-200" />
            Total Earning
          </p>
          <h2 className="text-[28px] sm:text-3xl md:text-[42px] font-black text-white tracking-tight leading-none drop-shadow-sm font-mono">
            {format(totalEarning)}
          </h2>
          <p className="text-sky-200/70 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mt-2 sm:mt-3">
            Lifetime combined income
          </p>
        </div>
      </div>

    </div>
  );
};

export default WalletBalance;