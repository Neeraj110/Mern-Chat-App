import { axiosInstance } from "./userAuthApi";

// Centralized API logic for sending messages
export const sendMessageToAPI = async (conversation, message) => {
  if (!conversation || !message.trim()) {
    throw new Error("Invalid conversation or message.");
  }

  const endpoint =
    conversation.isGroupChat === true
      ? `/messages/send-in-group/${conversation._id}`
      : `/messages/send-message/${conversation._id}`;

  try {
    const response = await axiosInstance.post(endpoint, { message });
    return response.data.data;
  } catch (error) {
    console.error(
      `Error sending ${conversation.isGroupChat ? "group" : "single"} message:`,
      error.message
    );
    throw error; // Re-throw for the caller to handle
  }
};

// Centralized API logic for fetching messages
export const fetchMessagesAPI = async (conversation) => {
  if (!conversation) {
    console.error("No conversation provided for message fetching.");
    return [];
  }

  const endpoint =
    conversation.isGroupChat === true
      ? `/messages/get-group-messages/${conversation._id}`
      : `/messages/get-messages/${conversation._id}`;

  try {
    const response = await axiosInstance.get(endpoint);

    if (response.data?.data) {
      return response.data.data[0]?.messages || [];
    } else {
      console.error("No messages found in response.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};
