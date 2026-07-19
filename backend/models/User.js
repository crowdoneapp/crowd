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
  // 🔹 REFERRAL & GLOBAL TEAM (50-LEVEL PLAN)
  // ==========================================
  sponsorId: { type: Number, default: null },
  isSponsorDeactivated: { type: Boolean, default: false }, 
  
  // 🔥 Har level open karne ke liye 1 direct chahiye (Max 50)
  directCount: { type: Number, default: 0 },       
  // 🔥 Har level pe 100 global team chahiye (Max 5000 for 50 levels)
  globalTeamCount: { type: Number, default: 0 },   

  // DAILY CAPPING TRACKER
  todayGlobalTeamAdded: { type: Number, default: 0 },
  lastGlobalTeamAddDate: { type: String, default: "" }, // Format: YYYY-MM-DD

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

   walletBalance: { type: Number, default: 0 },    // Main Top-up & Earning Wallet 
  isToppedUp: { type: Boolean, default: false },
  topUpAmount: { type: Number, default: 0 },
  topUpDate: { type: Date },
  
  // 🔥 Highest Package Tracking (Bounce Back aur Upgrades check karne ke liye)
  highestPackage: { type: Number, default: 0 },

  // 📜 Top-up history 
  topUps: [
    {
      plan: { type: String, default: "Global Auto-Pool" },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    }
  ],

  // ✅ PACKAGE SYSTEM 
  packages: [
    {
      plan: { type: String, default: "Global Auto-Pool" },
      amount: { type: Number, required: true },
      startDate: { type: Date, default: Date.now },
      withdrawn: { type: Number, default: 0 },
      isDummy: { type: Boolean, default: false } // Leader bypass track karne ke liye
    }
  ],

  purchasedPackages: { type: [Number], default: [] },
  boosterRewardPaid: { type: Boolean, default: false },

  // ==========================================
  // 💰 ALL INCOMES TRACKING (BASED ON NEW FLYERS)
  // ==========================================
  
  // 01 | Direct Earning
  directIncome: { type: Number, default: 0 },
  totalDirectIncome: { type: Number, default: 0 }, 
  
  // 02 | Crowd Donation Earning (50 Levels - 2x Returns over 90 days)
  poolIncome: { type: Number, default: 0 },       
  totalPoolIncome: { type: Number, default: 0 },  

  // 03 | Level Earning (Downline Team structure)
  levelIncome: { type: Number, default: 0 },
  totalLevelIncome: { type: Number, default: 0 },
  
  // 04 | Get Pass Earning (Fast Track / Acceleration)
  getPassIncome: { type: Number, default: 0 },
  totalGetPassIncome: { type: Number, default: 0 },
  
  // 05 | Upgrade Bounce Back Earning (Roll-up to correct upline)
  upgradeBounceBackIncome: { type: Number, default: 0 },     
  totalUpgradeBounceBackIncome: { type: Number, default: 0 },

  // 🔥 NAYA: Setting Income (For 'setup' [5%] & 'super_setup' [10%] roles)
  settingIncome: { type: Number, default: 0 },
  totalSettingIncome: { type: Number, default: 0 },

  // Legacy variables (kept for backend safety)
  rewardIncome: { type: Number, default: 0 },     
  totalRewardIncome: { type: Number, default: 0 },
  fastTrackIncome: { type: Number, default: 0 },
  totalFastTrackIncome: { type: Number, default: 0 },
  claimedRewards: { type: [Number], default: [] }, 

  // ==========================================
  // 🚀 ACTIVE POOLS TRACKER (DAILY CRON JOB KE LIYE)
  // ==========================================
  activePools: [{
      level: Number,
      dailyAmount: Number,
      totalDays: Number,
      daysPaid: { type: Number, default: 0 },
      lastPaidDate: { type: String, default: "" }, 
      status: { type: String, default: "ACTIVE" },  
      withdrawnAmount: { type: Number, default: 0 } 
  }],

  // ==========================================
  // 🔹 WITHDRAWAL TRACKING
  // ==========================================
  pendingWithdrawals: { type: Number, default: 0 }, 
  totalWithdrawn: { type: Number, default: 0 },     
  
  // ==========================================
  // 🔐 WALLET SECURITY
  // ==========================================
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
  // 🔥 NAYA: 'setup' aur 'super_setup' roles add kiye gaye hain
  role: { 
    type: String, 
    enum: ['user', 'admin', 'promo', 'leader', 'superleader', 'setup', 'super_setup'], 
    default: 'user' 
  },
  isBlocked: { type: Boolean, default: false },

}, { timestamps: true });

// Indexes for fast querying
userSchema.index({ sponsorId: 1 });
userSchema.index({ ipAddress: 1 }); 
userSchema.index({ deviceId: 1 });  
userSchema.index({ createdAt: -1 }); 
userSchema.index({ "activePools.status": 1 }); 

module.exports = mongoose.model('User', userSchema);