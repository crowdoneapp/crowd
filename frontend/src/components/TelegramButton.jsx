import React from 'react';

const TelegramButton = () => {
  return (
    <>
      <style>
        {`
          /* Pehle wala pulse animation (Ab darker shadow ke sath) */
          @keyframes attention-pulse {
            0% { transform: scale(1); box-shadow: 0 4px 15px rgba(22, 112, 158, 0.4); }
            50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(22, 112, 158, 0.7); }
            100% { transform: scale(1); box-shadow: 0 4px 15px rgba(22, 112, 158, 0.4); }
          }

          /* Shine (Chamkili line) Animation */
          @keyframes shine-effect {
            0% { left: -100%; }
            20% { left: 100%; }
            100% { left: 100%; }
          }

          .telegram-animated-btn {
            position: relative; 
            overflow: hidden; 
            animation: attention-pulse 2s infinite;
            box-sizing: border-box; 
            /* 🔥 Naya Dark Premium Gradient Background */
            background: linear-gradient(90deg, #1C84B8 0%, #115E85 100%);
          }

          /* Ye wo safed chamakti hui line hai jo cross karegi */
          .telegram-animated-btn::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50px;
            height: 100%;
            background: linear-gradient(
              to right, 
              rgba(255, 255, 255, 0) 0%, 
              rgba(255, 255, 255, 0.5) 50%, 
              rgba(255, 255, 255, 0) 100%
            );
            transform: skewX(-25deg);
            animation: shine-effect 3s infinite;
          }

          .telegram-animated-btn:hover {
            animation: none;
            transform: translateY(-2px);
            /* 🔥 Hover par thoda aur dark ho jayega */
            background: linear-gradient(90deg, #16709E 0%, #0C4E6E 100%) !important;
            box-shadow: 0 6px 20px rgba(22, 112, 158, 0.6) !important;
          }

          .telegram-animated-btn:hover::after {
            animation: none; 
          }

          /* Mobile screens ke liye padding aur size */
          @media (max-width: 768px) {
            .telegram-animated-btn {
              padding: 14px 16px !important;
              font-size: 15px !important;
              gap: 8px !important;
            }
            .telegram-animated-btn svg {
              width: 20px !important;
              height: 20px !important;
              flex-shrink: 0; 
            }
          }
        `}
      </style>

      <a
        href="https://t.me/crowdoneofficialchannel"
        target="_blank"
        rel="noopener noreferrer"
        className="telegram-animated-btn"
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#ffffff',
          padding: '16px 24px', /* 🔥 Thoda aur broad kiya UI image jaisa */
          borderRadius: '12px', /* 🔥 Corners ko thoda aur smooth (round) kiya */
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: '700', /* 🔥 Text ko thoda bold kiya */
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: 'none',
          textAlign: 'center', 
          whiteSpace: 'normal', 
          lineHeight: '1.4',
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          fill="currentColor" 
          viewBox="0 0 16 16"
        >
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.292.26.004.545-.106.855-.332 2.07-1.419 3.123-2.14 3.158-2.163.021-.013.048-.024.08-.024.043 0 .083.023.083.064 0 .025-.015.05-.084.126-.068.075-1.503 1.405-1.637 1.543-.109.112-.224.22-.116.327.105.106 1.48 1.002 1.944 1.32.193.133.35.242.49.336.195.132.368.248.583.226.13-.013.256-.129.324-.447.214-1.002.684-3.418.9-4.57.022-.12.008-.22-.038-.282-.047-.063-.128-.088-.236-.06z"/>
        </svg>
        Join Telegram Official Channel
      </a>
    </>
  );
};

export default TelegramButton;