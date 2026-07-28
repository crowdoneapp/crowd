// const cron = require('node-cron');
// const User = require('../models/User'); 
// const SystemStat = require('../models/SystemStat'); 
// const Transaction = require('../models/Transaction'); 
// const FakeUser = require('../models/FakeUser'); 
// const { countryNames, countriesProbability } = require('../utils/fakeData'); 

// // 🔥 NAYA LOGIC: 50 Levels Dynamic Generator 
// const TOTAL_LEVELS = 50;
// const ROI_DAYS = 90;
// const GLOBAL_POOLS = [];
// const PACKAGES = [30, 100, 300, 500, 1000];

// // 🔥 HAR LEVEL ME EXACTLY UTNE HI DIRECTS CHAHIYE JITNA LEVEL NUMBER HAI
// for (let i = 1; i <= TOTAL_LEVELS; i++) {
//     GLOBAL_POOLS.push({
//         level: i,
//         globalTeam: i * 100, // Level 1 = 100, Level 2 = 200, Level 50 = 5000...
//         reqDirects: i,       // ✅ FIX: Level 1 = 1 Direct, Level 2 = 2 Directs... Level 50 = 50 Directs
//         days: ROI_DAYS
//     });
// }

// const getISTDateStr = () => {
//     const d = new Date();
//     const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
//     const istDate = new Date(utc + (3600000 * 5.5)); 
//     return istDate.toISOString().split('T')[0];
// };

// const startGlobalGrowthCron = () => {

//     const processFakeGrowth = async (forcedCountry = null) => {
//         const todayStr = getISTDateStr();

//         // 🔥 Random Package Generator (Chote zyada, bade kam aayenge)
//         const pkgWeights = [30, 30, 30, 30, 100, 100, 100, 300, 300, 500, 1000];
//         const randomPkg = pkgWeights[Math.floor(Math.random() * pkgWeights.length)];

//         // Select Country & Name
//         let randomCountry = forcedCountry || (countriesProbability?.length > 0 ? countriesProbability[Math.floor(Math.random() * countriesProbability.length)] : "IN");
//         let randomName = "Crypto User";
//         if (countryNames && countryNames[randomCountry]) {
//             const namePool = countryNames[randomCountry];
//             randomName = namePool[Math.floor(Math.random() * namePool.length)];
//         }

//         // Generate Random User ID
//         const randomId = Math.floor(1000000 + Math.random() * 9000000); 
//         const isRealUser = await User.exists({ userId: randomId });
//         const isFakeUser = await FakeUser.exists({ userId: randomId });

//         if (!isRealUser && !isFakeUser) {
//             // 1. Create Fake User
//             await FakeUser.create({
//                 userId: randomId,
//                 name: randomName,
//                 country: randomCountry,
//                 isToppedUp: true,
//                 topUpAmount: randomPkg,
//                 date: new Date()
//             });

//             // 🔥 2. ADMIN & GLOBAL TRACKING ("ALL CROWD") - 100% Guaranteed Fix for Map
//             let statDoc = await SystemStat.findOne();
//             if (!statDoc) {
//                 statDoc = new SystemStat({ globalFakeCount: 0 });
//             }

//             statDoc.globalFakeCount = (statDoc.globalFakeCount || 0) + 1;

//             if (!statDoc.packageStats) {
//                 statDoc.packageStats = new Map();
//             }

//             const pkgKey = String(randomPkg);
            
//             // Map se data nikalo ya naya banao
//             let pkgData = statDoc.packageStats.get(pkgKey) || { allCrowd: 0, globalTeamCount: 0 };
            
//             // All Crowd mein 1 badhao
//             pkgData.allCrowd = (pkgData.allCrowd || 0) + 1;
            
//             // Map ke andar wapas set karo
//             statDoc.packageStats.set(pkgKey, pkgData);

//             // ⚠️ Sabse Zaroori Line: Mongoose ko batane ke liye ki Map change hua hai
//             statDoc.markModified('packageStats');

//             // Database mein save karo
//             await statDoc.save();

//             // 🔥 3. USER SPECIFIC TRACKING ("YOUR CROWD")
//             // Un users ki team badhao jinka package active hai
//             const activeUsers = await User.find({ isToppedUp: true }).select('_id highestPackage purchasedPackages globalTeamCount todayGlobalTeamAdded lastGlobalTeamAddDate packageStats');
//             const bulkOps = [];

//             for (const user of activeUsers) {
//                 const userMaxPkg = user.highestPackage || 0;
//                 const purchased = user.purchasedPackages || [];

//                 // Check agar user ke paas ye package hai ya user ka max package isse bada/barabar hai
//                 const hasPackage = purchased.includes(randomPkg) || userMaxPkg >= randomPkg;

//                 if (hasPackage) {
//                     let updateDoc = {
//                         $inc: { 
//                             globalTeamCount: 1, // Legacy global tracking
//                             [`packageStats.${randomPkg}.globalTeamCount`]: 1 // 🔥 Package-specific "Your Crowd"
//                         }
//                     };
                    
//                     if (user.lastGlobalTeamAddDate !== todayStr) {
//                         updateDoc.$set = { todayGlobalTeamAdded: 1, lastGlobalTeamAddDate: todayStr };
//                     } else {
//                         updateDoc.$inc.todayGlobalTeamAdded = 1;
//                         updateDoc.$set = { lastGlobalTeamAddDate: todayStr };
//                     }

//                     bulkOps.push({
//                         updateOne: {
//                             filter: { _id: user._id },
//                             update: updateDoc
//                         }
//                     });
//                 }
//             }

//             if (bulkOps.length > 0) {
//                 await User.bulkWrite(bulkOps);
//             }
//         } 
//     };

//     // =========================================================================
//     // HAR 1 MINUTE WALI CRON (FAKE GROWTH + POOL UNLOCKER)
//     // =========================================================================
//       cron.schedule('* * * * *', async () => {
//         try {
//             // 🔥 UPDATE: Har 14 Minute me exact 1 baar ID aayegi (1440 mins / 14 = ~102 IDs daily)
//             const currentMinute = new Date().getMinutes();
//             const shouldAddFakeUser = (currentMinute % 14 === 0); 

//             if (shouldAddFakeUser) {
//                 await processFakeGrowth(); 
//             }
            
//             // 🔥 POOL UNLOCK DISTRIBUTION LOGIC (Package-Wise)
//             const eligibleUsers = await User.find({ isToppedUp: true });
//             const currentTodayStr = getISTDateStr();

//             for (let user of eligibleUsers) {
//                 let isUpdated = false;
                
//                 // User ke saare active packages nikaalo
//                 const purchased = user.purchasedPackages || [];
//                 const maxPkg = user.highestPackage || 0;
//                 const activePkgs = PACKAGES.filter(p => purchased.includes(p) || maxPkg >= p);

//                 // Har Active package ke liye uski Your Crowd check karo
//                 for (let pkg of activePkgs) {
//                     const userCrowdForPackage = user.packageStats?.[pkg]?.globalTeamCount || 0;
                    
//                     // 🔥 STRICT DIRECT LOGIC APPLIED HERE 🔥
//                     let userDirectsForPackage = 0;
//                     if (pkg === 30) {
//                         userDirectsForPackage = user.packageStats?.[pkg]?.directCount || user.directCount || 0;
//                     } else {
//                         // $100 aur usse upar ke liye purane normal directs count nahi honge
//                         userDirectsForPackage = user.packageStats?.[pkg]?.directCount || 0;
//                     }

//                     for (let lvl of GLOBAL_POOLS) {
//                         // Check if Package Team and Directs match the Level requirements
//                         if (userCrowdForPackage >= lvl.globalTeam && userDirectsForPackage >= lvl.reqDirects) {
                            
//                             // Check if this specific Pool (Level + Package) is already active
//                             const existingPool = user.activePools?.find(p => p.level === lvl.level && p.packageAmount === pkg);
                            
//                             if (!existingPool) {
//                                 if (!user.activePools) user.activePools = [];
                                
//                                 const totalReturn = pkg * 2;
//                                 const dailyReturn = Number((totalReturn / ROI_DAYS).toFixed(2));

//                                 user.activePools.push({
//                                     packageAmount: pkg, // 👈 Kis package ka level hai wo save hoga
//                                     level: lvl.level,
//                                     dailyAmount: dailyReturn,
//                                     totalDays: lvl.days,
//                                     daysPaid: 1,               
//                                     lastPaidDate: currentTodayStr, // ✅ Double Payout prevent karne ke liye Day 1 ka timestamp set kiya    
//                                     status: 'ACTIVE'
//                                 });

//                                 user.poolIncome = (user.poolIncome || 0) + dailyReturn; 
                                
//                                 await Transaction.create({
//                                     userId: user.userId,
//                                     type: 'credit',
//                                     source: 'pool',
//                                     amount: dailyReturn,
//                                     description: `Daily Crowd Donation Earning Level ${lvl.level} ($${pkg} Tier) (Day 1 of ${lvl.days})`,
//                                     status: 'success'
//                                 });

//                                 isUpdated = true;
//                             }
//                         }
//                     }
//                 }
//                 if (isUpdated) await user.save();
//             }
//         } catch (err) {
//             console.error('[AUTO-GROWTH] Error:', err);
//         }
//     });

//     // =========================================================================
//     // DAILY MIDNIGHT CRON (PAYOUT DISTRIBUTION)
//     // =========================================================================
//     cron.schedule('30 1 * * *', async () => {
//         try {
//             console.log("🚀 Starting Daily Community Payouts...");
//             const users = await User.find({ "activePools.status": "ACTIVE" });
//             const todayStr = getISTDateStr();

//             const BATCH_SIZE = 50;
//             for (let i = 0; i < users.length; i += BATCH_SIZE) {
//                 const batch = users.slice(i, i + BATCH_SIZE);
                
//                 await Promise.all(batch.map(async (user) => {
//                     let isUpdated = false;
//                     for (let pool of user.activePools) {
//                         // ✅ STRICT DOUBLE INCOME BLOCKER: lastPaidDate ko aaj ki date (todayStr) se match karke rokta hai
//                         if (pool.status === 'ACTIVE' && pool.daysPaid < pool.totalDays && pool.lastPaidDate !== todayStr) {
                            
//                             user.poolIncome = (user.poolIncome || 0) + pool.dailyAmount;
                            
//                             const pkgAmount = pool.packageAmount || 30; // Fallback

//                             Transaction.create({
//                                 userId: user.userId,
//                                 type: 'credit',
//                                 source: 'pool',
//                                 amount: pool.dailyAmount,
//                                 description: `Daily Crowd Donation Earning Level ${pool.level} ($${pkgAmount} Tier) (Day ${pool.daysPaid + 1} of ${pool.totalDays})`,
//                                 status: 'success'
//                             }).catch(err => console.error("Txn creation failed:", err));

//                             pool.daysPaid += 1;
//                             pool.lastPaidDate = todayStr;
//                             if (pool.daysPaid >= pool.totalDays) pool.status = 'COMPLETED';
//                             isUpdated = true;
//                         }
//                     }
//                     if (isUpdated) await user.save();
//                 }));

//                 await new Promise(resolve => setTimeout(resolve, 200));
//             }
//             console.log(`✅ [CRON] Community Payout Done for: ${todayStr}`);
//         } catch (err) {
//             console.error('[DAILY-POOL] Error:', err);
//         }
//     }, {
//         scheduled: true,
//         timezone: "Asia/Kolkata" 
//     });
// };

// module.exports = startGlobalGrowthCron;


// const cron = require('node-cron');
// const User = require('../models/User'); 
// const SystemStat = require('../models/SystemStat'); 
// const Transaction = require('../models/Transaction'); 
// const FakeUser = require('../models/FakeUser'); 
// const { countryNames, countriesProbability } = require('../utils/fakeData'); 

// // 🔥 NAYA LOGIC: 50 Levels Dynamic Generator 
// const TOTAL_LEVELS = 50;
// const ROI_DAYS = 90;
// const GLOBAL_POOLS = [];
// const PACKAGES = [30, 100, 300, 500, 1000];

// // 🔥 HAR LEVEL ME EXACTLY UTNE HI DIRECTS CHAHIYE JITNA LEVEL NUMBER HAI
// for (let i = 1; i <= TOTAL_LEVELS; i++) {
//     GLOBAL_POOLS.push({
//         level: i,
//         globalTeam: i * 100, 
//         reqDirects: i,       
//         days: ROI_DAYS
//     });
// }

// const getISTDateStr = () => {
//     const d = new Date();
//     const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
//     const istDate = new Date(utc + (3600000 * 5.5)); 
//     return istDate.toISOString().split('T')[0];
// };

// const startGlobalGrowthCron = () => {

//     const processFakeGrowth = async (forcedCountry = null) => {
//         const todayStr = getISTDateStr();

//         const pkgWeights = [30, 30, 30, 30, 100, 100, 100, 300, 300, 500, 1000];
//         const randomPkg = pkgWeights[Math.floor(Math.random() * pkgWeights.length)];

//         let randomCountry = forcedCountry || (countriesProbability?.length > 0 ? countriesProbability[Math.floor(Math.random() * countriesProbability.length)] : "IN");
//         let randomName = "Crypto User";
//         if (countryNames && countryNames[randomCountry]) {
//             const namePool = countryNames[randomCountry];
//             randomName = namePool[Math.floor(Math.random() * namePool.length)];
//         }

//         const randomId = Math.floor(1000000 + Math.random() * 9000000); 
//         const isRealUser = await User.exists({ userId: randomId });
//         const isFakeUser = await FakeUser.exists({ userId: randomId });

//         if (!isRealUser && !isFakeUser) {
//             await FakeUser.create({
//                 userId: randomId, name: randomName, country: randomCountry,
//                 isToppedUp: true, topUpAmount: randomPkg, date: new Date()
//             });

//             let statDoc = await SystemStat.findOne();
//             if (!statDoc) statDoc = new SystemStat({ globalFakeCount: 0 });

//             statDoc.globalFakeCount = (statDoc.globalFakeCount || 0) + 1;
//             if (!statDoc.packageStats) statDoc.packageStats = new Map();

//             const pkgKey = String(randomPkg);
//             let pkgData = statDoc.packageStats.get(pkgKey) || { allCrowd: 0, globalTeamCount: 0 };
//             pkgData.allCrowd = (pkgData.allCrowd || 0) + 1;
            
//             statDoc.packageStats.set(pkgKey, pkgData);
//             statDoc.markModified('packageStats');
//             await statDoc.save();

//             const activeUsers = await User.find({ isToppedUp: true }).select('_id highestPackage purchasedPackages globalTeamCount todayGlobalTeamAdded lastGlobalTeamAddDate packageStats');
//             const bulkOps = [];

//             for (const user of activeUsers) {
//                 const userMaxPkg = user.highestPackage || 0;
//                 const purchased = user.purchasedPackages || [];
//                 const hasPackage = purchased.includes(randomPkg) || userMaxPkg >= randomPkg;

//                 if (hasPackage) {
//                     let updateDoc = {
//                         $inc: { 
//                             globalTeamCount: 1, 
//                             [`packageStats.${randomPkg}.globalTeamCount`]: 1 
//                         }
//                     };
                    
//                     if (user.lastGlobalTeamAddDate !== todayStr) {
//                         updateDoc.$set = { todayGlobalTeamAdded: 1, lastGlobalTeamAddDate: todayStr };
//                     } else {
//                         updateDoc.$inc.todayGlobalTeamAdded = 1;
//                         updateDoc.$set = { lastGlobalTeamAddDate: todayStr };
//                     }

//                     bulkOps.push({
//                         updateOne: { filter: { _id: user._id }, update: updateDoc }
//                     });
//                 }
//             }

//             if (bulkOps.length > 0) await User.bulkWrite(bulkOps);
//         } 
//     };

//     // =========================================================================
//     // HAR 1 MINUTE WALI CRON (FAKE GROWTH + POOL UNLOCKER ONLY, NO PAYOUT HERE)
//     // =========================================================================
//     cron.schedule('* * * * *', async () => {
//         try {
//             const currentMinute = new Date().getMinutes();
//             const shouldAddFakeUser = (currentMinute % 14 === 0); 

//             if (shouldAddFakeUser) {
//                 await processFakeGrowth(); 
//             }
            
//             const eligibleUsers = await User.find({ isToppedUp: true });

//             for (let user of eligibleUsers) {
//                 let isUpdated = false;
                
//                 const purchased = user.purchasedPackages || [];
//                 const maxPkg = user.highestPackage || 0;
//                 const activePkgs = PACKAGES.filter(p => purchased.includes(p) || maxPkg >= p);

//                 for (let pkg of activePkgs) {
//                     const userCrowdForPackage = user.packageStats?.[pkg]?.globalTeamCount || 0;
                    
//                     let userDirectsForPackage = 0;
//                     if (pkg === 30) {
//                         userDirectsForPackage = user.packageStats?.[pkg]?.directCount || user.directCount || 0;
//                     } else {
//                         userDirectsForPackage = user.packageStats?.[pkg]?.directCount || 0;
//                     }

//                     for (let lvl of GLOBAL_POOLS) {
//                         if (userCrowdForPackage >= lvl.globalTeam && userDirectsForPackage >= lvl.reqDirects) {
                            
//                             const existingPool = user.activePools?.find(p => p.level === lvl.level && p.packageAmount === pkg);
                            
//                             if (!existingPool) {
//                                 if (!user.activePools) user.activePools = [];
                                
//                                 const totalReturn = pkg * 2;
//                                 const dailyReturn = Number((totalReturn / ROI_DAYS).toFixed(2));

//                                 user.activePools.push({
//                                     packageAmount: pkg, 
//                                     level: lvl.level,
//                                     dailyAmount: dailyReturn,
//                                     totalDays: lvl.days,
//                                     daysPaid: 0,                   // ✅ FIX: Instant payout hata diya, 0 set kiya
//                                     lastPaidDate: "",              // ✅ FIX: Date blank rakhi, taaki raat wali cron pakad le
//                                     status: 'ACTIVE'
//                                 });

//                                 // ❌ YAHAN SE user.poolIncome AUR Transaction.create HATA DIYA HAI
//                                 isUpdated = true;
//                             }
//                         }
//                     }
//                 }
//                 if (isUpdated) await user.save();
//             }
//         } catch (err) {
//             console.error('[AUTO-GROWTH] Error:', err);
//         }
//     });

//     // =========================================================================
//     // DAILY MIDNIGHT CRON (PAYOUT DISTRIBUTION TO ALL)
//     // =========================================================================
//     cron.schedule('30 1 * * *', async () => {
//         try {
//             console.log("🚀 Starting Daily Community Payouts...");
//             const users = await User.find({ "activePools.status": "ACTIVE" });
//             const todayStr = getISTDateStr();

//             const BATCH_SIZE = 50;
//             for (let i = 0; i < users.length; i += BATCH_SIZE) {
//                 const batch = users.slice(i, i + BATCH_SIZE);
                
//                 await Promise.all(batch.map(async (user) => {
//                     let isUpdated = false;
//                     for (let pool of user.activePools) {
                        
//                         // ✅ Raat wali cron yahan payout degi jinka condition meet hua hai
//                         if (pool.status === 'ACTIVE' && pool.daysPaid < pool.totalDays && pool.lastPaidDate !== todayStr) {
                            
//                             user.poolIncome = (user.poolIncome || 0) + pool.dailyAmount;
                            
//                             const pkgAmount = pool.packageAmount || 30;

//                             Transaction.create({
//                                 userId: user.userId,
//                                 type: 'credit',
//                                 source: 'pool',
//                                 amount: pool.dailyAmount,
//                                 description: `Daily Crowd Donation Earning Level ${pool.level} ($${pkgAmount} Tier) (Day ${pool.daysPaid + 1} of ${pool.totalDays})`,
//                                 status: 'success'
//                             }).catch(err => console.error("Txn creation failed:", err));

//                             pool.daysPaid += 1;
//                             pool.lastPaidDate = todayStr;
//                             if (pool.daysPaid >= pool.totalDays) pool.status = 'COMPLETED';
//                             isUpdated = true;
//                         }
//                     }
//                     if (isUpdated) await user.save();
//                 }));

//                 await new Promise(resolve => setTimeout(resolve, 200));
//             }
//             console.log(`✅ [CRON] Community Payout Done for: ${todayStr}`);
//         } catch (err) {
//             console.error('[DAILY-POOL] Error:', err);
//         }
//     }, {
//         scheduled: true,
//         timezone: "Asia/Kolkata" 
//     });
// };

// module.exports = startGlobalGrowthCron;



const cron = require('node-cron');
const User = require('../models/User'); 
const SystemStat = require('../models/SystemStat'); 
const Transaction = require('../models/Transaction'); 
const FakeUser = require('../models/FakeUser'); 
const { countryNames, countriesProbability } = require('../utils/fakeData'); 
const sendTelegramAlert = require('../utils/telegramHelper');

// 🔥 50 Levels Dynamic Generator 
const TOTAL_LEVELS = 50;
const ROI_DAYS = 90;
const GLOBAL_POOLS = [];
const PACKAGES = [30, 100, 300, 500, 1000];

// Har Level ke liye conditions
for (let i = 1; i <= TOTAL_LEVELS; i++) {
    GLOBAL_POOLS.push({
        level: i,
        globalTeam: i * 100, 
        reqDirects: i,       
        days: ROI_DAYS
    });
}

const getISTDateStr = () => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const istDate = new Date(utc + (3600000 * 5.5)); 
    return istDate.toISOString().split('T')[0];
};

const getMinutesLeftInDay = () => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const istDate = new Date(utc + (3600000 * 5.5)); 
    return (24 * 60) - (istDate.getHours() * 60 + istDate.getMinutes());
};

const startGlobalGrowthCron = () => {

    // =========================================================================
    // 1. DYNAMIC FAKE GROWTH FUNCTION
    // =========================================================================
    const processFakeGrowth = async (forcedPkg, forcedCountry = null) => {
        const todayStr = getISTDateStr();
        const pkgToUse = forcedPkg || 30; // Default $30 hi rahega agar kuch pass nahi kiya

        let randomCountry = forcedCountry;
        if (!randomCountry) {
            randomCountry = (countriesProbability?.length > 0) ? countriesProbability[Math.floor(Math.random() * countriesProbability.length)] : "IN";
        }

        let randomName = "Crypto User";
        if (countryNames && countryNames[randomCountry]) {
            const namePool = countryNames[randomCountry];
            randomName = namePool[Math.floor(Math.random() * namePool.length)];
        }

        const randomId = Math.floor(1000000 + Math.random() * 9000000); 
        const isRealUser = await User.exists({ userId: randomId });
        const isFakeUser = await FakeUser.exists({ userId: randomId });

        if (!isRealUser && !isFakeUser) 
            
            
           {
            await FakeUser.create({
                userId: randomId, name: randomName, country: randomCountry,
                isToppedUp: true, topUpAmount: pkgToUse, date: new Date()
            });

           try {
                await sendTelegramAlert(randomName, randomId, pkgToUse, randomCountry);
            } catch (err) {
                console.error("Telegram error in cron:", err);
            }
            
            let statDoc = await SystemStat.findOne();
            if (!statDoc) statDoc = new SystemStat({ globalFakeCount: 0 });

            statDoc.globalFakeCount = (statDoc.globalFakeCount || 0) + 1;
            if (!statDoc.packageStats) statDoc.packageStats = new Map();

            const pkgKey = String(pkgToUse);
            let pkgData = statDoc.packageStats.get(pkgKey) || { allCrowd: 0, globalTeamCount: 0 };
            pkgData.allCrowd = (pkgData.allCrowd || 0) + 1;
            
            statDoc.packageStats.set(pkgKey, pkgData);
            statDoc.markModified('packageStats');
            await statDoc.save();

            const activeUsers = await User.find({ isToppedUp: true }).select('_id highestPackage purchasedPackages globalTeamCount todayGlobalTeamAdded lastGlobalTeamAddDate packageStats');
            const bulkOps = [];

            for (const user of activeUsers) {
                const userMaxPkg = user.highestPackage || 0;
                const purchased = user.purchasedPackages || [];
                const hasPackage = purchased.includes(pkgToUse) || userMaxPkg >= pkgToUse;

                if (hasPackage) {
                    let updateDoc = {
                        $inc: { 
                            globalTeamCount: 1, 
                            [`packageStats.${pkgToUse}.globalTeamCount`]: 1 
                        }
                    };
                    
                    if (user.lastGlobalTeamAddDate !== todayStr) {
                        updateDoc.$set = { todayGlobalTeamAdded: 1, lastGlobalTeamAddDate: todayStr };
                    } else {
                        updateDoc.$inc.todayGlobalTeamAdded = 1;
                        updateDoc.$set = { lastGlobalTeamAddDate: todayStr };
                    }

                    bulkOps.push({
                        updateOne: { filter: { _id: user._id }, update: updateDoc }
                    });
                }
            }

            if (bulkOps.length > 0) await User.bulkWrite(bulkOps);
        } 
    };

    // =========================================================================
    // 2. HAR 1 MINUTE WALI CRON (GROWTH + POOL UNLOCK)
    // =========================================================================
    cron.schedule('* * * * *', async () => {
        try {
            const todayStr = getISTDateStr();
            const minsLeft = getMinutesLeftInDay() || 1;

            let statDoc = await SystemStat.findOne();
            if (!statDoc) statDoc = new SystemStat();

            // A. Raat 12 baje Admin ka target reset karna
            if (statDoc.boostResetDate !== todayStr) {
                statDoc.boostResetDate = todayStr;
                if (statDoc.packageBoosts) {
                    for (let [pkg, data] of statDoc.packageBoosts.entries()) {
                        data.indiaToday = 0;
                        data.otherToday = 0;
                        statDoc.packageBoosts.set(pkg, data);
                    }
                }
                statDoc.markModified('packageBoosts');
                await statDoc.save();
            }

            let statUpdated = false;

            // B. ADMIN TARGET GROWTH (Dynamic Speed)
            if (statDoc.packageBoosts) {
                for (let [pkg, data] of statDoc.packageBoosts.entries()) {
                    
                    // India Boost
                    const indiaRemaining = data.indiaTarget - data.indiaToday;
                    if (indiaRemaining > 0) {
                        const probability = indiaRemaining / minsLeft;
                        if (Math.random() <= probability) {
                            await processFakeGrowth(Number(pkg), "IN"); 
                            data.indiaToday += 1;
                            statDoc.packageBoosts.set(pkg, data);
                            statUpdated = true;
                        }
                    }

                    // Foreign Boost
                    const otherRemaining = data.otherTarget - data.otherToday;
                    if (otherRemaining > 0) {
                        const probability = otherRemaining / minsLeft;
                        if (Math.random() <= probability) {
                            const foreignCountries = countriesProbability.filter(c => c !== "IN");
                            const fc = foreignCountries[Math.floor(Math.random() * foreignCountries.length)];
                            
                            await processFakeGrowth(Number(pkg), fc); 
                            data.otherToday += 1;
                            statDoc.packageBoosts.set(pkg, data);
                            statUpdated = true;
                        }
                    }
                }
            }

            if (statUpdated) {
                statDoc.markModified('packageBoosts');
                await statDoc.save();
            }

            // C. NATURAL GROWTH (Sirf $30, Har 14 min me ek)
            const currentMinute = new Date().getMinutes();
            if (currentMinute % 14 === 0) {
                await processFakeGrowth(30, null); 
            }
            
            // D. POOL UNLOCKER (Sirf Active karega, Paisa nahi dega)
            const eligibleUsers = await User.find({ isToppedUp: true });

            for (let user of eligibleUsers) {
                let isUpdated = false;
                
                const purchased = user.purchasedPackages || [];
                const maxPkg = user.highestPackage || 0;
                const activePkgs = PACKAGES.filter(p => purchased.includes(p) || maxPkg >= p);

                for (let pkg of activePkgs) {
                    const userCrowdForPackage = user.packageStats?.[pkg]?.globalTeamCount || 0;
                    
                    let userDirectsForPackage = 0;
                    if (pkg === 30) {
                        userDirectsForPackage = user.packageStats?.[pkg]?.directCount || user.directCount || 0;
                    } else {
                        userDirectsForPackage = user.packageStats?.[pkg]?.directCount || 0;
                    }

                    for (let lvl of GLOBAL_POOLS) {
                        if (userCrowdForPackage >= lvl.globalTeam && userDirectsForPackage >= lvl.reqDirects) {
                            
                            const existingPool = user.activePools?.find(p => p.level === lvl.level && p.packageAmount === pkg);
                            
                            if (!existingPool) {
                                if (!user.activePools) user.activePools = [];
                                
                                const totalReturn = pkg * 2;
                                const dailyReturn = Number((totalReturn / ROI_DAYS).toFixed(2));

                                user.activePools.push({
                                    packageAmount: pkg, 
                                    level: lvl.level,
                                    dailyAmount: dailyReturn,
                                    totalDays: lvl.days,
                                    daysPaid: 0,                   // 0 din ka paisa mila hai abhi
                                    lastPaidDate: "",              // Raat wali cron ke liye blank chhoda
                                    status: 'ACTIVE'
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
    // 3. DAILY MIDNIGHT CRON (PAYOUT DISTRIBUTION TO ALL)
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
                        
                        // ✅ Raat wali cron yahan sabko daily payout degi
                        if (pool.status === 'ACTIVE' && pool.daysPaid < pool.totalDays && pool.lastPaidDate !== todayStr) {
                            
                            user.poolIncome = (user.poolIncome || 0) + pool.dailyAmount;
                            const pkgAmount = pool.packageAmount || 30;

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