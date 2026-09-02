const sendWithdrawalTelegramAlert = require('../utils/telegramWithdrawalHelper');
const { countryNames } = require('../utils/fakeData');

// 10 ke multiples wale amounts ka array
const ALLOWED_AMOUNTS = [10, 20, 30, 40, 50, 60, 70, 100, 150, 200, 500, 1000];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 🔥 100% Accurate IST Time Helper (Server chahe US me ho ya Europe me) 🔥
const getISTHour = () => {
    const d = new Date();
    // Server ke timezone ko poori tarah ignore karke sirf India ka time uthayega
    const istString = d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    return istDate.getHours(); // Ye hamesha 0 se 23 ke beech Indian time dega
};

const processFakeWithdrawal = async () => {
    try {
        const currentHour = getISTHour();
        let selectedCountry = "IN";

        // 🔥 TIME & DEMOGRAPHIC LOGIC 🔥
        const isDayTime = (currentHour >= 6 && currentHour < 24); 
        const randomChance = Math.random();

        const foreignCountries = ["MY", "ZA", "NG", "PK", "BD", "LK", "VN", "GH", "KE"];

        if (isDayTime) {
            // Din me (6 AM to 12 AM IST): 80% Indian, 20% Foreign
            selectedCountry = (randomChance < 0.8) ? "IN" : getRandomItem(foreignCountries);
        } else {
            // Raat me (12 AM to 6 AM IST): 20% Indian, 80% Foreign
            selectedCountry = (randomChance < 0.2) ? "IN" : getRandomItem(foreignCountries);
        }
        
        // Naam select karo us country ke hisaab se
        let randomName = "Crypto User";
        if (countryNames && countryNames[selectedCountry]) {
            randomName = getRandomItem(countryNames[selectedCountry]);
        }

        // Random ID (6 Digit) aur Amount
        const randomId = Math.floor(100000 + Math.random() * 900000); 
        const randomAmount = getRandomItem(ALLOWED_AMOUNTS);

        await sendWithdrawalTelegramAlert(randomName, randomId, randomAmount, selectedCountry);
    } catch (err) {
        console.error("Fake Withdrawal Error:", err);
    }
};

// Ek sath 1 se 3 alerts bhejne ka function
const runRandomBatch = async () => {
    const count = Math.floor(Math.random() * 3) + 1; // 1, 2, ya 3 alert ek sath
    console.log(`🚀 Sending ${count} Fake Withdrawal Alert(s) in this batch...`);

    for (let i = 0; i < count; i++) {
        await processFakeWithdrawal();
        
        // Alerts ke beech 15 se 45 second ka chhota gap taaki real lage
        if (i < count - 1) {
            const delayMs = Math.floor(Math.random() * 30000) + 15000;
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
};

// 🔥 MASTER TIMING ENGINE 🔥
const scheduleNextWithdrawal = () => {
    const currentHour = getISTHour();
    const isDayTime = (currentHour >= 6 && currentHour < 24); 
    
    let nextRunMinutes;
    
    if (isDayTime) {
        // DIN MEIN FAST: 1 minute se 15 minute ke beech DYNAMICALLY chalega
        nextRunMinutes = Math.floor(Math.random() * 15) + 1; 
    } else {
        // RAAT MEIN SLOW: 15 minute se 45 minute ke beech chalega
        nextRunMinutes = Math.floor(Math.random() * 31) + 15; 
    }

    console.log(`⏳ Next Fake Withdrawal scheduled in exactly ${nextRunMinutes} minutes...`);

    // Timer set karo agle batch ke liye
    setTimeout(async () => {
        await runRandomBatch();
        
        // Loop chalate raho
        scheduleNextWithdrawal();
    }, nextRunMinutes * 60 * 1000); // Minutes ko milliseconds me convert kiya
};

const startFakeWithdrawalCron = () => {
    console.log("🌟 Fake Withdrawal Dynamic Engine Started...");
     // Server start hote hi pehla timer chalu ho jayega
    scheduleNextWithdrawal();
};

module.exports = startFakeWithdrawalCron;