import React from "react";
import { useDispatch } from "react-redux";
import { setSelectedConversation } from "../../redux/conversationSlice";

export function GroupInfo({ groups, isLoading, closeSidebar }) {
  const dispatch = useDispatch();

  const handleGroupSelect = (group) => {
    dispatch(setSelectedConversation(group));
    closeSidebar();
  };

  if (isLoading) {
    return <p className="text-center text-gray-500">Loading Groups...</p>;
  }

  if (!Array.isArray(groups) || groups.length === 0) {
    return <p className="text-center text-gray-500">No groups found.</p>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Your Groups</h3>
      <div className="space-y-4 p-4 h-full overflow-y-auto">
        {groups.map((group) => (
          <div
            key={group._id}
            className="flex items-center space-x-4 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onClick={() => handleGroupSelect(group)}
          >
            <img
              src={group.admin.avatar}
              alt={group.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col flex-1">
              <span className="font-medium text-sm">{group.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {group.members.length} members
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
