const axios = require('axios');
const nodeHtmlToImage = require('node-html-to-image');
const FormData = require('form-data');
require('dotenv').config();

const numberToWords = (num) => {
    const words = {
        10: "TEN", 20: "TWENTY", 30: "THIRTY", 40: "FORTY", 50: "FIFTY",
        60: "SIXTY", 70: "SEVENTY", 80: "EIGHTY", 90: "NINETY",
        100: "ONE HUNDRED", 150: "ONE HUNDRED FIFTY", 200: "TWO HUNDRED", 
        300: "THREE HUNDRED", 400: "FOUR HUNDRED", 500: "FIVE HUNDRED", 
        1000: "ONE THOUSAND"
    };
    return words[Math.floor(num)] || num.toString();
};

const getFullCountryName = (code) => {
    // Jo bhi data aaye usko uppercase kar lo space hata kar
    const rawCode = (code || 'IN').toUpperCase().trim();

    // Mapping dictionary jisme short aur full name dono hain
    const countryMap = {
        "IN": "🇮🇳 India", "INDIA": "🇮🇳 India",
        "MY": "🇲🇾 Malaysia", "MALAYSIA": "🇲🇾 Malaysia",
        "ZA": "🇿🇦 South Africa", "SOUTH AFRICA": "🇿🇦 South Africa",
        "NG": "🇳🇬 Nigeria", "NIGERIA": "🇳🇬 Nigeria",
        "PK": "🇵🇰 Pakistan", "PAKISTAN": "🇵🇰 Pakistan",
        "BD": "🇧🇩 Bangladesh", "BANGLADESH": "🇧🇩 Bangladesh",
        "LK": "🇱🇰 Sri Lanka", "SRI LANKA": "🇱🇰 Sri Lanka",
        "VN": "🇻🇳 Vietnam", "VIETNAM": "🇻🇳 Vietnam",
        "GH": "🇬🇭 Ghana", "GHANA": "🇬🇭 Ghana",
        "KE": "🇰🇪 Kenya", "KENYA": "🇰🇪 Kenya",
        "GLOBAL": "🌍 Global"
    };

    // Agar map me mil jaye toh Flag ke sath return karo, warna normal name ke aage Globe 🌍 laga do
    return countryMap[rawCode] || `🌍 ${code}`;
};

const sendWithdrawalTelegramAlert = async (userName, userId, amount, countryCode) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) return;

    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const displayCountry = getFullCountryName(countryCode);
    const amountInWords = `${numberToWords(amount)} USDT DOLLARS`;

    // 🔥 Exact React Modal jaisa Design
    const htmlTemplate = `
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@400;700;900&family=Great+Vibes&family=Roboto+Mono:wght@700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            width: 700px; 
            height: 900px; 
            background-color: #000; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-family: 'Montserrat', sans-serif; 
            padding: 30px; 
          }
          .cert-container { 
            width: 100%; 
            height: 100%; 
            background-color: #020b1c; 
            border: 4px solid #d4af37; 
            outline: 2px solid #d4af37; 
            outline-offset: 6px; 
            box-shadow: inset 0 0 50px rgba(212,175,55,0.2); 
            padding: 40px 30px; 
            display: flex; 
            flex-direction: column; 
            justify-content: space-between; 
            align-items: center; 
            color: #ffffff; 
            position: relative; 
          }

          /* Left Top Golden Tag */
          .top-left-tag { position: absolute; top: 0; left: 20px; width: 80px; background: linear-gradient(to bottom, #fceabb, #f8b500, #b38728); text-align: center; padding: 5px 5px 20px 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%); }
          .top-left-tag p { font-size: 8px; font-weight: 900; color: #4a3504; text-transform: uppercase; line-height: 1.2; letter-spacing: 0.1em; }
          
          /* Logo Area */
          .logo-area { text-align: center; margin-bottom: 5px; margin-top: 10px; }
          .logo-title { font-size: 26px; font-weight: 900; letter-spacing: 0.15em; line-height: 1; margin-top: 5px; color: #fff;}
          .logo-sub { color: #4da8da; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 4px; }
          
          /* Header Lines */
          .header-lines { display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 10px; }
          .line { height: 1px; width: 70px; background-color: #d4af37; }
          .header-label { color: #d4af37; letter-spacing: 0.2em; font-size: 14px; padding: 0 12px; font-weight: 700; }
          
          /* Title */
          .title-area { text-align: center; margin-bottom: 15px; }
          .main-heading { font-family: 'Cinzel', serif; font-size: 50px; font-weight: 900; color: #d4af37; text-shadow: 1px 1px 2px #000, 0 0 1em #d4af37; text-transform: uppercase; line-height: 1;}
          .sub-heading { font-family: 'Cinzel', serif; font-size: 20px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 10px; color: #fff;}
          .stars { display: flex; justify-content: center; gap: 6px; align-items: center; color: #d4af37; font-size: 14px;}
          
          .certify-text { color: #cbd5e1; font-size: 12px; letter-spacing: 0.15em; text-align: center; margin-bottom: 15px;}
          
          /* Name Section */
          .name-container { display: flex; align-items: center; justify-content: center; width: 100%; margin: 15px 0; }
          .name-line-left { height: 3px; flex: 1; max-width: 120px; background: linear-gradient(to right, transparent, rgba(248,181,0,0.7), #b8860b); border-radius: 999px; }
          .name-line-right { height: 3px; flex: 1; max-width: 120px; background: linear-gradient(to left, transparent, rgba(248,181,0,0.7), #b8860b); border-radius: 999px; }
          .name-wrapper { display: flex; flex-direction: column; align-items: center; padding: 0 20px;}
          .name-text { font-size: 48px; font-weight: 900; letter-spacing: 0.05em; background: linear-gradient(to bottom, #fceabb, #f8b500, #b8860b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; line-height: 1.1; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));}
          .id-badge { color: #4da8da; font-family: 'Roboto Mono', monospace; font-weight: 700; font-size: 16px; letter-spacing: 0.1em; background-color: #020b1c; padding: 4px 20px; border-radius: 999px; border: 1px solid rgba(6,182,212,0.5); display: inline-block; margin-top: 10px; }
          
          .action-text { color: #cbd5e1; font-size: 13px; text-align: center; line-height: 1.5; letter-spacing: 0.05em; margin: 15px 0; }
          
          /* Amount Box */
          .amount-wrapper { display: flex; justify-content: center; align-items: center; margin-bottom: 25px; width: 100%; }
          .leaf { color: #d4af37; font-size: 45px; opacity: 0.8; font-family: serif; }
          .amount-container { position: relative; border: 2px solid #d4af37; padding: 15px 50px 25px; background-color: #020b1c; box-shadow: inset 0 0 15px rgba(212,175,55,0.1); min-width: 320px; text-align: center; margin: 0 20px;}
          .amount-value { font-size: 70px; font-weight: 900; color: #d4af37; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); letter-spacing: -0.05em; line-height: 1;}
          .amount-ribbon { position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 110%; background: linear-gradient(to right, #b38728, #fceabb, #b38728); color: #4a3504; font-weight: 900; font-size: 11px; padding: 6px 10px; border: 1px solid #8a6d1c; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); text-transform: uppercase; }
          
          /* Thank you text */
          .thank-you-1 { color: #cbd5e1; font-size: 12px; text-align: center; margin-bottom: 5px; }
          .thank-you-2 { color: #4da8da; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; text-align: center; margin-bottom: 20px;}
          
          /* Date Badge */
          .date-container { display: flex; justify-content: center; margin-bottom: 25px; }
          .date-badge { display: flex; align-items: center; gap: 10px; color: #4da8da; background-color: rgba(6, 24, 56, 0.8); border: 1px solid rgba(6,182,212,0.3); padding: 10px 25px; border-radius: 999px; box-shadow: 0 0 15px rgba(6,182,212,0.1); }
          .date-text { font-family: 'Roboto Mono', monospace; font-weight: 700; font-size: 15px; letter-spacing: 0.1em; }
          
          /* Footer */
          .footer-area { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 20px; margin-bottom: 15px;}
          .footer-left { text-align: left; width: 33%; }
          .signature-font { font-family: 'Great Vibes', cursive; font-size: 26px; color: #e2e8f0; opacity: 0.9; margin-bottom: 5px; }
          .signature-line { width: 90px; height: 1px; background-color: #475569; margin-bottom: 5px; }
          .auth-text { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
          
          .footer-center { display: flex; flex-direction: column; align-items: center; position: relative; width: 34%; }
          .shield-bg { background: linear-gradient(to bottom, #fceabb, #b38728); padding: 5px; border-radius: 999px 999px 0 0; border: 1px solid #000; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); z-index: 1;}
          .shield-inner { background-color: #020b1c; border-radius: 999px; padding: 6px; display: flex; align-items: center; justify-content: center;}
          .secure-ribbon { background: linear-gradient(to right, #b38728, #fceabb, #b38728); color: #4a3504; font-weight: 900; font-size: 8px; padding: 5px 15px; border: 1px solid #8a6d1c; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); text-transform: uppercase; margin-top: -8px; z-index: 2; width: 120px; text-align: center;}
          
          .footer-right { text-align: right; width: 33%; }
          .ty-font { font-family: 'Great Vibes', cursive; font-size: 28px; color: #4da8da; margin-bottom: 5px; }
          .support-text { font-size: 9px; color: #94a3b8; line-height: 1.3; letter-spacing: 0.05em; }
          
          .bottom-line { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); width: 100%; text-align: center; padding-top: 12px; color: #d4af37; font-size: 10px; letter-spacing: 0.4em; opacity: 0.8; text-transform: uppercase;}
        </style>
      </head>
      <body>
        <div class="cert-container">
          
          <div class="top-left-tag">
             <p>Thank You<br>For trusting us<br>and being a part<br>of CrowdOne<br>Family</p>
             <div style="margin-top:5px; color:#4a3504; font-size:10px;">★</div>
          </div>

          <div class="logo-area">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4da8da" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            <div class="logo-title">CROWDONE</div>
            <div class="logo-sub">Together, We Grow</div>
          </div>
          
          <div class="header-lines">
            <div class="line"></div>
            <div class="header-label">PAYOUT</div>
            <div class="line"></div>
          </div>
          
          <div class="title-area">
            <h1 class="main-heading">WITHDRAWAL</h1>
            <div class="sub-heading">RECEIPT</div>
            <div class="stars">★ ★ ★ ★ ★</div>
          </div>
          
          <div class="certify-text">This is to certify that</div>
          
          <div class="name-container">
            <div class="name-line-left"></div>
            <div class="name-wrapper">
               <div class="name-text">${userName}</div>
               <div class="id-badge">ID: ${userId}</div>
            </div>
            <div class="name-line-right"></div>
          </div>
          
          <div class="action-text">has successfully processed a withdrawal<br>of</div>
          
          <div class="amount-wrapper">
             <div class="leaf" style="transform: rotate(-20deg);">🌿</div>
             <div class="amount-container">
                <div class="amount-value">$${amount}</div>
                <div class="amount-ribbon">${amountInWords}</div>
             </div>
             <div class="leaf" style="transform: scaleX(-1) rotate(-20deg);">🌿</div>
          </div>
          
          <div class="thank-you-1">Thank you for your trust and support.</div>
          <div class="thank-you-2">Together, we grow stronger!</div>
          
          <div class="date-container">
             <div class="date-badge">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
               <span class="date-text">${dateStr}</span>
             </div>
          </div>
          
          <div class="footer-area">
             <div class="footer-left">
                <div class="signature-font">Team CrowdOne</div>
                <div class="signature-line"></div>
                <div class="auth-text">Authorized Signature</div>
             </div>
             <div class="footer-center">
                <div class="shield-bg">
                   <div class="shield-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
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
        console.log(`⏳ Generating Withdrawal Certificate Image for ${userName} ($${amount})...`);
        const imageBuffer = await nodeHtmlToImage({
            html: htmlTemplate,
            quality: 100,
            type: 'jpeg',
            puppeteerArgs: { 
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                defaultViewport: { width: 700, height: 900 } 
            }
        });

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', imageBuffer, 'withdrawal.jpg');
        formData.append('caption', `🎉 *WITHDRAWAL SUCCESSFUL!*\n\n👤 *User:* ${userName}\n🆔 *ID:* ${userId}\n💸 *Amount:* $${amount}\n📍 *Country:* ${displayCountry}\n\n⚡️ _Instant Payout Processed Successfully!_\n🌐 _Build your team, grow your income!_`, { contentType: 'text/plain' });
        formData.append('parse_mode', 'Markdown');

        const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        await axios.post(url, formData, { headers: formData.getHeaders() });
        console.log(`✅ Withdrawal Alert sent for User: ${userId}`);
    } catch (error) {
        console.error("❌ Telegram Send Error:", error.message);
    }
};

module.exports = sendWithdrawalTelegramAlert;