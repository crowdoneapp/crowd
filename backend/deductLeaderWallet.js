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

        // 2. Sirf Setup aur Super Setup ko dhoondhein 🔥 (YAHAN CHANGE KIYA HAI)
        const targetUsers = await User.find({ role: { $in: ['setup', 'super_setup'] } });

        if (targetUsers.length === 0) {
            console.log("⚠️ Koi 'setup' ya 'super_setup' user nahi mila.");
            process.exit(0);
        }

        console.log(`🚀 Found ${targetUsers.length} Setup/Super Setup users. Starting $30 deduction...`);

        let updatedCount = 0;

        // 3. Har ek par loop lagayein aur 30 minus karein
        for (const user of targetUsers) {
            
            // $30 Minus karna
            user.walletBalance = (user.walletBalance || 0) - 30;
            
            // Transaction Create karna (Taaki user ke Wallet History me Entry dikhe)
            await Transaction.create({
                userId: user.userId,
                type: 'debit',
                source: 'manual_debit', 
                amount: 30,
                description: 'System deduction for Setup/Super Setup Maintenance/Activation', // 🔥 Detail change ki
                status: 'success',
                date: new Date()
            });

            // Save the user data
            await user.save();
            updatedCount++;
            
            console.log(`✅ Deducted $30 from UserID: ${user.userId} | New Balance: $${user.walletBalance.toFixed(2)}`);
        }

        console.log(`🎉 Mission Accomplished! Successfully deducted $30 from ${updatedCount} users.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error running script:", error);
        process.exit(1);
    }
};

// Script Run Karein
deductSetupWallet();