const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); // 🔥 Naya OTP ke liye

// Models
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Setting = require('../models/Setting');
const TopUp = require('../models/TopUp'); 
const DummyTransaction = require('../models/DummyTransaction');
const DummyUser = require('../models/DummyUser.js'); 
const FastTrack = require('../models/FastTrack');
const FakeUser = require('../models/FakeUser');

// Middleware & Utils
const authMiddleware = require('../middleware/authMiddleware');
const checkFeature = require("../middleware/checkFeatureEnabled");
const { bot } = require('../utils/telegramBot');

// ==========================================
// 🔥 SMTP Transporter Setup (OTP ke liye)
// ==========================================
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 👇 ISKE NICHE AAPKE SAARE ROUTES (API) AAYENGE 👇
// Controllers
// Controllers ko import kiya
const {
  getUserById,
  blockUser,
  unblockUser,
  getAllUsers,
  getSponsorName // 👈 Ye add kiya hai naye logic ke liye
} = require('../controllers/userController');

// ==========================================
// 🚀 ROUTES DEFINITION
// ==========================================


// =========================================================================
// 🔥 NEW SMART CAPPING ENGINE FOR REAL TOPUPS (SYNCED WITH CRON)
// =========================================================================
 








// 📋 Get all users (Admin ke liye)
router.get('/all', getAllUsers);

// 👤 Get Sponsor Name (Register page par verification ke liye)
router.get('/sponsor/:id', getSponsorName);

// 🔒 Block user (Admin)
router.put('/block/:id', blockUser);

// 🔓 Unblock user (Admin)
router.put('/unblock/:id', unblockUser);

 
// 🔍 Get User By ID (Dashboard data, real + fake count yahan se jayega)
// ⚠️ ISE SABSE NEECHE HI RAKHNA HAI
router.get('/:userId', authMiddleware, getUserById); // Ye to sabse pehle hona chahiye
// 
// // ---------------------------
// Helper: Check if target is in downline
const isUserInDownline = async (rootUserId, targetUserId) => {
  const visited = new Set();
  const queue = [rootUserId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const downlines = await User.find({ sponsorId: current }).select('userId');
    for (const user of downlines) {
      if (user.userId === targetUserId) return true;
      queue.push(user.userId);
    }
  }

  return false;
};

// ---------------------------
// Referral Tree
router.get('/tree/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const referrals = await User.find({ sponsorId: userId });

    const tree = {
      userId: user.userId,
      name: user.name,
      children: referrals.map(r => ({ userId: r.userId, name: r.name, children: [] }))
    };

    res.json(tree);
  } catch (err) {
    console.error('Error generating tree:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/// Helper Function: Pure Team Count nikalne ke liye (Recursive)
// Isko route ke bahar ya andar define kar sakte hain
const getDownlineCount = async (sponsorId) => {
  const referrals = await User.find({ sponsorId: Number(sponsorId) });
  let count = referrals.length;
  for (const r of referrals) {
    count += await getDownlineCount(r.userId);
  }
  return count;
};







// Apni backend user routes wali file mein (e.g., routes/user.js)
const SystemSettings = require('../models/SystemSettings'); // Path check kar lena

// routes/user.js

// 1. Static route ko upar rakhein (Isko pehle check karega)
router.get('/system-settings', async (req, res) => {
    try {
        const SystemSettings = require('../models/SystemSettings');
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({
                depositEnabled: true, topupEnabled: true, 
                transferEnabled: true, withdrawEnabled: true, toWalletEnabled: true
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings" });
    }
});

// 2. Dynamic route ko neeche rakhein
// Express yahan tabhi aayega agar path 'system-settings' nahi hoga
router.get('/:userId', getUserById); 











 
// 3. Update Profile & Wallet (SECURED)
// Bina auth token ke ab update nahi hoga
router.put('/update-profile-secure', authMiddleware, async (req, res) => {
    try {
        const { name, mobile, email, newWalletAddress, password } = req.body;
        const user = await User.findOne({ userId: req.user.userId }); // 🔥 Secure

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // 🔥 Password verify (plain text compare)
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required to update profile." });
        }

        if (password !== user.password) {
            return res.status(401).json({ success: false, message: "Incorrect password." });
        }

        // 🔥 Email Change Logic
        if (email && email.trim() !== '' && email !== user.email) {
            const emailExists = await User.findOne({ email: email.trim() });
            if (emailExists) {
                return res.status(400).json({ success: false, message: "This email is already used by another account." });
            }
            user.email = email.trim(); 
        }

        // Basic Profile Update
        user.name = name || user.name;
        user.mobile = mobile || user.mobile;

        // 🔥 Safe checks ke saath Wallet Logic
        const currentWallet = user.walletAddress || ""; 
        const newWallet = newWalletAddress ? newWalletAddress.trim() : "";

        if (newWallet !== "" && newWallet !== currentWallet) {
            const currentCount = user.walletAddressChangeCount || 0;
            if (currentCount >= 3) {
                return res.status(400).json({ success: false, message: "Wallet address change limit (3 times) exceeded." });
            }

           if (currentWallet !== '') {
                if (!user.walletAddressHistory) {
                    user.walletAddressHistory = [];
                }
                user.walletAddressHistory.push({ 
                    address: currentWallet, 
                    changedAt: new Date(),
                    updatedBy: "User"
                });
            }

            user.walletAddress = newWallet;
            user.walletAddressChangeCount = currentCount + 1; 
            
            if (user.walletAddressChangeCount === 1) {
                user.walletAddressChangeWindowStart = new Date();
            }
        }

        await user.save();

        res.json({ success: true, message: "Profile updated successfully!", user });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ success: false, message: "Profile update failed. Check backend console." });
    }
});
  // ---------------------------
// 1. UPDATED: Direct Team Route
// ---------------------------
// ---------------------------
// 1. UPDATED (SUPER FAST): Direct Team Route
// ---------------------------
router.get('/direct-team/:userId', async (req, res) => {
  try {
    const currentUserId = Number(req.params.userId);

    // 🔥 1. Ek hi baar me saare users RAM mein load karenge (Superfast Breakaway ke liye)
    const allUsers = await User.find({}, 'userId sponsorId name mobile country topUpAmount createdAt role').lean();

    // 👑 🔥 NAYA FIX: CURRENT USER KA ROLE CHECK KARO (Super Leader Bypass ke liye)
    const currentUserData = allUsers.find(u => u.userId === currentUserId);
    const isSuperLeader = currentUserData && currentUserData.role === 'superleader';

    // 2. RAM mein Network Tree (Map) banayenge
    const directMap = new Map();
    const userDetailsMap = new Map();

    for (let u of allUsers) {
        userDetailsMap.set(u.userId, u);
        if (u.sponsorId) {
            if (!directMap.has(u.sponsorId)) {
                directMap.set(u.sponsorId, []);
            }
            directMap.get(u.sponsorId).push(u);
        }
    }

    // 🔥 3. MAIN USER KI TOTAL TEAM NIKALNA (With Breakaway Rule) 🔥
    let mainUserTotalTeam = 0;
    let mainQueue = [...(directMap.get(currentUserId) || [])];

    while (mainQueue.length > 0) {
        const currentNode = mainQueue.shift();
        mainUserTotalTeam++; // Ek user count ho gaya

        // 🛑 ABSOLUTE BREAKAWAY WALL (WITH SUPER LEADER BYPASS) 🛑
        // Agar banda 'leader' hai aur check karne wala 'superleader' NAHI hai, tabhi roko.
        if (currentNode.role === 'leader' && !isSuperLeader) {
            continue; 
        }

        // Agar leader nahi hai ya Super Leader bypass hai, toh iski team aage queue mein add karo
        const children = directMap.get(currentNode.userId) || [];
        for (let child of children) {
            mainQueue.push(child);
        }
    }

    // 🔥 4. TABLE KE LIYE DIRECTS KA DATA BANANA 🔥
    const myDirects = directMap.get(currentUserId) || [];
    
    const teamWithStats = myDirects.map((direct, index) => {
        const membersDirects = directMap.get(direct.userId) || [];
        const directCount = membersDirects.length;

        let teamSize = 0;

        // 🛑 Agar Direct member Leader hai aur user normal hai, toh uski team 0 bhejenge
        if (direct.role === 'leader' && !isSuperLeader) {
            teamSize = 0; 
        } else {
            // Agar bypass allowed hai, toh uski team size calculate karenge
            let subQueue = [...membersDirects];
            while (subQueue.length > 0) {
                const subNode = subQueue.shift();
                teamSize++;

                // 🛑 Is sub-team ke andar bhi Breakaway check karenge (WITH BYPASS)
                if (subNode.role === 'leader' && !isSuperLeader) {
                    continue; 
                }
                const subChildren = directMap.get(subNode.userId) || [];
                for (let child of subChildren) {
                    subQueue.push(child);
                }
            }
        }

        return {
            srNo: index + 1,
            userId: direct.userId,
            name: direct.name,
            mobile: direct.mobile,
            country: direct.country,
            role: direct.role, 
            topUpAmount: direct.topUpAmount,
            createdAt: direct.createdAt,
            totalDirects: directCount,
            totalTeam: teamSize,
            // 🔥 NAYA FIX: Frontend ko same naam se data bhejo jo database mein hai
            globalTeamCount: teamSize, 
            directCount: directCount
        };
    });

    // Naye directs sabse upar dikhane ke liye sort (Descending order of date)
    teamWithStats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Response Bhejenge
    res.json({
      team: teamWithStats,      
      totalTeam: mainUserTotalTeam 
    });

  } catch (err) {
    console.error("Error in direct-team API:", err);
    res.status(500).json({ message: 'Server error' });
  }
});
 

router.get('/all-team/:userId', async (req, res) => {
  try {
    const currentUserId = Number(req.params.userId);

    // 🔥 1. Ek hi baar me saare users RAM mein load karenge (Superfast + Role Checking)
    const allUsers = await User.find({}, '_id userId sponsorId name country topUpAmount createdAt role').lean();

    // 🔥 CURRENT USER KA ROLE CHECK KARO (Check if he is a Super Leader)
    const currentUserData = allUsers.find(u => u.userId === currentUserId);
    const isSuperLeader = currentUserData && currentUserData.role === 'superleader';

    // 2. RAM mein Network Tree banayenge
    const directMap = new Map();
    for (let u of allUsers) {
        if (u.sponsorId) {
            if (!directMap.has(u.sponsorId)) {
                directMap.set(u.sponsorId, []);
            }
            directMap.get(u.sponsorId).push(u);
        }
    }

    // 3. Traversal with SECRET BREAKAWAY
    let allTeam = [];
    let queue = [];
    
    // Stats maintain karne ke variables (Aapke purane code ke hisaab se)
    let directCount = 0;
    const levelWiseCount = {};

    // Pehle apne direct (Level 1) walo ko queue mein daalo
    const directs = directMap.get(currentUserId) || [];
    for (let d of directs) {
        queue.push({ user: d, level: 1 });
    }

    // Ab poora network traverse karenge
    while (queue.length > 0) {
        const { user, level } = queue.shift();

        // Stats update karo
        if (level === 1) directCount++;
        levelWiseCount[level] = (levelWiseCount[level] || 0) + 1;

        // User ko All Team list mein add kar do
        allTeam.push({
            srNo: allTeam.length + 1,
            _id: user._id,
            userId: user.userId,
            name: user.name,
            country: user.country,
            topUpAmount: user.topUpAmount || 0,
            createdAt: user.createdAt,
            level: level
            // Role ko hum response mein bhej hi nahi rahe, taaki frontend par kisi ko doubt na ho!
        });

        // 🛑 SECRET BREAKAWAY WALL (WITH SUPER LEADER BYPASS) 🛑
        // Agar ye current banda 'leader' hai, aur jo dekh raha hai wo 'superleader' NAHI hai, toh aage mat badho.
        if (user.role === 'leader' && !isSuperLeader) {
            continue; 
        }

        // Agar leader nahi hai (ya phir dekhne wala superleader hai), toh uske direct logo ko queue mein dalo
        const children = directMap.get(user.userId) || [];
        for (let child of children) {
            queue.push({ user: child, level: level + 1 });
        }
    }

    // 4. Response exactly aapke purane format me bhej rahe hain
    res.json({
      team: allTeam,
      totalTeamCount: allTeam.length,
      directCount: directCount,
      indirectCount: allTeam.length - directCount,
      levelWiseCount: levelWiseCount
    });

  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ========================================================
// 🚀 PROMOTE DIRECT TO SETUP (Only for 'super_setup' Role)
// ========================================================
router.put('/promote-to-setup/:targetUserId', authMiddleware, async (req, res) => {
    try {
        // 1. Check if current user is super_setup
        const currentUser = await User.findOne({ userId: req.user.userId });
        if (!currentUser || currentUser.role !== 'super_setup') {
            return res.status(403).json({ success: false, message: "Access Denied. Only Super Setup accounts can perform this action." });
        }

        const targetUserId = Number(req.params.targetUserId);
        const targetUser = await User.findOne({ userId: targetUserId });

        if (!targetUser) {
            return res.status(404).json({ success: false, message: "Target user not found." });
        }

        // 2. Must be a direct referral
        if (targetUser.sponsorId !== currentUser.userId) {
            return res.status(400).json({ success: false, message: "You can only promote your DIRECT referrals." });
        }

        // 3. Prevent Double Promotion (Undo nahi ho sakta)
        if (targetUser.role === 'setup') {
            return res.status(400).json({ success: false, message: "This user is already a Setup account." });
        }

        // 4. Check 100 Limit
        const setupCount = await User.countDocuments({ sponsorId: currentUser.userId, role: 'setup' });
        if (setupCount >= 100) {
            return res.status(400).json({ success: false, message: "Limit Reached! You can only promote a maximum of 100 direct referrals to Setup." });
        }

        // 5. Promote & Give $30 Bonus
        targetUser.role = 'setup';
        targetUser.walletBalance = (targetUser.walletBalance || 0) + 30; // $30 Wallet Bonus
        await targetUser.save();

        // 6. Transaction Record for the $30
        const Transaction = require('../models/Transaction');
        await Transaction.create({
            userId: targetUser.userId,
            type: 'credit_to_wallet',
            source: 'setup_promotion_bonus',
            amount: 30,
            description: 'Setup Promotion Bonus (From Super Setup)',
            status: 'success',
            date: new Date()
        });

        res.json({ success: true, message: `Successfully promoted ${targetUser.name} to Setup. $30 has been credited to their wallet!` });
    } catch (error) {
        console.error("Promote to setup error:", error);
        res.status(500).json({ success: false, message: "Server error during promotion process." });
    }
});




// ---------------------------
// Wallet History
router.get('/wallet-history/:userId', async (req, res) => {
  try {
    const txs = await Transaction.find({
      userId: Number(req.params.userId),
      type: { $in: ['topup', 'deposit', 'transfer'] }
    }).sort({ date: -1 });

    res.json({ history: txs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

 // Block/Unblock Users
 
// ---------------------------
// All Users

// ---------------------------
  // ---------------------------
// All Users
 
// GET USER POOL STATUS
// GET USER POOL STATUS (Formatted for Frontend)
// GET USER POOL STATUS
router.get('/pool-status/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select('activePools').lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // 🔥 Sirf wahi pools dikhayenge jo sach me ACTIVE hain aur jinka paisa milna chalu ho gaya hai
    const formattedPools = (user.activePools || [])
      .filter(pool => pool.status === 'ACTIVE' || Number(pool.daysPaid) > 0) 
      .map((pool, index) => {
        return {
          level: pool.level || (index + 1),
          status: (pool.status || 'ACTIVE').toUpperCase(),
          daysPaid: Number(pool.daysPaid) || 0,
          totalDays: Number(pool.totalDays) || 100,
          dailyAmount: Number(pool.dailyAmount) || 0
        };
      });

    res.json({ success: true, activePools: formattedPools });
  } catch (error) {
    console.error("Pool Status Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ PROMO USER DEDICATED ROUTE

// 🔥 ADMIN ROUTE: Purane Missed Rewards Dilane Ke Liye (Bas Ek Baar Chalana Hai)
 




// C:\Users\HP\Desktop\crowdone\backend\routes\user.js (Ya jahan aapki user APIs hain)
// C:\Users\HP\Desktop\crowdone\backend\routes\user.js

 
 
 

 
   
router.put('/topup/:userId', authMiddleware, async (req, res) => {
    try {
        const targetUserId = Number(req.params.userId);
        const { amount, transactionPassword, isPromoFree } = req.body;

        // --- (Validations - Jo aapke purane code mein hain, wahi rehne do) ---
        const currentUser = await User.findOne({ userId: req.user.userId }).lean();
        if (!currentUser) return res.status(404).json({ message: "Current user not found" });

        if (!transactionPassword || transactionPassword.toLowerCase() !== currentUser.transactionPassword.toLowerCase()) {
            return res.status(403).json({ message: "Invalid transaction password" });
        }

        const allowedPackages = [30, 100, 300, 500, 1000];
        if (!allowedPackages.includes(amount)) return res.status(400).json({ message: "Invalid package." });

        let targetUser = await User.findOne({ userId: targetUserId });
        let isFakeUser = false;
        if (!targetUser) {
            const FakeUser = require('../models/FakeUser');
            targetUser = await FakeUser.findOne({ userId: targetUserId });
            if (targetUser) isFakeUser = true;
            else return res.status(404).json({ message: 'Target user not found' });
        }

        // Upgrade Logic
        const currentHighest = Number(targetUser.highestPackage) || 0;
        let expectedNext = (currentHighest === 0) ? 30 : (currentHighest === 30) ? 100 : (currentHighest === 100) ? 300 : (currentHighest === 300) ? 500 : (currentHighest === 500) ? 1000 : null;
        
        if (expectedNext === null) return res.status(400).json({ message: "Max package reached." });
        if (amount !== expectedNext) return res.status(400).json({ message: `Next required package is $${expectedNext}.` });

        // Wallet Deduction
        if (!(isPromoFree && amount === 10) && currentUser.role !== 'promo') {
            if (currentUser.walletBalance < amount) return res.status(400).json({ message: 'Insufficient balance' });
            await User.updateOne({ userId: currentUser.userId }, { $inc: { walletBalance: -amount } });
        }

        // Target User Update
        let isFirstTopup = !targetUser.isToppedUp;
        targetUser.packages.push({ plan: "Global Auto-Pool", amount, startDate: new Date() });
        targetUser.isToppedUp = true;
        targetUser.highestPackage = amount;
        await targetUser.save();

        const Transaction = require('../models/Transaction');
        await Transaction.create({ userId: targetUser.userId, type: "topup", amount, description: `Activated $${amount}` });

        res.json({ success: true, message: "Package Activated!" });

        // --- 🔥 CORRECTED MLM ENGINE ---
        (async () => {
            try {
                // 1. DIRECT / BOUNCE BACK LOGIC
                if (targetUser.sponsorId) {
                    const directBonusAmount = (amount * 10) / 100;
                    const directSponsor = await User.findOne({ userId: targetUser.sponsorId });

                    // Increment Direct Count
                    if (isFirstTopup && directSponsor) {
                        directSponsor.directCount = (Number(directSponsor.directCount) || 0) + 1;
                        await directSponsor.save();
                    }

                    // Check Direct Sponsor
                    if (directSponsor && directSponsor.isToppedUp && Number(directSponsor.highestPackage) >= Number(amount) && directSponsor.role !== 'setup' && directSponsor.role !== 'super_setup') {
                        await User.updateOne({ _id: directSponsor._id }, { $inc: { walletBalance: directBonusAmount, directIncome: directBonusAmount, totalDirectIncome: directBonusAmount } });
                        await Transaction.create({ userId: directSponsor.userId, type: "direct_income", amount: directBonusAmount, description: `Direct Bonus from ${targetUser.name}` });
                    } else {
                        // Bounce Back Logic
                        let current = directSponsor ? directSponsor.sponsorId : targetUser.sponsorId;
                        let found = false;
                        let depth = 0;
                        while (current && depth < 100) {
                            const up = await User.findOne({ userId: current });
                            if (!up) break;
                            if (up.isToppedUp && Number(up.highestPackage) >= Number(amount) && up.role !== 'setup' && up.role !== 'super_setup') {
                                await User.updateOne({ _id: up._id }, { $inc: { walletBalance: directBonusAmount, upgradeBounceBackIncome: directBonusAmount, totalUpgradeBounceBackIncome: directBonusAmount } });
                                await Transaction.create({ userId: up.userId, type: "upgrade_bounce_back_income", amount: directBonusAmount, description: `Bounce Back from ${targetUser.name}` });
                                found = true;
                                break;
                            }
                            current = up.sponsorId;
                            depth++;
                        }
                    }
                }

                // 2. SETTING INCOME (Setup/Super)
                let sUplineId = targetUser.sponsorId;
                let sPaid = false, ssPaid = false;
                let sDepth = 0;
                while (sUplineId && sDepth < 50) {
                    const su = await User.findOne({ userId: sUplineId });
                    if (!su) break;
                    if (su.isToppedUp) {
                        if (su.role === 'setup' && !sPaid) { await User.updateOne({ _id: su._id }, { $inc: { walletBalance: (amount * 0.05) } }); sPaid = true; }
                        if (su.role === 'super_setup' && !ssPaid) { await User.updateOne({ _id: su._id }, { $inc: { walletBalance: (amount * 0.10) } }); ssPaid = true; }
                    }
                    if (sPaid && ssPaid) break;
                    sUplineId = su.sponsorId;
                    sDepth++;
                }

                // 3. 20-LEVEL INCOME
                let lUplineId = targetUser.sponsorId;
                let level = 2; // Level 2 se start, Level 1 is Direct
                while (lUplineId && level <= 20) {
                    const up = await User.findOne({ userId: lUplineId });
                    if (!up) break;
                    if (up.isToppedUp && up.role !== 'setup' && up.role !== 'super_setup') {
                        let pct = (level === 2) ? 5 : (level === 3) ? 3 : (level === 4) ? 2 : (level === 5) ? 1 : (level <= 10) ? 0.5 : 0.25;
                        if (Number(up.highestPackage) >= Number(amount)) {
                            let lAmt = (amount * pct / 100);
                            await User.updateOne({ _id: up._id }, { $inc: { walletBalance: lAmt, levelIncome: lAmt, totalLevelIncome: lAmt } });
                            await Transaction.create({ userId: up.userId, type: "level_income", amount: lAmt, description: `Level ${level} Income` });
                        }
                    }
                    lUplineId = up.sponsorId;
                    level++;
                }
            } catch (e) { console.error("MLM Engine Error:", e); }
        })();

    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ message: "Server error" });
    }
});


// ========================================================
// 🚀 2. SETUP TOPUP ROUTE (For 'setup' role)
// ========================================================
router.put(
  '/setup-topup/:userId',
  authMiddleware,
  async (req, res) => {
    try {
      const targetUserId = Number(req.params.userId);
      const { amount, transactionPassword } = req.body;

      const currentUser = await User.findOne({ userId: req.user.userId });
      if (!currentUser) return res.status(404).json({ message: "Current user not found" });
      
      if (currentUser.role !== 'setup') {
          return res.status(403).json({ message: "Access denied. Only Setup roles can use this route." });
      }

      if (!transactionPassword) return res.status(400).json({ message: "Transaction password is required" });
      if (transactionPassword.toLowerCase() !== currentUser.transactionPassword.toLowerCase()) {
          return res.status(403).json({ message: "Invalid transaction password" });
      }

      const targetUser = await User.findOne({ userId: targetUserId });
      if (!targetUser) return res.status(404).json({ message: 'Target user not found' });

      // 🛑 STEP-BY-STEP UPGRADE LOGIC
      const currentHighest = targetUser.highestPackage || 0;
      let expectedNext = 30;
      
      if (currentHighest === 30) expectedNext = 100;
      else if (currentHighest === 100) expectedNext = 300;
      else if (currentHighest === 300) expectedNext = 500;
      else if (currentHighest === 500) expectedNext = 1000;
      else if (currentHighest === 1000) expectedNext = null; 

      if (expectedNext === null) {
          return res.status(400).json({ message: "This ID has already reached the maximum Apex package of $1000." });
      }

      if (amount !== expectedNext) {
          return res.status(400).json({ message: `Invalid upgrade. You must upgrade step-by-step. Your next required package is $${expectedNext}.` });
      }

      // 🛑 2 DIRECTS REQUIRED FOR UPGRADE LOGIC (Topup ke liye lagoo)
      if (currentHighest > 0) {
          const activeDirectsCount = await User.countDocuments({
              sponsorId: targetUser.userId,
              highestPackage: { $gte: currentHighest }
          });

          if (activeDirectsCount < 2) {
              return res.status(400).json({ 
                  message: `Upgrade Blocked: You need at least 2 active directs on your current $${currentHighest} tier before you can upgrade to $${amount}.` 
              });
          }
      }

      // 🚫 DOUBLE TOP-UP RESTRICTION 
      const isAlreadyBought = targetUser.packages?.some(p => p.amount === amount);
      if (isAlreadyBought) {
          return res.status(400).json({ message: `This ID is already active with a $${amount} package. Double top-up is not allowed.` });
      }

      // DOWNLINE VERIFICATION
      let isDownline = false;
      let checkUplineId = targetUser.sponsorId;
      let depth = 1;
      while (checkUplineId && depth <= 100) {
          if (Number(checkUplineId) === Number(currentUser.userId)) {
              isDownline = true;
              break;
          }
          const nextNode = await User.findOne({ userId: checkUplineId }).select('sponsorId');
          if (!nextNode) break;
          checkUplineId = nextNode.sponsorId;
          depth++;
      }

      if (!isDownline) {
          return res.status(403).json({ message: "Action Denied! You can only activate IDs in your own Downline." });
      }

      // =======================================================
      // 🛑 NEW LOGIC: $30 LOCKED BALANCE & FREE DIRECT $30
      // =======================================================
      const isDirect = (targetUser.sponsorId === currentUser.userId);
      
      if (isDirect && amount === 30) {
          if (currentUser.walletBalance < 30) {
              return res.status(400).json({ message: "Insufficient Balance! You must keep $30 in your wallet to activate a direct ID." });
          }
          console.log(`[FREE $30] Setup ${currentUser.userId} activated direct ${targetUser.userId}. Balance NOT deducted.`);
      } else {
          const availableBalance = currentUser.walletBalance - 30;
          if (availableBalance < amount) {
             return res.status(400).json({ 
                 message: `Insufficient Wallet Balance! You need $${amount}, plus $30 must remain locked in your wallet. (Total required: $${amount + 30})` 
             });
          }
          await User.updateOne({ userId: currentUser.userId }, { $inc: { walletBalance: -amount } });
      }

      const createTransaction = async (data) => {
         const Transaction = require('../models/Transaction'); 
         return Transaction.create({ ...data, date: new Date() });
      };

      // =======================================================
      // 🔹 3. CORE UPDATE
      // =======================================================
      let isFirstTopup = !targetUser.isToppedUp;
      
      targetUser.packages = targetUser.packages || [];
      targetUser.packages.push({ plan: "Global Auto-Pool", amount: amount, startDate: new Date(), withdrawn: 0, isDummy: false });
      targetUser.topUpAmount = Math.max(targetUser.topUpAmount || 0, amount);
      targetUser.highestPackage = amount;
      targetUser.updatedAt = new Date();
      
      if (isFirstTopup) {
          targetUser.isToppedUp = true;
          targetUser.topUpDate = new Date();
      }
      
      targetUser.activePools.push({ level: amount, dailyAmount: (amount*2)/90, totalDays: 90, daysPaid: 0, status: "ACTIVE", withdrawnAmount: 0 });
      await targetUser.save();

      let txDescription = isFirstTopup ? `Node Activated with $${amount} (By Setup)` : `Node Upgraded to $${amount} (By Setup)`;
      await createTransaction({
        userId: targetUser.userId, type: "topup", amount, fromUserId: currentUser.userId, toUserId: targetUser.userId,
        description: txDescription, status: 'success'
      });

      res.json({ success: true, message: `Success! $${amount} Package Activated by Setup.` });

      // =======================================================
      // 🔹 4. BACKGROUND MLM ENGINE
      // =======================================================
      (async () => {
          try {
              if (isFirstTopup && typeof processGlobalTeamGrowth === 'function') {
                  await processGlobalTeamGrowth(targetUser.userId);
              }

              const immediateSponsorObj = await User.findOne({ userId: targetUser.sponsorId }).select('role');
              const isDirectSponsorSpecial = immediateSponsorObj && (immediateSponsorObj.role === 'setup' || immediateSponsorObj.role === 'super_setup');

              // ==========================================================
              // ✅ BOUNCE BACK SPONSOR INCOME LOGIC (10%)
              // ==========================================================
            // ==========================================================
              // ✅ BOUNCE BACK SPONSOR INCOME LOGIC (10% - ONLY FOR DIRECT)
              // ==========================================================
              if (targetUser.sponsorId) {
                  const directSponsor = await User.findOne({ userId: targetUser.sponsorId });
                  
                  if (directSponsor) {
                      // Agar First Topup hai toh direct count badhao
                      if (isFirstTopup) {
                          directSponsor.directCount = (directSponsor.directCount || 0) + 1;
                          await directSponsor.save();
                      }

                      const directBonusAmount = (amount * 10) / 100;

                      // Condition 1: Check karo ki Direct Sponsor qualify karta hai ya nahi
                      if (directSponsor.isToppedUp && directSponsor.highestPackage >= amount) {
                          
                          // Agar Direct Sponsor Setup/Super Setup hai toh Income Block karo
                          if (directSponsor.role === 'setup' || directSponsor.role === 'super_setup') {
                              console.log(`[BLOCKED] Direct Income blocked for Setup role.`);
                          } else {
                              // Normal Direct Income (Sponsor qualify karta hai)
                              directSponsor.directIncome = (directSponsor.directIncome || 0) + directBonusAmount;
                              directSponsor.totalDirectIncome = (directSponsor.totalDirectIncome || 0) + directBonusAmount;
                              
                              await User.updateOne({ _id: directSponsor._id }, { $inc: { walletBalance: directBonusAmount } });
                              
                              await createTransaction({
                                  userId: directSponsor.userId, type: "direct_income", source: "direct",
                                  amount: directBonusAmount, fromUserId: targetUser.userId,
                                  description: `Direct Bonus (10%) from ${targetUser.name}'s $${amount} Package`, status: 'success'
                              });
                              await directSponsor.save();
                          }
                      } 
                      // Condition 2: Bounce Back (Agar Direct Sponsor fail ho gaya)
                      else {
                          let uplineId = directSponsor.sponsorId;
                          let searchDepth = 100;
                          let bounceReceiver = null;

                          // Upline mein qualify karne wala dhundo
                          while (uplineId && searchDepth > 0) {
                              const up = await User.findOne({ userId: uplineId });
                              if (!up) break;

                              if (up.isToppedUp && up.highestPackage >= amount) {
                                  bounceReceiver = up;
                                  break;
                              }
                              uplineId = up.sponsorId;
                              searchDepth--;
                          }

                          if (bounceReceiver) {
                              // Setup/Super Setup ko Bounce Back bhi nahi milna chahiye
                              if (bounceReceiver.role === 'setup' || bounceReceiver.role === 'super_setup') {
                                  console.log(`[BLOCKED] Bounce Back blocked for Setup role.`);
                              } else {
                                  bounceReceiver.upgradeBounceBackIncome = (bounceReceiver.upgradeBounceBackIncome || 0) + directBonusAmount;
                                  bounceReceiver.totalUpgradeBounceBackIncome = (bounceReceiver.totalUpgradeBounceBackIncome || 0) + directBonusAmount;
                                  
                                  await User.updateOne({ _id: bounceReceiver._id }, { $inc: { walletBalance: directBonusAmount } });
                                  
                                  await createTransaction({
                                      userId: bounceReceiver.userId, type: "upgrade_bounce_back_income", source: "bounce_back",
                                      amount: directBonusAmount, fromUserId: targetUser.userId,
                                      description: `Upgrade Bounce Back (10%) from ${targetUser.name}'s $${amount} Package`, status: 'success'
                                  });
                                  await bounceReceiver.save();
                              }
                          }
                      }
                  }
              }
              // ==========================================================
              // 🔥 STRICT BLOCKER
              // ==========================================================
              if (isDirectSponsorSpecial) {
                  console.log(`[BLOCKED] Sponsor is ${immediateSponsorObj.role}. Setting and Level incomes are blocked from going up for this direct ID.`);
              } else {
                  
                  // ==========================================================
                  // 🌟 SETTING INCOME (5% Setup / 10% Super Setup)
                  // ==========================================================
                  let settingUplineId = targetUser.sponsorId;
                  let setupPaid = false;
                  let superSetupPaid = false;
                  let settingDepth = 100;

                  while (settingUplineId && settingDepth > 0) {
                      const sUpline = await User.findOne({ userId: settingUplineId }).select('userId role isToppedUp sponsorId _id');
                      if (!sUpline) break;

                      if (sUpline.isToppedUp) {
                          if (sUpline.role === 'setup' && !setupPaid) {
                              const setupAmt = (amount * 5) / 100;
                              await User.updateOne({ _id: sUpline._id }, { $inc: { walletBalance: setupAmt } });
                              await createTransaction({
                                  userId: sUpline.userId, type: "credit_to_wallet", source: "setting_income",
                                  amount: setupAmt, fromUserId: targetUser.userId,
                                  description: `5% Setup Setting Income from Indirect Downline ($${amount})`, status: "success"
                              });
                              setupPaid = true; 
                          }
                          else if (sUpline.role === 'super_setup' && !superSetupPaid) {
                              const superSetupAmt = (amount * 10) / 100;
                              await User.updateOne({ _id: sUpline._id }, { $inc: { walletBalance: superSetupAmt } });
                              await createTransaction({
                                  userId: sUpline.userId, type: "credit_to_wallet", source: "setting_income",
                                  amount: superSetupAmt, fromUserId: targetUser.userId,
                                  description: `10% Super Setup Setting Income from Indirect Downline ($${amount})`, status: "success"
                              });
                              superSetupPaid = true; 
                          }
                      }
                      if (setupPaid && superSetupPaid) break;
                      settingUplineId = sUpline.sponsorId;
                      settingDepth--;
                  }

                  // ==========================================================
                  // 🌟 UNIFIED 20-LEVEL ENGINE (SETUP ROUTE)
                  // ==========================================================
                  let currentUplineId = targetUser.sponsorId; 
                  let currentLevel = 1;
                  let isBreakawayHit = false;

                  while (currentUplineId && currentLevel <= 20) {
                      const upline = await User.findOne({ userId: currentUplineId }).select('userId isToppedUp sponsorId role directCount highestPackage _id');
                      if (!upline) break;

                      if (!upline.isToppedUp || upline.role === 'setup' || upline.role === 'super_setup') {
                          currentUplineId = upline.sponsorId;
                          continue; 
                      }

                      const isCurrentUplineLeader = (upline.role === 'leader');
                      const isCurrentUplineSuperLeader = (upline.role === 'superleader'); 

                      if (isBreakawayHit && !isCurrentUplineSuperLeader) {
                          currentUplineId = upline.sponsorId;
                          continue; 
                      }

                      if (currentLevel >= 2 && currentLevel <= 20) {
                          let percentage = 0;
                          if (currentLevel === 2) percentage = 5;
                          else if (currentLevel === 3) percentage = 3;
                          else if (currentLevel === 4) percentage = 2;
                          else if (currentLevel === 5) percentage = 1;
                          else if (currentLevel >= 6 && currentLevel <= 10) percentage = 0.50;
                          else if (currentLevel >= 11 && currentLevel <= 20) percentage = 0.25;

                          // Level lene ke liye Upline ka package barabar ya bada hona chahiye, Direct ka koi condition nahi!
                          const hasSufficientPackage = upline.highestPackage >= amount;

                          if (hasSufficientPackage) {
                              const levelAmount = (amount * percentage) / 100;
                              if (levelAmount > 0) {
                                  await User.updateOne({ _id: upline._id }, { $inc: { levelIncome: levelAmount, totalLevelIncome: levelAmount, walletBalance: levelAmount } });
                                  await createTransaction({
                                      userId: upline.userId, type: "level_income", source: "level", amount: levelAmount,
                                      fromUserId: targetUser.userId, description: `Level ${currentLevel} Income (${percentage}%) from $${amount} Package`, status: 'success'
                                  });
                              }
                          }
                      }

                      if (currentLevel >= 2 && isCurrentUplineLeader && !isBreakawayHit) {
                          const instantBonusAmount = (amount * 10) / 100;
                          await User.updateOne({ _id: upline._id }, { $inc: { walletBalance: instantBonusAmount } });
                          isBreakawayHit = true; 
                      }

                      currentUplineId = upline.sponsorId;
                      currentLevel++; 
                  }
              }
          } catch (bgError) {
              console.error("Background MLM Engine Error:", bgError);
          }
      })();
      
    } catch (err) {
      console.error('Setup Top-up Error:', err);
      if (!res.headersSent) res.status(500).json({ message: 'Server error during setup top-up' });
    }
  }
);


// ========================================================
// 🚀 3. SUPER-SETUP TOPUP ROUTE (For 'super_setup' role)
// ========================================================
router.put(
  '/supersetup-topup/:userId',
  authMiddleware,
  async (req, res) => {
    try {
      const targetUserId = Number(req.params.userId);
      const { amount, transactionPassword } = req.body;

      const currentUser = await User.findOne({ userId: req.user.userId });
      if (!currentUser) return res.status(404).json({ message: "Current user not found" });
      
      if (currentUser.role !== 'super_setup') {
          return res.status(403).json({ message: "Access denied. Only Super Setup roles can use this route." });
      }

      if (!transactionPassword) return res.status(400).json({ message: "Transaction password is required" });
      if (transactionPassword.toLowerCase() !== currentUser.transactionPassword.toLowerCase()) {
          return res.status(403).json({ message: "Invalid transaction password" });
      }

      const targetUser = await User.findOne({ userId: targetUserId });
      if (!targetUser) return res.status(404).json({ message: 'Target user not found' });

      // 🛑 STEP-BY-STEP UPGRADE LOGIC
      const currentHighest = targetUser.highestPackage || 0;
      let expectedNext = 30;
      
      if (currentHighest === 30) expectedNext = 100;
      else if (currentHighest === 100) expectedNext = 300;
      else if (currentHighest === 300) expectedNext = 500;
      else if (currentHighest === 500) expectedNext = 1000;
      else if (currentHighest === 1000) expectedNext = null; 

      if (expectedNext === null) {
          return res.status(400).json({ message: "This ID has already reached the maximum Apex package of $1000." });
      }

      if (amount !== expectedNext) {
          return res.status(400).json({ message: `Invalid upgrade. You must upgrade step-by-step. Your next required package is $${expectedNext}.` });
      }

      // 🛑 2 DIRECTS REQUIRED FOR UPGRADE LOGIC (Topup ke liye lagoo)
      if (currentHighest > 0) {
          const activeDirectsCount = await User.countDocuments({
              sponsorId: targetUser.userId,
              highestPackage: { $gte: currentHighest }
          });

          if (activeDirectsCount < 2) {
              return res.status(400).json({ 
                  message: `Upgrade Blocked: You need at least 2 active directs on your current $${currentHighest} tier before you can upgrade to $${amount}.` 
              });
          }
      }

      // 🚫 DOUBLE TOP-UP RESTRICTION 
      const isAlreadyBought = targetUser.packages?.some(p => p.amount === amount);
      if (isAlreadyBought) {
          return res.status(400).json({ message: `This ID is already active with a $${amount} package. Double top-up is not allowed.` });
      }

      // DOWNLINE VERIFICATION
      let isDownline = false;
      let checkUplineId = targetUser.sponsorId;
      let depth = 1;
      while (checkUplineId && depth <= 100) {
          if (Number(checkUplineId) === Number(currentUser.userId)) {
              isDownline = true;
              break;
          }
          const nextNode = await User.findOne({ userId: checkUplineId }).select('sponsorId');
          if (!nextNode) break;
          checkUplineId = nextNode.sponsorId;
          depth++;
      }

      if (!isDownline) {
          return res.status(403).json({ message: "Action Denied! You can only activate IDs in your own Downline." });
      }

      // =======================================================
      // 🛑 NEW LOGIC: $30 LOCKED BALANCE & FREE DIRECT $30
      // =======================================================
      const isDirect = (targetUser.sponsorId === currentUser.userId);
      
      if (isDirect && amount === 30) {
          if (currentUser.walletBalance < 30) {
              return res.status(400).json({ message: "Insufficient Balance! You must keep $30 in your wallet to activate a direct ID." });
          }
          console.log(`[FREE $30] Super Setup ${currentUser.userId} activated direct ${targetUser.userId}. Balance NOT deducted.`);
      } else {
          const availableBalance = currentUser.walletBalance - 30; 
          if (availableBalance < amount) {
             return res.status(400).json({ 
                 message: `Insufficient Wallet Balance! You need $${amount}, plus $30 must remain locked in your wallet. (Total required: $${amount + 30})` 
             });
          }
          await User.updateOne({ userId: currentUser.userId }, { $inc: { walletBalance: -amount } });
      }

      const createTransaction = async (data) => {
         const Transaction = require('../models/Transaction'); 
         return Transaction.create({ ...data, date: new Date() });
      };

      // =======================================================
      // 🔹 3. CORE UPDATE
      // =======================================================
      let isFirstTopup = !targetUser.isToppedUp;
      
      targetUser.packages = targetUser.packages || [];
      targetUser.packages.push({ plan: "Global Auto-Pool", amount: amount, startDate: new Date(), withdrawn: 0, isDummy: false });
      targetUser.topUpAmount = Math.max(targetUser.topUpAmount || 0, amount);
      targetUser.highestPackage = amount;
      targetUser.updatedAt = new Date();
      
      if (isFirstTopup) {
          targetUser.isToppedUp = true;
          targetUser.topUpDate = new Date();
      }
      
      targetUser.activePools.push({ level: amount, dailyAmount: (amount*2)/90, totalDays: 90, daysPaid: 0, status: "ACTIVE", withdrawnAmount: 0 });
      await targetUser.save();

      let txDescription = isFirstTopup ? `Node Activated with $${amount} (By Super Setup)` : `Node Upgraded to $${amount} (By Super Setup)`;
      await createTransaction({
        userId: targetUser.userId, type: "topup", amount, fromUserId: currentUser.userId, toUserId: targetUser.userId,
        description: txDescription, status: 'success', date: new Date()
      });

      res.json({ success: true, message: `Success! $${amount} Package Activated by Super Setup.` });

      // =======================================================
      // 🔹 4. BACKGROUND MLM ENGINE
      // =======================================================
      (async () => {
          try {
              if (isFirstTopup && typeof processGlobalTeamGrowth === 'function') {
                  await processGlobalTeamGrowth(targetUser.userId);
              }

              const immediateSponsorObj = await User.findOne({ userId: targetUser.sponsorId }).select('role');
              const isDirectSponsorSpecial = immediateSponsorObj && (immediateSponsorObj.role === 'setup' || immediateSponsorObj.role === 'super_setup');

              // ==========================================================
              // ✅ BOUNCE BACK SPONSOR INCOME LOGIC (10%)
              // ==========================================================
            // ==========================================================
              // ✅ BOUNCE BACK SPONSOR INCOME LOGIC (10%)
              // ==========================================================
              if (targetUser.sponsorId) {
                  let directBonusAmount = (amount * 10) / 100;
                  
                  // 1. First Topup par Direct Count badhao
                  if (isFirstTopup) {
                      const immediateSponsor = await User.findOne({ userId: targetUser.sponsorId });
                      if (immediateSponsor) {
                          immediateSponsor.directCount = (immediateSponsor.directCount || 0) + 1;
                          await immediateSponsor.save();
                      }
                  }

                  // 2. Direct Sponsor (Level 1) check karo
                  const directSponsor = await User.findOne({ userId: targetUser.sponsorId });

                  if (directSponsor && directSponsor.isToppedUp && directSponsor.highestPackage >= amount) {
                      // ✅ Direct Sponsor qualify karta hai
                      if (directSponsor.role === 'setup' || directSponsor.role === 'super_setup') {
                          console.log(`[BLOCKED] Direct Income blocked for role: ${directSponsor.role}`);
                      } else {
                          directSponsor.directIncome = (directSponsor.directIncome || 0) + directBonusAmount;
                          directSponsor.totalDirectIncome = (directBonusReceiver.totalDirectIncome || 0) + directBonusAmount;
                          await User.updateOne({ _id: directSponsor._id }, { $inc: { walletBalance: directBonusAmount } });
                          await directSponsor.save();
                          
                          await createTransaction({
                              userId: directSponsor.userId, type: "direct_income", source: "direct",
                              amount: directBonusAmount, fromUserId: targetUser.userId,
                              description: `Direct Bonus (10%) from ${targetUser.name}'s $${amount} Package`, status: 'success'
                          });
                      }
                  } else {
                      // ❌ Direct Sponsor qualify nahi karta - Bounce Back logic on Upline
                      let currentUplineId = directSponsor ? directSponsor.sponsorId : targetUser.sponsorId;
                      let searchDepth = 100;
                      let bounceReceiver = null;

                      while (currentUplineId && searchDepth > 0) {
                          const up = await User.findOne({ userId: currentUplineId });
                          if (!up) break;

                          if (up.isToppedUp && up.highestPackage >= amount) {
                              bounceReceiver = up;
                              break;
                          }
                          currentUplineId = up.sponsorId;
                          searchDepth--;
                      }

                      if (bounceReceiver && bounceReceiver.role !== 'setup' && bounceReceiver.role !== 'super_setup') {
                          bounceReceiver.upgradeBounceBackIncome = (bounceReceiver.upgradeBounceBackIncome || 0) + directBonusAmount;
                          bounceReceiver.totalUpgradeBounceBackIncome = (bounceReceiver.totalUpgradeBounceBackIncome || 0) + directBonusAmount;
                          
                          await User.updateOne({ _id: bounceReceiver._id }, { $inc: { walletBalance: directBonusAmount } });
                          
                          await createTransaction({
                              userId: bounceReceiver.userId, type: "upgrade_bounce_back_income", source: "bounce_back",
                              amount: directBonusAmount, fromUserId: targetUser.userId,
                              description: `Upgrade Bounce Back (10%) from ${targetUser.name}'s $${amount} Package`, status: 'success'
                          });
                          await bounceReceiver.save();
                      }
                  }
              }

              // ==========================================================
              // 🔥 STRICT BLOCKER
              // ==========================================================
              if (isDirectSponsorSpecial) {
                  console.log(`[BLOCKED] Sponsor is ${immediateSponsorObj.role}. Setting and Level incomes are blocked from going up for this direct ID.`);
              } else {
                  
                  // ==========================================================
                  // 🌟 SETTING INCOME (5% Setup / 10% Super Setup)
                  // ==========================================================
                  let settingUplineId = targetUser.sponsorId;
                  let setupPaid = false;
                  let superSetupPaid = false;
                  let settingDepth = 100;

                  while (settingUplineId && settingDepth > 0) {
                      const sUpline = await User.findOne({ userId: settingUplineId }).select('userId role isToppedUp sponsorId _id');
                      if (!sUpline) break;

                      if (sUpline.isToppedUp) {
                          if (sUpline.role === 'setup' && !setupPaid) {
                              const setupAmt = (amount * 5) / 100;
                              await User.updateOne({ _id: sUpline._id }, { $inc: { walletBalance: setupAmt } });
                              await createTransaction({
                                  userId: sUpline.userId, type: "credit_to_wallet", source: "setting_income",
                                  amount: setupAmt, fromUserId: targetUser.userId,
                                  description: `5% Setup Setting Income from Indirect Downline ($${amount})`, status: "success"
                              });
                              setupPaid = true; 
                          }
                          else if (sUpline.role === 'super_setup' && !superSetupPaid) {
                              const superSetupAmt = (amount * 10) / 100;
                              await User.updateOne({ _id: sUpline._id }, { $inc: { walletBalance: superSetupAmt } });
                              await createTransaction({
                                  userId: sUpline.userId, type: "credit_to_wallet", source: "setting_income",
                                  amount: superSetupAmt, fromUserId: targetUser.userId,
                                  description: `10% Super Setup Setting Income from Indirect Downline ($${amount})`, status: "success"
                              });
                              superSetupPaid = true; 
                          }
                      }
                      if (setupPaid && superSetupPaid) break;
                      settingUplineId = sUpline.sponsorId;
                      settingDepth--;
                  }

                  // ==========================================================
                  // 🌟 UNIFIED 20-LEVEL ENGINE (SUPER SETUP ROUTE)
                  // ==========================================================
                  let currentUplineId = targetUser.sponsorId; 
                  let currentLevel = 1;
                  let isBreakawayHit = false;

                  while (currentUplineId && currentLevel <= 20) {
                      const upline = await User.findOne({ userId: currentUplineId }).select('userId isToppedUp sponsorId role directCount highestPackage _id');
                      if (!upline) break;

                      if (!upline.isToppedUp || upline.role === 'setup' || upline.role === 'super_setup') {
                          currentUplineId = upline.sponsorId;
                          continue; 
                      }

                      const isCurrentUplineLeader = (upline.role === 'leader');
                      const isCurrentUplineSuperLeader = (upline.role === 'superleader'); 

                      if (isBreakawayHit && !isCurrentUplineSuperLeader) {
                          currentUplineId = upline.sponsorId;
                          continue; 
                      }

                      if (currentLevel >= 2 && currentLevel <= 20) {
                          let percentage = 0;
                          if (currentLevel === 2) percentage = 5;
                          else if (currentLevel === 3) percentage = 3;
                          else if (currentLevel === 4) percentage = 2;
                          else if (currentLevel === 5) percentage = 1;
                          else if (currentLevel >= 6 && currentLevel <= 10) percentage = 0.50;
                          else if (currentLevel >= 11 && currentLevel <= 20) percentage = 0.25;

                          // Level lene ke liye Upline ka package barabar ya bada hona chahiye, Direct ka koi condition nahi!
                          const hasSufficientPackage = upline.highestPackage >= amount;

                          if (hasSufficientPackage) {
                              const levelAmount = (amount * percentage) / 100;
                              if (levelAmount > 0) {
                                  await User.updateOne({ _id: upline._id }, { $inc: { levelIncome: levelAmount, totalLevelIncome: levelAmount, walletBalance: levelAmount } });
                                  await createTransaction({
                                      userId: upline.userId, type: "level_income", source: "level", amount: levelAmount,
                                      fromUserId: targetUser.userId, description: `Level ${currentLevel} Income (${percentage}%) from $${amount} Package`, status: 'success'
                                  });
                              }
                          }
                      }

                      if (currentLevel >= 2 && isCurrentUplineLeader && !isBreakawayHit) {
                          const instantBonusAmount = (amount * 10) / 100;
                          await User.updateOne({ _id: upline._id }, { $inc: { walletBalance: instantBonusAmount } });
                          isBreakawayHit = true; 
                      }

                      currentUplineId = upline.sponsorId;
                      currentLevel++; 
                  }
              }
          } catch (bgError) {
              console.error("Background MLM Engine Error:", bgError);
          }
      })();
      
    } catch (err) {
      console.error('Super Setup Top-up Error:', err);
      if (!res.headersSent) res.status(500).json({ message: 'Server error during super setup top-up' });
    }
  }
);

// Backend Route: promo-dummy-topup
// ✅ PROMO DUMMY TOPUP - FIXED & ROBUST
// ✅ UPDATED BACKEND ROUTE (Using DummyTransaction Model)
// 🚀 PROMO USER TOPUP ROUTE (Strictly for Showcase/Screenshot Popup)
// 🚀 PROMO USER TOPUP ROUTE (Strictly for Today's Fake IDs)
router.post('/promo-dummy-topup', authMiddleware, async (req, res) => {
  try {
    const { amount, transactionPassword } = req.body;
    const currentUser = await User.findOne({ userId: req.user.userId });

    // 1. Password Check
    if (!transactionPassword || transactionPassword.toLowerCase() !== currentUser.transactionPassword.toLowerCase()) {
      return res.status(403).json({ message: "Invalid transaction password" });
    }

    // 2. Indian Names List
  const dummyNames = [
    "Yashraj Trivedi", "Zoravar Bhatt", "Aarav Sharma", "Vivaan Verma", "Faizan Ansari",
    "Aditya Singh", "Imran Shaikh", "Arjun Patel", "Krishna Gupta", "Rohan Yadav",
    "Aftab Sayyed", "Rahul Mishra", "Amit Tiwari", "Nadeem Siddiqui", "Vikas Pandey",
    "Sandeep Dubey", "Mohit Choudhary", "Arman Pathan", "Nitin Jha", "Manish Joshi",
    "Deepak Mehta", "Ankit Shah", "Rakesh Agarwal", "Suresh Jain", "Sajid Baig",
    "Prakash Saxena", "Mukesh Srivastava", "Abhishek Chauhan", "Ravindra Thakur", "Pankaj Rathore",
    "Sameer Qureshi", "Dinesh Solanki", "Ashok Parmar", "Rajesh Soni", "Salman Mirza",
    "Sanjay Bansal", "Vivek Goyal", "Harsh Mahajan", "Tarun Arora", "Irfan Momin",
    "Varun Malhotra", "Rajat Khanna", "Gaurav Kapoor", "Naveen Anand", "Yash Bhatia",
    "Sohail Shaikh", "Sahil Ahuja", "Akash Nagpal", "Rituraj Sachdeva", "Shubham Oberoi",
    "Rishi Puri", "Ayaan Khan", "Dev Sehgal", "Ishaan Grover", "Kabir Talwar",
    "Laksh Kalra", "Dhruv Bedi", "Aryan Wadhwa", "Junaid Pathan", "Rudra Gulati",
    "Parth Batra", "Keshav Sethi", "Ujjwal Narang", "Pranav Chaturvedi", "Noman Qureshi",
    "Tushar Bhandari", "Nikhil Upadhyay", "Ayush Tripathi", "Bilal Khan", "Shivam Mishra",
    "Madhav Joshi", "Kartik Shukla", "Danish Khan", "Anurag Pandey", "Rohit Tiwari",
    "Hemant Sharma", "Aamir Shaikh", "Kunal Mehta", "Satyam Dwivedi", "Nawaz Pathan",
    "Alok Srivastava", "Neeraj Dixit", "Faisal Qureshi", "Ajay Kashyap", "Vijay Tyagi",
    "Shadab Ansari", "Uday Rawat", "Piyush Bisht", "Anmol Negi", "Rizwan Siddiqui",
    "Nakul Panwar", "Ritik Bhandari", "Chetan Bora", "Farhan Ansari", "Pradeep Kandpal",
    "Saurabh Karki", "Anand Reddy", "Kiran Rao", "Mahendra Naidu", "Hamza Pathan",
    "Raghav Kulkarni", "Zeeshan Khan", "Atharv Deshmukh", "Mohammad Arif", "Tejas Patil",
    "Furqan Ansari", "Niranjan Hegde", "Shariq Siddiqui", "Omkar Jadhav", "Noman Shaikh",
    "Shreyas Gokhale", "Aadil Pathan", "Prathamesh Sawant", "Sufiyan Qureshi", "Milind Deshpande",
    "Rauf Mirza", "Amol Chavan", "Taufeeq Momin", "Ajinkya Mane", "Yasin Sayyed",
    "Nilesh More", "Shahbaz Baig", "Swapnil Pawar", "Javed Khan", "Datta Salunkhe",
    "Arbaz Ansari", "Sagar Kadam", "Muzammil Shaikh", "Ruturaj Shinde", "Ayan Siddiqui",
    "Ninad Apte", "Rashid Pathan", "Aniruddha Ranade", "Junaid Qureshi", "Atharva Tambe",
    "Asad Mirza", "Shankar Bhat", "Faheem Momin", "Ravi Kulkarni", "Aqeel Sayyed",
    "Sachin Patil", "Nisar Baig", "Pravin Jadhav", "Aamir Khan", "Ganesh Hegde",
    "Shakib Ansari", "Satish Kamath", "Parvaiz Shaikh", "Venkatesh Iyer", "Arsalan Siddiqui",
    "Srinivas Rao", "Sohail Pathan", "Harikrishna Menon", "Mudassir Qureshi", "Arvind Nair",
    "Zubair Mirza", "Madhavan Pillai", "Azeem Momin", "Raghavan Acharya", "Shanawaz Sayyed",
    "Shankar Shenoy", "Fardeen Baig", "Karthik Raman", "Naved Khan", "Saravanan Krishnan",
    "Shariq Ansari", "Vignesh Subramanian", "Tanzeel Shaikh", "Prabhu Rajan", "Yameen Siddiqui",
    "Muthu Sundaram", "Adil Pathan", "Hari Narayanan", "Asif Qureshi", "Bala Subramanian",
    "Riyaz Mirza", "Joseph Dsouza", "Sajjad Momin", "Brian Fernandes", "Anees Sayyed",
    "Kevin Rodrigues", "Naeem Baig", "Melvin Pereira", "Fais Khan", "Joel Gonsalves",
    "Ahtesham Ansari", "Ryan Lobo", "Noman Shaikh", "Bikram Majumdar", "Rauf Siddiqui",
    "Anirban Banerjee", "Faizan Pathan", "Subhajit Chatterjee", "Talha Qureshi", "Souvik Mukherjee",
    "Shahid Mirza", "Arindam Bose", "Ruhan Momin", "Kaushik Dutta", "Aqib Sayyed",
    "Tanmoy Sen", "Salim Baig", "Lakhan Bhadoria", "Bhupendra Tomar", "Jagdish Prajapati",
    "Moinuddin Khan", "Narendra Lodhi", "Mahavir Gurjar", "Kailash Khatik", "Gajendra Dangi",
    "Rameez Akhtar", "Govind Kushwaha", "Mukund Purohit", "Ramlal Meena", "Vishal Rajput",
    "Brijesh Pathak", "Rakesh Khandelwal", "Yogesh Suryavanshi", "Shahrukh Qureshi", "Manoj Vaishnav",
    "Dheeraj Tanwar", "Lokesh Parihar", "Bharat Sisodiya", "Kamal Baghel", "Vinay Raghuvanshi",
    "Prem Chouhan", "Naresh Solanki", "Hemraj Jat", "Mukul Goswami", "Raghunath Mali",
    "Devesh Vyas", "Kishan Bairwa", "Mahesh Dadhich", "Rajendra Sharma", "Ghanshyam Teli",
    "Pawan Kachhwaha", "Dilip Barot", "Hariram Suthar", "Bhanwar Lal Jat", "Chandrakant Mahajan",
    "Pratap Rathod", "Shivraj Chandel", "Damodar Acharya", "Narottam Nayak", "Mahendra Behera",
    "Pradeep Mahapatra", "Ranjit Pradhan", "Subrat Mishra", "Bikash Sahu", "Tapan Nayak",
    "Jayanta Rout", "Basudev Panda", "Arif Hussain", "Shakil Ahmad", "Fahad Ansari",
    "Taufiq Shaikh", "Sarfaraz Khan", "Azeem Qadri", "Nadeem Akhtar", "Aamir Siddiqui",
    "Suhail Khan", "Firoz Alam", "Armaan Farooqui", "Junaid Alam", "Nawab Hussain",
    "Zaki Ansari", "Adnan Farooqui", "Shayan Khan", "Shadab Alam", "Ayaan Farooqui",
    "Rehan Akhtar", "Tanzeem Khan", "Furkan Qureshi", "Aatif Siddiqui", "Rizwan Alam",
    "Sufyan Khan", "Shariq Hussain", "Faheem Akhtar", "Aqdas Ansari", "Noman Farooqui",
    "Shavez Khan", "Sameer Alam", "Mubeen Qureshi", "Aslam Hussain", "Yasir Siddiqui",
    "Shadan Khan", "Zeeshan Alam", "Aariz Ansari", "Ahsan Farooqui", "Saif Khan",
    "Muzammil Alam", "Aadil Siddiqui", "Shan Qureshi", "Arham Khan", "Aatif Alam",
    "Furqan Siddiqui", "Rayan Ansari", "Imteyaz Khan", "Shahnawaz Qureshi", "Parvez Alam",
    "Naseem Akhtar", "Tariq Hussain", "Ritesh Choube", "Karan Rathi", "Shahid Usmani",
    "Mangesh Shirole", "Vikrant Nikam", "Aqeel Ahmed", "Sambhaji Gaikwad", "Nitin Borse",
    "Haroon Rashid", "Prakash Borse", "Aniket Dhumal", "Amanullah Khan", "Sudarshan Kale",
    "Rohit Ingle", "Sajid Usmani", "Dattatray Shirsat", "Madhukar Bhosale", "Nafees Ahmad",
    "Abhay Wankhede", "Shivendra Bundela", "Fahim Akram", "Ganesh Mhatre", "Vilas Thorat",
    "Shoaib Akhtar", "Nandkishor Chikte", "Umesh Dongre", "Rauf Ahmed", "Balkrishna Chitale",
    "Shubham Khairnar", "Naved Parveen", "Ravikant Sonkar", "Chandrashekhar Karande", "Zubair Ahmad",
    "Mohan Tembhurne", "Prashant Meshram", "Ahtesham Ali", "Girish Rane", "Tukaram Koli",
    "Riyazuddin Khan", "Babulal Sen", "Rupesh Netam", "Sakib Usmani", "Jagannath Mahato",
    "Tarachand Bhoi", "Waseem Akram", "Mithilesh Mandal", "Suresh Hazarika", "Junaid Ashraf",
    "Pritam Basumatary", "Keshab Kalita", "Arsalan Ahmed", "Bhaben Gogoi", "Manab Deka",
    "Noman Ashraf", "Dipankar Saikia", "Rituraj Borthakur", "Suhail Parveen", "Tirthankar Debnath",
    "Sanjib Kar", "Faiz Alam", "Prasenjit Debbarma", "Kaushik Tripura", "Shariq Ahmed",
    "Nilotpal Neog", "Utpal Bora", "Yameen Ashraf", "Debojit Nath", "Himadri Talukdar",
    "Arman Usmani", "Rakesh Karmakar", "Subhash Biswas", "Tanzeel Alam", "Bikramjit Deori",
    "Parag Medhi", "Ayaan Rashid", "Goutam Barman", "Sudip Sutradhar", "Mubeen Ahmed",
    "Kunal Lahiri", "Tapan Naskar", "Firoz Parveen", "Arup Bhowmik", "Jaydeep Rakshit",
    "Sufiyan Akram", "Nirmal Deb", "Rajat Malakar", "Asif Usmani", "Debashis Paul",
    "Prabir Shil", "Naseem Alam", "Anupam Saha", "Tapas Adhikary", "Rizwan Ahmed",
    "Biplab Dhar", "Santanu Koley", "Faizan Rashid", "Ujjwal Karfa", "Pranab Maiti",
    "Azeem Ashraf", "Soumen Jana", "Biswaroop De", "Mahipal Shekhawat", "Iqbal Nizami",
    "Devendra Poonia", "Samiullah Faridi", "Jagmohan Beniwal", "Shamim Raza", "Surendra Godara",
    "Aaquib Nadvi", "Hanuman Charan", "Nafees Rizvi", "Balveer Jakhar", "Shariq Warsi",
    "Ratan Bhakar", "Ayan Rizvi", "Khemraj Mirdha", "Furkan Nadvi", "Girdhari Mahla",
    "Rashid Warsi", "Bhanwar Puniya", "Talib Rizvi", "Lalit Saran", "Aasim Faridi",
    "Rohtash Dhaka", "Moin Warsi", "Vijendra Peelwa", "Suhail Rizvi", "Narpat Khichar",
    "Arbaz Nadvi", "Shyoji Ram Sihag", "Azeem Faridi", "Rajveer Dudi", "Faheem Warsi",
    "Mukesh Pachar", "Noman Rizvi", "Omveer Jakasaniya", "Aatif Nadvi", "Kuldeep Legha",
    "Tahir Faridi", "Himmatram Bhamu", "Aqib Warsi", "Dharmpal Burdak", "Javed Rizvi",
    "Brijlal Karwasra", "Aadil Nadvi", "Sumer Poonia", "Shahid Faridi", "Madan Makkasar",
    "Anas Warsi", "Ravindra Takhar", "Yusuf Rizvi", "Bhagirath Matoria", "Saad Nadvi",
    "Gopal Siyag", "Zayan Faridi", "Ramkumar Bhadu", "Naeem Warsi", "Shankar Joon",
    "Huzaifa Rizvi", "Bhanwarlal Bajiya", "Ayaan Nadvi", "Mahendra Saran", "Zubair Faridi",
    "Jagdish Gathala", "Fais Warsi", "Ramlal Kookna", "Sameer Rizvi", "Pukhraj Dular",
    "Arham Nadvi", "Kailash Tetarwal", "Muzammil Faridi", "Gajsingh Bhakar", "Rehan Warsi",
    "Tejpal Dhaka", "Aariz Rizvi", "Vikram Mirdha", "Shadab Nadvi", "Bhupsingh Poonia",
    "Rizwan Faridi", "Narendra Legha", "Danish Warsi", "Harphool Sihag", "Asif Rizvi",
    "Jitendra Godara", "Shan Nadvi", "Moolchand Jakhar", "Ahsan Faridi", "Suresh Beniwal",
    "Faizan Warsi", "Manphool Dudi", "Imran Rizvi", "Rajendra Burdak", "Sufyan Nadvi",
    "Hanuman Mahla", "Arsalan Faridi", "Mukhtyar Pachar", "Shahrukh Warsi", "Girdharilal Bajiya",
    "Fardeen Rizvi", "Omprakash Kookna", "Tanzeel Nadvi", "Bhoopendra Gathala", "Raghunandan Kharol",
    "Vardhan Bisen", "Yatendra Baghel", "Tribhuvan Markam", "Mustafa Hashmi", "Bhairav Kanwar",
    "Kuber Netam", "Dushyant Uikey", "Jeevan Tekam", "Arif Chishti", "Harendra Porte",
    "Bhupat Maravi", "Ramlakhan Dhurve", "Nakul Salam", "Gokul Mandavi", "Vishram Korram",
    "Aamir Noori", "Devcharan Kawasi", "Mithlesh Potai", "Narayan Atram", "Pratap Kumeti",
    "Kailash Nagvanshi", "Mahesh Uke", "Qasim Chishti", "Rajkumar Gedam", "Puran Meshram",
    "Tikaram Markole", "Satyendra Baghmare", "Dinesh Kawde", "Chhotelal Pusam", "Shivprasad Naitam",
    "Sajjad Hashmi", "Gajraj Sidar", "Bhanu Pratap Sonwani", "Ramesh Neti", "Devvrat Kunjam",
    "Harinarayan Dhurwe", "Laxmikant Uikey", "Nandlal Atram", "Bhimsen Kawasi", "Damodar Kumre",
    "Zain Noori", "Shivkumar Potavi", "Premsingh Markam", "Ganesh Poyam", "Ramlal Kunjam",
    "Chandrakant Salam", "Bhaskar Marai", "Dharamlal Uike", "Kishore Pusam", "Ayaan Hashmi",
    "Rafi Chishti", "Shayan Noori", "Faiz Hashmi", "Asrar Chishti", "Talha Noori",
    "Noman Hashmi", "Reyan Chishti", "Sufyan Noori", "Zeeshan Hashmi", "Yameen Chishti",
    "Aqeel Noori", "Junaid Hashmi", "Ruhan Chishti", "Ahsan Noori", "Arham Hashmi",
    "Saif Chishti", "Aatif Noori", "Mubeen Hashmi", "Shadman Chishti", "Naeem Noori",
    "Arsalan Hashmi", "Adil Chishti", "Faizan Noori", "Tanzeel Hashmi", "Furqan Chishti",
    "Shariq Noori", "Aariz Hashmi", "Rizwan Chishti", "Hamza Noori", "Parvez Hashmi",
    "Yusuf Chishti", "Naved Noori", "Azeem Hashmi", "Shahid Chishti", "Sohail Noori",
    "Imteyaz Hashmi", "Aman Chishti", "Waseem Noori", "Fahad Chishti", "Shahrukh Noori",
    "Asif Hashmi", "Rituraj Kapse", "Manvendra Jhala", "Dharamveer Kataria", "Nikhilesh Dongardive",
    "Pradyumn Chandel", "Lokendra Hada", "Yograj Devda", "Shivraj Kachhi", "Bhavesh Dholakia",
    "Anurag Kapse", "Hemraj Baria", "Tushar Vasava", "Chetan Gamit", "Jignesh Rabari",
    "Mahipal Charan", "Devashish Munda", "Rakesh Tanti", "Prabhat Oraon", "Niraj Hansda",
    "Kamal Hojam", "Mubashir Kazmi", "Aadil Naqvi", "Rameez Bukhari", "Arbaz Kazmi",
    "Sarmad Naqvi", "Huzefa Bukhari", "Faheem Kazmi", "Taha Naqvi", "Aarish Bukhari",
    "Moin Kazmi", "Rudransh Katoch", "Nakul Jamwal", "Yashwant Dogra", "Praveen Thapa",
    "Dheerendra Rawal", "Mahesh Paneru", "Rajat Bisht", "Sudarshan Lohani", "Pankaj Fartyal",
    "Vinod Karki", "Shahnawaz Kazmi", "Rehmat Naqvi", "Nabeel Bukhari", "Ayaan Kazmi",
    "Sufiyan Naqvi", "Zayan Bukhari", "Mudassir Kazmi", "Rayyan Naqvi", "Arham Bukhari",
    "Talib Kazmi", "Harshad Zala", "Mukund Vekariya", "Nitin Korat", "Bharat Makwana",
    "Vipul Kathiriya", "Jaydev Savaliya", "Ketan Mangukiya", "Mitesh Donga", "Paresh Sorathiya",
    "Ravindra Vachhani", "Arshed Naqvi", "Ahtesham Bukhari", "Sajjad Kazmi", "Tanzeem Naqvi",
    "Noman Bukhari", "Fardeen Kazmi", "Yameer Naqvi", "Huzaifa Bukhari", "Shayaan Kazmi",
    "Ruhan Naqvi", "Aniket Bhalerao", "Sachindra Gawande", "Rohidas Khobragade", "Mangesh Atram",
    "Prakash Madavi", "Nandkishor Gedam", "Sopan Meshram", "Ganpat Uikey", "Ravikant Pusam",
    "Shivkumar Korram", "Aqdas Bukhari", "Jibran Kazmi", "Sameeh Naqvi", "Ayan Bukhari",
    "Faiyaz Kazmi", "Ariz Naqvi", "Naeem Bukhari", "Rafe Kazmi", "Tameem Naqvi",
    "Zubyan Bukhari", "Dattatray Ingole", "Balkrishna Waghmare", "Gajanan Lande", "Sanjay Kakde",
    "Vilas Nagrale", "Madhukar Kharat", "Pandurang Shingade", "Eknath Dhengre", "Ashok Bopche",
    "Namdeo Wankhade", "Satyajeet Mohite", "Raviraj Nalawade", "Pruthviraj Shirke", "Shailendra Chavan",
    "Abhijit Barge", "Tanmay Jagtap", "Vaibhav Khade", "Nilesh Ghorpade", "Ruturaj Mohol",
    "Sanket Dabhade", "Mujtaba Rizwan", "Shayan Qadri", "Hammad Firdausi", "Armaan Nizari",
    "Zarar Husaini", "Areeb Madani", "Daniyal Faruqi", "Uzair Abbasi", "Sahil Rizvi",
    "Basit Kashmiri", "Pranay Kshirsagar", "Anand Bawane", "Tejendra Bhoyar", "Rameshwar Dhote",
    "Yuvraj Khandekar", "Rohidas Futane", "Sharad Bisenkar", "Mahadev Tidke", "Vikasrao Wagh",
    "Ganeshrao Katre", "Ibrahim Nizami", "Ammar Firdausi", "Mahir Qadri", "Zayan Husaini",
    "Rayan Abbasi", "Shaheer Faruqi", "Afnan Madani", "Taha Rizwan", "Eesa Kashmiri",
    "Zubair Nizari", "Siddhesh Surve", "Akshay Dalvi", "Omraj Palav", "Shubhransh Naik",
    "Nikhil Rautela", "Parag Bhagat", "Mohan Kene", "Vivek Mestri", "Suhas Tandel",
    "Prasad Parab", "Sarmad Abbasi", "Ramees Husaini", "Aariz Faruqi", "Junaid Nizami",
    "Haseeb Qadri", "Arsham Rizwan", "Tameem Firdausi", "Aahil Madani", "Zavian Kashmiri",
    "Jaspreet Dhillon", "Ashutosh Mishra", "Ravi Teja Reddy", "Bhavesh Desai", "Sunil Hembrom",
    "Pradeep Narayanan", "Sukhdeep Grewal", "Rohit Pandey", "Nagarjuna Chowdary", "Kalpesh Trivedi",
    "Ajay Tudu", "Senthil Kumar", "Amritpal Sidhu", "Shivam Tripathi", "Harsha Varma",
    "Mitesh Joshi", "Mahesh Murmu", "Balasubramanian Pillai", "Navjot Randhawa", "Aditya Awasthi",
    "Sai Charan Goud", "Paresh Bhatt", "Dilip Baskey", "Arunachalam Nair", "Parminder Pannu",
    "Satyam Chaubey", "Kiran Kumar Reddy", "Nirav Vyas", "Ramesh Hansda", "Sivakumar Swaminathan",
    "Gagandeep Cheema", "Umesh Pathak", "Raghavendra Yadav", "Jayesh Amin", "Birsa Toppo",
    "Thangaraj Srinivasan", "Kulwinder Sekhon", "Prashant Dixit", "Lokesh Babu", "Chirag Panchal",
    "Anil Kisku", "Ravichandran Mahadevan", "Hardeep Virk", "Abhinav Bajpai", "Madhusudhan Rao",
    "Hemal Modi", "Sanjay Lakra", "Suresh Balan", "Amandeep Toor", "Deepak Tiwari",
    "Krishna Murthy", "Ketan Gandhi", "Vinod Kerketta", "Murugan Rajan", "Rajwinder Mann",
    "Nitesh Shukla", "Manoj Reddy", "Vipul Dave", "Arvind Minz", "Selvaraj Ganesan",
    "Jatinder Chahal", "Akhilesh Upadhyay", "Praveen Naidu", "Hitesh Parekh", "Raju Oraon",
    "Periyasamy Kannan", "Gurpreet Bajwa", "Rajat Srivastava", "Anand Raju", "Nakul Patel",
    "Shankar Tirkey", "Elango Venkataraman", "Sandeep Dhaliwal", "Vikas Pande", "Tarun Chowdhury",
    "Rutvik Solanki", "Mukesh Barla", "Kumaravel Arumugam", "Harjit Bains", "Piyush Tandon",
    "Chandra Sekhar Reddy", "Yash Bhavsar", "Ajit Kujur", "Arulmozhi Natarajan", "Dineshvel Muthukrishnan",
    "Jegadeesh Perumal", "Kumaran Thirumalai", "Madhan Velmurugan", "Prabhakaran Annamalai", "Yuvaraj Chockalingam",
    "Boopathi Palanisamy", "Manikandan Alagappan", "Sathishkumar Dhanapal", "Tejas Bhogayata", "Maulik Kansara",
    "Viral Chokshi", "Ruturaj Vaghasiya", "Krunal Zaveri", "Devang Majmudar", "Nisarg Jani",
    "Parthiv Kothari", "Harit Bhayani", "Meet Sanghvi", "Pavan Kalyan Guntur", "Sandeep Penmetsa",
    "Charan Veeramachaneni", "Lokesh Muppala", "Nikhil Velagapudi", "Tarak Kancherla", "Vamshi Katragadda",
    "Bhargav Pasupuleti", "Rakesh Adusumilli", "Phanindra Yarlagadda", "Jaskaran Chhina", "Lovepreet Deol",
    "Ranjodh Boparai", "Satnam Aulakh", "Gurkirat Samra", "Mandeep Basra", "Dilraj Heer",
    "Harjot Sohal", "Balraj Tiwana", "Inderpal Atwal", "Shubhendu Rastogi", "Naman Saxena",
    "Pratyush Nigam", "Anshul Agarwal", "Devendra Bhadouria", "Raghvendra Gautam", "Pushpendra Tomar",
    "Shailendra Chaubey", "Mayank Katiyar", "Vivekanand Purohit", "Sukhram Kandulna", "Babulal Purty",
    "Prakash Bodra", "Ramesh Pingua", "Nirmal Gagrai", "Ajay Surin", "Mangal Kandir",
    "Lukas Xalxo", "Mahadev Puran", "Doman Soy", "Aravindhan Chelladurai", "Muthuvel Pandiarajan",
    "Sarvesh Vora", "Dhruvin Rabari", "Jagadeesh Bommireddy", "Mahesh Kurella", "Amanpreet Bhullar",
    "Jatinder Sangha", "Pranjal Srivastava", "Ritesh Chitransh", "Karthirajan Somasundaram", "Senthooran Rajasekar",
    "Bhavin Lad", "Yatin Virani", "Sai Prudhvi Nalluri", "Chaitanya Mandava", "Sai Krishna Darsi",
    "Raghvendra Tandon", "Ajit Kujur", "Hemal Borad", "Faheem Ansari", "Subrat Pattnaik",
    "Ankan Ghosh", "Selvarasu Murugan", "Harmeet Sandha", "Rayan Qureshi", "Naveen Velagapudi",
    "Mayur Chaubey", "Roshan Kisku", "Kalpesh Kanani", "Asif Usmani", "Prasanta Lenka",
    "Sourav Mitra", "Velraj Chidambaram", "Rajwinder Johal", "Aadil Khan", "Phani Kalluri",
    "Vivek Srivastava", "Sanjay Baskey", "Yash Virani", "Sameer Akhtar", "Debajyoti Swain",
    "Agnivo Pal", "Karunanidhi Selvaraj", "Gurman Brar", "Fardeen Qureshi", "Praneel Veeramachaneni",
    "Anmol Pandey", "Kailash Xalxo", "Bhavin Makwana", "Rizwan Farooqui", "Prabhat Moharana",
    "Arka Nandi", "Muthuselvan Rajan", "Harjit Pannu", "Aamir Siddiqui", "Sai Karthik Kurella",
    "Rohit Awasthi", "Prakash Soy", "Nirav Ladani", "Shahid Ansari", "Rabin Pradhan", "Sapta"
];

    const randomNameIndex = Math.floor(Math.random() * dummyNames.length);
    const generatedName = dummyNames[randomNameIndex];
    const generatedId = Math.floor(1000000 + Math.random() * 9000000); 

    // 3. FakeUser Table mein add karo (Taaki Global List me dikhe)
    const FakeUser = require('../models/FakeUser');
    await FakeUser.create({
        userId: generatedId,
        name: generatedName,
        package: 30,
        country: "India",
        date: new Date() 
    });

    // =========================================================================
    // 🚀 NEW: GLOBAL TEAM GROWTH LOGIC (Jaise normal topup aur cron me hota hai)
    // =========================================================================
    const activeUsers = await User.find({ isToppedUp: true }).select('_id globalTeamCount directCount');
    const bulkOps = [];

    for (const user of activeUsers) {
        const team = user.globalTeamCount || 0;
        const directs = user.directCount || 0;
        
        let isLocked = false;
        
        // Locking conditions (Same as your cron logic)
        if (team === 2360 && directs < 6) isLocked = true;
        else if (team === 4360 && directs < 8) isLocked = true;
        else if (team === 7360 && directs < 10) isLocked = true;
        else if (team === 11360 && directs < 12) isLocked = true;
        else if (team === 16360 && directs < 14) isLocked = true;
        else if (team === 23860 && directs < 16) isLocked = true;
        else if (team === 33860 && directs < 18) isLocked = true;

        if (!isLocked) {
            bulkOps.push({
                updateOne: {
                    filter: { _id: user._id },
                    update: { $inc: { globalTeamCount: 1 } } // ✅ Sab eligible users ki team 1 se badha di
                }
            });
        }
    }

    if (bulkOps.length > 0) {
        await User.bulkWrite(bulkOps);
    }
    // =========================================================================

    // =========================================================================
    // 🚀 NEW: TOTAL COMMUNITY COUNT UPDATE (SystemStat)
    // Ye dashboard par total users ka count badhayega
    // =========================================================================
    const SystemStat = require('../models/SystemStat');
    await SystemStat.findOneAndUpdate(
        {}, 
        { $inc: { globalFakeCount: 1 } }, // Total community / Fake count ko +1 kar dega
        { upsert: true, returnDocument: 'after' }
    );
    // 4. Record Dummy Transaction (For Admin History)
    const Transaction = require('../models/Transaction'); 
    await Transaction.create({
      userId: generatedId,
      amount: Number(amount),
      type: "promo", 
      fromUserId: currentUser.userId,
      toUserId: generatedId,
      status: "success",
      description: `Promo showcase generated for Fake ID ${generatedId}`,
      date: new Date()
    });

    // 5. Success Response
    res.json({ 
        success: true, 
        generatedId: generatedId, 
        name: generatedName 
    });

  } catch (err) {
    console.error("Promo Showcase Error:", err);
    res.status(500).json({ message: "Server error during promo topup: " + err.message });
  }
});




 // Downline Team Business Details
router.get("/binary-summary/:userId", async (req, res) => {  
  try {
    const user = await User.findOne({ userId: Number(req.params.userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const strong = user.strongLegBusiness || 0;
    const weak   = user.weakLegBusiness || 0;

    const totalMatching = Math.min(strong, weak);
    const carryForward  = Math.abs(strong - weak);

    res.json({
      strongLegBusiness: strong,
      weakLegBusiness: weak,
      totalMatching,
      carryForward,

      // 🔷 current unreleased / available binary
      binaryIncome: user.binaryIncome || 0,

      // 🔥 VERY IMPORTANT FOR UI (eligibility)
      hasWithdrawn100: user.hasWithdrawn100 === true,

      // 🔥 optional (agar future me total released track karna ho)
      totalEarnedSoFar: user.totalBinaryEarned || user.binaryIncome || 0,
    });
  } catch (err) {
    console.error("Binary summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.get('/global-team-count/:userId', async (req, res) => {
  try {
    // System me total users
    const users = await User.find({}, { userId: 1, _id: 0 }).lean();
    const count = users.length;

    res.json({ count });
  } catch (err) {
    console.error('Error fetching global team count:', err);
    res.status(500).json({ message: 'Failed to fetch global team count' });
  }
});





// GET Downline Business
// 🚀 UPDATED (SUPER FAST): Downline Business Route
router.get("/downline-business/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    // 1. Find main user
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Sirf 1 DB call mein saari downline team nikal lo (GraphLookup)
    const teamResult = await User.aggregate([
      { $match: { userId: userId } },
      {
        $graphLookup: {
          from: "users",
          startWith: "$userId",
          connectFromField: "userId",
          connectToField: "sponsorId",
          as: "downline",
          maxDepth: 15, // 15 level deep tak ki team fetch karega
          depthField: "level"
        }
      }
    ]);

    // Agar downline nahi hai, toh empty data bhej do
    if (!teamResult || teamResult.length === 0 || !teamResult[0].downline) {
      return res.json({
        totalTopup: 0,
        totalWithdrawal: 0,
        totalBusiness: 0,
        totalTeamCount: 0,
        directCount: 0,
        indirectCount: 0,
        team: []
      });
    }

    const rawTeam = teamResult[0].downline;
    // Saare downline users ki ID ek array mein nikal lo
    const downlineUserIds = rawTeam.map(u => u.userId);

    // 3. Poori team ki transactions sirf 1 DB call mein nikal lo (Yahan loop khatam ho gaya!)
    const allTransactions = await Transaction.find({
      userId: { $in: downlineUserIds },
      type: { $in: ["topup", "withdrawal"] }
    }).lean().sort({ date: -1 });

    // 4. Transactions ko fast processing ke liye Map (Dictionary) mein daal lo
    const txMap = {};
    allTransactions.forEach(t => {
      if (!txMap[t.userId]) txMap[t.userId] = [];
      
      // Amount format fix
      let amt = t.amount;
      if (amt && typeof amt === "object") {
        amt = parseFloat(amt.toString());
      } else {
        amt = Number(amt || 0);
      }

      txMap[t.userId].push({
        type: t.type,
        amount: amt,
        date: t.date
      });
    });

    // 5. Final Calculations
    let totalSystemTopup = 0;
    let totalSystemWithdrawal = 0;
    let totalSystemBusiness = 0;
    let directCount = 0;
    let indirectCount = 0;

    const formattedTeam = rawTeam.map((u, idx) => {
      const actualLevel = (u.level || 0) + 1; // GraphLookup 0 se start karta hai
      
      if (actualLevel === 1) directCount++;
      else indirectCount++;

      const userTxs = txMap[u.userId] || [];
      
      let totalTopup = 0;
      let totalWithdrawal = 0;
      let totalBusiness = 0;

      userTxs.forEach(t => {
        if (t.type === "topup") totalTopup += t.amount;
        if (t.type === "withdrawal") totalWithdrawal += t.amount;
        totalBusiness += t.amount;
      });

      totalSystemTopup += totalTopup;
      totalSystemWithdrawal += totalWithdrawal;
      totalSystemBusiness += totalBusiness;

      return {
        userId: u.userId,
        name: u.name || "N/A",
        level: actualLevel,
        totalTopup,
        totalWithdrawal,
        totalBusiness,
        transactions: userTxs
      };
    });

    // Level ke hisaab se sort karo (Directs pehle aayenge)
    formattedTeam.sort((a, b) => a.level - b.level);

    // Frontend ke hisaab se srNo add karo
    const finalTeam = formattedTeam.map((u, idx) => ({
      srNo: idx + 1,
      ...u
    }));

    // 6. Return response
    res.json({
      totalTopup: totalSystemTopup,
      totalWithdrawal: totalSystemWithdrawal,
      totalBusiness: totalSystemBusiness,
      totalTeamCount: finalTeam.length,
      directCount,
      indirectCount,
      team: finalTeam
    });

  } catch (err) {
    console.error("Error fetching downline business:", err);
    res.status(500).json({ message: "Server error" });
  }
});




// 🔥 ADMIN ROUTE: Purane Missed Rewards Dilane Ke Liye (Bas Ek Baar Chalana Hai)
 


// routes/user.js
// ✅ UPDATED: Sponsor Name Fetch (Dono tables check karega)
router.get('/sponsor-name/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    // 1. Pehle 'User' (Real) collection mein dhoondo
    // Sirf 'name' select kar rahe hain taaki query fast ho
    let sponsor = await User.findOne({ userId: id }).select('name');

    // 2. 🔥 Agar Real mein nahi mila, toh 'FakeUser' table mein check karo
    if (!sponsor) {
      // Ensure karna ki FakeUser model upar require/import kiya hua hai
      if (typeof FakeUser !== 'undefined') {
        sponsor = await FakeUser.findOne({ userId: id }).select('name');
      } else if (typeof DummyUser !== 'undefined') {
        // Fallback agar galti se purana model use ho raha ho
        sponsor = await DummyUser.findOne({ userId: id }).select('name');
      }
    }

    // 3. Agar dono jagah nahi mila toh 404
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    // 4. Sirf naam bhej do (Frontend isi ka intezaar kar raha hai)
    res.json({ name: sponsor.name });

  } catch (err) {
    console.error("Sponsor Name Fetch Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ==========================================
// ✅ GET REWARD PROGRESS STATS API
// ==========================================
// ==========================================
// ✅ FAST: GET REWARD PROGRESS STATS API
// ==========================================
router.get('/reward-stats/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await User.findOne({ userId });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 FASTER WAY: Ek single database call se saari team nikal lo
    const result = await User.aggregate([
      { $match: { userId: userId } },
      {
        $graphLookup: {
          from: "users",
          startWith: "$userId",
          connectFromField: "userId",
          connectToField: "sponsorId",
          as: "fullTeam",
          maxDepth: 15,
          depthField: "level" // direct = level 0, indirect = level 1+
        }
      }
    ]);

    let teamSize30 = 0;
    let teamSize60 = 0;
    let teamSize120 = 0;
    let directs = [];

    // Memory (RAM) mein fast counting
    if (result.length > 0 && result[0].fullTeam) {
       const fullTeam = result[0].fullTeam;
       
       for (const member of fullTeam) {
           // Level 0 ka matlab Direct Member hai
           if (member.level === 0) {
               directs.push(member);
           } 
           // Level > 0 ka matlab Downline Team (indirects) hai
           else {
               const amt = member.topUpAmount || 0;
               if (amt >= 30) teamSize30++;
               if (amt >= 60) teamSize60++;
               if (amt >= 120) teamSize120++;
           }
       }
    }

    res.json({
      success: true,
      ownTopUpAmount: user.topUpAmount || 0,
      currentRanks: {
        managerRank: user.managerRank || 0,
        seniorManagerRank: user.seniorManagerRank || 0,
        executiveManagerRank: user.executiveManagerRank || 0
      },
      teamSizes: {
        30: teamSize30,
        60: teamSize60,
        120: teamSize120
      },
      directs: directs.map(d => ({
        topUpAmount: d.topUpAmount || 0,
        managerRank: d.managerRank || 0,
        seniorManagerRank: d.seniorManagerRank || 0,
        executiveManagerRank: d.executiveManagerRank || 0
      }))
    });

  } catch (err) {
    console.error("Reward Stats Error:", err);
    res.status(500).json({ message: "Server error fetching reward stats" });
  }
});
 
// ---------------------------
 

 


// ✅ UPDATED GET ROUTE: Supports both Real and Dummy Users
// Is file ke top par 'bot' import hona chahiye (jahan aapne bot setup kiya hai)
// const { bot } = require('../utils/telegramBot'); 

const mongoose = require('mongoose');
const sanitizeUser = require('../utils/sanitizeUser');

router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const rawUserId = req.params.userId;
    const loggedInUserId = Number(req.user.userId);

    // 🛡️ 1. Validation
    if (!rawUserId || rawUserId === "undefined") {
      return res.status(400).json({ success: false, message: 'User ID is missing' });
    }

    let query = {};
    let targetUserId = null;
    
    // 💡 2. Smart Detection
    if (mongoose.Types.ObjectId.isValid(rawUserId) && rawUserId.length === 24) {
      query = { _id: rawUserId };
    } else if (!isNaN(Number(rawUserId))) {
      targetUserId = Number(rawUserId);
      query = { userId: targetUserId };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    // 🔥 SECURITY LOCK: Sirf Admin ya wahi user apna data dekh sake
    if (req.user.role !== 'admin' && targetUserId && targetUserId !== loggedInUserId) {
        return res.status(403).json({ success: false, message: "Unauthorized: You can only view your own profile." });
    }

    // 3. Search Real User
    let user = await User.findOne(query).select('-password -transactionPassword -resetToken -__v');
    let isFake = false;
    
    // 🔥 4. Search Fake User if Real not found
    if (!user) {
        const FakeUser = require('../models/FakeUser');
        user = await FakeUser.findOne(query).select('-__v');
        
        if (!user && typeof DummyUser !== 'undefined') {
            user = await DummyUser.findOne(query).select('-__v');
        }

        if (user) {
            isFake = true;
            user = user.toObject ? user.toObject() : user;
            if (user.isToppedUp && (!user.packages || user.packages.length === 0)) {
                user.packages = [{ amount: user.topUpAmount || 30 }];
            }
        }
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 🏆 5. Sync Logic
    if (!isFake && user.totalRewardIncome === 0 && user.rewardIncome > 0) {
        user.totalRewardIncome = user.rewardIncome;
        await user.save();
    }

    // 💰 6. Response
    // res.json({ 
    //     success: true,
    //     user: user, 
    //     income: {
    //         totalDirectIncome: user.totalDirectIncome || user.directIncome || 0,
    //         totalLevelIncome: user.levelIncome || 0,
    //         totalRewardIncome: user.totalRewardIncome || user.rewardIncome || 0,
    //         totalIncome: (user.totalDirectIncome || 0) + (user.levelIncome || 0) + (user.totalRewardIncome || 0)
    //     }
    // });
    // 💰 6. Response
    res.json({ 
        success: true,
        user: user, 
        income: {
            totalDirectIncome: user.totalDirectIncome || user.directIncome || 0,
            
            // 🔥 FIX: Yahan user.totalLevelIncome add kar diya hai
            totalLevelIncome: user.totalLevelIncome || user.levelIncome || 0, 
            
            totalRewardIncome: user.totalRewardIncome || user.rewardIncome || 0,
            
            // 🔥 FIX: Total income mein bhi totalLevelIncome add kar diya
            totalIncome: (user.totalDirectIncome || 0) + (user.totalLevelIncome || user.levelIncome || 0) + (user.totalRewardIncome || 0)
        }
    });

  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ---------------------------
// 2. UPDATE PROFILE ROUTE - 🔥 SECURED
// ---------------------------
router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUserId = Number(req.params.userId);
    const loggedInUserId = Number(req.user.userId);

    // 🔥 SECURITY LOCK: Sirf Admin ya wahi user update kar sake
    if (req.user.role !== 'admin' && targetUserId !== loggedInUserId) {
        return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own profile." });
    }

    const { walletAddress, oldTxnPassword, name, email, mobile } = req.body;

    const user = await User.findOne({ userId: targetUserId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Transaction Password Verify
    if (!oldTxnPassword || oldTxnPassword !== user.transactionPassword) {
      return res.status(403).json({ message: 'Invalid Transaction Password.' });
    }

    // 🔒 PERMANENT WALLET LOCK & HISTORY LOGIC
    if (walletAddress && walletAddress.trim() !== '') {
      
      // Agar pehle se address hai aur wo change karne ki koshish kar raha hai, toh block karo
      if (user.walletAddress && user.walletAddress.trim() !== '' && walletAddress !== user.walletAddress) {
        return res.status(403).json({ message: 'Wallet Locked: Wallet address cannot be changed once it is set.' });
      }
      
      // Agar address khali tha, toh usko update karne do aur History mein daal do
      if (walletAddress !== user.walletAddress) {
        
        // 🔥 NAYA LOGIC: History array banaiye aur First-time entry daaliye
        if (!user.walletAddressHistory) {
            user.walletAddressHistory = [];
        }
        
        user.walletAddressHistory.push({
            address: walletAddress.trim(), // Jo naya address dala gaya hai
            changedAt: new Date(),
            updatedBy: "User" // 👈 User ne khud set kiya hai, ye track ho gaya
        });

        // Final address database mein save ho raha hai
        user.walletAddress = walletAddress.trim();
        user.walletAddressChangeCount = (user.walletAddressChangeCount || 0) + 1;
        user.walletAddressChangeWindowStart = new Date();
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', user: user });
  } catch (err) {
    console.error('Profile Update Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ---------------------------
// 3. CHECK WALLET
// ---------------------------
router.post('/check-wallet', async (req, res) => {
  const { walletAddress } = req.body;
  const exists = await User.findOne({ walletAddress });
  res.json({ exists: !!exists });
});


// ---------------------------
// 4. PASSWORD CHANGE - 🔥 SECURED WITH authMiddleware
// ---------------------------
router.put('/change-password/:userId', authMiddleware, async (req, res) => {
  const targetUserId = Number(req.params.userId);
  const loggedInUserId = Number(req.user.userId);

  // 🔥 SECURITY LOCK: Sirf apna password badal sakta hai
  if (req.user.role !== 'admin' && targetUserId !== loggedInUserId) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
  }

  const { oldPassword, newPassword, oldTxnPassword, newTxnPassword } = req.body;
  
  try {
    const user = await User.findOne({ userId: targetUserId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (oldPassword && newPassword) {
      if (oldPassword !== user.password) {
        return res.status(403).json({ message: 'Incorrect old login password' });
      }
      user.password = newPassword; 
    }

    if (oldTxnPassword && newTxnPassword) {
      if (oldTxnPassword !== user.transactionPassword) {
        return res.status(403).json({ message: 'Incorrect old transaction password' });
      }
      user.transactionPassword = newTxnPassword; 
    }

    await user.save();
    res.json({ message: 'Password(s) updated successfully' });

  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
 

// Ye aapki file ki sabse aakhiri line honi chahiye 👇
module.exports = router;