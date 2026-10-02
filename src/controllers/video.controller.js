import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "User id is not valid.");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }
  }

  const filter = {};

  if (userId) {
    filter.owner = new mongoose.Types.ObjectId(userId);
  }

  if (query) {
    filter.$or = [
      {
        title: {
          $regex: query,
          $options: "i",
        },
      },
      {
        description: {
          $regex: query,
          $options: "i",
        },
      },
    ];
  }

  const aggregate = await Video.aggregate([
    {
      $match: filter,
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          _id: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
  ]);

  const options = {
    page: Number(page),
    limit: Number(limit),
  };

  const videos = await Video.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully."));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Both title and description is required.");
  }

  const videoFile = req.files?.videoFile?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (!videoFile) {
    throw new ApiError(400, "video file is required.");
  }

  if (!thumbnailFile) {
    throw new ApiError(400, "Thumbnail is required.");
  }

  const uploadVideo = await uploadOnCloudinary(videoFile.path);

  if (!uploadVideo) {
    throw new ApiError(500, "Failed to upload video.");
  }

  const uploadThumnail = await uploadOnCloudinary(thumbnailFile.path);

  if (!uploadThumnail) {
    throw new ApiError(500, "Failed to upload thumbnail.");
  }

  const video = await Video.create({
    videoFile: uploadVideo.url,
    thumbnail: uploadThumnail.url,
    title: title,
    description: description,
    isPublished: true,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully."));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is not valid.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully."));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnail = req.file;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is not valid.");
  }

  if (!title && !description && !thumbnail) {
    throw new ApiError(400, "Please provide title, description or thumbnail.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this video.");
  }

  const updateData = {};

  if (title) {
    updateData.title = title;
  }

  if (description) {
    updateData.description = description;
  }

  if (thumbnail) {
    const uploadThumnail = await uploadOnCloudinary(thumbnail.path);

    if (!uploadThumnail) {
      throw new ApiError(500, "Failed to upload thumbnail.");
    }

    updateData.thumbnail = uploadThumnail.url;
  }

  const updatedData = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateData,
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedData, "Video updated successfully."));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is not valid.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this video.");
  }

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully."));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is not valid.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not allowed to change the publish status."
    );
  }

  video.isPublished = !video.isPublished;

  const updatedVideo = await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        `Video ${
          updatedVideo.isPublished ? "published" : "unpublished"
        } successfully.`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
