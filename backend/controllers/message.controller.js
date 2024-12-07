import { isValidObjectId } from "mongoose";
import Conversation from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const MessageController = {
  createMessage: async (req, res) => {
    try {
      const { message } = req.body;
      const { receiverId } = req.params;
      const senderId = req.user._id;

      if (!receiverId || !message) {
        return res.status(400).json({
          success: false,
          message: "Receiver ID and message are required.",
        });
      }

      let conversation = await Conversation.findOne({
        isGroupChat: false,
        members: { $all: [senderId, receiverId] },
      });

      // Create a new conversation if it doesn't exist
      if (!conversation) {
        conversation = await Conversation.create({
          name: "One-to-One Chat",
          isGroupChat: false,
          members: [senderId, receiverId],
        });
      }

      // Create a new message
      const newMessage = await Message.create({
        senderId,
        receiverId,
        conversationId: conversation._id,
        message,
        messageType: "individual",
      });

      // Update the conversation's last message
      conversation.lastMessage = newMessage._id;
      await conversation.save();

      const populatedMessage = await Message.findById(newMessage._id);

      return res.status(201).json({
        success: true,
        message: "Message created successfully.",
        data: populatedMessage,
      });
    } catch (error) {
      console.error("Error in createMessage:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error creating message.",
        error: error.message,
      });
    }
  },

  sendMessageInGroup: asyncHandler(async (req, res) => {
    try {
      const { message } = req.body;
      const { conversationId } = req.params;
      const senderId = req.user._id;

      if (!isValidObjectId(conversationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid conversation ID.",
        });
      }

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message content is required.",
        });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        isGroupChat: true,
        members: senderId,
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found.",
        });
      }

      const messageData = {
        senderId,
        conversationId: conversation._id,
        message,
        messageType: "group",
      };

      const newMessage = await Message.create(messageData);

      conversation.lastMessage = newMessage._id;
      await conversation.save();

      const populatedMessage = await Message.findById(newMessage._id);

      return res.status(201).json({
        success: true,
        message: "Message sent successfully.",
        data: populatedMessage,
      });
    } catch (error) {
      console.error("Error in sendMessageInGroup:", error);
      return res.status(500).json({
        success: false,
        message: "Error sending message.",
        error: error.message,
      });
    }
  }),

  getMessages: asyncHandler(async (req, res) => {
    try {
      const { receiverId } = req.params;
      const { conversationId } = req.body;
      const userId = req.user._id;

      let conversation;
      if (conversationId !== undefined) {
        conversation = await Conversation.findById(conversationId);
      } else {
        conversation = await Conversation.findOne({
          isGroupChat: false,
          members: { $all: [userId, receiverId] },
        });
      }

      if (!conversation) {
        return res.status(200).json({
          success: true,
          message: "No conversation found.",
          data: [],
        });
      }

      if (!conversation.members.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this conversation.",
        });
      }

      const newConversation = await Conversation.aggregate([
        {
          $match: {
            _id: conversation._id,
          },
        },
        // Lookup members to get user details
        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "members",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        // Lookup messages related to this conversation
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "conversationId",
            as: "messages",
            pipeline: [
              // Lookup sender details for each message
              {
                $lookup: {
                  from: "users",
                  localField: "senderId",
                  foreignField: "_id",
                  as: "sender",
                },
              },
              // Lookup receiver details for each message
              {
                $lookup: {
                  from: "users",
                  localField: "receiverId",
                  foreignField: "_id",
                  as: "receiver",
                },
              },
              {
                $addFields: {
                  sender: { $arrayElemAt: ["$sender", 0] },
                  receiver: { $arrayElemAt: ["$receiver", 0] },
                },
              },
              {
                $project: {
                  _id: 1,
                  message: 1,
                  createdAt: 1,
                  sender: { _id: 1, name: 1, email: 1, avatar: 1 },
                  receiver: { _id: 1, name: 1, email: 1, avatar: 1 },
                },
              },
              { $sort: { createdAt: 1 } }, // Sort messages by creation date
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            isGroupChat: 1,
            members: 1,
            messages: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        message: "Messages fetched successfully.",
        data: newConversation,
      });
    } catch (error) {
      console.error("Error in getMessages:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error fetching messages.",
        error: error.message,
      });
    }
  }),

  getMessagesForGroup: asyncHandler(async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user._id;

      // Find the conversation and explicitly check it's a group chat
      const conversation = await Conversation.findOne({
        _id: conversationId,
        isGroupChat: true,
      });

      if (!conversation) {
        throw new Error("Group conversation not found.");
      }

      if (!conversation.members.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this group conversation.",
        });
      }

      const newConversation = await Conversation.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(conversationId),
            isGroupChat: true, // Double-check in the aggregation pipeline
          },
        },
        // Lookup members to get user details
        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "members",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        // Lookup messages related to this conversation
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "conversationId",
            as: "messages",
            pipeline: [
              // Lookup sender details for each message
              {
                $lookup: {
                  from: "users",
                  localField: "senderId",
                  foreignField: "_id",
                  as: "sender",
                },
              },
              {
                $addFields: {
                  sender: { $arrayElemAt: ["$sender", 0] },
                },
              },
              {
                $project: {
                  _id: 1,
                  message: 1,
                  messageType: 1,
                  createdAt: 1,
                  sender: { _id: 1, name: 1, email: 1, avatar: 1 },
                },
              },
              { $sort: { createdAt: 1 } }, // Sort messages by creation date
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            isGroupChat: 1,
            members: 1,
            messages: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);

      if (!newConversation.length) {
        return res.status(200).json({
          success: true,
          message: "No messages found for this group conversation.",
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: "Group messages fetched successfully.",
        data: newConversation, // Return the first (and only) conversation
      });
    } catch (error) {
      console.error("Error in getMessagesForGroup:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error fetching group messages.",
        error: error.message,
      });
    }
  }),

  deleteOnetoOneChat: asyncHandler(async (req, res) => {
    try {
      const { conversationId } = req.params;

      // Delete conversation
      const deletedConversation = await Conversation.findByIdAndDelete(
        conversationId
      );

      if (!deletedConversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found.",
        });
      }

      // Delete all messages related to the conversation
      await Message.deleteMany({ conversation: conversationId });

      return res.status(200).json({
        success: true,
        message: "Conversation deleted successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error deleting conversation.",
        error: error.message,
      });
    }
  }),
};

export default MessageController;
