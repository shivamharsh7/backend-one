import { Router } from "express";
import { registerUser , getUser, loginUser, logoutUser, refreshAccessToken,changeCurrentPassword, getCurrentUser, updateAccoountDeatils, updateUserAvatar, updateUserCoverImage, getUserChannelProfile} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/getuser").get(getUser)

router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)

//secure routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/fetch-user").post(verifyJWT,getCurrentUser)
router.route("/update-user").post(verifyJWT,updateAccoountDeatils)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
export default router