// File Name: fixData.js (Project ke main folder mein banayein)
const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config(); // Agar aapka MONGO_URI .env mein hai

// Apne User model ka sahi path yahan dalein (Check kar lena folder structure)
const User = require('./models/User'); 

// Terminal se Yes/No input lene ke liye setup
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const fixWrongPools = async () => {
    try {
        console.log("⏳ Connecting to Database...");
        // Apna MongoDB Connection string yahan check karein. Agar .env me hai to process.env.MONGO_URI use hoga
        const DB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/worldfinance"; 
        await mongoose.connect(DB_URI);
        console.log("✅ Database Connected!\n");

        console.log("🔍 Scanning for users with wrong pool incomes...");
        const users = await User.find({ "activePools.0": { $exists: true } });
        
        let usersToFix = [];
        let totalSystemRecovery = 0;

        for (let user of users) {
            let amountToDeduct = 0;
            let validPools = [];
            let isModified = false;

            for (let pool of user.activePools) {
                const pkgAmount = pool.packageAmount || 30; 
                const actualLevel = pool.packageAmount ? pool.level : 1; 

                let userDirects = 0;
                if (pkgAmount === 30) {
                    userDirects = user.packageStats?.[pkgAmount]?.directCount || user.directCount || 0;
                } else {
                    userDirects = user.packageStats?.[pkgAmount]?.directCount || 0;
                }

                // Agar Directs kam hain ya purana "level: 30" wala bug hai
                if (userDirects < actualLevel || pool.level === 30) {
                    if (pool.daysPaid > 0) {
                        const wrongIncome = pool.dailyAmount * pool.daysPaid;
                        amountToDeduct += wrongIncome;
                    }
                    isModified = true;
                } else {
                    validPools.push(pool);
                }
            }

            if (isModified) {
                totalSystemRecovery += amountToDeduct;
                usersToFix.push({
                    documentId: user._id,
                    userId: user.userId,
                    name: user.name,
                    directs: user.directCount,
                    poolIncomeDeduction: Number(amountToDeduct.toFixed(4)),
                    newValidPools: validPools
                });
            }
        }

        if (usersToFix.length === 0) {
            console.log("🎉 Sab kuch theek hai! Kisi bhi user ko galat paisa nahi gaya hai.");
            process.exit(0);
        }

        // 📊 LIST DIKHAO
        console.log(`\n🚨 FOUND ${usersToFix.length} USERS WITH WRONG POOLS 🚨`);
        console.table(usersToFix.map(u => ({
            "User ID": u.userId,
            "Name": u.name,
            "Total Directs": u.directs,
            "Money To Deduct ($)": u.poolIncomeDeduction
        })));
        console.log(`💰 Total System Recovery: $${totalSystemRecovery.toFixed(2)}\n`);

        // ❓ YES OR NO CONFIRMATION
        rl.question('⚠️ Kya aap in users ka paisa katna aur galat pool hatana chahte hain? (Type YES or NO): ', async (answer) => {
            if (answer.trim().toUpperCase() === 'YES') {
                console.log("\n⚙️ Processing database updates...");
                
                let bulkOps = [];
                for (let u of usersToFix) {
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: u.documentId },
                            update: { 
                                $inc: { poolIncome: -u.poolIncomeDeduction },
                                $set: { activePools: u.newValidPools }
                            }
                        }
                    });
                }

                if (bulkOps.length > 0) {
                    await User.bulkWrite(bulkOps);
                }

                console.log("✅ DEDUCTION SUCCESSFUL! Database is now clean.");
            } else {
                console.log("\n❌ OPERATION CANCELLED! Database ko touch nahi kiya gaya.");
            }
            
            rl.close();
            mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        console.error("Error running script:", error);
        process.exit(1);
    }
};

fixWrongPools();