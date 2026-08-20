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

const deleteSpecificTimeWithdrawals = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log("❌ Error: MONGO_URI missing in .env");
            process.exit(1);
        }

        console.log("⏳ Database se connect ho raha hai...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected!");

        // 🔥 EXACT TIME WINDOWS (Sirf yahi time check hoga, Date nahi) 🔥
        // Window 1: 12:45 PM to 12:55 PM (12:50 wale ko pakadne ke liye)
        const t1Start = mongoose.Types.ObjectId.createFromTime(Math.floor(new Date('2026-08-20T12:45:00.000+05:30').getTime() / 1000));
        const t1End = mongoose.Types.ObjectId.createFromTime(Math.floor(new Date('2026-08-20T12:55:00.000+05:30').getTime() / 1000));

        // Window 2: 2:10 PM to 2:15 PM (2:12 wale ko pakadne ke liye)
        const t2Start = mongoose.Types.ObjectId.createFromTime(Math.floor(new Date('2026-08-20T14:10:00.000+05:30').getTime() / 1000));
        const t2End = mongoose.Types.ObjectId.createFromTime(Math.floor(new Date('2026-08-20T14:15:00.000+05:30').getTime() / 1000));

        // Query: Sirf in 2 time par bane huye saare Installments (4 mahine tak ke)
        const query = {
            status: "pending", 
            description: { $regex: /Installment/i },
            $or: [
                { _id: { $gte: t1Start, $lte: t1End } }, // 12:50 PM click
                { _id: { $gte: t2Start, $lte: t2End } }  // 2:12 PM click
            ]
        };

        const scheduledWithdrawals = await Withdrawal.find(query);

        if (scheduledWithdrawals.length === 0) {
            console.log("ℹ️ 12:50 PM ya 2:12 PM ko koi galat withdrawal nahi mila.");
            mongoose.connection.close();
            process.exit(0);
        }

        console.log(`🔍 Total ${scheduledWithdrawals.length} entries mili hain jo theek 12:50 PM aur 2:12 PM ko bani thi!`);

        const userDeductions = {};
        scheduledWithdrawals.forEach(w => {
            if (!userDeductions[w.userId]) userDeductions[w.userId] = 0;
            userDeductions[w.userId] += w.netAmount;
        });

        const showList = await askQuestion("👀 Kya aap list dekhna chahte hain ki in specific times par kisne lagaya aur kitna minus hoga? (Y/N): ");
        if (showList.trim().toLowerCase() === 'y') {
            console.log("\n📋 --- AFFECTED USERS ---");
            console.table(Object.keys(userDeductions).map(userId => ({
                UserID: userId,
                "Amount To Deduct (Revert)": userDeductions[userId]
            })));
            console.log("--------------------------\n");
        }

        const confirm = await askQuestion("⚠️ Kya aap sach me in do timings par bane saare future installments DELETE karna chahte hain? (Y/N): ");
        
        if (confirm.trim().toLowerCase() === 'y') {
            const logFilePath = path.join(__dirname, 'deleted_time_specific_withdrawals.json');
            fs.writeFileSync(logFilePath, JSON.stringify(scheduledWithdrawals, null, 2));
            console.log(`\n📂 Backup save ho gaya hai: ${logFilePath}`);

            console.log("⏳ Withdrawals delete ho rahe hain aur User ka totalWithdrawn minus ho raha hai...");

            for (const userId of Object.keys(userDeductions)) {
                const amountToMinus = userDeductions[userId];
                await User.updateOne(
                    { userId: userId },
                    { $inc: { totalWithdrawn: -amountToMinus } } 
                );
            }

            const deleteResult = await Withdrawal.deleteMany(query);
            
            console.log(`✅ Success! ${deleteResult.deletedCount} entries hamesha ke liye delete ho gayi hain. Baaki data ekdum safe hai!`);
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

deleteSpecificTimeWithdrawals();