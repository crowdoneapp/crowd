// import React, { useState, useEffect } from "react";
// import { Users } from "lucide-react";

// const TotalSystemUsers = ({ user, totalRealUsersFromDB = 0, globalFakeCount = 0 }) => {
//   const [totalSystemUsers, setTotalSystemUsers] = useState(0);

//   useEffect(() => {
//     const BASE_TOTAL_USERS = 100; 
//     const finalTotal = BASE_TOTAL_USERS + totalRealUsersFromDB + globalFakeCount;
//     setTotalSystemUsers(finalTotal);
//   }, [totalRealUsersFromDB, globalFakeCount]);

//   return (
//     <div className="w-full mb-6">

//       {/* TOTAL COMMUNITY — Blue theme (only box) */}
//       <div className="relative overflow-hidden bg-gradient-to-br from-[#0b3a82] via-[#1450a8] to-[#1d63c9] p-5 sm:p-7 rounded-[20px] sm:rounded-[24px] shadow-[0_10px_30px_-10px_rgba(15,60,140,0.45)] hover:shadow-[0_14px_40px_-10px_rgba(15,60,140,0.55)] transition-all duration-300 group flex flex-col justify-center min-h-[130px] sm:min-h-[150px]">
//         {/* Ambient glow */}
//         <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-300/30 rounded-full blur-[35px] group-hover:bg-sky-200/40 transition-colors duration-500 pointer-events-none"></div>
//         <div className="absolute -left-6 -bottom-8 w-28 h-28 bg-blue-400/20 rounded-full blur-[30px] pointer-events-none"></div>

//         <div className="relative z-10">
//           <p className="text-sky-200 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1.5">
//             <Users size={13} className="text-sky-200" />
//             Total Community
//           </p>
//           <h2 className="text-[28px] sm:text-3xl md:text-[42px] font-black text-white tracking-tight leading-none drop-shadow-sm font-mono">
//             {totalSystemUsers.toLocaleString()}
//           </h2>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default TotalSystemUsers;