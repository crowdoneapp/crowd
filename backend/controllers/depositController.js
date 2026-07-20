// ========================================================
// 🚀 BACKEND: depositController.js
// ========================================================
const { ethers, HDNodeWallet } = require("ethers");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Deposit = require("../models/Deposit"); 
require("dotenv").config();

// 🔥 PREMIUM RPC (Sirf Sweep/Transfer aur Manual Check ke liye)
const primaryProvider = new ethers.JsonRpcProvider(process.env.RPC_URL_PRIMARY);

const usdtAbi = [
    "function balanceOf(address owner) view returns (uint256)", 
    "function transfer(address to, uint256 amount) returns (bool)"
];

// 🆓 FREE PUBLIC RPC POOL (Backup Cron Checking ke liye taaki credits bachein)
const freeRpcUrls = [
    "https://bsc-dataseed.binance.org/",
    "https://binance.llamarpc.com",
    "https://1rpc.io/bnb",
    "https://bsc.meowrpc.com",
    "https://bsc-dataseed1.defibit.io/"
];

const getRandomFreeProvider = () => {
    const randomIndex = Math.floor(Math.random() * freeRpcUrls.length);
    return new ethers.JsonRpcProvider(freeRpcUrls[randomIndex]);
};

// 1. Generate Address
const getDepositAddress = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id || req.user._id;
        let user = await User.findOne({ userId: Number(userId) }) || await User.findById(userId);
        
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.depositAddress) return res.json({ address: user.depositAddress });

        const pathIndex = parseInt(user._id.toString().substring(0, 8), 16); 
        const hdNode = HDNodeWallet.fromPhrase(process.env.MNEMONIC);
        const userWallet = hdNode.derivePath(`44'/60'/0'/0/${pathIndex}`); 
        
        user.depositAddress = userWallet.address;
        await user.save();

        res.json({ address: user.depositAddress });
    } catch (error) {
        console.error("Generate Address Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// 🛡️ HELPER: Free check for the backup cron job
async function checkUsdtBalanceFree(address) {
    let retries = 2; 
    while (retries > 0) {
        try {
            const freeProvider = getRandomFreeProvider();
            const freeContract = new ethers.Contract(process.env.USDT_CONTRACT_ADDRESS, usdtAbi, freeProvider);
            const usdtWei = await freeContract.balanceOf(address);
            return usdtWei;
        } catch (err) {
            retries--;
            if (retries === 0) return 0n; 
        }
    }
}

// 💎 2. SWEEP FUNDS (The Main Engine)
const sweepFunds = async (user_id) => {
    try {
        const user = await User.findById(user_id);
        if (!user || !user.depositAddress) return;

        // Check using Free RPC first to save credits during background cron
        const usdtWei = await checkUsdtBalanceFree(user.depositAddress);
        const amountInUSDT = parseFloat(ethers.formatUnits(usdtWei, 18));

        // 🔥 NAYA: Minimum 10 USDT Check (Backend Sweep Level)
        if (amountInUSDT < 10) return; 

        console.log(`\n💰💰 [DEPOSIT DETECTED] ${amountInUSDT} USDT for User ${user.userId}... Sweeping via Premium!`);

        const bnbWei = await primaryProvider.getBalance(user.depositAddress);
        const feeData = await primaryProvider.getFeeData();
        const gasPrice = feeData.gasPrice;

        const pathIndex = parseInt(user._id.toString().substring(0, 8), 16); 
        const hdNode = HDNodeWallet.fromPhrase(process.env.MNEMONIC);
        
        const userWallet = hdNode.derivePath(`44'/60'/0'/0/${pathIndex}`).connect(primaryProvider);
        const userUsdtContract = new ethers.Contract(process.env.USDT_CONTRACT_ADDRESS, usdtAbi, userWallet);
        const gasFunderWallet = new ethers.Wallet(process.env.GAS_FUNDER_PRIVATE_KEY, primaryProvider);

        // --- USDT SWEEP ---
        let gasLimit;
        try {
            gasLimit = await userUsdtContract.transfer.estimateGas(process.env.CENTRAL_WALLET_ADDRESS, usdtWei);
        } catch (error) {
            gasLimit = 100000n; 
        }

        const exactBnbNeeded = (gasLimit * gasPrice * 105n) / 100n; 
        
        if (bnbWei < exactBnbNeeded) {
            const bnbToFund = exactBnbNeeded - bnbWei;
            console.log(`⛽ Sending ${ethers.formatEther(bnbToFund)} BNB for fees...`);
            const gasTx = await gasFunderWallet.sendTransaction({ to: userWallet.address, value: bnbToFund });
            await gasTx.wait(); 
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const sweepTx = await userUsdtContract.transfer(process.env.CENTRAL_WALLET_ADDRESS, usdtWei);
        const receipt = await sweepTx.wait(); 
        const actualHash = receipt.hash; 

        // 🔥 FIX: Direct Main Wallet Balance me jod diya
        user.walletBalance = (user.walletBalance || 0) + amountInUSDT;
        await user.save();
        
        await Transaction.create({
            userId: user.userId,
            amount: amountInUSDT,
            type: 'deposit',
            status: 'completed', 
            description: `Auto-Deposit of ${amountInUSDT} USDT via BEP-20`,
            date: new Date(),
            txHash: actualHash,  
            txnHash: actualHash  
        });

        await Deposit.create({
            userId: user.userId,
            amount: amountInUSDT,
            txnHash: actualHash, 
            status: 'approved',
            createdAt: new Date()
        });

        console.log(`✅ [SUCCESS] ${amountInUSDT} USDT swept! Hash: ${actualHash}`);

        // --- BNB RECOVERY ---
        try {
            const currentBnbBalance = await primaryProvider.getBalance(userWallet.address);
            const freshFeeData = await primaryProvider.getFeeData();
            const costToSendBnb = 21000n * freshFeeData.gasPrice; 

            if (currentBnbBalance > costToSendBnb) {
                const sweepableBnb = currentBnbBalance - costToSendBnb;
                if (sweepableBnb > ethers.parseEther("0.0003")) {
                    const bnbSweepTx = await userWallet.sendTransaction({
                        to: gasFunderWallet.address, 
                        value: sweepableBnb
                    });
                    await bnbSweepTx.wait();
                }
            }
        } catch (bnbError) {
            console.log(`⚠️ BNB recovery skipped: ${bnbError.message}`);
        }

    } catch (error) {
        console.error(`❌ Sweep Failed for User ${user_id}:`, error.code || error.message);
    }
};

// 🚀 3. NAYA FUNCTION: User-Triggered Manual Check
const verifyAndProcessDeposit = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const user = await User.findOne({ userId: Number(userId) }) || await User.findById(userId);
        
        if (!user || !user.depositAddress) {
            return res.status(400).json({ success: false, message: "Deposit address not found. Please generate one first." });
        }

        console.log(`🔍 [MANUAL CHECK] User ${user.userId} checking deposit on ${user.depositAddress}`);

        const userUsdtContract = new ethers.Contract(process.env.USDT_CONTRACT_ADDRESS, usdtAbi, primaryProvider);
        const usdtWei = await userUsdtContract.balanceOf(user.depositAddress);
        const amountInUSDT = parseFloat(ethers.formatUnits(usdtWei, 18));

        // 🔥 NAYA: Minimum 10 USDT Check (User Manual Check Level)
        if (amountInUSDT < 10) {
            return res.status(400).json({ 
                success: false, 
message: "Minimum deposit requirement is 10 USDT. Please allow 1-2 minutes for blockchain network synchronization. If funds do not appear in your Asset Vault within 5 minutes, please contact our support team with your Transaction Hash (TXID) for manual reconciliation."            });
        }

        // Fund mil gaya
        res.json({ 
            success: true, 
            message: `Success! ${amountInUSDT} USDT detected. It is being credited to your main wallet in a few seconds.` 
        });

        // Background sweep chalu kar do
        sweepFunds(user._id).catch(err => console.error("Background sweep error:", err));

    } catch (error) {
        console.error("Manual Deposit Check Error:", error);
        res.status(500).json({ success: false, message: "Error checking deposit. Please try again." });
    }
};

module.exports = {
    getDepositAddress,
    sweepFunds,
    verifyAndProcessDeposit
};