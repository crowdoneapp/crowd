const mongoose = require('mongoose');

const systemStatSchema = new mongoose.Schema({
    globalTeamCount: { type: Number, default: 0 },
    globalFakeCount: { type: Number, default: 0 },
    
    // 🔥 Package-wise All Crowd & stats tracking schema
    packageStats: {
        type: Map,
        of: {
            allCrowd: { type: Number, default: 0 },
            globalTeamCount: { type: Number, default: 0 }
        },
        default: {}
    },

    // Admin Boost Controls
    extraIndiaDailyTarget: { type: Number, default: 0 },
    extraNigeriaDailyTarget: { type: Number, default: 0 },
    extraSouthAfricaDailyTarget: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('SystemStat', systemStatSchema);