require('dotenv').config(); // .env se data lene ke liye
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Apne User model ka sahi path yahan dalein
const User = require('./models/User'); 

// Console me Yes/No poochne ke liye setup
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};

const resetWalletBalances = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log("❌ Error: .env file mein MONGO_URI nahi mili!");
            process.exit(1);
        }

        console.log("⏳ Connecting to Database...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected!");

        // 1. Un users ko find karein jinka balance 0 se bada aur 100 se chhota hai
        const targetUsers = await User.find({ 
            walletBalance: { $gt: 0, $lt: 100 } 
        }).select('userId name walletBalance email');

        if (targetUsers.length === 0) {
            console.log("ℹ️ Koi aisa user nahi mila jiska balance 100 se kam ho.");
            mongoose.connection.close();
            process.exit(0);
        }

        console.log(`🔍 Total ${targetUsers.length} users mile jinka balance 100 se kam hai.`);

        // 2. User se poochein ki list dekhni hai ya nahi
        const showList = await askQuestion("👀 Kya aap pehle in users ki list dekhna chahte hain? (Y/N): ");
        
        if (showList.trim().toLowerCase() === 'y') {
            console.log("\n📋 --- USERS LIST ---");
            console.table(targetUsers.map(u => ({
                UserID: u.userId,
                Name: u.name,
                Balance: u.walletBalance
            })));
            console.log("----------------------\n");
        }

        // 3. Final confirmation balance reset karne ke liye
        const confirmReset = await askQuestion("⚠️ Kya aap sach me in sabhi ka walletBalance 0 karna chahte hain? (Y/N): ");

        if (confirmReset.trim().toLowerCase() === 'y') {
            // Backup save karna
            const logData = targetUsers.map(u => ({
                userId: u.userId,
                name: u.name,
                email: u.email,
                oldBalance: u.walletBalance,
                resetDate: new Date().toISOString()
            }));

            const logFilePath = path.join(__dirname, 'wallet_reset_log.json');
            fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
            console.log(`\n📂 Backup saved successfully at: ${logFilePath}`);

            // DB Update karna
            const updateResult = await User.updateMany(
                { walletBalance: { $gt: 0, $lt: 100 } },
                { $set: { walletBalance: 0 } }
            );

            console.log(`✅ Successfully reset walletBalance to 0 for ${updateResult.modifiedCount} users.`);
        } else {
            console.log("🛑 Operation cancelled. Kisi ka balance 0 nahi kiya gaya.");
        }

    } catch (error) {
        console.error("❌ Script Error:", error);
    } finally {
        mongoose.connection.close();
        rl.close();
        console.log("🔌 Database Connection Closed.");
    }
};

resetWalletBalances();