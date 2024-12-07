import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises"; // Use promise-based fs methods for async operations
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath, options = {}) => {
  try {
    if (!localFilePath) throw new Error("File path is required for upload.");

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      ...options,
    });

    // Clean up the local file after successful upload
    await fs.unlink(localFilePath);

    return response;
  } catch (error) {
    // Clean up the local file if an error occurs
    if (localFilePath) await fs.unlink(localFilePath).catch(() => {});
    console.error("Cloudinary Upload Error:", error.message);

    return {
      success: false,
      message: "Failed to upload file to Cloudinary.",
      error: error.message,
    };
  }
};

// Delete file from Cloudinary
const deleteOnCloudinary = async (url) => {
  try {
    if (!url) throw new Error("URL is required for deletion.");

    // Extract public_id from the URL
    const public_id = url.split("/").slice(7, 9).join("/").split(".")[0];

    // Determine the resource type
    let resource_type = "image"; // Default resource type
    if (url.includes("/video/")) {
      resource_type = "video";
    } else if (url.includes("/raw/")) {
      resource_type = "raw";
    }

    // Perform deletion
    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });

    return response;
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error.message);

    return {
      success: false,
      message: "Failed to delete file from Cloudinary.",
      error: error.message,
    };
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
