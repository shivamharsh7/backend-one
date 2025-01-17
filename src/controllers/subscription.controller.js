import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    console.log(channelId)
    if(channelId.trim()===""){
        throw new ApiError(400,"channel Id required")
    }
    console.log('user',req.user._id)
     // Check if subscription already exists
     const isSubscribed = await Subscription.findOne({
        subscriber: new mongoose.Types.ObjectId(req.user._id),
        channel: new mongoose.Types.ObjectId(channelId)
    })

    if (isSubscribed) {
        // If subscription exists, remove it
        await Subscription.findByIdAndDelete(isSubscribed._id)
        return res.status(200).json(
            new ApiResponse(200, "Unsubscribed successfully", { subscribed: false })
        )
    }
    const subscribe = await Subscription.create({
        channel: new mongoose.Types.ObjectId(channelId),
        subscriber: new mongoose.Types.ObjectId(req.user._id)
    })

    return res.status(200).json(new ApiResponse(200, "Subscription toggled successfully", {subscribe}))   
    
})
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.find({channel: new mongoose.Types.ObjectId(channelId)}).populate("subscriber","username").select("-__v -updatedAt -createdAt -channel")
    res.status(200).json(new ApiResponse(200, "Subscriber fetched successfully", {subscribers,
        totalSubscribers: subscribers.length
    }))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const  subscriberId  = req.user._id
    const subscribedChannels = await Subscription.find({subscriber: new mongoose.Types.ObjectId(subscriberId)}).populate("channel","username").select("-__v -updatedAt -createdAt -subscriber")
    res.status(200).json(new ApiResponse(200, "Subscribed channels fetched successfully", {subscribedChannels,
        totalSubscribedChannels: subscribedChannels.length
    }))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}