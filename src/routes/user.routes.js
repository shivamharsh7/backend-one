import { Router } from "express";
import { registerUser , getUser, loginUser, logoutUser, refreshAccessToken} from "../controllers/user.controller.js";
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
export default router