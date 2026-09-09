const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  name: { type: String, default: "-" },

  // Source jahan se paisa nikala gaya (Jaise: "Direct, Level, ROI")
  source: {
    type: String,
    required: true
  },

  // Amounts
  grossAmount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 },
  
  // Kitna working income use hua
  incomeUsed: { type: Number, default: 0 },

  // Payment Details
  walletAddress: { type: String, default: "" },
  txnHash: { type: String, default: "" },

  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "processing"],
    default: "pending" 
  },

  remarks: { type: String, default: "" }
  
}, {
  // 🔥 Mongoose ka Smart Feature: Ye auto handle karega createdAt & updatedAt!
  // Isse 'next is not a function' wala error hamesha ke liye khatam.
  timestamps: true 
});

module.exports = mongoose.model("Withdrawal", withdrawalSchema);