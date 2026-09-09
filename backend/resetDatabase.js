require('dotenv').config(); // Path change: Ab ye direct utha lega
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Path change: Ab ek dot (.) lagega kyunki models same bahar wale folder me hain
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Withdrawal = require('./models/Withdrawal');
const SystemStat = require('./models/SystemStat');

const resetDatabase = async () => {
    try {
        console.log("⏳ Connecting to Database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected!");

        console.log("🚨 WARNING: Starting Database Backup & Reset process...");

        // ==========================================
        // 💾 STEP 1: CREATE BACKUPS
        // ==========================================
        console.log("💾 Creating Backups...");
        const backupDir = path.join(__dirname, 'backups');
        
        try {
            await fs.access(backupDir);
        } catch {
            await fs.mkdir(backupDir);
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // 1. Backup Transactions
        const transactionsToBackup = await Transaction.find({ type: { $ne: 'withdrawal_request' } });
        await fs.writeFile(
            path.join(backupDir, `transactions_backup_${timestamp}.json`), 
            JSON.stringify(transactionsToBackup, null, 2)
        );
        console.log(`📁 Saved ${transactionsToBackup.length} Transactions to backup.`);

        // 2. Backup System Stats
        const statsToBackup = await SystemStat.find({});
        await fs.writeFile(
            path.join(backupDir, `systemstats_backup_${timestamp}.json`), 
            JSON.stringify(statsToBackup, null, 2)
        );
        console.log(`📁 Saved System Stats to backup.`);

        // 3. Backup All Users
        const usersToBackup = await User.find({});
        await fs.writeFile(
            path.join(backupDir, `users_backup_${timestamp}.json`), 
            JSON.stringify(usersToBackup, null, 2)
        );
        console.log(`📁 Saved ${usersToBackup.length} Users to backup.`);

        console.log("✅ All Backups Created Successfully! Now starting deletion...");

        // ==========================================
        // 🗑️ STEP 2: CLEAR TRANSACTIONS & STATS
        // ==========================================
        console.log("🗑️ Deleting Top-up & Income Transactions (Keeping Withdrawal History Safe)...");
        await Transaction.deleteMany({ type: { $ne: 'withdrawal_request' } });
        
        console.log("🗑️ Resetting System Stats...");
        await SystemStat.deleteMany({});

        // ==========================================
        // ♻️ STEP 3: RESET USERS
        // ==========================================
        console.log("♻️ Resetting all Users...");
        
        const updateResult = await User.updateMany(
            {}, 
            {
                $set: {
                    walletBalance: 0,
                    directIncome: 0,
                    totalDirectIncome: 0,
                    levelIncome: 0,
                    totalLevelIncome: 0,
                    rewardIncome: 0,
                    totalRewardIncome: 0,
                    roiIncome: 0,
                    totalRoiIncome: 0,
                    matchingRoiIncome: 0,
                    totalMatchingRoiIncome: 0,
                    upgradeBounceBackIncome: 0,
                    totalUpgradeBounceBackIncome: 0,
                    
                    isToppedUp: false,
                    highestPackage: 0,
                    topUpAmount: 0,
                    topUpDate: null,
                    packages: [],
                    purchasedPackages: [],
                    activePools: [],
                    
                    directCount: 0,
                    globalTeamCount: 0,
                    
                    role: 'user'
                },
                $unset: {
                    packageStats: ""
                }
            }
        );

        console.log(`✅ Success! Reset ${updateResult.modifiedCount} users.`);
        
        // ==========================================
        // 👑 STEP 4: RESTORE ROOT USER
        // ==========================================
        console.log("👑 Checking Root User (100000)...");
        const rootUser = await User.findOne({ userId: 100000 });
        if (rootUser) {
            rootUser.isActive = true;
            await rootUser.save();
            console.log("✅ Root User confirmed.");
        } else {
             console.log("⚠️ Root User (100000) not found.");
        }

        console.log("🎉 DATABASE RESET & BACKUP COMPLETE!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Reset Error:", err);
        process.exit(1);
    }
};

resetDatabase();