 

const cron = require('node-cron');
const User = require('../models/User');
const { sweepFunds } = require('../controllers/depositController');

const startSweeper = () => {
    // 🔥 AB YE HAR 5 MINUTE NAHI, HAR 12 GHANTE MEIN CHALEGA (Backup Check)
    cron.schedule('0 */12 * * *', async () => {
        console.log("🔍 Running Backup Automated Deposit Check (Every 12 Hours)...");
        
        try {
            const usersWithWallets = await User.find({ 
                depositAddress: { $exists: true, $ne: null } 
            });

            console.log(`Total Wallets to check in background: ${usersWithWallets.length}`);

            // BATCH PROCESSING: 20 users ek sath
            const batchSize = 20; 
            
            for (let i = 0; i < usersWithWallets.length; i += batchSize) {
                const batch = usersWithWallets.slice(i, i + batchSize);
                
                await Promise.all(batch.map(async (user) => {
                    try {
                        await sweepFunds(user._id);
                    } catch (err) {
                        // Silent catch taaki ek fail ho toh baki na ruke
                    }
                }));
                
                // ⏱️ Delay increased to 1500ms (1.5 sec) taaki Free RPC block na karein
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            
            console.log("✅ Backup Automated check complete.");
        } catch (error) {
            console.error("❌ Error during backup automated sweep:", error);
        }
    });
};

module.exports = startSweeper;