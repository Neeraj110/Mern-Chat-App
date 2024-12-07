import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ members: 1 });
conversationSchema.index({ lastMessage: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
