 

import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios"; 
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../../context/AuthContext";

// Components Imports
import IncomeSummary from "../../components/dashboard/IncomeSummary";
import ReferralLink from "../../components/dashboard/ReferralLink";
import WalletBalance from "../../components/dashboard/WalletBalance";
import DailyROIPlan from "../../components/dashboard/DailyROI";
import SpinnerOverlay from "../../components/common/SpinnerOverlay";
import SuccessModal from "../../components/modals/SuccessModal";
import TelegramPopup from "../../components/TelegramPopup";

// 🔥 QUICK ACTIONS IMPORT (Path check kar lena agar alag folder me ho toh)
import QuickActions from "../../components/dashboard/QuickActions"; 

const Dashboard = ({ setModalState }) => {
  const { user, token, setUser, logout } = useAuth();
  const navigate = useNavigate(); 

  const [walletRefreshKey, setWalletRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [totalRealUsers, setTotalRealUsers] = useState(0);
  const [globalFakeCount, setGlobalFakeCount] = useState(0);
  const [activeDownlineCount, setActiveDownlineCount] = useState(0);
  
  const [income, setIncome] = useState({
    directIncome: 0,
    levelIncome: 0,
    dailyIncome: 0,
    spinIncome: 0,
    availableSpins: 0,
  });

  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    userId: "",
    amount: 0,
  });

  // 🔥 WALLET POPUP STATE
  const [showWallet, setShowWallet] = useState(false);
  const [showStakingPopup, setShowStakingPopup] = useState(true);
  const hasFetched = useRef(false);

  const fetchUserData = async () => {
    if (!token || !user?.userId) return;

    // 🔥 SPEED UP FIX: LOCAL STORAGE CACHE CHECK 🔥
    const cacheKey = `dash_cache_${user.userId}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            setTotalRealUsers(parsedData.totalRealUsers || 0);
            setGlobalFakeCount(parsedData.globalFakeCount || 0);
            setActiveDownlineCount(parsedData.activeDownlineCount || 0);
            setIncome(parsedData.income || income);
            // Agar Cache mil gaya, toh loading spinner on nahi karenge, seedha UI dikhayenge!
        } catch (error) {
            console.error("Cache parse error", error);
        }
    } else {
        // Agar pehli baar load ho raha hai (koi cache nahi), tabhi spinner dikhao
        setLoading(true);
    }

    try {
        // 🔥 1. MAIN DATA (Background me fetch hoga agar UI load ho chuka hai)
        const [userRes, incomeRes] = await Promise.all([
            api.get(`/user/${user.userId}?t=${new Date().getTime()}`, { headers: { Authorization: `Bearer ${token}` } }),
            api.get(`/wallet/${user.userId}?t=${new Date().getTime()}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setUser(userRes.data.user); 
        setTotalRealUsers(userRes.data.totalRealUsers || 0);
        setGlobalFakeCount(userRes.data.globalFakeCount || 0);
        setActiveDownlineCount(incomeRes.data.activeDownlineCount || 0);

        const newIncome = {
          directIncome: incomeRes.data.directIncome || 0,
          levelIncome: incomeRes.data.levelIncome || 0,
          dailyIncome: incomeRes.data.planIncome || 0,
          spinIncome: incomeRes.data.spinIncome || 0,
          rewardIncome: incomeRes.data.rewardIncome || 0,
          totalDirectIncome: incomeRes.data.income?.totalDirectIncome || 0,
          totalLevelIncome: incomeRes.data.income?.totalLevelIncome || 0,
          totalRewardIncome: incomeRes.data.income?.totalRewardIncome || 0,
          totalSpinIncome: incomeRes.data.income?.totalSpinIncome || 0,
          fastTrackIncome: incomeRes.data.fastTrackIncome || incomeRes.data.income?.fastTrackIncome || 0,
          totalFastTrackIncome: incomeRes.data.totalFastTrackIncome || incomeRes.data.income?.totalFastTrackIncome || 0,
        };
        
        setIncome(newIncome);

        // 🔥 SAVE FRESH DATA TO CACHE FOR NEXT VISIT 🔥
        localStorage.setItem(cacheKey, JSON.stringify({
            totalRealUsers: userRes.data.totalRealUsers || 0,
            globalFakeCount: userRes.data.globalFakeCount || 0,
            activeDownlineCount: incomeRes.data.activeDownlineCount || 0,
            income: newIncome
        }));

    } catch (err) {
        console.error("Failed to fetch user data:", err);
        if (err?.response?.status === 401) logout();
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
        hasFetched.current = false;
    }
  }, [user?.userId]);

  useEffect(() => {
    if (!hasFetched.current && token && user?.userId) {
      hasFetched.current = true;
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, token]); 

  // 🔥 DIRECT WALLET POPUP LOGIC
  useEffect(() => {
    if (user && user.userId) {
      const hasWallet = user.walletAddress && user.walletAddress.trim() !== "";
      
      if (!hasWallet) {
        const timer = setTimeout(() => {
          setShowWallet(true);
        }, 800); 

        return () => clearTimeout(timer);
      }
    }
  }, [user?.userId, user?.walletAddress]); 

  const handleCloseWallet = () => {
    setShowWallet(false);
  };

  const handleTopUpSuccess = async (amount = 0, userId = "") => {
    await fetchUserData();
    setWalletRefreshKey((prev) => prev + 1);
    if (amount > 0) {
      setSuccessModal({ isOpen: true, userId, amount });
    }
  };

  const claimDailyROI = async (dayIndex) => {
    try {
      setLoading(true);
      await api.put(
        `/user/claim-daily/${user.userId}`,
        { dayIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await handleTopUpSuccess();
    } catch (err) {
      console.error("Failed to claim Daily ROI:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !token) return <SpinnerOverlay />;

  const referralLink = `${window.location.origin}/register?ref=${user.userId}`;

  return (
    <div className="w-full relative animate-fadeIn pb-28 md:pb-8 bg-[#f8fafc] min-h-screen selection:bg-blue-500/20 selection:text-blue-900">
      
      {loading && <SpinnerOverlay />}

      <div className="space-y-6 md:space-y-8 relative z-10 px-0 sm:px-4 md:px-0 pt-2">
        
      
        
        <section>
          <WalletBalance userId={user.userId} refreshKey={walletRefreshKey} income={income} />
        </section>

         <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] border border-slate-100">
            <ReferralLink link={referralLink} />
        </div>

        {/* 🔥 YAHAN QUICK ACTIONS ADD KIYA HAI - Income Summary ke theek upar 🔥 */}
        <section className="mb-2 md:mb-4">
            <QuickActions 
               onDepositClick={() => setModalState && setModalState('deposit')}
               onTopUpClick={() => setModalState && setModalState('topup')}
               onWalletTransferClick={() => setModalState && setModalState('transfer')}
               onWithdrawClick={() => setModalState && setModalState('withdraw')}
            />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 1. Income Summary Box */}
            <div className="bg-white p-2 rounded-[20px] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] border border-slate-100">
                <IncomeSummary income={income} user={user} />
            </div>
        </div>

        <section className="bg-white rounded-[20px] overflow-hidden shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] border border-slate-100">
            <DailyROIPlan dailyROI={user.dailyROI || []} onClaim={claimDailyROI} />
        </section>
        
      </div>

      <SuccessModal
        isOpen={successModal.isOpen}
        userId={successModal.userId}
        amount={successModal.amount}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {!loading && user && <TelegramPopup currentUser={user} />}
      
    </div>
  );
};

export default Dashboard;