// // // C:\Users\HP\Desktop\crowdone\backend\utils\sanitizeUser.js

// // module.exports = function sanitizeUser(user) {
// //   if (!user) return null;

// //   return {
// //     userId: user.userId,
// //     name: user.name,
// //     email: user.email,
// //     mobile: user.mobile, 
// //     role: user.role,
// //     sponsorId: user.sponsorId,
    
// //     // 🛡️ WALLET & SECURITY
// //     walletAddress: user.walletAddress || "", 
// //     walletAddressChangeCount: user.walletAddressChangeCount || 0,
// //     walletAddressChangeWindowStart: user.walletAddressChangeWindowStart,
// //     walletAddressHistory: user.walletAddressHistory || [], 
// //     pendingWithdrawals: user.pendingWithdrawals || 0,

// //     // 💰 WALLET BALANCES
// //     walletBalance: user.walletBalance || 0,
// //     usdtBep20Balance: user.usdtBep20Balance || 0, 
// //     directIncome: user.directIncome || 0,
// //     levelIncome: user.levelIncome || 0,
// //     totalLevelIncome: user.totalLevelIncome || 0, 
// //     poolIncome: user.poolIncome || 0,
// //     rewardIncome: user.rewardIncome || 0,
// //     totalWithdrawn: user.totalWithdrawn || 0,

// //     // 🔥 NAYA: STAKING INCOMES YAHAN ADD KI HAIN 🔥
// //     cctStakingIncome: user.cctStakingIncome || 0,
// //     cctStakingDirectIncome: user.cctStakingDirectIncome || 0,
// //     cctStakingLevelIncome: user.cctStakingLevelIncome || 0,

// //     // 🚀 TOPUP & STATUS
// //     isToppedUp: user.isToppedUp,
// //     topUpAmount: user.topUpAmount,
// //     topUpDate: user.topUpDate,
// //     hasTopup: user.hasTopup,
// //     levelStatus: user.levelStatus,
// //     isTelegramJoined: user.isTelegramJoined,

// //     // 👥 TEAM DATA
// //     globalTeamCount: user.globalTeamCount || 0,
// //     directCount: user.directCount || 0,

// //     // 🌊 POOL DATA 
// //     activePools: user.activePools || [] 
// //   };
// // };
// // C:\Users\HP\Desktop\crowdone\backend\utils\sanitizeUser.js

// module.exports = function sanitizeUser(user) {
//   if (!user) return null;

//   return {
//     userId: user.userId,
//     name: user.name,
//     email: user.email,
//     mobile: user.mobile, 
//     role: user.role,
//     sponsorId: user.sponsorId,
    
//     // 🛡️ WALLET & SECURITY
//     walletAddress: user.walletAddress || "", 
//     walletAddressChangeCount: user.walletAddressChangeCount || 0,
//     walletAddressChangeWindowStart: user.walletAddressChangeWindowStart,
//     walletAddressHistory: user.walletAddressHistory || [], 
//     pendingWithdrawals: user.pendingWithdrawals || 0,

//     // 💰 WALLET BALANCES
//     walletBalance: user.walletBalance || 0,
//     usdtBep20Balance: user.usdtBep20Balance || 0, 
//     directIncome: user.directIncome || 0,
//     totalDirectIncome: user.totalDirectIncome || 0, // Dhyan rakhein, Total bhi bheja hai
//     levelIncome: user.levelIncome || 0,
//     totalLevelIncome: user.totalLevelIncome || 0, 
//     poolIncome: user.poolIncome || 0,
//     totalPoolIncome: user.totalPoolIncome || 0, // Total Pool Income
//     rewardIncome: user.rewardIncome || 0,
//     totalWithdrawn: user.totalWithdrawn || 0,

//     // 🔥 NAYA: PROMO ROI INCOMES YAHAN ADD KI HAIN (Dashboard ke liye zaroori) 🔥
//     roiIncome: user.roiIncome || 0,
//     totalRoiIncome: user.totalRoiIncome || 0,
//     matchingRoiIncome: user.matchingRoiIncome || 0,
//     totalMatchingRoiIncome: user.totalMatchingRoiIncome || 0,

//     // 🔥 STAKING INCOMES 
//     cctStakingIncome: user.cctStakingIncome || 0,
//     cctStakingDirectIncome: user.cctStakingDirectIncome || 0,
//     cctStakingLevelIncome: user.cctStakingLevelIncome || 0,

//     // 🚀 TOPUP & STATUS
//     isToppedUp: user.isToppedUp,
//     topUpAmount: user.topUpAmount,
//     topUpDate: user.topUpDate,
//     hasTopup: user.hasTopup,
//     levelStatus: user.levelStatus,
//     isTelegramJoined: user.isTelegramJoined,

//     // 👥 TEAM DATA
//     globalTeamCount: user.globalTeamCount || 0,
//     directCount: user.directCount || 0,

//     // 🌊 POOL DATA 
//     activePools: user.activePools || [] 
//   };
// };

// backend/utils/sanitizeUser.js

module.exports = function sanitizeUser(user) {
  if (!user) return null;

  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    mobile: user.mobile, 
    role: user.role,
    sponsorId: user.sponsorId,
    
    // 🛡️ WALLET & SECURITY
    walletAddress: user.walletAddress || "", 
    walletAddressChangeCount: user.walletAddressChangeCount || 0,
    walletAddressChangeWindowStart: user.walletAddressChangeWindowStart,
    walletAddressHistory: user.walletAddressHistory || [], 
    pendingWithdrawals: user.pendingWithdrawals || 0,

    // 💰 WALLET BALANCES
    walletBalance: user.walletBalance || 0,
    usdtBep20Balance: user.usdtBep20Balance || 0, 
    
    // 💼 WORKING INCOMES
    directIncome: user.directIncome || 0,
    totalDirectIncome: user.totalDirectIncome || 0, 
    levelIncome: user.levelIncome || 0,
    totalLevelIncome: user.totalLevelIncome || 0, 
    rewardIncome: user.rewardIncome || 0,
    
    // 🌊 OLD CROWD DONATION (POOL)
    poolIncome: user.poolIncome || 0,
    totalPoolIncome: user.totalPoolIncome || 0, 
    totalWithdrawn: user.totalWithdrawn || 0,

    // 🔥 NAYA: DAILY TRADE (ROI) & TEAM COMPOUNDING (MATCHING) 🔥
    roiIncome: user.roiIncome || 0,
    totalRoiIncome: user.totalRoiIncome || 0,
    matchingRoiIncome: user.matchingRoiIncome || 0,
    totalMatchingRoiIncome: user.totalMatchingRoiIncome || 0,

    // 🪙 STAKING INCOMES 
    cctStakingIncome: user.cctStakingIncome || 0,
    cctStakingDirectIncome: user.cctStakingDirectIncome || 0,
    cctStakingLevelIncome: user.cctStakingLevelIncome || 0,

    // 🚀 TOPUP & STATUS
    isToppedUp: user.isToppedUp,
    topUpAmount: user.topUpAmount,
    topUpDate: user.topUpDate,
    hasTopup: user.hasTopup,
    levelStatus: user.levelStatus,
    isTelegramJoined: user.isTelegramJoined,
    
    // 🔥 ZAROORI ADDITIONS FOR FRONTEND CALCULATION 🔥
    highestPackage: user.highestPackage || 0,
    purchasedPackages: user.purchasedPackages || [],
    packageStats: user.packageStats || {},

    // 👥 TEAM DATA
    globalTeamCount: user.globalTeamCount || 0,
    directCount: user.directCount || 0,

    // 🌊 POOL DATA 
    activePools: user.activePools || [] 
  };
};