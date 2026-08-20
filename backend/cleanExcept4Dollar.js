require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const User = require('./models/User'); 
const Withdrawal = require('./models/Withdrawal'); 

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

const cleanWithdrawalsExcept4 = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log("❌ Error: MONGO_URI missing in .env");
            process.exit(1);
        }

        console.log("⏳ Database se connect ho raha hai...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected!");

        // 🔥 TIME KA FILTER HATA DIYA 🔥
        // Sirf PENDING status wale saare withdrawals nikal lo
        const allPending = await Withdrawal.find({ status: "pending" });

        if (allPending.length === 0) {
            console.log("ℹ️ System mein koi bhi pending withdrawal nahi mila.");
            mongoose.connection.close();
            process.exit(0);
        }

        // 🛡️ Logic: $4 wale ko chhod do (Safe), Baaki sab pakad lo (Delete)
        // (Math.round isliye lagaya taaki 4.00 exact 4 hi count ho, point ka error na aaye)
        const toDelete = allPending.filter(w => Math.round(w.grossAmount) !== 4);
        const toKeep = allPending.filter(w => Math.round(w.grossAmount) === 4);

        console.log(`\n📊 HISAAB-KITAB:`);
        console.log(`🔍 Total Pending Entries: ${allPending.length}`);
        console.log(`🛡️ SAFE RAKHI GAYI ($4.00 wali): ${toKeep.length}`);
        console.log(`🗑️ DELETE HONE WALI ($6, $19, etc): ${toDelete.length}\n`);

        if (toDelete.length === 0) {
            console.log("✅ Delete karne ke liye kuch nahi bacha. Sab pehle se theek hai.");
            mongoose.connection.close();
            process.exit(0);
        }

        // Delete hone walo ka netAmount calculate karo taaki user ka totalWithdrawn minus ho sake
        const userDeductions = {};
        const idsToDelete = [];

        toDelete.forEach(w => {
            idsToDelete.push(w._id); // Delete karne ke liye ID save kar lo
            if (!userDeductions[w.userId]) userDeductions[w.userId] = 0;
            userDeductions[w.userId] += w.netAmount;
        });

        const showList = await askQuestion("👀 Kya aap list dekhna chahte hain ki kis user ka kitna minus hoga? (Y/N): ");
        if (showList.trim().toLowerCase() === 'y') {
            console.log("\n📋 --- USERS JINKA GALAT WITHDRAWAL KATEGA ---");
            console.table(Object.keys(userDeductions).map(userId => ({
                UserID: userId,
                "Amount To Deduct (Revert)": userDeductions[userId]
            })));
            console.log("----------------------------------------------\n");
        }

        const confirm = await askQuestion("⚠️ Kya aap sach me $4 walon ko chhod kar baaki saare pending DELETE karna chahte hain? (Y/N): ");
        
        if (confirm.trim().toLowerCase() === 'y') {
            // 1. BACKUP SAVE KAREIN
            const logFilePath = path.join(__dirname, 'deleted_withdrawals_except_4.json');
            fs.writeFileSync(logFilePath, JSON.stringify(toDelete, null, 2));
            console.log(`\n📂 Backup save ho gaya hai: ${logFilePath}`);

            console.log("⏳ Withdrawals delete ho rahe hain aur User ka totalWithdrawn theek ho raha hai...");

            // 2. USER KA totalWithdrawn MINUS KAREIN
            for (const userId of Object.keys(userDeductions)) {
                const amountToMinus = userDeductions[userId];
                await User.updateOne(
                    { userId: userId },
                    { $inc: { totalWithdrawn: -amountToMinus } } 
                );
            }

            // 3. DATABASE SE DELETE KAREIN (Sirf toDelete wali IDs)
            const deleteResult = await Withdrawal.deleteMany({ _id: { $in: idsToDelete } });
            
            console.log(`✅ Success! ${deleteResult.deletedCount} entries delete ho gayi. Aapke $4 wale withdrawals ekdum SAFE hain!`);
        } else {
            console.log("🛑 Operation Cancelled.");
        }

    } catch (error) {
        console.error("❌ Script Error:", error);
    } finally {
        mongoose.connection.close();
        rl.close();
        console.log("🔌 Database Connection Closed.");
    }
};

cleanWithdrawalsExcept4();