// // const cron = require('node-cron');
// // const User = require('../models/User');
// // const PackageActivation = require('../models/PackageActivation');
// // const Transaction = require('../models/Transaction');

// // // 🕛 Run everyday at 12:15 AM (IST)
// // cron.schedule('48 16 * * *', async () => {
// //     console.log('⏳ Running Daily ROI & Team Compounding Cron Job at', new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
// //     try {
// //         const activePackages = await PackageActivation.find({
// //             status: 'active',
// //             daysCompleted: { $lt: 30
// //              }
// //         });

// //         // 🔥 INDIA TIME (IST) KE HISAAB SE AAJ RAAT 12 BAJE KA EXACT TIME
// //         const istDateString = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
// //         const startOfToday = new Date(istDateString);
// //         startOfToday.setHours(0, 0, 0, 0);

// //         // 🔥 SPEED OPTIMIZATION: 100 Packages ek sath process honge
// //         const chunkSize = 100;

// //         for (let i = 0; i < activePackages.length; i += chunkSize) {
// //             const chunk = activePackages.slice(i, i + chunkSize);

// //             // Parallel Processing for fast execution
// //             await Promise.all(chunk.map(async (pkg) => {
// //                 try {
// //                     // 🛑 DOUBLE PAYOUT PREVENTION
// //                     const alreadyPaid = await Transaction.findOne({
// //                         userId: pkg.userId,
// //                         type: 'daily_roi',
// //                         description: `Daily ROI (${pkg.daysCompleted + 1}/30) for $${pkg.packageAmount} Package`,
// //                         date: { $gte: startOfToday }
// //                     });

// //                     if (alreadyPaid) {
// //                         console.log(`⏩ Skipping: ROI already paid today for User ${pkg.userId}`);
// //                         return; // Map me hamesha 'return' use hota hai skip karne ke liye
// //                     }

// //                     // 1. User Find Karo
// //                     const user = await User.findOne({ userId: pkg.userId });
// //                     if (!user) return; 

// //                     // 2. User ko Direct ROI do (Directly in roiIncome)
// //                     const roiAmount = pkg.dailyRoi; 
                    
// //                     await User.updateOne(
// //                         { _id: user._id }, 
// //                         { $inc: { roiIncome: roiAmount, totalRoiIncome: roiAmount } }
// //                     );

// //                     // 3. Package Status & Days Update
// //                     pkg.daysCompleted += 1;
// //                     if (pkg.daysCompleted >= pkg.totalDays) {
// //                         pkg.status = 'completed'; 
// //                     }
// //                     await pkg.save();

// //                     // 4. Transaction Log for ROI
// //                     await Transaction.create({
// //                         userId: user.userId,
// //                         type: "daily_roi",
// //                         source: "roi",
// //                         amount: roiAmount,
// //                         description: `Daily ROI (${pkg.daysCompleted}/30) for $${pkg.packageAmount} Package`,
// //                         status: "success",
// //                         date: new Date()
// //                     });

// //                     // =======================================================
// //                     // 🔹 5. DAILY LEVEL INCOME ENGINE (Team Compounding)
// //                     // =======================================================
// //                     const LEVEL_PERCENTAGES = [5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; 
// //                     let currentUplineId = user.sponsorId;
// //                     let currentLevel = 1;

// //                     while (currentUplineId && currentLevel <= 12) {
// //                         const upline = await User.findOne({ userId: currentUplineId });
// //                         if (!upline) break;

// //                         const directsCount = upline.directCount || 0;
// //                         const uplineTopUpAmt = upline.topUpAmount || 0;

// //                         // 🛑 RULE 1: INACTIVE OR < $2 FLUSH (Naya Rule Add Kiya)
// //                         if (!upline.isToppedUp || uplineTopUpAmt < 2) {
// //                             console.log(`[FLUSHED] Daily Level Income flushed for ${upline.userId} at Level ${currentLevel} - ID is INACTIVE or Package < $2.`);
// //                         } 
// //                         // 🛑 RULE 2: STRICT DIRECTS CONDITION (Old rules preserved)
// //                         else if (directsCount < currentLevel) {
// //                             console.log(`[FLUSHED] Daily Level Income flushed for ${upline.userId} at Level ${currentLevel} - Needs ${currentLevel} directs, has ${directsCount}.`);
// //                         } 
// //                         // ✅ SUCCESS: Give Income in levelIncome
// //                         else {
// //                             const percentage = LEVEL_PERCENTAGES[currentLevel - 1];
// //                             const dailyLevelBonus = (roiAmount * percentage) / 100; 

// //                             if (dailyLevelBonus > 0) {
// //                                 // Paise seedhe Level Income me jayenge
// //                                 await User.updateOne(
// //                                     { _id: upline._id }, 
// //                                     { $inc: { levelIncome: dailyLevelBonus, totalLevelIncome: dailyLevelBonus } }
// //                                 );

// //                                 await Transaction.create({
// //                                     userId: upline.userId,
// //                                     type: "daily_level_income",
// //                                     source: "level",
// //                                     amount: dailyLevelBonus,
// //                                     fromUserId: user.userId,
// //                                     description: `Daily Level Income (${percentage}%) from ${user.userId}'s ROI (Level ${currentLevel})`,
// //                                     status: "success",
// //                                     date: new Date()
// //                                 });
// //                             }
// //                         }

// //                         // Move to next upline
// //                         currentUplineId = upline.sponsorId;
// //                         currentLevel++;
// //                     }

// //                 } catch (pkgError) {
// //                     console.error(`❌ Error processing ROI/Level for package ${pkg._id}:`, pkgError);
// //                 }
// //             }));
// //         }
// //         console.log('🎉 Daily ROI & Level Income Cron Job Finished Successfully!');
// //     } catch (error) {
// //         console.error('❌ Cron Job Fatal Error:', error);
// //     }
// // }, {
// //     // 🔥 INDIA TIME (IST) FORCE 
// //     scheduled: true,
// //     timezone: "Asia/Kolkata" 
// // });


// const cron = require('node-cron');
// const User = require('../models/User');
// const PackageActivation = require('../models/PackageActivation');
// const Transaction = require('../models/Transaction');

// // 🕛 Run everyday at 12:15 AM (IST)
// cron.schedule('26 21 * * *', async () => {
//     console.log('⏳ Running Daily ROI & Team Compounding Cron Job at', new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
//     try {
//         const activePackages = await PackageActivation.find({
//             status: 'active',
//             daysCompleted: { $lt: 30 }
//         });

//         // 🔥 INDIA TIME (IST) KE HISAAB SE AAJ RAAT 12 BAJE KA EXACT TIME
//         const istDateString = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
//         const startOfToday = new Date(istDateString);
//         startOfToday.setHours(0, 0, 0, 0);

//         // 🔥 SPEED OPTIMIZATION: 100 Packages ek sath process honge
//         const chunkSize = 100;

//         for (let i = 0; i < activePackages.length; i += chunkSize) {
//             const chunk = activePackages.slice(i, i + chunkSize);

//             // Parallel Processing for fast execution
//             await Promise.all(chunk.map(async (pkg) => {
//                 try {
//                     // 🛑 DOUBLE PAYOUT PREVENTION
//                     const alreadyPaid = await Transaction.findOne({
//                         userId: pkg.userId,
//                         type: 'daily_roi',
//                         description: `Daily ROI (${pkg.daysCompleted + 1}/30) for $${pkg.packageAmount} Package`,
//                         date: { $gte: startOfToday }
//                     });

//                     if (alreadyPaid) {
//                         console.log(`⏩ Skipping: ROI already paid today for User ${pkg.userId}`);
//                         return; // Map me hamesha 'return' use hota hai skip karne ke liye
//                     }

//                     // 1. User Find Karo
//                     const user = await User.findOne({ userId: pkg.userId });
//                     if (!user) return; 

//                     // 2. User ko Direct ROI do (Directly in roiIncome)
//                     const roiAmount = pkg.dailyRoi; 
                    
//                     await User.updateOne(
//                         { _id: user._id }, 
//                         { $inc: { roiIncome: roiAmount, totalRoiIncome: roiAmount } }
//                     );

//                     // 3. Package Status & Days Update
//                     pkg.daysCompleted += 1;
//                     if (pkg.daysCompleted >= pkg.totalDays) {
//                         pkg.status = 'completed'; 
//                     }
//                     await pkg.save();

//                     // 4. Transaction Log for ROI
//                     await Transaction.create({
//                         userId: user.userId,
//                         type: "daily_roi",
//                         source: "roi",
//                         amount: roiAmount,
//                         description: `Daily ROI (${pkg.daysCompleted}/30) for $${pkg.packageAmount} Package`,
//                         status: "success",
//                         date: new Date()
//                     });

//                     // =======================================================
//                     // 🔹 5. DAILY LEVEL INCOME ENGINE (Team Compounding)
//                     // =======================================================
//                     // 🔥 UPDATE: 15 Levels tak sabko exactly 1% milega
//                     const LEVEL_PERCENTAGES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; 
//                     let currentUplineId = user.sponsorId;
//                     let currentLevel = 1;

//                     // 🔥 UPDATE: 12 ki jagah ab loop 15 level tak chalega
//                     while (currentUplineId && currentLevel <= 15) {
//                         const upline = await User.findOne({ userId: currentUplineId });
//                         if (!upline) break;

//                         const directsCount = upline.directCount || 0;
//                         const uplineTopUpAmt = upline.topUpAmount || 0;

//                         // 🛑 RULE 1: INACTIVE OR < $2 FLUSH
//                         if (!upline.isToppedUp || uplineTopUpAmt < 2) {
//                             console.log(`[FLUSHED] Daily Level Income flushed for ${upline.userId} at Level ${currentLevel} - ID is INACTIVE or Package < $2.`);
//                         } 
//                         // 🛑 RULE 2: STRICT DIRECTS CONDITION
//                         else if (directsCount < currentLevel) {
//                             console.log(`[FLUSHED] Daily Level Income flushed for ${upline.userId} at Level ${currentLevel} - Needs ${currentLevel} directs, has ${directsCount}.`);
//                         } 
//                         // ✅ SUCCESS: Give Income in levelIncome
//                         else {
//                             const percentage = LEVEL_PERCENTAGES[currentLevel - 1];
//                             const dailyLevelBonus = (roiAmount * percentage) / 100; 

//                             if (dailyLevelBonus > 0) {
//                                 // Paise seedhe Level Income me jayenge
//                                 await User.updateOne(
//                                     { _id: upline._id }, 
//                                     { $inc: { levelIncome: dailyLevelBonus, totalLevelIncome: dailyLevelBonus } }
//                                 );

//                                 await Transaction.create({
//                                     userId: upline.userId,
//                                     type: "daily_level_income",
//                                     source: "level",
//                                     amount: dailyLevelBonus,
//                                     fromUserId: user.userId,
//                                     description: `Daily Level Income (${percentage}%) from ${user.userId}'s ROI (Level ${currentLevel})`,
//                                     status: "success",
//                                     date: new Date()
//                                 });
//                             }
//                         }

//                         // Move to next upline
//                         currentUplineId = upline.sponsorId;
//                         currentLevel++;
//                     }

//                 } catch (pkgError) {
//                     console.error(`❌ Error processing ROI/Level for package ${pkg._id}:`, pkgError);
//                 }
//             }));
//         }
//         console.log('🎉 Daily ROI & Level Income Cron Job Finished Successfully!');
//     } catch (error) {
//         console.error('❌ Cron Job Fatal Error:', error);
//     }
// }, {
//     // 🔥 INDIA TIME (IST) FORCE 
//     scheduled: true,
//     timezone: "Asia/Kolkata" 
// });

const cron = require('node-cron');
const User = require('../models/User');
const PackageActivation = require('../models/PackageActivation');
const Transaction = require('../models/Transaction');

// 🕛 Run everyday at your specified time
cron.schedule('10 0 * * *', async () => {
        console.log('⏳ Running Daily ROI & Team Compounding Cron Job at', new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    try {
        const activePackages = await PackageActivation.find({
            status: 'active',
            daysCompleted: { $lt: 30 }
        });

        // 🔥 INDIA TIME (IST) KE HISAAB SE AAJ RAAT 12 BAJE KA EXACT TIME
        const istDateString = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const startOfToday = new Date(istDateString);
        startOfToday.setHours(0, 0, 0, 0);

        // 🔥 SPEED OPTIMIZATION: 100 Packages ek sath process honge
        const chunkSize = 100;

        for (let i = 0; i < activePackages.length; i += chunkSize) {
            const chunk = activePackages.slice(i, i + chunkSize);

            // Parallel Processing for fast execution
            await Promise.all(chunk.map(async (pkg) => {
                try {
                    // 🛑 DOUBLE PAYOUT PREVENTION (PERFECT FIX)
                    // Ab hum Package ki Unique ID se check kar rahe hain taaki galti se bhi double na mile
                    const alreadyPaid = await Transaction.findOne({
                        userId: pkg.userId,
                        type: 'daily_roi',
                        description: { $regex: pkg._id.toString() }, // 🔥 Yahan Magic Hai!
                        date: { $gte: startOfToday }
                    });

                    if (alreadyPaid) {
                        console.log(`⏩ Skipping: ROI already paid TODAY for User ${pkg.userId} (Package: ${pkg._id})`);
                        return; // Agar aaj ka mil chuka hai, toh turant skip kar dega
                    }

                    // 1. User Find Karo
                    const user = await User.findOne({ userId: pkg.userId });
                    if (!user) return; 

                    // 2. User ko Direct ROI do (Directly in roiIncome)
                    const roiAmount = pkg.dailyRoi; 
                    
                    await User.updateOne(
                        { _id: user._id }, 
                        { $inc: { roiIncome: roiAmount, totalRoiIncome: roiAmount } }
                    );

                    // 3. Package Status & Days Update
                    pkg.daysCompleted += 1;
                    if (pkg.daysCompleted >= pkg.totalDays) {
                        pkg.status = 'completed'; 
                    }
                    await pkg.save();

                    // 4. Transaction Log for ROI (Description me ID add ki hai)
                    await Transaction.create({
                        userId: user.userId,
                        type: "daily_roi",
                        source: "roi",
                        amount: roiAmount,
                        description: `Daily ROI (${pkg.daysCompleted}/30) for $${pkg.packageAmount} Package (ID: ${pkg._id})`, // 🔥 ID Saved Here
                        status: "success",
                        date: new Date()
                    });

                    // =======================================================
                    // 🔹 5. DAILY LEVEL INCOME ENGINE (Team Compounding)
                    // =======================================================
                    // 🔥 15 Levels tak sabko exactly 1% milega
                    const LEVEL_PERCENTAGES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; 
                    let currentUplineId = user.sponsorId;
                    let currentLevel = 1;

                    // 🔥 Loop 15 level tak chalega
                    while (currentUplineId && currentLevel <= 15) {
                        const upline = await User.findOne({ userId: currentUplineId });
                        if (!upline) break;

                        const directsCount = upline.directCount || 0;
                        const uplineTopUpAmt = upline.topUpAmount || 0;

                        // 🛑 RULE 1: INACTIVE OR < $2 FLUSH
                        if (!upline.isToppedUp || uplineTopUpAmt < 2) {
                            console.log(`[FLUSHED] Daily Level Income flushed for ${upline.userId} at Level ${currentLevel} - ID is INACTIVE or Package < $2.`);
                        } 
                        // 🛑 RULE 2: STRICT DIRECTS CONDITION
                        else if (directsCount < currentLevel) {
                            console.log(`[FLUSHED] Daily Level Income flushed for ${upline.userId} at Level ${currentLevel} - Needs ${currentLevel} directs, has ${directsCount}.`);
                        } 
                        // ✅ SUCCESS: Give Income in levelIncome
                        else {
                            const percentage = LEVEL_PERCENTAGES[currentLevel - 1];
                            const dailyLevelBonus = (roiAmount * percentage) / 100; 

                            if (dailyLevelBonus > 0) {
                                // Paise seedhe Level Income me jayenge
                                await User.updateOne(
                                    { _id: upline._id }, 
                                    { $inc: { levelIncome: dailyLevelBonus, totalLevelIncome: dailyLevelBonus } }
                                );

                                await Transaction.create({
                                    userId: upline.userId,
                                    type: "daily_level_income",
                                    source: "level",
                                    amount: dailyLevelBonus,
                                    fromUserId: user.userId,
                                    description: `Daily Level Income (${percentage}%) from ${user.userId}'s ROI (Level ${currentLevel})`,
                                    status: "success",
                                    date: new Date()
                                });
                            }
                        }

                        // Move to next upline
                        currentUplineId = upline.sponsorId;
                        currentLevel++;
                    }

                } catch (pkgError) {
                    console.error(`❌ Error processing ROI/Level for package ${pkg._id}:`, pkgError);
                }
            }));
        }
        console.log('🎉 Daily ROI & Level Income Cron Job Finished Successfully!');
    } catch (error) {
        console.error('❌ Cron Job Fatal Error:', error);
    }
}, {
    // 🔥 INDIA TIME (IST) FORCE 
    scheduled: true,
    timezone: "Asia/Kolkata" 
});