import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addMemberToGroup, removeMemberFromGroup } from "../../hooks/groupApi";
import { MdDelete, MdClose } from "react-icons/md";
import { setGroupUpdated } from "../../redux/conversationSlice";

function GroupDetailsModal({ group, isDarkMode, onClose }) {
  const { user, allUsers } = useSelector((state) => state.auth);
  const [members, setMembers] = useState(group.members || []);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const isAdmin = user?._id === group?.admin?._id;

  useEffect(() => {
    setFilteredUsers(
      allUsers.filter(
        (u) =>
          !members.some((m) => m._id === u._id) &&
          !selectedMembers.some((m) => m._id === u._id) &&
          (u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }, [allUsers, members, selectedMembers, search]);

  const handleAddMember = async () => {
    setLoading(true);
    try {
      await addMemberToGroup(
        group?._id,
        selectedMembers.map((m) => m._id)
      );
      setMembers((prev) => [...prev, ...selectedMembers]);
      dispatch(setGroupUpdated(true));
      setSelectedMembers([]);
      setSearch("");
      toast.success(`${selectedMembers.length} member(s) added successfully`);
    } catch (error) {
      toast.error(
        error.response?.data?.error || error.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMemberFromGroup(group?._id, [memberId]);
      setMembers((prev) => prev.filter((member) => member._id !== memberId));
      dispatch(setGroupUpdated(true));
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to remove member"
      );
    }
  };

  const selectMember = (user) => {
    if (!selectedMembers.some((m) => m._id === user._id)) {
      setSelectedMembers((prev) => [...prev, user]);
    }
  };

  const removeMember = (memberId) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== memberId));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className={`w-full min-h-screen p-2 ${
          isDarkMode ? "bg-gray-900 bg-opacity-80" : "bg-gray-200 bg-opacity-80"
        }`}
      >
        <div
          className={`w-full mx-auto rounded-lg shadow-xl p-4 ${
            isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold truncate">
              {group.name} - Group Management
            </h2>
            <button
              onClick={onClose}
              className="text-red-500 hover:text-red-600"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Current Members Section */}
          <div className="mb-4">
            <h3 className="text-base font-semibold mb-2">Current Members</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {members.map((member) => (
                <div
                  key={member._id}
                  className={`inline-flex items-center px-2 py-1 rounded-full gap-1 text-xs ${
                    isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  <img
                    src={member.avatar}
                    alt={member.name || "User"}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <div className="font-medium truncate text-xs">
                      {member.name}
                    </div>
                  </div>
                  {isAdmin && member?._id !== group?.admin?._id && (
                    <button
                      onClick={() => handleRemoveMember(member?._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove member"
                    >
                      <MdDelete size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Members Section */}
          {selectedMembers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-medium mb-1">Selected Members</h3>
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedMembers.map((member) => (
                  <span
                    key={member._id}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {member.name}
                    <button
                      type="button"
                      onClick={() => removeMember(member._id)}
                      className="ml-1 text-red-500 hover:text-red-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={handleAddMember}
                disabled={loading}
                className={`w-full px-3 py-2 rounded-md text-sm ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {loading
                  ? "Adding..."
                  : `Add ${selectedMembers.length} Member(s)`}
              </button>
            </div>
          )}

          {/* Add Members Section (Admin Only) */}
          {isAdmin && (
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-2">Add New Members</h3>
              <input
                type="text"
                placeholder="Search users to add..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full p-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500"
                    : "bg-gray-100 border-gray-300 focus:ring-blue-400"
                }`}
              />
              <div className="mt-2 max-h-40 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center p-2 text-xs text-gray-500">
                    No users found to add
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => selectMember(user)}
                        className={`inline-flex items-center cursor-pointer px-2 py-1 rounded-full text-xs ${
                          isDarkMode
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover mr-2"
                        />
                        <div>
                          <div className="font-medium text-xs">{user.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupDetailsModal;
