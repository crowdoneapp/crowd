import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react';

const faqData = [
  { q: "What is Crowd One?", a: "Crowd One is a global community-building platform designed to help members grow through teamwork, leadership, and community expansion." },
  { q: "How do I register?", a: "Registration is completely free. After registration, you can activate your ID and become an active member." },
  { q: "How do I activate my ID?", a: "Deposit USDT (BEP20) into your Top-Up Wallet. Once the funds are received, enter your ID number and activate your account with $30." },
  { q: "What is the activation cost?", a: "The activation cost is $30." },
  { q: "Which network should be used for deposits?", a: "All deposits must be made through USDT (BEP20) only." },
  { q: "What is the minimum deposit amount?", a: "The minimum deposit amount is $1." },
  { q: "What is the fund distribution system?", a: "The business volume is distributed as follows:\n✅ 25% – Direct & Level Income\n✅ 5% – Rewards & Recognition\n✅ 70% – Community Building" },
  { q: "What are the earning opportunities?", a: "Members can qualify for:\n✅ Direct Income\n✅ Community Income\n✅ Level Income\n✅ Rewards & Recognition" },
  { q: "What is Community Building?", a: "Community Building is a system where members work together to create a strong and growing global community." },
  { q: "What is the minimum withdrawal amount?", a: "The minimum withdrawal amount is $10." },
  { q: "Are withdrawals available 24/7?", a: "Yes, withdrawals are available according to the platform's withdrawal policy." },
  { q: "Is there any withdrawal fee?", a: "Please refer to the latest platform policy for applicable withdrawal charges." },
  { q: "Can I build an international team?", a: "Yes. Crowd One is designed for worldwide community building." },
  { q: "How important are direct referrals?", a: "Direct referrals are important for community growth." },
  { q: "Are direct referrals mandatory for community withdrawals?", a: "Yes. Direct referrals are mandatory for qualifying community withdrawals according to platform rules." },
  { q: "What is the vision of Crowd One?", a: "Our vision is to create a powerful global community focused on growth, leadership, teamwork, and long-term opportunities." },
  { q: "What is the future roadmap?", a: "Crowd One plans to launch CC Token in 2027 and expand its ecosystem globally." },
  { q: "Where is the CC Token planned to be listed?", a: "The CC Token is planned for listing on CoinMarketCap and Decentralized Exchanges (DEX), subject to future development and launch plans." },
  { q: "Why should I join Crowd One?", a: "Crowd One provides an opportunity to build a global network, develop leadership skills, participate in community growth, and be part of a long-term vision." },
  { q: "What is the key to success in Crowd One?", a: "Build your community consistently, support your team, complete your direct referrals, and focus on long-term growth." }
];

function FAQPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 pt-6 md:pt-10">
      <div className="max-w-4xl mx-auto px-4 md:px-6">

        {/* Header & Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-xl md:text-2xl font-black text-slate-800 uppercase tracking-wide">
            <HelpCircle className="text-blue-500" size={26} />
            Frequently Asked Questions
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none group"
              >
                <span className="font-bold text-slate-700 pr-4 text-sm md:text-base group-hover:text-blue-700 transition-colors">
                  {index + 1}. {faq.q}
                </span>
                <div
                  className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                    openFaq === index
                      ? 'bg-blue-100 text-blue-600 rotate-180'
                      : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                  }`}
                >
                  <ChevronDown size={18} strokeWidth={3} />
                </div>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-5 pt-1 border-t border-slate-100 mt-2">
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default FAQPage;