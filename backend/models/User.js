const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ==========================================
  // 🔹 IDENTITY
  // ==========================================
  userId: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },

  // ==========================================
  // 🔹 AUTHENTICATION
  // ==========================================
  password: { type: String, required: true },
  transactionPassword: { type: String, required: true },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },

  // ==========================================
  // 🔹 REFERRAL & GLOBAL TEAM (LEGACY)
  // ==========================================
  sponsorId: { type: Number, default: null },
  isSponsorDeactivated: { type: Boolean, default: false }, 
  directCount: { type: Number, default: 0 },       
  globalTeamCount: { type: Number, default: 0 },   

  // ==========================================
  // 🔥 NAYA: HAR PACKAGE KE LIYE ALAG TEAM TRACKING
  // ==========================================
  packageStats: {
    "30": { directCount: { type: Number, default: 0 }, globalTeamCount: { type: Number, default: 0 } },
    "100": { directCount: { type: Number, default: 0 }, globalTeamCount: { type: Number, default: 0 } },
    "300": { directCount: { type: Number, default: 0 }, globalTeamCount: { type: Number, default: 0 } },
    "500": { directCount: { type: Number, default: 0 }, globalTeamCount: { type: Number, default: 0 } },
    "1000": { directCount: { type: Number, default: 0 }, globalTeamCount: { type: Number, default: 0 } }
  },

  // DAILY CAPPING TRACKER
  todayGlobalTeamAdded: { type: Number, default: 0 },
  lastGlobalTeamAddDate: { type: String, default: "" },

  // ==========================================
  // 🔹 SECURITY & TRACKING
  // ==========================================
  deviceId: { type: String, default: null },
  telegramId: { type: String, default: null },
  isTelegramJoined: { type: Boolean, default: false },
  ipAddress: { type: String }, 
  depositAddress: { type: String, unique: true, sparse: true },

  // ==========================================
  // 🔹 WALLET & TOP-UP (MAIN BALANCES)
  // ==========================================
  walletBalance: { type: Number, default: 0 }, 
  isToppedUp: { type: Boolean, default: false },
  topUpAmount: { type: Number, default: 0 },
  topUpDate: { type: Date },
  highestPackage: { type: Number, default: 0 },

  // 📜 Top-up history & Packages
  topUps: [
    {
      plan: { type: String, default: "Global Auto-Pool" },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  packages: [
    {
      plan: { type: String, default: "Global Auto-Pool" },
      amount: { type: Number, required: true },
      startDate: { type: Date, default: Date.now },
      withdrawn: { type: Number, default: 0 },
      isDummy: { type: Boolean, default: false }
    }
  ],
  purchasedPackages: { type: [Number], default: [] },
  boosterRewardPaid: { type: Boolean, default: false },

  // ==========================================
  // 💰 ALL INCOMES TRACKING
  // ==========================================
  directIncome: { type: Number, default: 0 },
  totalDirectIncome: { type: Number, default: 0 }, 
  poolIncome: { type: Number, default: 0 },       
  totalPoolIncome: { type: Number, default: 0 },  
  levelIncome: { type: Number, default: 0 },
  totalLevelIncome: { type: Number, default: 0 },
  getPassIncome: { type: Number, default: 0 },
  totalGetPassIncome: { type: Number, default: 0 },
  upgradeBounceBackIncome: { type: Number, default: 0 },     
  totalUpgradeBounceBackIncome: { type: Number, default: 0 },
  settingIncome: { type: Number, default: 0 },
  totalSettingIncome: { type: Number, default: 0 },

  rewardIncome: { type: Number, default: 0 },     
  totalRewardIncome: { type: Number, default: 0 },
  fastTrackIncome: { type: Number, default: 0 },
  totalFastTrackIncome: { type: Number, default: 0 },
  claimedRewards: { type: [Number], default: [] }, 

  // ==========================================
  // 🚀 ACTIVE POOLS TRACKER
  // ==========================================
 
  activePools: [{
      packageAmount: Number, // <--- 👈 Ye add karna hai
      level: Number,
      dailyAmount: Number,
      totalDays: Number,
      daysPaid: { type: Number, default: 0 },
      lastPaidDate: { type: String, default: "" }, 
      status: { type: String, default: "ACTIVE" },  
      withdrawnAmount: { type: Number, default: 0 } 
  }],

  // ==========================================
  // 🔹 WITHDRAWAL & WALLET SECURITY
  // ==========================================
  pendingWithdrawals: { type: Number, default: 0 }, 
  totalWithdrawn: { type: Number, default: 0 },     
  walletAddress: { type: String, default: '' },
  walletAddressChangeCount: { type: Number, default: 0 },
  walletAddressChangeWindowStart: { type: Date, default: null },
  walletAddressUpdatedAt: { type: Date },
  walletAddressHistory: [
  {
    address: { type: String },
    addedAt: { type: Date }, 
    changedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: "User" } 
  }
  ],
  otpRequestCount: { type: Number, default: 0 },
  lastOtpRequestDate: { type: Date },
  passwordResetCount: { type: Number, default: 0 },
  lastPasswordResetDate: { type: Date },
  editProfileOtp: { type: String },
  editProfileOtpExpiry: { type: Date },
  profileEditAccessExpiry: { type: Date },
  
  // ==========================================
  // 🔹 ROLE & STATUS
  // ==========================================
  role: { 
    type: String, 
    enum: ['user', 'admin', 'promo', 'leader', 'superleader', 'setup', 'super_setup'], 
    default: 'user' 
  },
  isBlocked: { type: Boolean, default: false },

}, { timestamps: true });

userSchema.index({ sponsorId: 1 });
userSchema.index({ ipAddress: 1 }); 
userSchema.index({ deviceId: 1 });  
userSchema.index({ createdAt: -1 }); 
userSchema.index({ "activePools.status": 1 }); 

module.exports = mongoose.model('User', userSchema);