const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the session schema
const sessionSchema = new Schema({
    communityId: {
      type: mongoose.Schema.Types.ObjectId, // Correct usage of ObjectId
    ref: 'Community',  // Reference to the Community model
    required: true
    }, 
  userId: Number,
  chatId: Number,
  notified: { type: Boolean, default: false }, //track notification status
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
},
{timestamps : true}
);

// Create the session model
const Session = mongoose.model('Session', sessionSchema);

module.exports = Session