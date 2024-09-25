const  express =  require("express")
const { getUserPaymentSession, getUserPayments, checkoutSubscription } = require("../controllers/payment-controller")

const router =  express.Router()

// GET PAYMENT SESSION
router.route('/session/:userId').get(getUserPaymentSession)
router.route("/payments/:userId").get(getUserPayments)
router.route("/check-out/:userId").post(checkoutSubscription)


module.exports = router