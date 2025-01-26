import mongoose from "mongoose"
import { Tweet } from "../models/tweet.modal.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createTweet = asyncHandler(async (req,res)=>{
    
        const {content} = req.body
        if(!content) throw new ApiError(400,"Content is required")
        const userId = req.user._id
        const tweet = await Tweet.create({content,
            // owner:userId
            owner: new mongoose.Types.ObjectId(userId)
        })
        return res.status(200).json(new ApiResponse(200,"Tweet created successfully",{tweet}))
    
})

const getUserTweets = asyncHandler(async (req,res)=>{
    const userId = req.user._id;
    const tweets = await Tweet.find({owner:userId}).populate("owner","username -_id").select("-__v -updatedAt -createdAt -_id")
    return res.status(200).json(new ApiResponse(200,"Tweets fetched successfully",{tweets}))
})

const updateTweet = asyncHandler(async (req,res)=>{
    const {tweetId} = req.params
    const {content} = req.body
    const userId = req.user._id;
    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404,"Tweet not found")
    if(tweet.owner.toString() !== userId.toString()) throw new ApiError(403,"You are not allowed to update this tweet")
    // const tweet = await Tweet.findByIdAndUpdate(id,{content},{new:true})
    tweet.content = content
    await tweet.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new ApiResponse(200,"Tweet is change"))
    
})

const deleteTweet = asyncHandler(async (req,res)=>{
    const {tweetId} = req.params
    const userId = req.user._id;
    const tweet = await Tweet.findById(tweetId);
    if(!tweet) throw new ApiError(404,"Tweet not found")
    if(tweet.owner.toString() !== userId.toString()) throw new ApiError(403,"You are not allowed to delete this tweet")
    await tweet.deleteOne();
    return res.status(200).json(new ApiResponse(200,"Tweet deleted successfully"))
})

export {createTweet,getUserTweets,updateTweet,deleteTweet}