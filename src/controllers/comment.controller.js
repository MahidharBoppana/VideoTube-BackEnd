import mongoose, { set } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const skip = (pageNumber - 1) * limitNumber;

  const comments = await Comment.find({ video: videoId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("owner", "username fullName avatar");

  const totalComments = await Comment.countDocuments({ video: videoId });

  const totalPages = Math.ceil(totalComments / limitNumber);

  const responseData = {
    comments,
    page: pageNumber,
    limit: limitNumber,
    totalComments,
    totalPages,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "Comments fetched successfully."));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Please write the comment");
  }

  const comment = await Comment.create({
    video: videoId,
    content: content,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Please write the comment. comment is empty");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "forbidden");
  }

  comment.content = content;

  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Forbidden: User are not allowed to delete the comment"
    );
  }

  await comment.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment delete successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
