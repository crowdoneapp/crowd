const cron = require('node-cron');
const User = require('../models/User'); 
const SystemStat = require('../models/SystemStat'); 
const Transaction = require('../models/Transaction'); 
const FakeUser = require('../models/FakeUser'); 
const { countryNames, countriesProbability } = require('../utils/fakeData'); 

// 🔥 NAYA LOGIC: 50 Levels Dynamic Generator (Same as Frontend)
const TOTAL_LEVELS = 50;
const ROI_DAYS = 90;
const GLOBAL_POOLS = [];
const PACKAGES = [30, 100, 300, 500, 1000];

// 🔥 HAR LEVEL ME EXACT 100 CUMULATIVE TEAM & 1 DIRECT RULE
for (let i = 1; i <= TOTAL_LEVELS; i++) {
    GLOBAL_POOLS.push({
        level: i,
        globalTeam: i * 100, // Level 1 = 100, Level 2 = 200, Level 3 = 300... Level 50 = 5000
        reqDirects: 1,       // ✅ Har level me 1 Direct chahiye
        days: ROI_DAYS
    });
}

const getISTDateStr = () => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const istDate = new Date(utc + (3600000 * 5.5)); 
    return istDate.toISOString().split('T')[0];
};

const startGlobalGrowthCron = () => {

    const processFakeGrowth = async (forcedCountry = null) => {
        const todayStr = getISTDateStr();

        // 🔥 FIX 1: Random Package Generator (Sab packages grow honge)
        // (Chote packages zyada aayenge, bade packages kam aayenge)
        const pkgWeights = [30, 30, 30, 30, 100, 100, 100, 300, 300, 500, 1000];
        const randomPkg = pkgWeights[Math.floor(Math.random() * pkgWeights.length)];

        // Select Country
        let randomCountry = "IN";
        if (forcedCountry) {
            randomCountry = forcedCountry;
        } else if (typeof countriesProbability !== 'undefined' && countriesProbability?.length > 0) {
            randomCountry = countriesProbability[Math.floor(Math.random() * countriesProbability.length)];
        }

        // Select Name
        let randomName = "Crypto User";
        if (typeof countryNames !== 'undefined') {
            const namePool = countryNames[randomCountry] || countryNames["IN"];
            if (namePool && namePool.length > 0) {
                randomName = namePool[Math.floor(Math.random() * namePool.length)];
            }
        }

        // Generate Random User ID
        const randomId = Math.floor(1000000 + Math.random() * 9000000); 
        const isRealUser = await User.exists({ userId: randomId });
        const isFakeUser = await FakeUser.exists({ userId: randomId });

        if (!isRealUser && !isFakeUser) {
            // Create Fake User with the randomly selected Package
            await FakeUser.create({
                userId: randomId,
                name: randomName,
                country: randomCountry,
                isToppedUp: true,
                topUpAmount: randomPkg,
                date: new Date()
            });

            // 🔥 FIX 2: Admin panel tracking ke liye SystemStat update
            await SystemStat.findOneAndUpdate(
                {}, 
                { 
                    $inc: { 
                        globalFakeCount: 1,
                        [`packageStats.${randomPkg}.allCrowd`]: 1, // Us package me overall kitni aayi
                        [`countryStats.${randomCountry}.${randomPkg}`]: 1 // Kis country se konsa package aaya
                    } 
                }, 
                { upsert: true }
            );            

            // 🔥 FIX 3: Un users ki team badhao jinka package is growth ke eligible hai
            const activeUsers = await User.find({ isToppedUp: true }).select('_id highestPackage globalTeamCount todayGlobalTeamAdded lastGlobalTeamAddDate packageStats');
            const bulkOps = [];

            for (const user of activeUsers) {
                const userMaxPkg = user.highestPackage || 30;

                // Agar user ka package randomPkg ke barabar ya bada hai, toh hi uski Your Crowd badhegi
                if (userMaxPkg >= randomPkg) {
                    let updateDoc = {
                        $inc: { 
                            globalTeamCount: 1, 
                            [`packageStats.${randomPkg}.yourCrowd`]: 1 // Package-specific team growth!
                        }
                    };
                    
                    if (user.lastGlobalTeamAddDate !== todayStr) {
                        updateDoc.$set = { todayGlobalTeamAdded: 1, lastGlobalTeamAddDate: todayStr };
                    } else {
                        updateDoc.$inc.todayGlobalTeamAdded = 1;
                        updateDoc.$set = { lastGlobalTeamAddDate: todayStr };
                    }

                    bulkOps.push({
                        updateOne: {
                            filter: { _id: user._id },
                            update: updateDoc
                        }
                    });
                }
            }

            if (bulkOps.length > 0) {
                await User.bulkWrite(bulkOps);
            }
        } 
    };

    // =========================================================================
    // HAR 1 MINUTE WALI CRON
    // =========================================================================
   cron.schedule('* * * * *', async () => {
        try {
            const shouldAddFakeUser = Math.random() < (100 / 1440); 
            if (shouldAddFakeUser) {
                await processFakeGrowth(); 
            }
            
            // 🔥 POOL UNLOCK DISTRIBUTION LOGIC (100, 200, 300 Team Logic)
            const eligibleUsers = await User.find({ directCount: { $gte: 1 }, isToppedUp: true });
            const currentTodayStr = getISTDateStr();

            for (let user of eligibleUsers) {
                let isUpdated = false;
                const targetPackageAmount = user.highestPackage || 30; 
                
                // User ki selected package ki team check karo, agar nahi hai toh globalTeam fallback lo
                const userCrowdForPackage = user.packageStats?.[targetPackageAmount]?.yourCrowd || user.globalTeamCount || 0;

                for (let lvl of GLOBAL_POOLS) {
                    // Check logic: Has Required Team (100, 200...) AND Required Directs (1)
                    if (userCrowdForPackage >= lvl.globalTeam && user.directCount >= lvl.reqDirects) {
                        const existingPool = user.activePools?.find(p => p.level === lvl.level);
                        
                        if (!existingPool) {
                            if (!user.activePools) user.activePools = [];
                            
                            const totalReturn = targetPackageAmount * 2;
                            const dailyReturn = Number((totalReturn / ROI_DAYS).toFixed(2));

                            user.activePools.push({
                                level: lvl.level,
                                dailyAmount: dailyReturn,
                                totalDays: lvl.days,
                                daysPaid: 1,               
                                lastPaidDate: currentTodayStr,    
                                status: 'ACTIVE'
                            });

                            user.poolIncome = (user.poolIncome || 0) + dailyReturn; 
                            
                            await Transaction.create({
                                userId: user.userId,
                                type: 'credit',
                                source: 'pool',
                                amount: dailyReturn,
                                description: `Daily Community Yield Level ${lvl.level} (Day 1 of ${lvl.days})`,
                                status: 'success'
                            });

                            isUpdated = true;
                         }
                    }
                }
                if (isUpdated) await user.save();
            }
        } catch (err) {
            console.error('[AUTO-GROWTH] Error:', err);
        }
    });

    // =========================================================================
    // DAILY MIDNIGHT CRON (PAYOUT DISTRIBUTION)
    // =========================================================================
    cron.schedule('30 1 * * *', async () => {
        try {
            console.log("🚀 Starting Daily Community Payouts...");
            const users = await User.find({ "activePools.status": "ACTIVE" });
            const todayStr = getISTDateStr();

            const BATCH_SIZE = 50;
            for (let i = 0; i < users.length; i += BATCH_SIZE) {
                const batch = users.slice(i, i + BATCH_SIZE);
                
                await Promise.all(batch.map(async (user) => {
                    let isUpdated = false;
                    for (let pool of user.activePools) {
                        if (pool.status === 'ACTIVE' && pool.daysPaid < pool.totalDays && pool.lastPaidDate !== todayStr) {
                            
                            user.poolIncome = (user.poolIncome || 0) + pool.dailyAmount;
                            
                            Transaction.create({
                                userId: user.userId,
                                type: 'credit',
                                source: 'pool',
                                amount: pool.dailyAmount,
                                description: `Daily Community Yield Level ${pool.level} (Day ${pool.daysPaid + 1} of ${pool.totalDays})`,
                                status: 'success'
                            }).catch(err => console.error("Txn creation failed:", err));

                            pool.daysPaid += 1;
                            pool.lastPaidDate = todayStr;
                            if (pool.daysPaid >= pool.totalDays) pool.status = 'COMPLETED';
                            isUpdated = true;
                        }
                    }
                    if (isUpdated) await user.save();
                }));

                await new Promise(resolve => setTimeout(resolve, 200));
            }
            console.log(`✅ [CRON] Community Payout Done for: ${todayStr}`);
        } catch (err) {
            console.error('[DAILY-POOL] Error:', err);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" 
    });
};

module.exports = startGlobalGrowthCron;