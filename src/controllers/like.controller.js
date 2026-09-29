import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video Id is not valid.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  const like = await Like.findOne({ video: videoId, likedBy: req.user._id });

  if (like) {
    await like.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Unliked"));
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    return res.status(201).json(new ApiResponse(201, {}, "Liked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment Id is not valid.");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found.");
  }

  const commentLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (commentLike) {
    await commentLike.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Unliked."));
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, {}, "Liked."));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet Id is not valid.");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found.");
  }

  const tweetLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (tweetLike) {
    await tweetLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, {}, "Unliked."));
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, {}, "Liked"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $ne: null },
  }).populate("video");

  if (likedVideos.length === 0) {
    throw new ApiError(404, "No liked videos found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully.")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
