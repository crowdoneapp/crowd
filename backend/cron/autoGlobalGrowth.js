const cron = require('node-cron');
const User = require('../models/User'); 
const SystemStat = require('../models/SystemStat'); 
const Transaction = require('../models/Transaction'); 
const FakeUser = require('../models/FakeUser'); 
const { countryNames, countriesProbability } = require('../utils/fakeData'); 

// 🔥 NAYA LOGIC: 50 Levels Dynamic Generator 
const TOTAL_LEVELS = 50;
const ROI_DAYS = 90;
const GLOBAL_POOLS = [];
const PACKAGES = [30, 100, 300, 500, 1000];

// 🔥 HAR LEVEL ME EXACT 100 CUMULATIVE TEAM & 1 DIRECT RULE
for (let i = 1; i <= TOTAL_LEVELS; i++) {
    GLOBAL_POOLS.push({
        level: i,
        globalTeam: i * 100, // Level 1 = 100, Level 2 = 200...
        reqDirects: 1,       // Har level me 1 Direct chahiye
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

        // 🔥 Random Package Generator (Chote zyada, bade kam aayenge)
        const pkgWeights = [30, 30, 30, 30, 100, 100, 100, 300, 300, 500, 1000];
        const randomPkg = pkgWeights[Math.floor(Math.random() * pkgWeights.length)];

        // Select Country & Name
        let randomCountry = forcedCountry || (countriesProbability?.length > 0 ? countriesProbability[Math.floor(Math.random() * countriesProbability.length)] : "IN");
        let randomName = "Crypto User";
        if (countryNames && countryNames[randomCountry]) {
            const namePool = countryNames[randomCountry];
            randomName = namePool[Math.floor(Math.random() * namePool.length)];
        }

        // Generate Random User ID
        const randomId = Math.floor(1000000 + Math.random() * 9000000); 
        const isRealUser = await User.exists({ userId: randomId });
        const isFakeUser = await FakeUser.exists({ userId: randomId });

        if (!isRealUser && !isFakeUser) {
            // 1. Create Fake User
            await FakeUser.create({
                userId: randomId,
                name: randomName,
                country: randomCountry,
                isToppedUp: true,
                topUpAmount: randomPkg,
                date: new Date()
            });

            // 🔥 2. ADMIN & GLOBAL TRACKING ("ALL CROWD")
            // Ye record sabko same dikhega front-end par us package ke tab mein
            await SystemStat.findOneAndUpdate(
                {}, 
                { 
                    $inc: { 
                        globalFakeCount: 1,
                        [`packageStats.${randomPkg}.allCrowd`]: 1, // Har package ka global count
                        [`countryStats.${randomCountry}.${randomPkg}`]: 1 
                    } 
                }, 
                { upsert: true }
            );            

            // 🔥 3. USER SPECIFIC TRACKING ("YOUR CROWD")
            // Un users ki team badhao jinka package active hai
            const activeUsers = await User.find({ isToppedUp: true }).select('_id highestPackage purchasedPackages globalTeamCount todayGlobalTeamAdded lastGlobalTeamAddDate packageStats');
            const bulkOps = [];

            for (const user of activeUsers) {
                const userMaxPkg = user.highestPackage || 0;
                const purchased = user.purchasedPackages || [];

                // Check agar user ke paas ye package hai ya user ka max package isse bada/barabar hai
                const hasPackage = purchased.includes(randomPkg) || userMaxPkg >= randomPkg;

                if (hasPackage) {
                    let updateDoc = {
                        $inc: { 
                            globalTeamCount: 1, // Legacy global tracking
                            [`packageStats.${randomPkg}.globalTeamCount`]: 1 // 🔥 Package-specific "Your Crowd"
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
    // HAR 1 MINUTE WALI CRON (FAKE GROWTH + POOL UNLOCKER)
    // =========================================================================
      cron.schedule('* * * * *', async () => {
        try {
            // 🔥 UPDATE: Har 14 Minute me exact 1 baar ID aayegi (1440 mins / 14 = ~102 IDs daily)
            const currentMinute = new Date().getMinutes();
            const shouldAddFakeUser = (currentMinute % 14 === 0); 

            if (shouldAddFakeUser) {
                await processFakeGrowth(); 
            }
            
            // 🔥 POOL UNLOCK DISTRIBUTION LOGIC (Package-Wise)
            const eligibleUsers = await User.find({ isToppedUp: true });
            const currentTodayStr = getISTDateStr();

            for (let user of eligibleUsers) {
                let isUpdated = false;
                
                // User ke saare active packages nikaalo
                const purchased = user.purchasedPackages || [];
                const maxPkg = user.highestPackage || 0;
                const activePkgs = PACKAGES.filter(p => purchased.includes(p) || maxPkg >= p);

                // Har Active package ke liye uski Your Crowd check karo
                for (let pkg of activePkgs) {
                    const userCrowdForPackage = user.packageStats?.[pkg]?.globalTeamCount || 0;
                    const userDirectsForPackage = user.packageStats?.[pkg]?.directCount || user.directCount || 0;

                    for (let lvl of GLOBAL_POOLS) {
                        // Check if Package Team and Directs match the Level requirements
                        if (userCrowdForPackage >= lvl.globalTeam && userDirectsForPackage >= lvl.reqDirects) {
                            
                            // Check if this specific Pool (Level + Package) is already active
                            // Note: backend me identify karne ke liye p.packageAmount check karna zaroori hai
                            const existingPool = user.activePools?.find(p => p.level === lvl.level && p.packageAmount === pkg);
                            
                            if (!existingPool) {
                                if (!user.activePools) user.activePools = [];
                                
                                const totalReturn = pkg * 2;
                                const dailyReturn = Number((totalReturn / ROI_DAYS).toFixed(2));

                                user.activePools.push({
                                    packageAmount: pkg, // 👈 Kis package ka level hai wo save hoga
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
                                    description: `Daily Crowd Donation Earnign Level ${lvl.level} ($${pkg} Tier) (Day 1 of ${lvl.days})`,
                                    status: 'success'
                                });

                                isUpdated = true;
                            }
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
                            
                            const pkgAmount = pool.packageAmount || 30; // Fallback

                            Transaction.create({
                                userId: user.userId,
                                type: 'credit',
                                source: 'pool',
                                amount: pool.dailyAmount,
                                description: `Daily Crowd Donation Earning Level ${pool.level} ($${pkgAmount} Tier) (Day ${pool.daysPaid + 1} of ${pool.totalDays})`,
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