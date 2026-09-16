// // const sendWithdrawalTelegramAlert = require('../utils/telegramWithdrawalHelper');
// // const { countryNames } = require('../utils/fakeData');

// // // 10 ke multiples wale amounts ka array
// // const ALLOWED_AMOUNTS = [10, 20, 30, 40, 50, 60, 70, 100, 150, 200, 500, 1000];

// // const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// // // 🔥 100% Accurate IST Time Helper (Server chahe US me ho ya Europe me) 🔥
// // const getISTHour = () => {
// //     const d = new Date();
// //     // Server ke timezone ko poori tarah ignore karke sirf India ka time uthayega
// //     const istString = d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
// //     const istDate = new Date(istString);
// //     return istDate.getHours(); // Ye hamesha 0 se 23 ke beech Indian time dega
// // };

// // const processFakeWithdrawal = async () => {
// //     try {
// //         const currentHour = getISTHour();
// //         let selectedCountry = "IN";

// //         // 🔥 TIME & DEMOGRAPHIC LOGIC 🔥
// //         const isDayTime = (currentHour >= 6 && currentHour < 24); 
// //         const randomChance = Math.random();

// //         const foreignCountries = ["MY", "ZA", "NG", "PK", "BD", "LK", "VN", "GH", "KE"];

// //         if (isDayTime) {
// //             // Din me (6 AM to 12 AM IST): 80% Indian, 20% Foreign
// //             selectedCountry = (randomChance < 0.8) ? "IN" : getRandomItem(foreignCountries);
// //         } else {
// //             // Raat me (12 AM to 6 AM IST): 20% Indian, 80% Foreign
// //             selectedCountry = (randomChance < 0.2) ? "IN" : getRandomItem(foreignCountries);
// //         }
        
// //         // Naam select karo us country ke hisaab se
// //         let randomName = "Crypto User";
// //         if (countryNames && countryNames[selectedCountry]) {
// //             randomName = getRandomItem(countryNames[selectedCountry]);
// //         }

// //         // Random ID (6 Digit) aur Amount
// //         const randomId = Math.floor(100000 + Math.random() * 900000); 
// //         const randomAmount = getRandomItem(ALLOWED_AMOUNTS);

// //         await sendWithdrawalTelegramAlert(randomName, randomId, randomAmount, selectedCountry);
// //     } catch (err) {
// //         console.error("Fake Withdrawal Error:", err);
// //     }
// // };

// // // Ek sath 1 se 3 alerts bhejne ka function
// // const runRandomBatch = async () => {
// //     const count = Math.floor(Math.random() * 3) + 1; // 1, 2, ya 3 alert ek sath
// //     console.log(`🚀 Sending ${count} Fake Withdrawal Alert(s) in this batch...`);

// //     for (let i = 0; i < count; i++) {
// //         await processFakeWithdrawal();
        
// //         // Alerts ke beech 15 se 45 second ka chhota gap taaki real lage
// //         if (i < count - 1) {
// //             const delayMs = Math.floor(Math.random() * 30000) + 15000;
// //             await new Promise(resolve => setTimeout(resolve, delayMs));
// //         }
// //     }
// // };

// // // 🔥 MASTER TIMING ENGINE 🔥
// // const scheduleNextWithdrawal = () => {
// //     const currentHour = getISTHour();
// //     const isDayTime = (currentHour >= 6 && currentHour < 24); 
    
// //     let nextRunMinutes;
    
// //     if (isDayTime) {
// //         // DIN MEIN FAST: 1 minute se 15 minute ke beech DYNAMICALLY chalega
// //         nextRunMinutes = Math.floor(Math.random() * 15) + 1; 
// //     } else {
// //         // RAAT MEIN SLOW: 15 minute se 45 minute ke beech chalega
// //         nextRunMinutes = Math.floor(Math.random() * 31) + 15; 
// //     }

// //     console.log(`⏳ Next Fake Withdrawal scheduled in exactly ${nextRunMinutes} minutes...`);

// //     // Timer set karo agle batch ke liye
// //     setTimeout(async () => {
// //         await runRandomBatch();
        
// //         // Loop chalate raho
// //         scheduleNextWithdrawal();
// //     }, nextRunMinutes * 60 * 1000); // Minutes ko milliseconds me convert kiya
// // };

// // const startFakeWithdrawalCron = () => {
// //     console.log("🌟 Fake Withdrawal Dynamic Engine Started...");
// //      // Server start hote hi pehla timer chalu ho jayega
// //     scheduleNextWithdrawal();
// // };

// // module.exports = startFakeWithdrawalCron;



// const sendWithdrawalTelegramAlert = require('../utils/telegramWithdrawalHelper');
// const { countryNames } = require('../utils/fakeData');

// // 10 ke multiples wale amounts ka array
// const ALLOWED_AMOUNTS = [10, 20, 30, 40, 50, 60, 70, 100, 150, 200, 500, 1000];

// const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// // 🔥 100% Accurate IST Time Helper 🔥
// const getISTHour = () => {
//     const d = new Date();
//     const istString = d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
//     const istDate = new Date(istString);
//     return istDate.getHours(); // 0 se 23
// };

// const getISTMinute = () => {
//     const d = new Date();
//     const istString = d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
//     const istDate = new Date(istString);
//     return istDate.getMinutes();
// };

// const processFakeWithdrawal = async () => {
//     try {
//         const currentHour = getISTHour();
//         let selectedCountry = "IN";

//         const isDayTime = (currentHour >= 6 && currentHour < 24); 
//         const randomChance = Math.random();
//         const foreignCountries = ["MY", "ZA", "NG", "PK", "BD", "LK", "VN", "GH", "KE"];

//         if (isDayTime) {
//             selectedCountry = (randomChance < 0.8) ? "IN" : getRandomItem(foreignCountries);
//         } else {
//             selectedCountry = (randomChance < 0.2) ? "IN" : getRandomItem(foreignCountries);
//         }
        
//         let randomName = "Crypto User";
//         if (countryNames && countryNames[selectedCountry]) {
//             randomName = getRandomItem(countryNames[selectedCountry]);
//         }

//         // 7-digit ID matching with your setup (ya agar 6-digit rakhi hai toh waisa hi)
//         const randomId = Math.floor(100000 + Math.random() * 900000); 
//         const randomAmount = getRandomItem(ALLOWED_AMOUNTS);

//         await sendWithdrawalTelegramAlert(randomName, randomId, randomAmount, selectedCountry);
//     } catch (err) {
//         console.error("Fake Withdrawal Error:", err);
//     }
// };

// const runRandomBatch = async () => {
//     const currentHour = getISTHour();
    
//     // 🔥 Agar shaam ke 6 se 8 (18:00 - 20:00 IST) hain, toh ek sath 2 se 4 alerts bachenge (Super Active Evening)
//     let count = Math.floor(Math.random() * 3) + 1; 
//     if (currentHour >= 18 && currentHour < 20) {
//         count = Math.floor(Math.random() * 3) + 2; // 2 to 4 alerts
//     }

//     console.log(`🚀 Sending ${count} Fake Withdrawal Alert(s) in this batch (IST Hour: ${currentHour}:00)...`);

//     for (let i = 0; i < count; i++) {
//         await processFakeWithdrawal();
        
//         if (i < count - 1) {
//             const delayMs = Math.floor(Math.random() * 15000) + 5000; // 5 to 20 seconds gap between batch items
//             await new Promise(resolve => setTimeout(resolve, delayMs));
//         }
//     }
// };

// // 🔥 MASTER TIMING ENGINE WITH 6 PM - 8 PM PEAK 🔥
// const scheduleNextWithdrawal = () => {
//     const currentHour = getISTHour();
//     const isDayTime = (currentHour >= 6 && currentHour < 24); 
    
//     // 🔥 SPECIAL EVENING PEAK: 6 PM to 8 PM (18:00 to 20:00 IST)
//     const isEveningPeak = (currentHour >= 18 && currentHour < 20);

//     let nextRunMinutes;
    
//     if (isEveningPeak) {
//         // Shaam 6 se 8 baje ke beech FASTER hoga: Har 1 se 4 minute mein message aayega!
//         nextRunMinutes = Math.floor(Math.random() * 4) + 1; 
//     } else if (isDayTime) {
//         // Baaki din mein: 1 se 15 minute
//         nextRunMinutes = Math.floor(Math.random() * 15) + 1; 
//     } else {
//         // Raat mein: 15 se 45 minute
//         nextRunMinutes = Math.floor(Math.random() * 31) + 15; 
//     }

//     console.log(`⏳ Next Fake Withdrawal scheduled in exactly ${nextRunMinutes} minutes (IST Hour: ${currentHour})...`);

//     setTimeout(async () => {
//         await runRandomBatch();
//         scheduleNextWithdrawal();
//     }, nextRunMinutes * 60 * 1000);
// };

// const startFakeWithdrawalCron = () => {
//     console.log("🌟 Fake Withdrawal Dynamic Engine Started (Evening 6-8 PM Peak Configured)...");
//     scheduleNextWithdrawal();
// };

// module.exports = startFakeWithdrawalCron;

const sendWithdrawalTelegramAlert = require('../utils/telegramWithdrawalHelper');
const { countryNames } = require('../utils/fakeData');

// 10 ke multiples wale amounts ka array
const ALLOWED_AMOUNTS = [10, 20, 30, 40, 50, 60, 70, 100, 150, 200, 500, 1000];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 🔥 100% Accurate IST Time Helper 🔥
const getISTHour = () => {
    const d = new Date();
    const istString = d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    return istDate.getHours(); // 0 se 23
};

// 🔥 Helper: Agle 6 PM IST tak kitne minutes bache hain calculate karne ke liye
const getMinutesUntil6PM = () => {
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    
    const currentHour = istDate.getHours();
    
    let targetDate = new Date(istDate);
    if (currentHour >= 20) {
        // Agar raat ke 8 baje ke baad ka time hai, toh target agle din ka 6 PM (18:00) hai
        targetDate.setDate(targetDate.getDate() + 1);
    }
    targetDate.setHours(18, 0, 0, 0);
    
    const diffMs = targetDate.getTime() - istDate.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    return diffMinutes > 0 ? diffMinutes : 1;
};

const processFakeWithdrawal = async () => {
    try {
        // Shaam 6 se 8 ke beech zyadatar Indian users rakhenge (80% IN, 20% Foreign)
        const randomChance = Math.random();
        const foreignCountries = ["MY", "ZA", "NG", "PK", "BD", "LK", "VN", "GH", "KE"];
        const selectedCountry = (randomChance < 0.8) ? "IN" : getRandomItem(foreignCountries);
        
        let randomName = "Crypto User";
        if (countryNames && countryNames[selectedCountry]) {
            randomName = getRandomItem(countryNames[selectedCountry]);
        }

        const randomId = Math.floor(100000 + Math.random() * 900000); 
        const randomAmount = getRandomItem(ALLOWED_AMOUNTS);

        await sendWithdrawalTelegramAlert(randomName, randomId, randomAmount, selectedCountry);
    } catch (err) {
        console.error("Fake Withdrawal Error:", err);
    }
};

const runRandomBatch = async () => {
    const currentHour = getISTHour();
    
    // Sirf 6 PM se 8 PM ke beech ek sath 2 se 4 alerts bachenge (Super Active Peak)
    const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 alerts

    console.log(`🚀 Sending ${count} Fake Withdrawal Alert(s) in this batch (Evening Peak IST Hour: ${currentHour}:00)...`);

    for (let i = 0; i < count; i++) {
        await processFakeWithdrawal();
        
        if (i < count - 1) {
            const delayMs = Math.floor(Math.random() * 10000) + 5000; // 5 to 15 seconds gap
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
};

// 🔥 STRICT 6 PM - 8 PM IST MASTER ENGINE 🔥
const scheduleNextWithdrawal = () => {
    const currentHour = getISTHour();
    
    // 🔥 STRICT CHECK: Sirf Shaam 6 se 8 (18:00 to 20:00 IST)
    const isEveningPeak = (currentHour >= 18 && currentHour < 20);

    if (isEveningPeak) {
        // Peak time ke andar hain: Har 1 se 3 minute mein fast batch chalega!
        const nextRunMinutes = Math.floor(Math.random() * 3) + 1; 

        console.log(`⏳ Next Fake Withdrawal batch in exactly ${nextRunMinutes} minutes (Evening Peak Active)...`);

        setTimeout(async () => {
            await runRandomBatch();
            scheduleNextWithdrawal();
        }, nextRunMinutes * 60 * 1000);

    } else {
        // Agar 6 PM - 8 PM ke alawa koi aur time hai, toh engine chupchaap agle 6 PM tak ke liye so jayega!
        const waitMinutes = getMinutesUntil6PM();
        console.log(`🌙 Outside Peak Window (Current IST Hour: ${currentHour}). Pausing cron until next 6 PM IST (approx ${waitMinutes} minutes)...`);

        setTimeout(async () => {
            scheduleNextWithdrawal();
        }, waitMinutes * 60 * 1000);
    }
};

const startFakeWithdrawalCron = () => {
    console.log("🌟 Strict Evening-Only (6 PM - 8 PM IST) Fake Withdrawal Engine Started...");
    scheduleNextWithdrawal();
};

module.exports = startFakeWithdrawalCron;