import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["individual", "group"],
      default: "individual",
    },
  },
  { timestamps: true } 
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

// Remove the validation that requires receiverId
messageSchema.pre("validate", function (next) {
  if (this.messageType === "group") {
    this.receiverId = undefined;
  }
  next();
});

export const Message = mongoose.model("Message", messageSchema);
