import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import asynhHandler from "../utils/asyncHandler.js";

const VerifyToken = asynhHandler(async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") || req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
      error: error.message,
    });
  }
});

export default VerifyToken;
