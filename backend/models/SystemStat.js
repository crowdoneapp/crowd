const mongoose = require('mongoose');

const systemStatSchema = new mongoose.Schema({
    globalFakeCount: { type: Number, default: 0 },
    packageStats: { type: Map, of: Object, default: {} }, 
    
    // 🔥 NAYA: Har package ka target aur aaj ka count save karne ke liye
    packageBoosts: {
        type: Map, 
        of: {
            indiaTarget: { type: Number, default: 0 },
            otherTarget: { type: Number, default: 0 },
            indiaToday: { type: Number, default: 0 },
            otherToday: { type: Number, default: 0 }
        },
        default: {}
    },
    
    boostResetDate: { type: String, default: "" } // Raat 12 baje zero karne ke liye

}, { timestamps: true });

module.exports = mongoose.model('SystemStat', systemStatSchema);