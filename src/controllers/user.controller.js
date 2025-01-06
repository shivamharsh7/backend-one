import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken" 

const generateAccessAndRefereshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()
       user.refreshToken = refreshToken //saving refresh token
       await user.save({validateBeforeSave: false})
       return{accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while genrating token")
    }
}

const registerUser = asyncHandler(async(req,res)=>{
const {fullName, email, username, password} = req.body;

   if([fullName , email, username,password].some((field)=>field.trim() === "")){
    throw new ApiError(400,"All field are required")
   }
   const existedUser= await User.findOne({
    $or : [{username},{email}]
   })
   if(existedUser) throw new ApiError(409,"User with email or username already exists")

    const avatarLocation = req.files?.avatar[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocation){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocation)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is req")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const getUser = asyncHandler(async(req,res)=>{
    const username = req.query.username

    if(username.trim() ==="") throw new ApiError(400,"User name req")

    const userName = await User.findOne({username: username}).select(
        "-password -watchHistory"
    )

    if( !userName) throw new ApiError(409,"user is not there");

    return res.status(200).json(
        new ApiResponse(204,userName,"user is present")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    const {email, username, password} = req.body;
    

    if(!username && !email){
        throw new ApiError(400,"usernaem or password is required")
    }

    const user = await User.findOne({
        $or : [{username}, {email}]
    })

    if(!user) throw new ApiError(404,"User doesn't exist")

     const isPasswordValid = await user.isPasswordCorrect(password)   

     if(!isPasswordValid) throw new ApiError(401,"Invalid user credentials")

      const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user : loggedInUser, accessToken ,refreshToken
        },
        "User logged In Successfully"
    )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set: {
            refreshToken : "",
        }},{
            new:true
        }
    )
    const options = {
        httpOnly: true, //for stopping change from frontend
        secure: true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user =User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"Invalid request token")
    }
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,'Refersh token is expired or removed')
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {newAccessToken,newRefershToken}=await generateAccessAndRefereshTokens(user._id)
    return res.status(200).cookie("accessToken",newAccessToken).cookie("refreshToken",newRefershToken).
    json(
        new ApiResponse(200,
            {newAccessToken,refershToken:newRefershToken},
        "Access token refreshed")
    )
})

export {registerUser, getUser,loginUser,logoutUser,refreshAccessToken} 