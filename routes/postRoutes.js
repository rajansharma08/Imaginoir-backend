import express from "express";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import Post from "../mongodb/models/post.js";

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.route("/").get(async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({
      success: false,
      message: "Fetching posts failed, please try again",
    });
  }
});

router.route("/").post(async (req, res) => {
  try {
    const { name, prompt, photo } = req.body;

    // Debug logs
    console.log("Request received:", {
      name,
      prompt,
      photoLength: photo?.length,
    });
    console.log("Cloudinary config:", {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    // Validate required fields
    if (!name || !prompt || !photo) {
      return res.status(400).json({
        success: false,
        message: "Name, prompt, and photo are required",
      });
    }

    // Check if Cloudinary credentials exist
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary credentials not configured",
      });
    }

    console.log("Uploading to Cloudinary...");
    const photoUrl = await cloudinary.uploader.upload(photo);
    console.log("Cloudinary upload successful:", photoUrl.secure_url);

    const newPost = await Post.create({
      name,
      prompt,
      photo: photoUrl.secure_url, // Use secure_url instead of url
    });

    console.log("Post created successfully:", newPost._id);
    res.status(200).json({ success: true, data: newPost });
  } catch (err) {
    console.error("Post creation error:", err);

    // Better error handling
    let errorMessage = "Unable to create a post, please try again";

    if (err.message.includes("cloudinary")) {
      errorMessage = "Image upload failed, please try again";
    } else if (err.message.includes("validation")) {
      errorMessage = "Invalid data provided";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: err.message, // Add actual error for debugging
    });
  }
});

export default router;
