// C:\Users\HP\Desktop\crowdone\backend\controllers\userController.js
const User = require('../models/User');
const sanitizeUser = require('../utils/sanitizeUser');
const SystemStat = require('../models/SystemStat'); // 👈 SystemStat import kiya hai fake count ke liye


 
// 🔍 1. Get User By ID (Ye function frontend Dashboard se call hota hai)
exports.getUserById = async (req, res) => {
  try {
    const rawId = req.params.userId || req.params.id; 
    const targetUserId = Number(rawId);

    if (!targetUserId) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const user = await User.findOne({ userId: targetUserId }).select("+usdtBep20Balance");
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const totalRealUsers = await User.countDocuments({ isToppedUp: true });
    
    // SystemStat ya Cron model ko fetch karein
//     const stat = await SystemStat.findOne();
//     const globalFakeCount = stat ? stat.globalFakeCount : 0; 

//     // 🔥 FIX: Mongoose se aaye data ko safely extract karna
//     const dbPackageStats = stat && stat.packageStats ? stat.packageStats : {};
//     const baseTotal = globalFakeCount + totalRealUsers;

//     // 🔥 Har Package ka All Crowd (Sabke liye alag-alag calculation).
//     // const globalStats = {
//     //     "30": { allCrowd: dbPackageStats["30"]?.allCrowd || (baseTotal > 0 ? baseTotal : 0) },
//     //     "100": { allCrowd: dbPackageStats["100"]?.allCrowd || Math.floor(baseTotal * 0.45) },
//     //     "300": { allCrowd: dbPackageStats["300"]?.allCrowd || Math.floor(baseTotal * 0.25) },
//     //     "500": { allCrowd: dbPackageStats["500"]?.allCrowd || Math.floor(baseTotal * 0.10) },
//     //     "1000": { allCrowd: dbPackageStats["1000"]?.allCrowd || Math.floor(baseTotal * 0.05) }
//     // };

//     const globalStats = {
//     "30": { allCrowd: dbPackageStats["30"]?.allCrowd ?? 50 },
//     "100": { allCrowd: dbPackageStats["100"]?.allCrowd ?? 15 },
//     "300": { allCrowd: dbPackageStats["300"]?.allCrowd ?? 5 },
//     "500": { allCrowd: dbPackageStats["500"]?.allCrowd ?? 2 },
//     "1000": { allCrowd: dbPackageStats["1000"]?.allCrowd ?? 1 }
// };

// SystemStat ya Cron model ko fetch karein
    const stat = await SystemStat.findOne();
    const globalFakeCount = stat ? stat.globalFakeCount : 0; 

    // 🔥 FIX: Mongoose Map se safe tarike se data nikalne ka tareeqa
    const pStats = stat && stat.packageStats ? stat.packageStats : null;

    // Helper function jo Map ya Object dono se value nikal lega
    const getCrowdVal = (key, defaultVal) => {
        if (!pStats) return defaultVal;
        let val = null;
        if (pStats instanceof Map) {
            val = pStats.get(key);
        } else {
            val = pStats[key];
        }
        return (val && typeof val.allCrowd === 'number') ? val.allCrowd : defaultVal;
    };

    const globalStats = {
        "30": { allCrowd: getCrowdVal("30", 50) },
        "100": { allCrowd: getCrowdVal("100", 15) },
        "300": { allCrowd: getCrowdVal("300", 5) },
        "500": { allCrowd: getCrowdVal("500", 2) },
        "1000": { allCrowd: getCrowdVal("1000", 1) }
    };
    
    const sanitizedUserData = sanitizeUser(user);
    sanitizedUserData.highestPackage = user.highestPackage || 0;
    sanitizedUserData.topUpAmount = user.topUpAmount || 0;
    sanitizedUserData.packages = user.packages || [];
    sanitizedUserData.purchasedPackages = user.purchasedPackages || [];
    
    // 🔥 Mongoose Map ko Plain Object me convert karke bhejna (taaki frontend easily read kar sake)
    sanitizedUserData.packageStats = user.packageStats instanceof Map ? Object.fromEntries(user.packageStats) : (user.packageStats || {});

    // Legacy support
    sanitizedUserData.directCount = user.directCount || 0;
    sanitizedUserData.globalTeamCount = user.globalTeamCount || 0;
    sanitizedUserData.isToppedUp = user.isToppedUp || false;

    res.json({
      success: true,
      user: sanitizedUserData, 
      totalRealUsers: totalRealUsers, 
      globalFakeCount: globalFakeCount,
      globalStats: globalStats // 👈 Ab har package ka separate "All Crowd" isme jayega
    });
  } catch (err) {
    console.error("Dashboard Fetch Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
// 👤 2. Get Sponsor Name (Registration Verification ke liye)
exports.getSponsorName = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await User.findOne({ userId: parseInt(id) });
    
    if (!sponsor) {
      return res.status(404).json({ message: 'Invalid Sponsor' });
    }
    
    res.json({ name: sponsor.name });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sponsor' });
  }
};

// 🔒 3. Block user (Admin Access)
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.id },
      { isBlocked: true },
      { returnDocument: 'after' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User blocked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔓 4. Unblock user (Admin Access)
exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.id },
      { isBlocked: false },
      { returnDocument: 'after' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unblocked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 📋 5. Get all users (Admin Access)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ userId: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};