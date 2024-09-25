const express = require("express")
const { requestOtp, verifyOtp, getUserProfile, updateUserInfo } = require("../controllers/auth-controller")
//const { getPaymentLinksByUserId } = require("../controller/paymentController")

  const router = express.Router()
 router.route("/request-otp").post(requestOtp)
 router.route("/verify-otp").post(verifyOtp)
 router.route("/user/:userId/update-profile").put(updateUserInfo)
 router.route("/user/:id").get(getUserProfile)
 //router.route("/user/:userId/payment-links").get(getPaymentLinksByUserId)




   module.exports =  router