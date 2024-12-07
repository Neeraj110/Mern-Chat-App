import React from "react";
import { useDispatch } from "react-redux";
import { setSelectedConversation } from "../../redux/conversationSlice";

export function UserInfo({ users, isLoading, closeSidebar }) {
  const disptach = useDispatch();

  function selectHandler(user) {
    disptach(setSelectedConversation(user));
    closeSidebar();
  }

  if (isLoading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (!Array.isArray(users) || users.length === 0) {
    return <p className="text-center text-gray-500">No users found.</p>;
  }

  return (
    <div className="overflow-y-auto overflow-x-hidden h-[55%] md:h-[70%] space-y-4">
      {users.map((user) => (
        <div
          className="flex items-center space-x-4 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition "
          key={user._id}
          onClick={() => selectHandler(user)}
        >
          <img
            src={user.avatar}
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col flex-1">
            <span className="font-medium text-sm">{user?.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
