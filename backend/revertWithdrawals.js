require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Apne models ka sahi path dalein
const User = require('./models/User'); 
const Withdrawal = require('./models/Withdrawal'); 

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

const deleteScheduledWithdrawals = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log("❌ Error: MONGO_URI missing in .env");
            process.exit(1);
        }

        console.log("⏳ Database se connect ho raha hai...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected!");

        // Aaj raat 12:00 AM ka time
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // 🔥 MAIN LOGIC: Sirf unko dhoondho jinke description me "Installment" likha hai
        const scheduledWithdrawals = await Withdrawal.find({ 
            createdAt: { $gte: startOfToday },
            description: { $regex: /Installment/i } // Ye sirf 7 din wale pakdega
        });

        if (scheduledWithdrawals.length === 0) {
            console.log("ℹ️ Aaj ki date mein koi bhi '7-din wala scheduled' withdrawal nahi mila.");
            mongoose.connection.close();
            process.exit(0);
        }

        console.log(`🔍 Total ${scheduledWithdrawals.length} scheduled installments mile hain.`);

        // User wise total amount calculate karein (taaki totalWithdrawn minus ho sake)
        const userDeductions = {};
        scheduledWithdrawals.forEach(w => {
            if (!userDeductions[w.userId]) userDeductions[w.userId] = 0;
            userDeductions[w.userId] += w.netAmount;
        });

        const showList = await askQuestion("👀 Kya aap list dekhna chahte hain ki kiska kitna minus hoga? (Y/N): ");
        if (showList.trim().toLowerCase() === 'y') {
            console.log("\n📋 --- USERS & AMOUNT TO REVERT ---");
            console.table(Object.keys(userDeductions).map(userId => ({
                UserID: userId,
                "Amount To Deduct (Revert)": userDeductions[userId]
            })));
            console.log("-----------------------------------\n");
        }

        const confirm = await askQuestion("⚠️ Kya aap sach me ye scheduled withdrawals DELETE karna chahte hain? (Y/N): ");
        
        if (confirm.trim().toLowerCase() === 'y') {
            // 1. JSON FILE MEIN DATA SAVE KAREIN
            const logFilePath = path.join(__dirname, 'deleted_scheduled_withdrawals.json');
            fs.writeFileSync(logFilePath, JSON.stringify(scheduledWithdrawals, null, 2));
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

            // 3. DATABASE SE DELETE KAREIN
            const deleteResult = await Withdrawal.deleteMany({ 
                createdAt: { $gte: startOfToday },
                description: { $regex: /Installment/i }
            });
            
            console.log(`✅ Success! ${deleteResult.deletedCount} scheduled entries delete ho gayi hain.`);
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

deleteScheduledWithdrawals();