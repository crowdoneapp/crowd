require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// 🔥 .env se MONGO URI uthao
const MONGO_URI = process.env.MONGO_URI; 

// 🔥 APNE MODELS KA PATH SAHI KAR LENA
const User = require('./models/User'); 
const Transaction = require('./models/Transaction'); 

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function fixMissingIncome() {
    if (!MONGO_URI) {
        console.error("❌ Error: MONGO_URI is missing in .env file!");
        process.exit(1);
    }

    try {
        console.log("⏳ Connecting to Database...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Database Connected Successfully!\n");

        console.log("⏳ Fetching all users and building tree... Please wait.");
        
        // 1. Saare users utha lo taaki calculation fast ho (Memory me map banayenge)
        const allUsers = await User.find().lean();
        const userMap = new Map();
        for (let u of allUsers) {
            userMap.set(u.userId, u);
        }

        const targetRoles = ['setup', 'supersetup', 'super_setup'];
        const expectedIncomes = {}; // Format: { userId: { direct: 0, level: 0 } }

        // 2. Har Topped-Up user ke liye uske uplines ka income calculate karo
        for (let user of allUsers) {
            if (!user.isToppedUp) continue;

            // Agar packages array nahi hai, toh fallback me topUpAmount le lo
            let packagesToProcess = user.packages && user.packages.length > 0 
                                    ? user.packages 
                                    : (user.topUpAmount > 0 ? [{ amount: user.topUpAmount }] : []);

            for (let pkg of packagesToProcess) {
                const amount = Number(pkg.amount);
                if (!amount) continue;

                // ==========================================
                // 🔥 DIRECT INCOME (LEVEL 1) - 10%
                // ==========================================
                let sponsorId = user.sponsorId;
                let sponsor = userMap.get(sponsorId);

                if (sponsor && targetRoles.includes((sponsor.role || '').toLowerCase())) {
                    // Condition: Upline ka highest package bada ya barabar hona chahiye
                    if (Number(sponsor.highestPackage) >= amount) {
                        if (!expectedIncomes[sponsor.userId]) expectedIncomes[sponsor.userId] = { direct: 0, level: 0 };
                        expectedIncomes[sponsor.userId].direct += (amount * 10) / 100;
                    }
                }

                // ==========================================
                // 🔥 LEVEL INCOME (LEVELS 2 to 20)
                // ==========================================
                let currentUplineId = sponsorId ? userMap.get(sponsorId)?.sponsorId : null;
                let currentLevel = 2;

                while (currentUplineId && currentLevel <= 20) {
                    let upline = userMap.get(currentUplineId);
                    if (!upline) break;

                    // Inactive (not topped up) user ko skip karo, par level count mat badhao
                    if (!upline.isToppedUp) {
                        currentUplineId = upline.sponsorId;
                        continue;
                    }

                    // Agar ye upline setup ya supersetup hai, toh isko iska level income do
                    if (targetRoles.includes((upline.role || '').toLowerCase())) {
                        if (Number(upline.highestPackage) >= amount) {
                            let percentage = 0;
                            if (currentLevel === 2) percentage = 5;
                            else if (currentLevel === 3) percentage = 3;
                            else if (currentLevel === 4) percentage = 2;
                            else if (currentLevel === 5) percentage = 1;
                            else if (currentLevel >= 6 && currentLevel <= 10) percentage = 0.50;
                            else if (currentLevel >= 11 && currentLevel <= 20) percentage = 0.25;

                            if (percentage > 0) {
                                if (!expectedIncomes[upline.userId]) expectedIncomes[upline.userId] = { direct: 0, level: 0 };
                                expectedIncomes[upline.userId].level += (amount * percentage) / 100;
                            }
                        }
                    }

                    currentUplineId = upline.sponsorId;
                    currentLevel++;
                }
            }
        }

        // 3. Ab Real DB data se compare karo ki unhe actual me kitna mil chuka hai
        const reportData = [];
        const usersToUpdate = [];

        for (const [uId, expected] of Object.entries(expectedIncomes)) {
            const dbUser = await User.findOne({ userId: uId });
            if (!dbUser) continue;

            const alreadyGotDirect = Number(dbUser.totalDirectIncome || 0);
            const alreadyGotLevel = Number(dbUser.totalLevelIncome || 0);

            let pendingDirect = expected.direct - alreadyGotDirect;
            let pendingLevel = expected.level - alreadyGotLevel;

            // Agar thoda decimal difference hai (0.0001) toh ignore marne ke liye
            if (pendingDirect < 0.01) pendingDirect = 0;
            if (pendingLevel < 0.01) pendingLevel = 0;

            if (pendingDirect > 0 || pendingLevel > 0) {
                reportData.push({
                    "User ID": dbUser.userId,
                    "Role": dbUser.role,
                    "Pending Direct ($)": pendingDirect.toFixed(2),
                    "Pending Level ($)": pendingLevel.toFixed(2)
                });

                usersToUpdate.push({
                    user: dbUser,
                    pendingDirect,
                    pendingLevel
                });
            }
        }

        // 🔥 STEP 1: Pehle sirf Data dikhao
        console.log("\n📊 --- MISSING INCOME REPORT (Setup / SuperSetup) --- 📊");
        if (reportData.length > 0) {
            console.table(reportData);
        } else {
            console.log("✅ Sabka hisaab clear hai! Kisi ko koi Direct/Level income missing nahi hai.");
            process.exit(0);
        }
        
        console.log(`💰 Total Setup/SuperSetup Users with pending income: ${usersToUpdate.length}`);
        console.log("⚠️ NOTE: Ye amount WALLET BALANCE me add NAHI hoga. Sirf unke Direct/Level counters aur history me aayega.\n");

        // 🔥 STEP 2: User se YES ya NO poocho
        rl.question(`Kya aap in ${usersToUpdate.length} users ke profile me missing income UPDATE karna chahte hain? (yes / no): `, async (answer) => {
            
            const confirm = answer.toLowerCase().trim();

            if (confirm === 'yes' || confirm === 'y') {
                console.log("\n🚀 Updating Income Records... Please wait...");

                for (let data of usersToUpdate) {
                    const { user, pendingDirect, pendingLevel } = data;

                    let updateQuery = { $inc: {} };
                    
                    // 👉 Sirf Income counters update kar rahe hain, walletBalance NAHI chhu rahe.
                    if (pendingDirect > 0) {
                        updateQuery.$inc.directIncome = pendingDirect;
                        updateQuery.$inc.totalDirectIncome = pendingDirect;
                        
                        await Transaction.create({
                            userId: user.userId,
                            amount: pendingDirect,
                            type: 'direct_income',
                            source: 'direct',
                            category: 'Direct Income',
                            remark: 'System Recovery: Missing Direct Income Recovered',
                            status: 'success',
                            date: new Date()
                        });
                    }

                    if (pendingLevel > 0) {
                        updateQuery.$inc.levelIncome = pendingLevel;
                        updateQuery.$inc.totalLevelIncome = pendingLevel;
                        
                        await Transaction.create({
                            userId: user.userId,
                            amount: pendingLevel,
                            type: 'level_income',
                            source: 'level',
                            category: 'Level Income',
                            remark: 'System Recovery: Missing Level Income Recovered',
                            status: 'success',
                            date: new Date()
                        });
                    }

                    // Save the user updates
                    await User.updateOne({ _id: user._id }, updateQuery);
                }

                console.log("✅ SUCCESSFULLY UPDATED! Unka ruka hua history aur total income set ho gaya (Wallet not affected).");
            } else {
                console.log("\n❌ UPDATE CANCELLED. Koi changes nahi kiye gaye.");
            }

            mongoose.connection.close();
            rl.close();
            process.exit(0);
        });

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

fixMissingIncome();