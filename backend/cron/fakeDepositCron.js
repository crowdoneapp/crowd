const sendTelegramAlert = require('../utils/telegramHelper'); 
const { countryNames } = require('../utils/fakeData');
const { ethers } = require('ethers');

// 🔥 DUMMY MODELS
const DummyUser = require('../models/DummyUser');
const DummyTransaction = require('../models/DummyTransaction');

require('dotenv').config();

const USDT_ADDRESS = "0x55d398326f99059ff775485246999027b3197955";
const ALLOWED_AMOUNTS = [2, 5, 10, 20, 30, 50, 100, 200, 300, 400, 500, 1000];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getISTHour = () => {
    const d = new Date();
    const istString = d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    return istDate.getHours();
};

const generateFakeTxHash = () => {
    const chars = 'abcdef0123456789';
    let fakeHash = '0x';
    for (let i = 0; i < 64; i++) {
        fakeHash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return fakeHash;
};

const getRealUsdtTransfer = async () => {
    try {
        const rpcUrl = process.env.RPC_URL_PRIMARY || "https://bsc-dataseed.binance.org/";
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const latestBlock = await provider.getBlockNumber();
        
        const transferEventSignature = ethers.id("Transfer(address,address,uint256)");
        const logs = await provider.getLogs({
            address: USDT_ADDRESS,
            topics: [transferEventSignature],
            fromBlock: latestBlock - 15,
            toBlock: latestBlock
        });

        const shuffledLogs = logs.sort(() => 0.5 - Math.random());

        for (let log of shuffledLogs) {
            const rawAmount = BigInt(log.data);
            const amountInUSDT = Number(ethers.formatUnits(rawAmount, 18));
            
            if (ALLOWED_AMOUNTS.includes(amountInUSDT)) {
                try {
                    const tx = await provider.getTransaction(log.transactionHash);
                    if (tx && tx.to && tx.to.toLowerCase() === USDT_ADDRESS.toLowerCase() && tx.data.startsWith("0xa9059cbb")) {
                        return { hash: log.transactionHash, amount: amountInUSDT };
                    }
                } catch (txErr) {
                    continue; 
                }
            }
        }
        return null; 
    } catch (error) {
        console.log("⚠️ BSC RPC Issue, falling back to generated hash...");
        return null;
    }
};

const processFakeDeposit = async () => {
    try {
        let selectedCountry = "IN";
        const foreignCountries = ["MY", "ZA", "NG", "PK", "BD", "LK", "VN", "GH", "KE"];

        const randomChance = Math.random();
        if (randomChance < 0.85) {
            selectedCountry = "IN";
        } else {
            selectedCountry = getRandomItem(foreignCountries);
        }
        
        let randomName = "Crypto User";
        if (countryNames && countryNames[selectedCountry]) {
            randomName = getRandomItem(countryNames[selectedCountry]);
        }

        const randomId = Math.floor(1000000 + Math.random() * 9000000); 
        
        let finalAmount;
        let finalHash;
        
        const realData = await getRealUsdtTransfer();
        
        if (realData) {
            finalAmount = realData.amount; 
            finalHash = realData.hash;     
        } else {
            finalAmount = getRandomItem(ALLOWED_AMOUNTS);
            finalHash = generateFakeTxHash();
        }

        // ========================================================
        // 🔥 DATABASE ME DUMMY DATA SAVE KARNA 🔥
        // ========================================================
        try {
            await DummyUser.create({
                userId: randomId,
                name: randomName,
                country: selectedCountry,
                mobile: "0000000000",
                email: `dummy${randomId}@crowdone.world`,
                password: "dummypassword",
                transactionPassword: "dummypassword",
                sponsorId: "100000", 
                isActive: true,
                walletBalance: finalAmount
            });

            const fakeGeneratedId = "TRX" + Math.floor(1000000 + Math.random() * 9000000);

            await DummyTransaction.create({
                generatedId: fakeGeneratedId,
                userId: randomId,
                amount: finalAmount,
                type: 'deposit',
                status: 'completed',
                description: `Auto-Deposit of ${finalAmount} USDT via BEP-20`,
                date: new Date(),
                txHash: finalHash,
                txnHash: finalHash
            });

            console.log(`💾 Saved Dummy User ${randomId} & Deposit of $${finalAmount} to Dummy Models!`);
        } catch (dbErr) {
            console.log(`⚠️ DB Save Error:`, dbErr.message);
        }
        // ========================================================

        await sendTelegramAlert(randomName, randomId, finalAmount, selectedCountry, finalHash);
    } catch (err) {
        console.error("Fake Deposit Error:", err);
    }
};

const runRandomBatch = async () => {
    const count = Math.floor(Math.random() * 3) + 1; 
    console.log(`🚀 Sending & Saving ${count} Fake Deposit(s) in this batch...`);

    for (let i = 0; i < count; i++) {
        await processFakeDeposit();
        if (i < count - 1) {
            const delayMs = Math.floor(Math.random() * 5000) + 2000;
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
};

const scheduleNextDeposit = () => {
    const currentHour = getISTHour();
    const isDayTime = (currentHour >= 6 && currentHour < 24); 
    
    let nextRunMinutes;
    if (isDayTime) {
        nextQueryMinutes = Math.floor(Math.random() * 17) + 2; 
        nextRunMinutes = Math.floor(Math.random() * 17) + 2; 
    } else {
        nextRunMinutes = Math.floor(Math.random() * 31) + 20; 
    }

    console.log(`⏳ Next Fake Deposit scheduled in exactly ${nextRunMinutes} minutes...`);

    setTimeout(async () => {
        await runRandomBatch();
        scheduleNextDeposit();
    }, nextRunMinutes * 60 * 1000); // 👈 WAPAS MINUTES MEIN KAR DIYA (* 60 * 1000)
};

const startFakeDepositCron = () => {
    console.log("🌟 Fake Deposit Engine Started (Normal Production Mode)...");
    scheduleNextDeposit();
};

module.exports = startFakeDepositCron;