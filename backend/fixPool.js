require('dotenv').config(); // 🔥 ENV file load karne ke liye
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User'); // Apne User model ka path sahi set karein
const Transaction = require('./models/Transaction'); 

// 🛑 ENV SE MONGO URI LIYA 🛑
const MONGO_URI = process.env.MONGO_URI; 

if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is missing in your .env file!");
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runFixer() {
    try {
        console.log("⏳ Connecting to Database...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Database Connected!\n");

        console.log("🔍 Scanning users for wrongful Pool Income...");
        const users = await User.find({ "activePools.0": { $exists: true } });

        let totalAffectedUsers = 0;
        let totalWrongAmountPaid = 0;
        let usersToFix = [];

        for (let user of users) {
            let userWrongAmount = 0;
            let validPools = [];

            for (let pool of user.activePools) {
                if (pool.status !== 'ACTIVE' && pool.status !== 'COMPLETED') continue;

                let pkg = pool.packageAmount || 30; // Default 30
                let reqDirects = pool.level; // Level 1 = 1 direct, Level 5 = 5 direct

                // User ke paas us package ke kitne direct hain?
                let userDirectsForPackage = 0;
                if (pkg === 30) {
                    userDirectsForPackage = user.packageStats?.[30]?.directCount || user.directCount || 0;
                } else {
                    userDirectsForPackage = user.packageStats?.[pkg]?.directCount || 0;
                }

                // Agar Direct kam hain Level se, toh yeh pool GALAT hai!
                if (userDirectsForPackage < reqDirects) {
                    let amountPaidForThisPool = pool.daysPaid * pool.dailyAmount;
                    userWrongAmount += amountPaidForThisPool;
                } else {
                    validPools.push(pool); // Ye pool theek hai
                }
            }

            if (userWrongAmount > 0) {
                totalAffectedUsers++;
                totalWrongAmountPaid += userWrongAmount;
                usersToFix.push({ user, userWrongAmount, validPools });
            }
        }

        console.log("==========================================");
        console.log(`🚨 REPORT: WRONGFUL POOL INCOME DETECTED 🚨`);
        console.log(`👤 Total Users Affected: ${totalAffectedUsers}`);
        console.log(`💸 Total Wrong Fund Distributed: $${totalWrongAmountPaid.toFixed(2)}`);
        console.log("==========================================\n");

        if (totalAffectedUsers === 0) {
            console.log("✅ Sab kuch theek hai! Koi galat pool nahi mila.");
            process.exit(0);
        }

        // CONFIRMATION PROMPT
        rl.question(`⚠️ Are you sure you want to DEDUCT $${totalWrongAmountPaid.toFixed(2)} and RESET their pools? Type 'yes' or 'no': `, async (answer) => {
            if (answer.toLowerCase() === 'yes') {
                console.log("\n🛠️ Fixing Database... Please wait.");
                
                for (let data of usersToFix) {
                    const { user, userWrongAmount, validPools } = data;

                    // 1. Unke valid pools wapas set karo (Galat wale hat jayenge / 0 ho jayenge)
                    user.activePools = validPools;

                    // 2. Unki Total Pool Income me se galat amount minus karo
                    user.poolIncome = Math.max(0, (user.poolIncome || 0) - userWrongAmount);

                    // 3. Ek system transaction generate karo taaki ledger balance barabar rahe
                    await Transaction.create({
                        userId: user.userId,
                        type: 'manual_debit',
                        source: 'admin',
                        amount: userWrongAmount,
                        description: `System Correction: Deducted wrongfully credited Pool Income (Missing Directs).`,
                        status: 'success'
                    });

                    await user.save();
                }
                
                console.log(`✅ SUCCESS: ${totalAffectedUsers} Users Fixed! Wrong pools removed and balance deducted.`);
            } else {
                console.log("\n❌ Action Cancelled. Database was NOT changed.");
            }
            
            mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

runFixer();