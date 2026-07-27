// models/AdminGrowthSetting.js
const mongoose = require('mongoose');

const adminGrowthSchema = new mongoose.Schema({
    packageAmount: { type: Number, required: true }, // 30, 100, 300, etc.
    indiaTarget: { type: Number, default: 0 },       // Din me India ki kitni ID chahiye
    foreignTarget: { type: Number, default: 0 },     // Din me Bahar ki kitni chahiye
    indiaTodayCount: { type: Number, default: 0 },   // Aaj India ki kitni aa chuki
    foreignTodayCount: { type: Number, default: 0 }, // Aaj Bahar ki kitni aa chuki
    lastResetDate: { type: String }                  // Raat 12 baje count 0 karne ke liye
});

module.exports = mongoose.model('AdminGrowthSetting', adminGrowthSchema);