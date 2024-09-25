const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    userId: Number,
    userName : String,
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    tier: { type: String, required: true }, // e.g., "Basic", "Premium"
    txHash: { type: String},
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    reminded: { type: Boolean, default: false } // New field to track if reminder has been sent
  },
{
  timestamps : true
}
);
  

  const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;