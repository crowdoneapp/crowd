// File Name: deductSetupWallet.js (Backend folder ke andar banayein)

// 🔥 .env file se variables load karne ke liye
require('dotenv').config(); 

const mongoose = require('mongoose');
const User = require('./models/User');               // Apna User model ka path sahi set karein
const Transaction = require('./models/Transaction'); // Apna Transaction model ka path sahi set karein

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI; 

const deductSetupWallet = async () => {
    try {
        if (!MONGODB_URI) {
            console.error("❌ Error: MONGO_URI is not defined in your .env file!");
            process.exit(1);
        }

        // 1. Database Connect Karein
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Database connected successfully...");

        // 2. Sirf Setup aur Super Setup ko dhoondhein
        const targetUsers = await User.find({ role: { $in: ['setup', 'super_setup'] } });

        if (targetUsers.length === 0) {
            console.log("⚠️ Koi 'setup' ya 'super_setup' user nahi mila.");
            process.exit(0);
        }

        console.log(`🚀 Found ${targetUsers.length} Setup/Super Setup users. Starting wallet zeroing process...`);

        let updatedCount = 0;

        // 3. Har ek par loop lagayein aur Wallet 0 karein
        for (const user of targetUsers) {
            
            // User ka purana balance note kar lo taaki record me daal sakein
            const deductedAmount = user.walletBalance || 0;

            // Agar balance pehle se 0 hai toh skip kar sakte hain, warna 0 set karein
            if (deductedAmount > 0) {
                // 🔥 Wallet ko poori tarah ZERO (0) karna
                user.walletBalance = 0;

                // 🔥 Transaction Create karna (Jitna minus hua uska exact record)
                await Transaction.create({
                    userId: user.userId,
                    type: 'debit',
                    source: 'manual_debit', 
                    amount: deductedAmount, // Pura bacha hua amount jo clear kiya gaya
                    description: `System deduction: Wallet reset to $0 (Deducted $${deductedAmount.toFixed(2)})`, 
                    status: 'success',
                    date: new Date()
                });

                // Save the user data
                await user.save();
                updatedCount++;

                console.log(`✅ Cleared $${deductedAmount.toFixed(2)} from UserID: ${user.userId} | New Balance: $0.00`);
            } else {
                console.log(`⏩ Skipped UserID: ${user.userId} | Already has $0 balance.`);
            }
        }

        console.log(`🎉 Mission Accomplished! Successfully reset wallets to $0 for ${updatedCount} users.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error running script:", error);
        process.exit(1);
    }
};

// Script Run Karein
deductSetupWallet();