const cron = require('node-cron');
const User = require('../models/User'); 
const Transaction = require('../models/Transaction'); 

const startPromoRoiCron = () => {

    // =========================================================================
    // 📈 5% DAILY TRADE INCOME & 1% TEAM COMPOUNDING INCOME CRON (Roz Raat 2 Baje)
    // =========================================================================
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log("🚀 Starting Daily Trade Income & Team Compounding Income...");
            
            // Un sabhi users ko dhundho jinhone ye Free wala package liya hai
            const users = await User.find({ "packages.plan": "Free-100-Promo" });
            const todayStr = new Date().toISOString().split('T')[0];

            for (let user of users) {
                // ==========================================================
                // 📊 1. USER KO 5% "DAILY TRADE INCOME" ($5) DENA HAI
                // ==========================================================
                const dailyTradeIncome = 5; // 5% of $100
                
                await User.updateOne(
                    { _id: user._id },
                    { $inc: { roiIncome: dailyTradeIncome, totalRoiIncome: dailyTradeIncome } } 
                );

                await Transaction.create({
                    userId: user.userId,
                    type: 'credit',
                    source: 'roi_income', // DB field same rakhi hai taaki aage error na aaye
                    amount: dailyTradeIncome,
                    description: `5% Daily Trade Income on Total Trading Volume ($100)`,
                    status: 'success'
                });

                // ==========================================================
                // 🤝 2. SPONSOR KO 1% "TEAM COMPOUNDING INCOME" ($1) DENA HAI
                // ==========================================================
                if (user.sponsorId) {
                    const sponsor = await User.findOne({ userId: user.sponsorId });
                    
                    if (sponsor) {
                        const teamCompoundingIncome = 1; // 1% of $100
                        
                        await User.updateOne(
                            { _id: sponsor._id },
                            { 
                                $inc: { 
                                    matchingRoiIncome: teamCompoundingIncome, 
                                    totalMatchingRoiIncome: teamCompoundingIncome
                                } 
                            }
                        );

                        await Transaction.create({
                            userId: sponsor.userId,
                            type: 'credit',
                            source: 'matching_roi',
                            amount: teamCompoundingIncome,
                            description: `1% Team Compounding Income from Direct ${user.name}'s Volume`,
                            status: 'success'
                        });
                    }
                }
            }
            
            console.log("✅ 5% Daily Trade Income & 1% Team Compounding Income Distribution Done!");
        } catch (err) {
            console.error("Promo ROI Cron Error:", err);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" 
    });
};

module.exports = startPromoRoiCron;