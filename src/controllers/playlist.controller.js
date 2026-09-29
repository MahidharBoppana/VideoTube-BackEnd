import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Both name and description required.");
  }

  const newPlaylist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newPlaylist, `${name} is created successfully.`)
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User id is not valid.");
  }

  const playlists = await Playlist.find({ owner: userId });

  if (playlists.length === 0) {
    throw new ApiError(404, "No playlists found. You can create one.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully."));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist id is not valid.");
  }

  const playlist = await Playlist.findById(playlistId).populate("videos");

  if (!playlist) {
    throw new ApiError(404, "Playlist is not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully."));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(
      400,
      "Either of Playlist id and Video id is not valid. "
    );
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  const originalVideo = await Video.findById(videoId);

  if (!originalVideo) {
    throw new ApiError(404, "Video not found.");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to add the video.");
  }

  const video = playlist.videos.some((id) => id.toString() === videoId);

  if (video) {
    throw new ApiError(400, "video already exist.");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } },
    { new: true }
  ).populate("videos");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "video Added successfully."));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Either of playlist id and video id is not valid.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "playlist not found.");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to remove the video.");
  }

  const video = playlist.videos.some((id) => id.toString() === videoId);

  if (!video) {
    throw new ApiError(404, "video not found.");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
  ).populate("videos");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed successfully."));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist id is not valid.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete the playlist.");
  }

  await Playlist.deleteOne(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully."));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist id is not valid.");
  }

  if (!name && !description) {
    throw new ApiError(400, "At least one field is required.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "playlist not found.");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update the playlist.");
  }

  const updatedData = {};

  if (name) {
    updatedData.name = name;
  }

  if (description) {
    updatedData.description = description;
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: { ...updatedData },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully.")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
