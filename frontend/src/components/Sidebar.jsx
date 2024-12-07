import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { UserInfo } from "../components/subComponents/UserInfo";
import { GroupInfo } from "./subComponents/GroupInfo.jsx";
import { getUsersInfo, searchUser } from "../hooks/getUsersInfo";
import { useGetGroups } from "../hooks/groupApi";
import { getUser } from "../redux/authSlice.js";
import { setGroupUpdated } from "../redux/conversationSlice.js";

function Sidebar({ isSidebarOpen, closeSidebar, isAlwaysVisible = false }) {
  const { isDarkMode } = useSelector((state) => state.theme);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const dispatch = useDispatch();
  const { isGroupUpdated } = useSelector((state) => state.conversations);

  // Debounce effect for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = debouncedSearch
        ? await searchUser(debouncedSearch)
        : await getUsersInfo();
      setUsers(data);
      dispatch(getUser(data));
    } catch (error) {
      toast.error("Failed to fetch user info");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await useGetGroups();
      setGroups(data.groups || []);
    } catch (error) {
      toast.error("Failed to fetch groups");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isGroupUpdated === true) {
      fetchGroups();
      console.log("fetching groups");
      dispatch(setGroupUpdated(false));
    }
  }, [isGroupUpdated === true]);

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, [fetchUsers, fetchGroups]);

  return (
    <div
      className={`fixed md:static top-0 left-0 h-full w-full md:w-[32vw] z-50 
        transition-transform transform ${
          isAlwaysVisible || isSidebarOpen
            ? "translate-x-0 ease-in-out"
            : "-translate-x-full"
        } ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
    >
      <div className="p-4 h-full overflow-y-auto">
        {!isAlwaysVisible && (
          <button
            onClick={closeSidebar}
            className="md:hidden text-red-500 font-bold mb-4"
          >
            Close
          </button>
        )}
        <input
          type="text"
          placeholder="Search User"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 ${
            isDarkMode ? "bg-white text-gray-800" : "bg-white text-black"
          }`}
        />
        <Link to="/create-group">
          <button className="w-full p-3 bg-blue-500 text-white rounded mb-4 hover:bg-blue-600">
            Create Group
          </button>
        </Link>

        {/* Render Users */}
        <UserInfo
          users={users}
          isLoading={isLoading}
          closeSidebar={closeSidebar}
        />

        {/* Render Groups */}
        <GroupInfo
          groups={groups}
          isLoading={isLoading}
          closeSidebar={closeSidebar}
        />
      </div>
    </div>
  );
}

export default Sidebar;
