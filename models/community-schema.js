const mongoose = require("mongoose");

const tierSchema = new mongoose.Schema({
  tierName: String,        // Name of the subscription tier
  tierDuration: String,        // Duration of the subscription tier
  tierPrice: Number,       // Price for the subscription
  tierBenefits: [String],  // Array of benefits for the tier
});

const communitySchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  chatTitle: String,
  chatType: String,
  owner: {
    userId : String,
    tgUserId: Number,
    firstName: String,
    username: String
  },
  subscriptionTiers: [tierSchema]  // Array of subscription tiers
},
{
  timestamps : true
}
);

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
