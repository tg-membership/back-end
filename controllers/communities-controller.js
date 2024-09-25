const  asyncHandler  =  require("express-async-handler");
const Community = require("../models/community-schema");
const Subscription = require("../models/subscription-schema");
const Payment = require("../models/payment-schema");
const { default: mongoose } = require("mongoose");


const getUserCommunities =   asyncHandler (async (req, res)  =>  {
 const {userId}  = req.params
 try {
  // Fetch communities where the owner's userId matches the provided userId
    const communities = await Community.find({ 'owner.userId': userId });

    /*if (communities.length === 0) {
      return res.status(404).json({ message: 'No communities found for this user' });
    }*/

    // Return the found communities/groups
    res.status(200).json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})


/*const getUserCommunitiesWithRevenue = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    try {
      // Fetch communities where the owner's userId matches the provided userId
      const communities = await Community.find({ 'owner.userId': userId });
  
      if (communities.length === 0) {
        return res.status(404).json({ message: 'No communities found for this user' });
      }
  
      // Prepare to enhance each community with subscriber count and earnings
      const enhancedCommunities = await Promise.all(
        communities.map(async (community) => {
          const communityId = community._id;
  
          // Get the count of active subscribers for this community
          const subscriberCount = await Subscription.countDocuments({
            groupId: communityId,
            isActive: true,
          });

          console.log("the  subscribers count", subscriberCount)
  
          // Get total earnings for this community
          const totalEarnings = await Payment.aggregate([
            { $match: { communityId: communityId } }, // Match payments for this community
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }, // Sum the 'amount' field
          ]);

          console.log("the  earnings count", totalEarnings)

  
          // Return the community with the extra data
          return {
            ...community.toObject(), // Convert the mongoose doc to plain object
            subscriberCount,
            totalEarnings: totalEarnings[0]?.totalAmount || 0, // Default to 0 if no earnings
          };
        })
      );
  
      // Return the enhanced communities
      res.status(200).json(enhancedCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });*/
  
  const getUserCommunitiesWithRevenue = asyncHandler(async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Fetch communities where the owner's userId matches the provided userId
      const communities = await Community.find({ 'owner.userId': userId });
  
      if (communities.length === 0) {
        return res.status(404).json({ message: 'No communities found for this user' });
      }
  
      // Loop over each community and get the subscriber count and total earnings
      const enhancedCommunities = await Promise.all(
        communities.map(async (community) => {
          const communityId = community._id;
  
          // 1. Get the count of active subscribers for this community
          const subscriberCount = await Subscription.countDocuments({
            groupId: communityId,  // Match by ObjectId
            isActive: true,
          });
  
          // 2. Get the total earnings for this community
          const totalEarningsResult = await Payment.aggregate([
            { $match: { communityId: communityId } },  // Match by ObjectId
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } },  // Sum the 'amount' field
          ]);
  
          // Get total earnings, defaulting to 0 if there are no payments
          const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].totalAmount : 0;
  
          // Log to confirm correct data
          console.log(`Community ID: ${communityId}`);
          console.log(`Subscriber count: ${subscriberCount}`);
          console.log(`Total earnings: ${totalEarnings}`);
  
          // Return the community data with subscriber count and earnings
          return {
            ...community.toObject(),  // Convert mongoose doc to plain object
            subscriberCount,
            totalEarnings,
          };
        })
      );
  
      // Return the enhanced communities
      res.status(200).json(enhancedCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
//  get community total earnings  

const getTotalEarnings = asyncHandler(async (req, res) => {
    const { communityId } = req.params;
    const objectIdCommunityId = new mongoose.Types.ObjectId(communityId);
    try {
      // Calculate total earnings for the community
      const totalEarningsResult = await Payment.aggregate([
        { $match: { 
            communityId: objectIdCommunityId }}, // Match the community by ObjectId
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } }, // Sum the 'amount' field
      ]);
  
      const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].totalAmount : 0;
  
      res.status(200).json({ communityId, totalEarnings });
    } catch (error) {
      console.error('Error fetching total earnings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  

// Function to convert human-readable duration (like 'weekly', 'monthly') to seconds
const durationToUnix = (duration) => {
    switch (duration.toLowerCase()) {
      case 'weekly':
        return 7 * 24 * 60 * 60; // 1 week in seconds
      case 'monthly':
        return 30 * 24 * 60 * 60; // Approx 1 month in seconds
      case 'annually':
        return 365 * 24 * 60 * 60; // 1 year in seconds
      default:
        throw new Error('Invalid duration');
    }
  };
  
  // Function to update subscription tiers for a community
  const updateCommunityTiers = asyncHandler(async (req, res) => {
    const { communityId } = req.params;
    const { userId, tiers } = req.body;
  
    try {
      // Ensure all tiers contain required fields (tierName, tierPrice, tierDuration, tierBenefits)
      const updatedTiers = tiers.map(tier => ({
        tierName: tier.name,               // Match with schema field
        tierPrice: tier.price,             // Match with schema field
        tierDuration: durationToUnix(tier.duration), // Match with schema field
        tierBenefits: tier.tierBenefits || []        // Default to empty array if not provided
      }));
  
      // Use findOneAndUpdate to update the tiers directly
      const community = await Community.findOneAndUpdate(
        { _id: communityId, 'owner.userId': userId },  // Match community and owner
        { $set: { subscriptionTiers: updatedTiers } }, // Update tiers
        { new: true }  // Return the updated document
      );
  
      if (!community) {
        return res.status(404).json({ message: 'Community not found or user is not the owner' });
      }
  
      // Respond with updated community info
      res.status(200).json({
        message: 'Subscription tiers updated successfully',
        subscriptionTiers: community.subscriptionTiers.map(tier => ({
          tierName: tier.tierName,               // Return correct field names
          tierPrice: tier.tierPrice,             // Return correct field names
          tierDuration: tier.tierDuration,       // Return correct field names (Unix)
          tierBenefits: tier.tierBenefits        // Return correct field names
        })),
        community
      });
    } catch (error) {
      console.error('Error updating tiers:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  // GET COMMUNITY BY CHAT ID
const getCommunityByChatId = asyncHandler(async (req, res) => {
    const { chatId } = req.params; // Extracting chatId from the request parameters
    console.log("chat id", chatId)
    if (!chatId) {
      // Check if chatId is provided
      res.status(400).json({ message: 'Chat ID is required' });
      return;
    }
  
    const numericChatId = Number(chatId);
    try {
      // Find the community by chatId
      const group = await Community.findOne({ 
        chatId : numericChatId });
  
      if (!group) {
        // If no community found, send a 404 response
        return res.status(404).json({ message: 'No community found with the provided chatId' });
      }
  
      // If community is found, send it back in the response
      res.status(200).json(group);
    } catch (error) {
      // If there's an error, catch it and send a 500 response with the error message
      console.error('Error fetching community:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = {getUserCommunities, updateCommunityTiers, getUserCommunitiesWithRevenue, getTotalEarnings, getCommunityByChatId}