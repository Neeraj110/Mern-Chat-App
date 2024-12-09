import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useCreateGroup } from "../hooks/groupApi";
import { getUsersInfo, searchUser } from "../hooks/getUsersInfo";
import { toast } from "react-toastify";

function CreateGroup() {
  const { isDarkMode } = useSelector((state) => state.theme);
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users (debounced)
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = debouncedSearch
        ? await searchUser(debouncedSearch)
        : await getUsersInfo();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch user info");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || selectedMembers.length < 2) {
      setError("Please provide a valid group name and at least 2 members.");
      return;
    }
    const data = {
      name,
      members: selectedMembers.map((member) => member._id),
    };
    try {
      setLoading(true);
      await useCreateGroup(data);
      setName("");
      setSelectedMembers([]);
      toast.success("Group created successfully!");
    } catch (error) {
      setError(error.response?.data?.message || "Error creating group.");
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const addMember = (user) => {
    if (!selectedMembers.some((member) => member._id === user._id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const removeMember = (userId) => {
    setSelectedMembers(
      selectedMembers.filter((member) => member._id !== userId)
    );
  };

  return (
    <div
      className={`min-h-screen w-full p-4 overflow-y-auto ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateGroup} className="space-y-4">
        <div className="flex items-center gap-4 w-full">
          {/* Group Name Input */}
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium mb-2"
            >
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 transition duration-300 ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500"
                  : "bg-gray-100 border-gray-300 focus:ring-blue-400"
              }`}
            />
          </div>

          {/* Search Users */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Members
            </label>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 transition duration-300 ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-500"
                  : "bg-gray-100 border-gray-300 focus:ring-blue-400"
              }`}
            />
          </div>
        </div>

        {/* Selected Members */}
        {selectedMembers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Selected Members</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedMembers.map((member) => (
                <span
                  key={member._id}z
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {member.name}
                  <button
                    type="button"
                    onClick={() => removeMember(member._id)}
                    className="ml-2 text-red-500 hover:text-red-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* User List */}
        <div className="max-h-64 overflow-y-auto border">
          {isLoading ? (
            <div className="text-center">Loading users...</div>
          ) :  users.length === 0 ? (
            <div className="text-center text-gray-500">No users found</div>
          ) : (
            <div className="grid gap-2 ">
              {users
                .filter(
                  (user) => !selectedMembers.some((m) => m._id === user._id)
                )
                .map((user) => (
                  <div
                    key={user._id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div
                          className="text-sm text-gray-500 md:w-full w-[13rem] truncate"
                          title={user.email} // Tooltip shows the full email on hover
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addMember(user)}
                      className="px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Create Group Button */}
        <button
          type="submit"
          disabled={loading || selectedMembers.length < 2}
          className={`w-full md:w-[15rem]  py-2 rounded-lg mt-4 transition duration-300 ${
            selectedMembers.length < 2 || loading
              ? "opacity-50 cursor-not-allowed bg-slate-500"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
}

export default CreateGroup;
