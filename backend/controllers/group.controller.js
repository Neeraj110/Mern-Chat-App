import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { isValidObjectId } from "mongoose";

const GroupController = {
  createGroup: asyncHandler(async (req, res) => {
    try {
      const { name, members } = req.body;

      if (!name || !members || !Array.isArray(members) || members.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid group name and at least 2 members",
        });
      }

      const existingGroup = await Conversation.findOne({
        name: name.trim(),
        isGroupChat: true,
        members: { $all: members },
      }).populate("members", "name email avatar");

      if (existingGroup) {
        return res.status(400).json({
          success: false,
          message: "Group with same name and members already exists",
        });
      }

      // Add the current user to the group members
      if (!members.includes(req.user._id)) {
        members.push(req.user._id);
      }

      // Create new group
      const newGroup = await Conversation.create({
        name: name.trim(),
        members,
        isGroupChat: true,
        admin: req.user._id,
        createdAt: new Date(),
      });

      // Populate the group data
      const populatedGroup = await Conversation.findById(newGroup._id)
        .populate("members", "name email avatar")
        .populate("admin", "name emailm avatar");

      if (!populatedGroup) {
        return res.status(500).json({
          success: false,
          message: "Group created but error fetching details",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Group created successfully",
        group: populatedGroup,
      });
    } catch (error) {
      console.error("Group creation error:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating group",
        error: error.message,
      });
    }
  }),

  

  addMembers: asyncHandler(async (req, res) => {
    try {
      const { members } = req.body;

      const { conversationId } = req.params;

      if (
        !isValidObjectId(conversationId) ||
        !members ||
        !Array.isArray(members) ||
        members.length < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid group ID and at least 1 member",
        });
      }

      const group = await Conversation.findById(conversationId);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found",
        });
      }

      // Check if the current user is the group admin
      if (group.admin.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to add members to this group",
        });
      }

      // Add new members to the group
      group.members.push(...members);

      await group.save();

      // Populate the group data
      const populatedGroup = await Conversation.findById(group._id)
        .populate("members", "name email avatar")
        .populate("admin", "name emailm avatar");

      if (!populatedGroup) {
        return res.status(500).json({
          success: false,
          message: "Members added but error fetching group details",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Members added successfully",
        group: populatedGroup,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error adding members",
        error: error.message,
      });
    }
  }),

  getGroups: asyncHandler(async (req, res) => {
    try {
      const groups = await Conversation.find({
        members: req.user._id,
        isGroupChat: true,
      })
        .populate("members", "name email avatar")
        .populate("admin", "name email avatar")
        .sort("-createdAt");

      return res.status(200).json({
        success: true,
        groups,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching groups",
        error: error.message,
      });
    }
  }),

  getGroup: asyncHandler(async (req, res) => {
    try {
      const { conversationId } = req.params;

      if (!isValidObjectId(conversationId)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid group ID",
        });
      }
      const group = await Conversation.findById(conversationId)
        .populate("members", "name email avatar")
        .populate("admin", "name email avatar");

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Group details",
        data: group,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching group",
        error: error.message,
      });
    }
  }),

  removeMembers: asyncHandler(async (req, res) => {
    try {
      const { members } = req.body;
      const { conversationId } = req.params;

      if (
        !isValidObjectId(conversationId) ||
        !members ||
        !Array.isArray(members) ||
        members.length < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid group ID and at least 1 member",
        });
      }

      const group = await Conversation.findById(conversationId);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found",
        });
      }

      // Check if the current user is the group admin
      if (group.admin.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to remove members from this group",
        });
      }

      // Remove members from the group
      group.members = group.members.filter(
        (member) => !members.includes(member.toString())
      );

      await group.save();

      // Populate the group data
      const populatedGroup = await Conversation.findById(group._id)
        .populate("members", "name email avatar")
        .populate("admin", "name email avatar");

      if (!populatedGroup) {
        return res.status(500).json({
          success: false,
          message: "Members removed but error fetching group details",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Members removed successfully",
        group: populatedGroup,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error removing members",
        error: error.message,
      });
    }
  }),

  deleteGroup: asyncHandler(async (req, res) => {
    try {
      const { conversationId } = req.params;

      if (!isValidObjectId(conversationId)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid group ID",
        });
      }

      const group = await Conversation.findById(conversationId);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found",
        });
      }

      // Check if the current user is the group admin
      if (group.admin.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this group",
        });
      }

      await Message.deleteMany({ conversationId });

      await Conversation.findByIdAndDelete(conversationId);

      return res.status(200).json({
        success: true,
        message: "Group deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error deleting group",
        error: error.message,
      });
    }
  }),

  leaveGroup: asyncHandler(async (req, res) => {
    try {
      const { conversationId } = req.params;

      if (!isValidObjectId(conversationId)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid group ID",
        });
      }

      const group = await Conversation.findById(conversationId);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found",
        });
      }

      // Remove the current user from the group members
      group.members = group.members.filter(
        (member) => member.toString() !== req.user._id.toString()
      );

      // If the leaving user is the admin, choose a new admin
      if (group.admin.toString() === req.user._id.toString()) {
        // Select the first member as the new admin if available
        if (group.members.length > 0) {
          group.admin = group.members[0];
        } else {
          // If no members left, you might want to delete the group
          await Conversation.findByIdAndDelete(conversationId);
          return res.status(200).json({
            success: true,
            message: "Group deleted as no members remain",
          });
        }
      }

      // Save the updated group
      await group.save();

      return res.status(200).json({
        success: true,
        message: "Left group successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error leaving group",
        error: error.message,
      });
    }
  }),
  updateGroup: asyncHandler(async (req, res) => {}),
};

export default GroupController;
