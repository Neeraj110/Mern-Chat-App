import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import asycnHandler from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const token = user.accessToken();
    return { token };
  } catch (error) {
    return null;
  }
};

const UserController = {
  // Register a new user
  register: asycnHandler(async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const avatarFilePath = req.file?.path;

      if (!name || !email || !password || !avatarFilePath) {
        return res.status(400).json({
          success: false,
          message: "Please enter all fields",
        });
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      const avatar = await uploadOnCloudinary(avatarFilePath, {
        folder: "chat-app/avatars",
      });

      const user = await User.create({
        name,
        email,
        password,
        avatar: avatar.url || "",
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User could not be created",
        });
      }

      const newUser = await User.findById(user._id).select("-password");

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }),

  // Login a user
  login: asycnHandler(async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide both email and password.",
        });
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.comparePassword(password))) {
        return res.status(404).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const { token } = await generateTokens(user._id);

      const newUser = await User.findById(user._id).select("-password");

      res.status(200).cookie("token", token, options).json({
        success: true,
        message: "User logged in successfully",
        data: newUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }),

  //logout a user
  logout: asycnHandler(async (req, res) => {
    try {
      const userId = req.user?._id;

      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.clearCookie("token", options).json({
        success: true,
        message: "User logged out successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }),

  // Get all users
  getAllUsers: asycnHandler(async (req, res) => {
    try {
      const users = await User.find({ _id: { $ne: req.user._id } }).select(
        "-password"
      );

      if (!users) {
        return res.status(404).json({
          success: false,
          message: "Users not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Users found successfully",
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error in getAllUsers.",
        error: error.message,
      });
    }
  }),

  // Get a single user
  searchUser: asycnHandler(async (req, res) => {
    try {
      const { search } = req.query;

      if (!search) {
        return res.status(400).json({
          success: false,
          message: "Please enter a search query",
        });
      }

      const searchCriteria = {
        //what is $and?
        // $and is a logical operator that joins two or more expressions and returns true only if both expressions evaluate to true.
        $and: [
          { _id: { $ne: req.user._id } }, // Exclude current user
          {
            // $or is a logical operator that performs a logical OR operation on an array of two or more expressions and selects the documents that satisfy at least one of the expressions.
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          },
        ],
      };

      if (!searchCriteria) {
        return res.status(400).json({
          success: false,
          message: "No search criteria found",
        });
      }

      const users = await User.find(searchCriteria).select(
        "name email avatar "
      );

      if (!users) {
        return res.status(404).json({
          success: false,
          message: "Users not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Users found successfully",
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error in searchUser.",
        error: error.message,
      });
    }
  }),

  // update user profile
  updateProfile: asycnHandler(async (req, res) => {
    try {
      const userId = req.user?._id;
      const { name, email, currentPassword, newPassword } = req.body;
      const avatarFilePath = req.file?.path;

      // Validate user ID
      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Handle avatar update
      let avatar = user.avatar;
      if (avatarFilePath) {
        if (avatar) {
          await deleteOnCloudinary(avatar);
        }
        avatar = await uploadOnCloudinary(avatarFilePath, {
          folder: "chat-app/avatars",
        });
      }

      // Validate current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid current password",
        });
      }

      // Update user details
      user.name = name || user.name;
      user.email = email || user.email;
      user.avatar = avatar || user.avatar;
      if (newPassword) user.password = newPassword;

      const updatedUser = await user.save();

      const updatedProfile = await User.findById(updatedUser._id).select(
        "-password"
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error in updateProfile.",
        error: error.message,
      });
      throw error;
    }
  }),
};

export default UserController;
