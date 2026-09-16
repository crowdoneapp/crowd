const mongoose = require('mongoose');

const DummyTransactionSchema = new mongoose.Schema({
  userId: { type: Number, required: true }, 
  generatedId: { type: String, required: true }, // 🔥 Yahan Number se String kar diya hai
  amount: { type: Number, required: true },
  type: { type: String, required: true }, 
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.DummyTransaction || mongoose.model('DummyTransaction', DummyTransactionSchema);