const mongoose = require('mongoose');

const packageActivationSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    memberId: { type: Number, required: true },
    purchasedBy: { type: Number, required: true },
    packageAmount: { type: Number, required: true },
    dailyRoi: { type: Number, required: true },
    totalDays: { type: Number, default: 30 }, // 🔥 Default days 25 se badha kar 30 kar diye hain
    daysCompleted: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PackageActivation', packageActivationSchema);