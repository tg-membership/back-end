const  asyncHandler =  require("express-async-handler")
const Session = require("../models/session-schema")
const Subscription = require("../models/subscription-schema")
const Payment = require("../models/payment-schema")
const { checkTxStatus } = require("../lib/checkTxStatus")



/*const getUserPaymentSession =  asyncHandler (async (req, res)  =>  {
const  {userId} = req.params

try {
   // Find the session for the user
    const session = await Session.findOne({ userId })
      .populate('communityId'); // Populate community information

    // Check if a session exists
    if (!session) {
      return res.status(404).json({ message: 'No active session found.' });
    }

    // Return the session data along with populated community info
    res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching session:", error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
})*/

const getUserPaymentSession = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the session for the user
    const session = await Session.findOne({ userId })
      .populate({
        path: 'communityId',
        populate: {
          path: 'owner.userId', // Populate the owner.userId inside the communityId
          model: 'User'         // Make sure to specify the correct model for the user
        }
      });

    // Check if a session exists
    if (!session) {
      return res.status(404).json({ message: 'No active session found.' });
    }

    // Return the session data along with populated community and owner info
    res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching session:", error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});




  const  getUserPayments  =  asyncHandler( async (req, res)  => {
   const {userId}  =  req.params
    try {
      const payments = await Subscription.find()
        .populate({
          path: 'groupId',  // Populate the group/community info
          match: { 'owner.userId': userId }, // Filter by owner's userId
          select: 'chatTitle chatId',  // You can specify fields to return (optional)
        })
        .exec();
  
         if(! payments){
          res.status(404).json({message : "No payments for user"})
          throw new Error("No payment")
          }
      // Filter out subscriptions that didn't match the owner's userId (in case they exist)
      const filteredPayments = payments.filter(payment => payment.groupId != null);
  
      res.status(200).json(filteredPayments)
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }

  })


  // Checkout function
const checkoutSubscription = asyncHandler(async (req, res) => {
 // const {userId}  = req.params
  const {userId, communityId, tier, amount, txHash, startTime, stopTime } = req.body;
  const io = req.app.get('socketio');


  try {
    // Validate the input
    if (!userId || !communityId || !tier || !amount || !txHash || !startTime || !stopTime) {
      io.emit('paymentStatus', {
        status : "FAILED",
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log("the community id", communityId)

     

    // Step 1: Create a new payment entry (with status 'pending')
    const newPayment = await Payment.create({
      userId,
      communityId,
      tier,
      amount,
      status: 'pending'
    });

    io.emit('paymentStatus', {
      status : "PENDING",
      userId : userId,
      communityId : communityId,
      tier,
      amount,
    });

    // Example: Assuming tier has duration info in months
   // const startTime = Math.floor(Date.now() / 1000).toString();
    //const stopTime = Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 30).toString();



// Monitor transaction status
const interval = setInterval(async () => {
  //const status = await checkTransactionStatus(transactionHash);

   
     const  txResult  =  await  checkTxStatus(txHash)
    console.log("the result status",  txResult)
    console.log("transaction hash", txHash)

  if (txResult === 'SUCCESS') {
   

    

    // Notify user via email

 /*   const  OTP_TEMPLATE_UUID  = "7e201329-33cf-49cd-b879-69255081bd6f"

    const recipients = [
     {
       email: user.email,
     }
   ];*/
 
  /* await sendMail2(recipients, OTP_TEMPLATE_UUID, {
    "amount": paymentSession.amount,
    "currency": "HBAR",
    "transaction_id": paymentSession.sessionId,
    "payment_link": paymentSession.paymentLinkId,
    "receiver_wallet": user.wallet,
   });*/

     // UPDATE_USER_DETAILS_AND_TX_STATUS

       // Find and update the PaymentSession document
   
           // Step 2: Create the subscription (if needed)
    const newSubscription = await Subscription.create({
      userId,
      groupId: communityId,
      tier,
      txHash : txHash,
      startDate: new Date(parseInt(startTime) * 1000),
      expiryDate: new Date(parseInt(stopTime) * 1000),
      isActive: true
    });

  // Update payment status to 'completed' after the transaction
  newPayment.status = 'completed';
  newPayment.txHash = txHash;
  await newPayment.save();

      //console.log("updated payment  info and status", updatedPaymentSession)
      clearInterval(interval);



  // Emit real-time updates via Socket.io

  io.emit('paymentStatus', {
    status : "SUCCESS",
    userId : userId,
    communityId : communityId,
    tier,
    amount,
    transactionHash : txHash
  });

    // Notify user via UI (e.g., via WebSocket or an update endpoint)
    // ... your notification logic here ...
  } else if (txResult === 'FAILED') { 
    // UPDATE_PAYMENT_DETAILS_AND_TX_STATUS
    
        // Handle payment failure
        await Payment.findByIdAndUpdate(newPayment._id, { status: 'failed' });


    clearInterval(interval);
    // Notify user via UI (e.g., via WebSocket or an update endpoint)
    // ... your notification logic here ...
    io.emit('paymentStatus', {
      status : "FAILED",
      userId : userId
    });
  }else if(new Date()   > paymentSession.durationTime  && paymentSession.paymentStatus === "pending" ){

       // UPDATE_USER_DETAILS_AND_TX_STATUS

        // Handle payment failure
    await Payment.findByIdAndUpdate(newPayment._id, { status: 'failed' });
   
    clearInterval(interval);
    // Notify user via UI (e.g., via WebSocket or an update endpoint)
    // ... your notification logic here ...
    io.emit('paymentStatus', {
      status : "EXPIRED",
      userId : userId
    });

  }
}, 30000); // Check every 30 seconds  */


      
    // Step 2: Create the subscription (if needed)
  /*  const newSubscription = await Subscription.create({
      userId,
      groupId: communityId,
      tier,
      txHash : txHash,
      startDate: new Date(parseInt(startTime) * 1000),
      expiryDate: new Date(parseInt(stopTime) * 1000),
      isActive: true
    });

    // Step 3: After successful payment (handled by front-end Aptos SDK)
    // - Assume the payment process is handled by the SDK and we receive a transaction hash
    const transactionHash = 'example_transaction_hash'; // Replace with real transaction hash from frontend

    // Update payment status to 'completed' after the transaction
    newPayment.status = 'completed';
    newPayment.txHash = transactionHash;
    await newPayment.save();

    // Emit real-time updates via Socket.io

    io.emit('paymentStatus', {
      status : "SUCCESS",
      userId : userId,
      communityId : communityId,
      tier,
      amount,
      transactionHash
    });*/

    // Send the response back
    res.status(201).json({
      message: 'Subscription created and payment completed successfully',
      payment: newPayment
    });

  } catch (error) {
    console.error('Error processing subscription:', error);

    // Handle payment failure
    //await Payment.findByIdAndUpdate(newPayment._id, { status: 'failed' });

    // EMIT FAILED STATE

    io.emit('paymentStatus', {
      status : "FAILED",
      userId : userId,
      communityId : communityId,
      tier,
      amount,
      txHash
    });

    res.status(500).json({ message: 'Internal server error' });
  }
})


module.exports =  {getUserPaymentSession, getUserPayments, checkoutSubscription}