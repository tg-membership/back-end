const Community = require("../../models/community-schema");
const Session = require("../../models/session-schema");
const Subscription = require("../../models/subscription-schema");



const saveCommunityInfo = async (chatInfo, userInfo, userId) => {
    try {

      const groupData = {
        chatId: chatInfo.id,
        chatTitle: chatInfo.title,
        chatType: chatInfo.type,
        owner: {
        userId : userId,
          tgUserId: userInfo.id,
          firstName: userInfo.first_name,
          username: userInfo.username,
        }
      };
  
      // Save the group information in MongoDB
      const savedCommunity = await Community.create(groupData);
      console.log("Group saved successfully:", savedCommunity);
    } catch (error) {
      console.error("Error saving group:", error);
    }
  };

  const checkUserSubscription = async (userId, chatId) => {
    // Find the community (group) by chatId
    const community = await Community.findOne({ chatId: chatId });
  
    // Check if the community exists
    if (!community) {
      console.log(`Community with chatId ${chatId} not found`);
      return false; // No community found, so user can't be subscribed
    }
  
    // Check if the user has subscribed to the community
    const subscription = await Subscription.findOne({
      userId: userId,
      groupId: community._id
    });
  
    // Return true if the subscription exists, otherwise false
    return subscription !== null;
  };


  // say somethin

 /* const createPaymentSession = async (userId, chatId) => {
    try {
      // Session expires after 30 minutes
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  
      // Get the community by chatId
      const community = await Community.findOne({ chatId: chatId });
  
      // If the community doesn't exist, throw an error
      if (!community) {
        throw new Error('Community not found');
      }
  
      // Create a new session
      const newSession = new Session({
        userId,
        chatId,
        communityId: community._id,
        expiresAt
      });
  
      // Save the session and return it
      await newSession.save();
      return newSession;
    } catch (error) {
      console.error("Error creating payment session:", error.message);
      return null;  // You can handle the error case here as needed
    }
  };*/


  const createPaymentSession = async (userId, chatId) => {
    try {
      // Session expires after 30 minutes
     // const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
     //  session expires  after  10 mins
     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      // Get the community by chatId
      const community = await Community.findOne({ chatId: chatId });
  
      // If the community doesn't exist, throw an error
      if (!community) {
        throw new Error('Community not found');
      }
  
      // Check if a session already exists for the user and the specific chat
      const existingSession = await Session.findOne({ userId });
  
      // If a session exists, delete it
      if (existingSession) {
        //await existingSession.remove();
        await Session.deleteOne({ _id: existingSession._id }); // Correct way to delete
      }
  
      // Create a new session
      const newSession = new Session({
        userId,
        chatId,
        communityId: community._id,
        expiresAt
      });
  
      // Save the new session and return it
      await newSession.save();
      return newSession;
  
    } catch (error) {
      console.error("Error creating payment session:", error.message);
      return null;  // Handle the error case as needed
    }
  };
  
  
  module.exports = {saveCommunityInfo, checkUserSubscription, createPaymentSession}