import React, { useState } from "react";
import GroupDetailsModal from "./GroupDetailsModal";
import { GiBurningEye } from "react-icons/gi";

function ChatHeader({ selectedConversation, isDarkMode, onlineUsers }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOnline = onlineUsers.includes(selectedConversation?._id);

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  return (
    <div
      className={`flex  items-center justify-between px-4 py-2 mb-3 rounded-lg ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"
      }`}
    >
      {/* User Avatar and Name */}
      <div className="flex space-x-3 ">
        <img
          src={
            selectedConversation?.avatar
              ? selectedConversation?.avatar
              : `https://api.dicebear.com/9.x/bottts/webp`
          }
          alt="User"
          className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border"
        />
        <div className="flex flex-col relative">
          <h2 className="text-[1rem] sm:text-xl font-bold truncate flex items-center gap-3">
            {selectedConversation?.name}
            {isOnline && <small className=" text-green-500">online</small>}
          </h2>

          <p className="text-[.5rem] sm:text-base w-[12rem] md:w-[40rem] text-gray-500 dark:text-gray-400 truncate">
            {selectedConversation.isGroupChat
              ? selectedConversation?.members
                  .map((member) => member.name)
                  .join(",  ")
              : selectedConversation?.email}
          </p>
        </div>
      </div>

      {/* Eye Icon Button (Visible only for Group Chats) */}
      {selectedConversation.isGroupChat && (
        <button
          className="flex items-center p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
          onClick={toggleModal}
        >
          <GiBurningEye className="w-6 h-6" />
        </button>
      )}

      {/* Group Details Modal */}
      {isModalOpen && (
        <GroupDetailsModal
          isDarkMode={isDarkMode}
          group={selectedConversation}
          onClose={toggleModal}
        />
      )}
    </div>
  );
}

export default ChatHeader;
