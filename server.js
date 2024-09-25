const express =  require("express")
const connectionDb = require("./lib/dbConnection")
const cors =  require("cors")
const env = require("dotenv").config();
const http = require('http');
const socketIo = require('socket.io');
const session = require("express-session");
const { Bot, InlineKeyboard } = require("grammy");
const { updateUserInfo } = require("./controllers/auth-controller");
const User = require("./models/user-schema");
const { saveCommunityInfo, checkUserSubscription, createPaymentSession } = require("./controllers/bot-controllers/bot-utils");
const cron = require('node-cron');
const Subscription = require("./models/subscription-schema");
const Session = require("./models/session-schema");
const Community = require("./models/community-schema");
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  }
});



connectionDb();


app.use(cors())
app.use(express.json());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 60000 * 60,
  }
}));

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
;

    
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
})

console.log("hello  world")

app.use("/api/auth", require("./routes/auth-route"));
app.use("/api/payment", require("./routes/payment-route"));
app.use("/api/communities", require("./routes/communities-route"));



// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot("7519802378:AAG2MizzvriVjddNSUZWlN6LkfcmO6cst1U", {client : {
  sensitiveLogs  : true
}}); // <-- put your bot token between the ""

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.


/*const labelDataPairs = [
  ["« 1", "first"],
  ["‹ 3", "prev"],
  ["· 4 ·", "stay"],
  ["5 ›", "next"],
  ["31 »", "last"],
];

const buttonRow = labelDataPairs
  .map(([label, data]) => InlineKeyboard.text(label, data));
const keyboard = InlineKeyboard.from([buttonRow]);*/

   //Construct a keyboard.

  const payBtn = new InlineKeyboard().url("Pay now", "https://t.me/tg_membership_3_bot/clubsmembers");

// This will connect to the Telegram servers and wait for messages.

// Handle the /start command.
bot.command("start", (ctx) =>  {
 // console.log("the context", ctx.from.first_name)
  const userId = ctx.match
  console.log("user id from ctx", ctx.chat)

  if(userId)  {
  const tgProfile =  {
    firstName : ctx.from.first_name,
    lastName  : ctx.from.last_name,
    tgUsername : ctx.from.username,
    profilePics :  ctx.from.tgProfile,
    tgUserId : ctx.from.id
  }
  
//  UPDATE  USER  PROFILE

const updateProfile  =  async ()  =>  {
  try {

    // Find the user by ID and update their information
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {  tgProfile},
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      console.log("no user found please register first")
    }

      console.log("updated profile", updatedUser)
    console.log('User information updated successfully');
  } catch (error) {
    console.log("something went wrong", error)
    throw new Error(error)
  }
}

updateProfile()
  }
  ctx.reply("Welcome! Up and running.")
} )


/// LISTEN  FOR   NEW  JOIN  MEMBERS

bot.on("chat_member",  async (ctx) => {
  //  console.log("request context", ctx)
    // Make sure to specify the desired update types
    const chatInfo = ctx.update.chat_member.chat;  // Chat (group) info
  const userInfo = ctx.update.chat_member.from;  // User who added the bot
  const newAction = ctx.update.chat_member.new_chat_member;  // current action  / left / kicked
  const actionStatus  =  newAction?.status

   // console.log("chat info", chatInfo)
    //console.log("user info info", userInfo)
   // console.log("new  action", newAction)
    console.log("action status", actionStatus )

    // Extract necessary IDs
  const chatId = chatInfo.id;           // Chat ID (group/channel ID)
  const userId = userInfo.id;           // User's Telegram ID

 
    // Check if the user has joined as a "member"
  if (actionStatus === "member" || actionStatus === "creator") {
    // Query your database to check if the user is subscribed
    const isSubscribed = await checkUserSubscription(userId, chatId);

    // If the user is subscribed
    if (isSubscribed) {
      ctx.reply(`Welcome back! You're subscribed to this group.`);
    } 
    // If the user is not subscribed
    else {

      const   session = await createPaymentSession(userId, chatId);

      console.log("the generated session ", session)
      
  await ctx.reply("Your not  subscriber please  click button below to subscribe", { reply_markup: payBtn })

    }}
 
 // ctx.reply("New  join attemp")
})

// LISTEN FOR  ADDING BOT  EVENT 

bot.on("my_chat_member",  async (ctx) => {
  const chatInfo = ctx.update.my_chat_member.chat;  // Chat (group) info
  const userInfo = ctx.update.my_chat_member.from;  // User who added the bot
  const newAction = ctx.update.my_chat_member.new_chat_member;  // current action  / join / kicked

     const actionStatus  =  newAction?.status
  console.log("request context", ctx)
     console.log("chat information", chatInfo)
     console.log("user information", userInfo)
     console.log("new action infoormation ", newAction)
     console.log("status ", actionStatus)

     if(actionStatus  === "administrator"){
      try {
        const existingUser = await User.findOne({ "tgProfile.tgUserId": userInfo.id });

        if (!existingUser) {
          // If the user is not registered, respond and do not proceed
          await   ctx.api.sendMessage(userInfo.id, "Please  register inour platform before adding to your group")
           ctx.reply(`Please register on the platform before adding me to your group.`);
        }
    
        // If the user exists, proceed to save the group info
        console.log("User found, proceeding to save the group");
        await saveCommunityInfo(chatInfo, userInfo, existingUser._id);
        
      } catch (error) {
        console.error("Error checking user or saving group:", error);
        ctx.reply("There was an error processing your request.");
      }
     }else if(actionStatus === "kicked"){
     // ctx.reply("You  removed  the king");
     console.log("bot kicked out")
     }




// ctx.reply("New  join attemp")
})



 // Function to remove a user from a Telegram group
async function removeUserFromGroup(chatId, userId) {
  try {
    await bot.api.banChatMember(chatId, userId);
    //await bot.api.sendMessage(userId, "you removed coz you failed to pay")
    console.log(`Removed user ${userId} from group ${chatId}`);
  } catch (error) {
    console.error(`Error removing user ${userId} from group ${chatId}:`, error);
  }
}


// Function to send a reminder to a user
async function sendReminder(userId, chatId, message) {
  try {
    await bot.api.sendMessage(userId, message);
    console.log(`Sent reminder to user ${userId} in group ${chatId}`);
  } catch (error) {
    console.error(`Error sending reminder to user ${userId} in group ${chatId}:`, error);
  }
}

// '*/30 * * * *'
// Cron job to check for unpaid users every 30 minutes
// Cron job to check for expired sessions every 30 minutes*
/*cron.schedule('* * * * * *', async () => {
 // console.log('Running check for expired sessions...');

  const now = new Date();

  try {
    // Find all sessions that have expired and haven't resulted in an active subscription
    const expiredSessions = await Session.find({
      expiresAt: { $lte: now }
    });

    for (const session of expiredSessions) {
      const { userId, communityId, chatId } = session;

      // Check if there is any active subscription for this user in this community
      const activeSubscription = await Subscription.findOne({
        userId,
        groupId: communityId,
        isActive: true
      });

      // If no active subscription is found, remove the user from the group
      if (!activeSubscription) {
        await removeUserFromGroup(chatId, userId);
      }

      // Optionally, delete the session or update it to indicate it's been processed
      // await Session.deleteOne({ _id: session._id }); // Uncomment to delete the session
      // OR
      // session.processed = true;
      // await session.save(); // Uncomment to mark as processed
    }

   // console.log('Check for expired sessions completed.');
  } catch (error) {
    console.error('Error checking for expired sessions:', error.message);
  }
});  */

cron.schedule('* * * * * *', async () => { // Run every minute
  //console.log('Running instant check for unpaid users...');

  const now = new Date();

  // Find all sessions that have expired (expiresAt is now or earlier)
  const expiredSessions = await Session.find({
    expiresAt: { $lte: now },
    notified: false // Only get sessions that have not been notified
  });

  for (const session of expiredSessions) {
    // Check if there is a corresponding active subscription for this user and community
    const activeSubscription = await Subscription.findOne({
      userId: session.userId,
      groupId: session.communityId,
      isActive: true
    });

    // If no active subscription, remove the user from the group
    if (!activeSubscription) {
      // Send a message to the user only once
      await bot.api.sendMessage(session.userId, "You were removed because you failed to pay.");
      console.log(`Notified user ${session.userId} about removal from group ${session.chatId}.`);

      // Update the session to mark the user as notified
      await Session.updateOne(
        { _id: session._id },
        { $set: { notified: true } }
      );

      // Optionally, you can delete the expired session if needed
      await removeUserFromGroup(session.chatId, session.userId);
      console.log(`Removed user ${session.userId} from group ${session.chatId} due to unpaid session.`);
    }
  }
});

// Cron job to send reminders every day at midnight
// Revised Cron Job to Send Reminders
cron.schedule('0 0 * * *', async () => {
  console.log('Running check for expiring subscriptions...');
  
  // Get the current date and time
  const now = new Date();

  // Set the date for two days from now
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(now.getDate() + 2);

  // Filter for active subscriptions expiring exactly in 2 days and not reminded yet
  const expiringSubscriptions = await Subscription.find({
    isActive: true,
    expiryDate: {
      $gte: twoDaysFromNow.setHours(0, 0, 0, 0), // Start of the day 2 days from now
      $lte: twoDaysFromNow.setHours(23, 59, 59, 999) // End of the day 2 days from now
    },
    reminded: false // Ensure we are only sending reminders once
  });

  for (const sub of expiringSubscriptions) {
    try {
      // Fetch the community data if needed
      const community = await Community.findById(sub.groupId);

      if (!community) {
        console.error(`Community not found for groupId: ${sub.groupId}`);
        continue;
      }

      // Construct the reminder message
      const message = `Your subscription to ${community.chatTitle} is expiring in 2 days. Please renew to continue enjoying the benefits!`;

      // Send the reminder message
      await sendReminder(sub.userId, sub.groupId, message);
      console.log(`Sent reminder to user ${sub.userId} for group ${sub.groupId}.`);

      // Update the subscription to mark the user as reminded
      sub.reminded = true;
      await sub.save();
    } catch (error) {
      console.error(`Failed to send reminder to user ${sub.userId}:`, error.message);
    }
  }
});

console.log('Cron jobs initialized.');



// Now that you specified how to handle messages, you can start your bo

// Start the bot.
bot.start({
  // Make sure to specify the desired update types
  allowed_updates: ["chat_member", "my_chat_member"],
  
});



server.listen(PORT, () => {
  console.log("app started at", PORT);
});

app.set('socketio', io);//here you export my socket.io to a global       
