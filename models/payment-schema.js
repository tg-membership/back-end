const { default: mongoose } = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: { 
      type: Number, 
      required: true 
    }, // ID of the user making the payment
    communityId: { 
        type: mongoose.Schema.Types.ObjectId, // Correct usage of ObjectId
        ref: 'Community',  // Reference to the Community model
        required: true
    }, // ID of the community the payment is for
    tier: { 
      type: mongoose.Schema.Types.Mixed, 
      required: false
    }, 
    amount: { 
      type: Number, 
      required: true 
    }, // Amount paid
    paymentMethod: { 
      type: String, 
      enum: ['APT', 'USDC', 'USDT', 'other'], 
      required: false 
    }, // Payment method used
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'], 
      default: 'pending' 
    }, // Status of the payment
    transactionDate: { 
      type: Date, 
      default: Date.now 
    }, // Date of the transaction
    txHash: { 
      type: String,
    }, // Optional: Transaction ID from payment gateway
    remarks: { 
      type: String 
    } // Optional: Any extra remarks or metadata
  });
  
  // Create and export the model
  const Payment = mongoose.model('Payment', paymentSchema);
  module.exports = Payment;
  