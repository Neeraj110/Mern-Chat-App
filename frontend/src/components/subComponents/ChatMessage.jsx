import React from "react";
import { useSelector } from "react-redux";

function ChatMessage({ isDarkMode, messages, messagesEndRef, isTyping }) {
  const { user } = useSelector((state) => state.auth);
  const loggedInUserId = user?._id;

  return (
    <div
      className={`flex flex-col flex-grow h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)] md:h-[55vh] lg:h-[55vh] p-2 sm:p-4 rounded-lg overflow-y-auto ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      {messages?.length > 0 ? (
        messages.map((message) => (
          <div
            key={message?._id}
            className={`mb-3 sm:mb-4 ${
              message?.sender?._id === loggedInUserId
                ? "flex justify-end"
                : "flex justify-start"
            }`}
          >
            <div
              className={`flex flex-col gap-2 p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[70%] text-sm sm:text-base ${
                message?.sender?._id === loggedInUserId
                  ? isDarkMode
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {message?.sender?._id !== loggedInUserId &&
                message?.messageType === "group" && (
                  <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-md">
                    <img
                      src={message?.sender?.avatar}
                      className="w-8 h-8 object-cover rounded-full"
                      alt={message?.sender?.name}
                    />
                    <small
                      className={`text-xs sm:text-sm ${
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {message?.sender?.name}
                    </small>
                  </div>
                )}
              <div>{message?.message}</div>
              <div className="text-xs sm:text-sm opacity-50 mt-1">
                {new Date(message?.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div
          className={`text-center text-base sm:text-2xl ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          No messages in this conversation
        </div>
      )}
      {isTyping && (
        <div className="">
          <div
            className={`text-left mb-[1rem] text-sm sm:text-base ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Someone is typing...
          </div>
          <div className="mt-[3rem]"></div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessage;
