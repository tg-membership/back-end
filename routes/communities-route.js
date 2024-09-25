const  express =  require("express")
const { getUserCommunities, updateCommunityTiers, getUserCommunitiesWithRevenue, getTotalEarnings, getCommunityByChatId } = require("../controllers/communities-controller")

const  router = express.Router()
 router.route("/:userId").get(getUserCommunities)
 router.route("/revenue/:userId").get(getUserCommunitiesWithRevenue)
 router.route("/earnings/:communityId").get(getTotalEarnings)
 router.route("/community/:chatId").get(getCommunityByChatId)



 router.route("/community/:communityId/update-tiers").put(updateCommunityTiers)
module.exports = router