// C:\Users\HP\Desktop\crowdone\backend\controllers\userController.js
const User = require('../models/User');
const sanitizeUser = require('../utils/sanitizeUser');
const SystemStat = require('../models/SystemStat'); // 👈 SystemStat import kiya hai fake count ke liye

// 🔍 1. Get User By ID (Ye function frontend Dashboard se call hota hai)
exports.getUserById = async (req, res) => {
  try {
    // 🔥 BUG 1 & 2 FIX: Route se ID nikal kar usko thik se NUMBER mein convert karna
    const rawId = req.params.userId || req.params.id; 
    const targetUserId = Number(rawId);

    // Agar ID valid number nahi hai toh yahi block kar do
    if (!targetUserId) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const user = await User.findOne({ userId: targetUserId }).select("+usdtBep20Balance");
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // 🔥 Total Real Users ka count nikalna
    const totalRealUsers = await User.countDocuments({ isToppedUp: true });

    // 🔥 Total Fake Users (Cron wala) ka count nikalna
    const stat = await SystemStat.findOne();
    const globalFakeCount = stat ? stat.globalFakeCount : 0; 

    // ✅ FIX: sanitizeUser package details hata raha tha, isliye hum manually attach kar rahe hain
    const sanitizedUserData = sanitizeUser(user);
    sanitizedUserData.highestPackage = user.highestPackage || 0;
    sanitizedUserData.topUpAmount = user.topUpAmount || 0;
    sanitizedUserData.packages = user.packages || [];
    sanitizedUserData.directCount = user.directCount || 0;
    sanitizedUserData.globalTeamCount = user.globalTeamCount || 0;
    sanitizedUserData.isToppedUp = user.isToppedUp || false;

    // Frontend ko user data, real count, aur fake count ek sath bhejo
    res.json({
      success: true,
      user: sanitizedUserData, // 👈 Ab sahi data jayega
      totalRealUsers: totalRealUsers, 
      globalFakeCount: globalFakeCount 
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