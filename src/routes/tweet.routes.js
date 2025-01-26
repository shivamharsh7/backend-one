

import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js"

const router = Router()

router.use(verifyJWT)
router.route("/create").post(createTweet)
router.route("/gettweets").get(getUserTweets)
router.route("/t/:tweetId").patch(updateTweet)
router.route("/t/:tweetId").delete(deleteTweet)
export default router