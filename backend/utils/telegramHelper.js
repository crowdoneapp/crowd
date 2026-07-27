// // backend/utils/telegramHelper.js
// const axios = require('axios');
// require('dotenv').config();

// const sendTelegramAlert = async (userName, userId, amount, countryCode) => {
//     const botToken = process.env.TELEGRAM_BOT_TOKEN;
//     const chatId = process.env.TELEGRAM_CHAT_ID;

//     if (!botToken || !chatId) {
//         console.log("⚠️ Telegram Bot Token ya Chat ID missing hai.");
//         return;
//     }

//     // Country flag emoji and full name logic
//     const countryMap = {
//         'IN': '🇮🇳 India', 'ZA': '🇿🇦 South Africa', 'NG': '🇳🇬 Nigeria', 'PK': '🇵🇰 Pakistan',
//         'BD': '🇧🇩 Bangladesh', 'LK': '🇱🇰 Sri Lanka', 'MY': '🇲🇾 Malaysia', 'VN': '🇻🇳 Vietnam',
//         'GH': '🇬🇭 Ghana', 'KE': '🇰🇪 Kenya', 'US': '🇺🇸 United States', 'GB': '🇬🇧 United Kingdom', 
//         'AE': '🇦🇪 UAE'
//     };
//     const cCode = (countryCode || 'IN').toUpperCase();
//     const displayCountry = countryMap[cCode] || `🌍 ${cCode}`;

//     // VIP Format Message (Jaise aapka modal hai)
//     const message = `
// 🏆 *DONATION CERTIFICATE* 🏆
// ━━━━━━━━━━━━━━━━━━━━
// 🎉 *Congratulations!* 🎉
// A New Member has joined the CrowdOne Family!

// 👤 *Name:* ${userName}
// 🆔 *User ID:* ${userId}
// 🌍 *Country:* ${displayCountry}
// 💰 *Package:* *$${amount} USDT*
// 📅 *Date:* ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}

// 🌿 *Together, We Grow Stronger!* 🌿
// 🌐 www.yourwebsite.com
//     `;

//     try {
//         const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
//         await axios.post(url, {
//             chat_id: chatId,
//             text: message,
//             parse_mode: 'Markdown' // Taaki text bold aur format me aaye
//         });
//         console.log(`✅ Telegram Alert sent for User: ${userId}`);
//     } catch (error) {
//         console.error("❌ Telegram Send Error:", error.response ? error.response.data : error.message);
//     }
// };

// module.exports = sendTelegramAlert;