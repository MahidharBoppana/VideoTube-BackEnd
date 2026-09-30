import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channel id is not valid.");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found.");
  }

  if (req.user._id.toString() === channelId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel.");
  }

  const subscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (subscription) {
    await subscription.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully."));
  } else {
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Subscribed successfully."));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channel id is not valid.");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found.");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber"
  );

  if (subscribers.length === 0) {
    throw new ApiError(404, "No subscribers found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "All subscibers fetched successfully.")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Subscriber id is not valid.");
  }

  const subscriber = await User.findById(subscriberId);

  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found.");
  }

  const channels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel");

  if (channels.length === 0) {
    throw new ApiError(404, "You have not subscribed to any channel.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channels, "All channels fetched successfully."));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
