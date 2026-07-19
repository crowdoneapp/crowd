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

// Base package amount 30 maankar calculation ki gayi hai.
// (Amount aur Daily Return user ke topup par depend karega baad me)
for (let i = 1; i <= TOTAL_LEVELS; i++) {
    GLOBAL_POOLS.push({
        level: i,
        globalTeam: i * 100, // Level 1 = 100, Level 2 = 200, Level 50 = 5000
        reqDirects: i,       // Level 1 = 1, Level 2 = 2, Level 50 = 50
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
        // 🔥 RULE 1: ONLY ACTIVE USERS WILL GET GLOBAL TEAM (isToppedUp: true)
        const activeUsers = await User.find({ isToppedUp: true })
            .select('_id globalTeamCount directCount todayGlobalTeamAdded lastGlobalTeamAddDate');

        const bulkOps = [];

        for (const user of activeUsers) {
            // 🔥 RULE 2: TEAM GROWS ONLY IF DIRECTS EXIST
            // Agar aap chahte hain ki bina direct ke team na badhe, toh condition lagaiye:
            // if (user.directCount === 0) continue; 
            
            // Abhi ke liye main normal growth rakha hai kyunki global team auto hoti hai. 
            // Lock logic sirf unlock ke time check hota hai.

            if (user.lastGlobalTeamAddDate !== todayStr) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: user._id },
                        update: {
                            $inc: { globalTeamCount: 1 },
                            $set: { todayGlobalTeamAdded: 1, lastGlobalTeamAddDate: todayStr }
                        }
                    }
                });
            } else {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: user._id },
                        update: {
                            $inc: { globalTeamCount: 1, todayGlobalTeamAdded: 1 },
                            $set: { lastGlobalTeamAddDate: todayStr }
                        }
                    }
                });
            }
        }

        if (bulkOps.length > 0) {
            await User.bulkWrite(bulkOps);
        }

        await SystemStat.findOneAndUpdate(
            {}, 
            { $inc: { globalFakeCount: 1 } }, 
            { upsert: true, returnDocument: 'after' }
        );            
        
        const randomId = Math.floor(1000000 + Math.random() * 9000000); 
        const isRealUser = await User.exists({ userId: randomId });
        const isFakeUser = await FakeUser.exists({ userId: randomId });

        if (!isRealUser && !isFakeUser) {
            let randomCountry = "IN";
            if (forcedCountry) {
                randomCountry = forcedCountry;
            } else if (typeof countriesProbability !== 'undefined' && countriesProbability?.length > 0) {
                randomCountry = countriesProbability[Math.floor(Math.random() * countriesProbability.length)];
            }

            let randomName = "Crypto User";
            if (typeof countryNames !== 'undefined') {
                const namePool = countryNames[randomCountry] || countryNames["IN"];
                if (namePool && namePool.length > 0) {
                    randomName = namePool[Math.floor(Math.random() * namePool.length)];
                }
            }

            await FakeUser.create({
                userId: randomId,
                name: randomName,
                country: randomCountry,
                isToppedUp: true,
                topUpAmount: 30,
                date: new Date()
            });
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

            // [India, Nigeria, ZA Boost Logic code remains here... skiping for brevity]
            
            // 🔥 2. POOL UNLOCK DISTRIBUTION LOGIC (NEW 50 LEVELS RULE)
            // User ke paas minimum 1 direct hona chahiye pehle level ke liye
            const eligibleUsers = await User.find({ directCount: { $gte: 1 }, isToppedUp: true });
            const currentTodayStr = getISTDateStr();

            for (let user of eligibleUsers) {
                let isUpdated = false;

                // Naye logic me cumulative ki zaroorat nahi hai, kyuki hum absolute reqTeam check kar rahe hain
                // User Global Team = 100, 200, 300 (not cumulative)

                for (let lvl of GLOBAL_POOLS) {
                    // Check logic: Has Required Team AND Required Directs
                    if (user.globalTeamCount >= lvl.globalTeam && user.directCount >= lvl.reqDirects) {
                        const existingPool = user.activePools?.find(p => p.level === lvl.level);
                        
                        if (!existingPool) {
                            if (!user.activePools) user.activePools = [];
                            
                            // User ne jis package se topup kiya hai, uska double milega level pe
                            const targetPackageAmount = user.highestPackage || 30; 
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
                                description: `Daily Community Income Level ${lvl.level} (Day 1 of ${lvl.days})`,
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
    // DAILY MIDNIGHT CRON
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
                                description: `Daily Community Income Level ${pool.level} (Day ${pool.daysPaid + 1} of ${pool.totalDays})`,
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