// const axios = require('axios');
// const nodeHtmlToImage = require('node-html-to-image');
// const FormData = require('form-data');
// require('dotenv').config();

// // Helper: Amount ko Words me badalne ke liye
// const numberToWords = (num) => {
//     const words = {
//         10: "TEN", 20: "TWENTY", 30: "THIRTY", 40: "FORTY", 50: "FIFTY",
//         100: "ONE HUNDRED", 200: "TWO HUNDRED", 300: "THREE HUNDRED",
//         400: "FOUR HUNDRED", 500: "FIVE HUNDRED", 600: "SIX HUNDRED",
//         700: "SEVEN HUNDRED", 800: "EIGHT HUNDRED", 900: "NINE HUNDRED",
//         1000: "ONE THOUSAND"
//     };
//     return words[Math.floor(num)] || num.toString();
// };

// const sendTelegramAlert = async (userName, userId, amount, countryCode) => {
//     const botToken = process.env.TELEGRAM_BOT_TOKEN;
//     const chatId = process.env.TELEGRAM_CHAT_ID;

//     if (!botToken || !chatId) {
//         console.log("⚠️ Telegram Bot Token ya Chat ID missing hai.");
//         return;
//     }

//     const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//     const displayCountry = (countryCode || 'IN').toUpperCase();
    
//     // 🔥 YAHAN DYNAMICALLY AMOUNT WORDS MEIN CONVERT HO RAHA HAI
//     const amountInWords = `${numberToWords(amount)} USDT DOLLARS`;

//     const htmlTemplate = `
//     <html>
//       <head>
//         <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;700;900&family=Great+Vibes&family=Roboto+Mono:wght@700&display=swap" rel="stylesheet">
//         <style>
//           * { box-sizing: border-box; margin: 0; padding: 0; }
//           body {
//             width: 600px;
//             height: 1080px; 
//             background-color: #000000; 
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-family: 'Montserrat', sans-serif;
//             padding: 20px;
//           }
//           .cert-container {
//             width: 100%;
//             height: 100%;
//             background-color: #020b1c; 
//             border: 3px solid #d4af37; 
//             outline: 1px solid #d4af37; 
//             outline-offset: 4px; 
//             box-shadow: inset 0 0 40px rgba(212,175,55,0.15); 
//             padding: 40px 30px;
//             display: flex;
//             flex-direction: column;
//             justify-content: space-between;
//             align-items: center;
//             color: #ffffff;
//             position: relative;
//           }
          
//           /* Logo Area */
//           .logo-area { text-align: center; margin-bottom: 10px; }
//           .logo-title { font-size: 24px; font-weight: 900; letter-spacing: 0.1em; line-height: 1; margin-top: 10px; }
//           .logo-sub { color: #4da8da; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 4px; }
          
//           /* Header Lines */
//           .header-lines { display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 15px; }
//           .line { height: 1px; width: 64px; background-color: #d4af37; }
//           .header-label { color: #d4af37; letter-spacing: 0.2em; font-size: 14px; padding: 0 10px; font-weight: 700; }
          
//           /* Title */
//           .title-area { text-align: center; margin-bottom: 20px; }
//           .main-heading { font-family: 'Cinzel', serif; font-size: 60px; font-weight: 900; color: #d4af37; text-shadow: 1px 1px 2px #000, 0 0 1em #d4af37; text-transform: uppercase; line-height: 1.1;}
//           .sub-heading { font-family: 'Cinzel', serif; font-size: 22px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 15px; }
//           .stars { display: flex; justify-content: center; gap: 4px; align-items: center; color: #d4af37; }
          
//           /* Body Text */
//           .certify-text { color: #cbd5e1; font-size: 12px; letter-spacing: 0.1em; text-align: center; }
          
//           /* Name Section */
//           .name-container { display: flex; align-items: center; justify-content: center; width: 100%; margin: 25px 0; }
//           .name-line-left { height: 3px; flex: 1; max-width: 100px; background: linear-gradient(to right, transparent, rgba(248,181,0,0.7), #b8860b); border-radius: 999px; }
//           .name-line-right { height: 3px; flex: 1; max-width: 100px; background: linear-gradient(to left, transparent, rgba(248,181,0,0.7), #b8860b); border-radius: 999px; }
//           .name-text { font-size: 55px; font-weight: 900; letter-spacing: 0.05em; background: linear-gradient(to bottom, #fceabb, #f8b500, #b8860b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; padding: 0 20px; line-height: 1.1; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));}
          
//           /* ID Badge */
//           .id-badge { color: #4da8da; font-family: 'Roboto Mono', monospace; font-weight: 700; font-size: 18px; letter-spacing: 0.1em; background-color: #020b1c; padding: 6px 24px; border-radius: 999px; border: 1px solid rgba(6,182,212,0.5); display: inline-block; margin-bottom: 25px; }
          
//           .action-text { color: #cbd5e1; font-size: 14px; text-align: center; line-height: 1.5; letter-spacing: 0.05em; margin-bottom: 25px; }
          
//           /* Amount Box */
//           .amount-wrapper { display: flex; justify-content: center; align-items: center; margin-bottom: 35px; width: 100%; }
//           .leaf { color: #d4af37; font-size: 40px; opacity: 0.8; font-family: serif; }
//           .amount-container { position: relative; border: 2px solid #d4af37; padding: 25px 50px; background-color: #020b1c; box-shadow: inset 0 0 15px rgba(212,175,55,0.1); min-width: 320px; text-align: center; margin: 0 20px;}
//           .amount-value { font-size: 80px; font-weight: 900; color: #d4af37; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); letter-spacing: -0.05em; line-height: 1;}
//           .amount-ribbon { position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%); width: 110%; background: linear-gradient(to right, #b38728, #fceabb, #b38728); color: #4a3504; font-weight: 900; font-size: 11px; padding: 8px 10px; border: 1px solid #8a6d1c; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); text-transform: uppercase; }
          
//           /* Thank you text */
//           .thank-you-1 { color: #cbd5e1; font-size: 12px; text-align: center; margin-bottom: 5px; }
//           .thank-you-2 { color: #4da8da; font-weight: 700; font-size: 15px; letter-spacing: 0.05em; text-align: center; margin-bottom: 30px;}
          
//           /* Date Badge */
//           .date-container { display: flex; justify-content: center; margin-bottom: 30px; }
//           .date-badge { display: flex; align-items: center; gap: 10px; color: #4da8da; background-color: rgba(6, 24, 56, 0.8); border: 1px solid rgba(6,182,212,0.3); padding: 12px 30px; border-radius: 999px; box-shadow: 0 0 15px rgba(6,182,212,0.1); }
//           .date-text { font-family: 'Roboto Mono', monospace; font-weight: 700; font-size: 16px; letter-spacing: 0.1em; }
          
//           /* Footer */
//           .footer-area { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 10px; margin-bottom: 20px;}
          
//           .footer-left { text-align: left; width: 33%; }
//           .signature-font { font-family: 'Great Vibes', cursive; font-size: 28px; color: #e2e8f0; opacity: 0.9; margin-bottom: 5px; }
//           .signature-line { width: 90px; height: 1px; background-color: #475569; margin-bottom: 5px; }
//           .auth-text { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
          
//           .footer-center { display: flex; flex-direction: column; align-items: center; position: relative; width: 34%; }
//           .shield-bg { background: linear-gradient(to bottom, #fceabb, #b38728); padding: 5px; border-radius: 999px 999px 0 0; border: 1px solid #000; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); z-index: 1;}
//           .shield-inner { background-color: #020b1c; border-radius: 999px; padding: 8px; display: flex; align-items: center; justify-content: center;}
//           .secure-ribbon { background: linear-gradient(to right, #b38728, #fceabb, #b38728); color: #4a3504; font-weight: 900; font-size: 9px; padding: 6px 15px; border: 1px solid #8a6d1c; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); text-transform: uppercase; margin-top: -10px; z-index: 2; width: 140px;}
          
//           .footer-right { text-align: right; width: 33%; }
//           .ty-font { font-family: 'Great Vibes', cursive; font-size: 32px; color: #4da8da; margin-bottom: 5px; }
//           .support-text { font-size: 10px; color: #94a3b8; line-height: 1.3; letter-spacing: 0.05em; }
          
//           /* Bottom line */
//           .bottom-line { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); width: 100%; text-align: center; padding-top: 15px; color: #d4af37; font-size: 10px; letter-spacing: 0.4em; opacity: 0.8; text-transform: uppercase;}
//         </style>
//       </head>
//       <body>
//         <div class="cert-container">
          
//           <!-- Logo -->
//           <div class="logo-area">
//             <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4da8da" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
//             <div class="logo-title">CROWDONE</div>
//             <div class="logo-sub">Together, We Grow</div>
//           </div>
          
//           <!-- Header Label -->
//           <div class="header-lines">
//             <div class="line"></div>
//             <div class="header-label">TOP-UP</div>
//             <div class="line"></div>
//           </div>
          
//           <!-- Title -->
//           <div class="title-area">
//             <h1 class="main-heading">DONATION</h1>
//             <div class="sub-heading">CERTIFICATE</div>
//             <div class="stars">
//                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
//                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
//                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
//                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
//             </div>
//           </div>
          
//           <div class="certify-text">This is to certify that</div>
          
//           <!-- Name Container -->
//           <div class="name-container">
//             <div class="name-line-left"></div>
//             <div class="name-text">${userName}</div>
//             <div class="name-line-right"></div>
//           </div>
          
//           <!-- ID -->
//           <div class="id-badge">ID: ${userId}</div>
          
//           <div class="action-text">has successfully made a TOP-UP (Donation)<br>of</div>
          
//           <!-- YAHAN DEKHO BHAU: DYNAMIC AMOUNT LAGA HAI -->
//           <div class="amount-wrapper">
//              <div class="leaf" style="transform: rotate(-20deg);">🌿</div>
//              <div class="amount-container">
//                 <div class="amount-value">$${amount}</div>
//                 <div class="amount-ribbon">${amountInWords}</div>
//              </div>
//              <div class="leaf" style="transform: scaleX(-1) rotate(-20deg);">🌿</div>
//           </div>
          
//           <!-- Thank you -->
//           <div class="thank-you-1">Thank you for your trust and support.</div>
//           <div class="thank-you-2">Together, we grow stronger!</div>
          
//           <!-- Date -->
//           <div class="date-container">
//              <div class="date-badge">
//                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
//                <span class="date-text">${dateStr}</span>
//              </div>
//           </div>
          
//           <!-- Footer -->
//           <div class="footer-area">
//              <div class="footer-left">
//                 <div class="signature-font">Team CrowdOne</div>
//                 <div class="signature-line"></div>
//                 <div class="auth-text">Authorized Signature</div>
//              </div>
             
//              <div class="footer-center">
//                 <div class="shield-bg">
//                    <div class="shield-inner">
//                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
//                    </div>
//                 </div>
//                 <div class="secure-ribbon">VERIFIED & SECURE</div>
//              </div>
             
//              <div class="footer-right">
//                 <div class="ty-font">Thank You!</div>
//                 <div class="support-text">Your support helps us<br>build a strong<br>community.</div>
//              </div>
//           </div>
          
//           <div class="bottom-line">• TOGETHER, WE GROW •</div>
          
//         </div>
//       </body>
//     </html>
//     `;

//     try {
//         console.log(`⏳ Generating Premium React-Clone Image for ${userName} ($${amount})...`);

//         // HTML se Image convert karna
//         const imageBuffer = await nodeHtmlToImage({
//             html: htmlTemplate,
//             quality: 100,
//             type: 'jpeg',
//             puppeteerArgs: { 
//                 args: ['--no-sandbox', '--disable-setuid-sandbox'],
//                 defaultViewport: { width: 600, height: 1080 } 
//             }
//         });

//         // Telegram ko bhejna
//         const formData = new FormData();
//         formData.append('chat_id', chatId);
//         formData.append('photo', imageBuffer, 'certificate.jpg');
        
//         // Caption
//         formData.append('caption', `🎉 *Congratulations ${userName}!*\n🆔 *ID:* ${userId}\n💰 *Package:* $${amount}\n🌍 *Country:* ${displayCountry}\n\n🌿 _Together, We Grow Stronger!_`, { contentType: 'text/plain' });
//         formData.append('parse_mode', 'Markdown');

//         const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
//         await axios.post(url, formData, {
//             headers: formData.getHeaders()
//         });

//         console.log(`✅ Telegram Premium Certificate sent for User: ${userId}`);
//     } catch (error) {
//         console.error("❌ Telegram Send Error:", error.message);
//     }
// };

// module.exports = sendTelegramAlert;


const axios = require('axios');
const nodeHtmlToImage = require('node-html-to-image');
const FormData = require('form-data');
require('dotenv').config();

// Helper: Amount ko Words me badalne ke liye
const numberToWords = (num) => {
    const words = {
        10: "TEN", 20: "TWENTY", 30: "THIRTY", 40: "FORTY", 50: "FIFTY",
        100: "ONE HUNDRED", 200: "TWO HUNDRED", 300: "THREE HUNDRED",
        400: "FOUR HUNDRED", 500: "FIVE HUNDRED", 600: "SIX HUNDRED",
        700: "SEVEN HUNDRED", 800: "EIGHT HUNDRED", 900: "NINE HUNDRED",
        1000: "ONE THOUSAND"
    };
    return words[Math.floor(num)] || num.toString();
};

// 🔥 NAYA HELPER: Country Code ko Full Name + Flag mein badalne ke liye
const getFullCountryName = (code) => {
    const countryMap = {
        "IN": "🇮🇳 India",
        "MY": "🇲🇾 Malaysia",
        "ZA": "🇿🇦 South Africa",
        "NG": "🇳🇬 Nigeria",
        "PK": "🇵🇰 Pakistan",
        "BD": "🇧🇩 Bangladesh",
        "LK": "🇱🇰 Sri Lanka",
        "VN": "🇻🇳 Vietnam",
        "GH": "🇬🇭 Ghana",
        "KE": "🇰🇪 Kenya"
    };
    const upperCode = (code || 'IN').toUpperCase();
    return countryMap[upperCode] || `🌍 ${upperCode}`;
};

const sendTelegramAlert = async (userName, userId, amount, countryCode) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.log("⚠️ Telegram Bot Token ya Chat ID missing hai.");
        return;
    }

    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    // 🔥 YAHAN FULL COUNTRY NAME USE HO RAHA HAI
    const displayCountry = getFullCountryName(countryCode);
    
    // 🔥 YAHAN DYNAMICALLY AMOUNT WORDS MEIN CONVERT HO RAHA HAI
    const amountInWords = `${numberToWords(amount)} USDT DOLLARS`;

    const htmlTemplate = `
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;700;900&family=Great+Vibes&family=Roboto+Mono:wght@700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 600px;
            height: 1080px; 
            background-color: #000000; 
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', sans-serif;
            padding: 20px;
          }
          .cert-container {
            width: 100%;
            height: 100%;
            background-color: #020b1c; 
            border: 3px solid #d4af37; 
            outline: 1px solid #d4af37; 
            outline-offset: 4px; 
            box-shadow: inset 0 0 40px rgba(212,175,55,0.15); 
            padding: 40px 30px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            color: #ffffff;
            position: relative;
          }
          
          /* Logo Area */
          .logo-area { text-align: center; margin-bottom: 10px; }
          .logo-title { font-size: 24px; font-weight: 900; letter-spacing: 0.1em; line-height: 1; margin-top: 10px; }
          .logo-sub { color: #4da8da; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 4px; }
          
          /* Header Lines */
          .header-lines { display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 15px; }
          .line { height: 1px; width: 64px; background-color: #d4af37; }
          .header-label { color: #d4af37; letter-spacing: 0.2em; font-size: 14px; padding: 0 10px; font-weight: 700; }
          
          /* Title */
          .title-area { text-align: center; margin-bottom: 20px; }
          .main-heading { font-family: 'Cinzel', serif; font-size: 60px; font-weight: 900; color: #d4af37; text-shadow: 1px 1px 2px #000, 0 0 1em #d4af37; text-transform: uppercase; line-height: 1.1;}
          .sub-heading { font-family: 'Cinzel', serif; font-size: 22px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 15px; }
          .stars { display: flex; justify-content: center; gap: 4px; align-items: center; color: #d4af37; }
          
          /* Body Text */
          .certify-text { color: #cbd5e1; font-size: 12px; letter-spacing: 0.1em; text-align: center; }
          
          /* Name Section */
          .name-container { display: flex; align-items: center; justify-content: center; width: 100%; margin: 25px 0; }
          .name-line-left { height: 3px; flex: 1; max-width: 100px; background: linear-gradient(to right, transparent, rgba(248,181,0,0.7), #b8860b); border-radius: 999px; }
          .name-line-right { height: 3px; flex: 1; max-width: 100px; background: linear-gradient(to left, transparent, rgba(248,181,0,0.7), #b8860b); border-radius: 999px; }
          .name-text { font-size: 55px; font-weight: 900; letter-spacing: 0.05em; background: linear-gradient(to bottom, #fceabb, #f8b500, #b8860b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; padding: 0 20px; line-height: 1.1; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));}
          
          /* ID Badge */
          .id-badge { color: #4da8da; font-family: 'Roboto Mono', monospace; font-weight: 700; font-size: 18px; letter-spacing: 0.1em; background-color: #020b1c; padding: 6px 24px; border-radius: 999px; border: 1px solid rgba(6,182,212,0.5); display: inline-block; margin-bottom: 25px; }
          
          .action-text { color: #cbd5e1; font-size: 14px; text-align: center; line-height: 1.5; letter-spacing: 0.05em; margin-bottom: 25px; }
          
          /* Amount Box */
          .amount-wrapper { display: flex; justify-content: center; align-items: center; margin-bottom: 35px; width: 100%; }
          .leaf { color: #d4af37; font-size: 40px; opacity: 0.8; font-family: serif; }
          .amount-container { position: relative; border: 2px solid #d4af37; padding: 25px 50px; background-color: #020b1c; box-shadow: inset 0 0 15px rgba(212,175,55,0.1); min-width: 320px; text-align: center; margin: 0 20px;}
          .amount-value { font-size: 80px; font-weight: 900; color: #d4af37; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); letter-spacing: -0.05em; line-height: 1;}
          .amount-ribbon { position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%); width: 110%; background: linear-gradient(to right, #b38728, #fceabb, #b38728); color: #4a3504; font-weight: 900; font-size: 11px; padding: 8px 10px; border: 1px solid #8a6d1c; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); text-transform: uppercase; }
          
          /* Thank you text */
          .thank-you-1 { color: #cbd5e1; font-size: 12px; text-align: center; margin-bottom: 5px; }
          .thank-you-2 { color: #4da8da; font-weight: 700; font-size: 15px; letter-spacing: 0.05em; text-align: center; margin-bottom: 30px;}
          
          /* Date Badge */
          .date-container { display: flex; justify-content: center; margin-bottom: 30px; }
          .date-badge { display: flex; align-items: center; gap: 10px; color: #4da8da; background-color: rgba(6, 24, 56, 0.8); border: 1px solid rgba(6,182,212,0.3); padding: 12px 30px; border-radius: 999px; box-shadow: 0 0 15px rgba(6,182,212,0.1); }
          .date-text { font-family: 'Roboto Mono', monospace; font-weight: 700; font-size: 16px; letter-spacing: 0.1em; }
          
          /* Footer */
          .footer-area { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 10px; margin-bottom: 20px;}
          
          .footer-left { text-align: left; width: 33%; }
          .signature-font { font-family: 'Great Vibes', cursive; font-size: 28px; color: #e2e8f0; opacity: 0.9; margin-bottom: 5px; }
          .signature-line { width: 90px; height: 1px; background-color: #475569; margin-bottom: 5px; }
          .auth-text { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
          
          .footer-center { display: flex; flex-direction: column; align-items: center; position: relative; width: 34%; }
          .shield-bg { background: linear-gradient(to bottom, #fceabb, #b38728); padding: 5px; border-radius: 999px 999px 0 0; border: 1px solid #000; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); z-index: 1;}
          .shield-inner { background-color: #020b1c; border-radius: 999px; padding: 8px; display: flex; align-items: center; justify-content: center;}
          .secure-ribbon { background: linear-gradient(to right, #b38728, #fceabb, #b38728); color: #4a3504; font-weight: 900; font-size: 9px; padding: 6px 15px; border: 1px solid #8a6d1c; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); text-transform: uppercase; margin-top: -10px; z-index: 2; width: 140px;}
          
          .footer-right { text-align: right; width: 33%; }
          .ty-font { font-family: 'Great Vibes', cursive; font-size: 32px; color: #4da8da; margin-bottom: 5px; }
          .support-text { font-size: 10px; color: #94a3b8; line-height: 1.3; letter-spacing: 0.05em; }
          
          /* Bottom line */
          .bottom-line { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); width: 100%; text-align: center; padding-top: 15px; color: #d4af37; font-size: 10px; letter-spacing: 0.4em; opacity: 0.8; text-transform: uppercase;}
        </style>
      </head>
      <body>
        <div class="cert-container">
          
          <!-- Logo -->
          <div class="logo-area">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4da8da" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            <div class="logo-title">CROWDONE</div>
            <div class="logo-sub">Together, We Grow</div>
          </div>
          
          <!-- Header Label -->
          <div class="header-lines">
            <div class="line"></div>
            <div class="header-label">TOP-UP</div>
            <div class="line"></div>
          </div>
          
          <!-- Title -->
          <div class="title-area">
            <h1 class="main-heading">DONATION</h1>
            <div class="sub-heading">CERTIFICATE</div>
            <div class="stars">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
          </div>
          
          <div class="certify-text">This is to certify that</div>
          
          <!-- Name Container -->
          <div class="name-container">
            <div class="name-line-left"></div>
            <div class="name-text">${userName}</div>
            <div class="name-line-right"></div>
          </div>
          
          <!-- ID -->
          <div class="id-badge">ID: ${userId}</div>
          
          <div class="action-text">has successfully made a TOP-UP (Donation)<br>of</div>
          
          <!-- YAHAN DEKHO BHAU: DYNAMIC AMOUNT LAGA HAI -->
          <div class="amount-wrapper">
             <div class="leaf" style="transform: rotate(-20deg);">🌿</div>
             <div class="amount-container">
                <div class="amount-value">$${amount}</div>
                <div class="amount-ribbon">${amountInWords}</div>
             </div>
             <div class="leaf" style="transform: scaleX(-1) rotate(-20deg);">🌿</div>
          </div>
          
          <!-- Thank you -->
          <div class="thank-you-1">Thank you for your trust and support.</div>
          <div class="thank-you-2">Together, we grow stronger!</div>
          
          <!-- Date -->
          <div class="date-container">
             <div class="date-badge">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
               <span class="date-text">${dateStr}</span>
             </div>
          </div>
          
          <!-- Footer -->
          <div class="footer-area">
             <div class="footer-left">
                <div class="signature-font">Team CrowdOne</div>
                <div class="signature-line"></div>
                <div class="auth-text">Authorized Signature</div>
             </div>
             
             <div class="footer-center">
                <div class="shield-bg">
                   <div class="shield-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                   </div>
                </div>
                <div class="secure-ribbon">VERIFIED & SECURE</div>
             </div>
             
             <div class="footer-right">
                <div class="ty-font">Thank You!</div>
                <div class="support-text">Your support helps us<br>build a strong<br>community.</div>
             </div>
          </div>
          
          <div class="bottom-line">• TOGETHER, WE GROW •</div>
          
        </div>
      </body>
    </html>
    `;

    try {
        console.log(`⏳ Generating Premium React-Clone Image for ${userName} ($${amount})...`);

        // HTML se Image convert karna
        const imageBuffer = await nodeHtmlToImage({
            html: htmlTemplate,
            quality: 100,
            type: 'jpeg',
            puppeteerArgs: { 
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                defaultViewport: { width: 600, height: 1080 } 
            }
        });

        // Telegram ko bhejna
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', imageBuffer, 'certificate.jpg');
        
        // Caption
        formData.append('caption', `🎉 *Congratulations ${userName}!*\n🆔 *ID:* ${userId}\n💰 *Package:* $${amount}\n📍 *Country:* ${displayCountry}\n\n🌿 _Together, We Grow Stronger!_`, { contentType: 'text/plain' });
        formData.append('parse_mode', 'Markdown');

        const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        await axios.post(url, formData, {
            headers: formData.getHeaders()
        });

        console.log(`✅ Telegram Premium Certificate sent for User: ${userId}`);
    } catch (error) {
        console.error("❌ Telegram Send Error:", error.message);
    }
};

module.exports = sendTelegramAlert;