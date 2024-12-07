import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/themeSlice";
import { GiHamburgerMenu } from "react-icons/gi";
import { CiLight } from "react-icons/ci";
import { MdLightMode } from "react-icons/md";
import { TbLogout2 } from "react-icons/tb";
import { logoutSuccess } from "../redux/authSlice";

function Header({ isLoggedIn, toggleSidebar }) {
  const { isDarkMode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate("/login");
  };

  return (
    <header
      className={`flex justify-between items-center px-4 py-2 md:px-5 md:py-3 shadow-lg ${
        isDarkMode ? "dark:bg-gray-800 " : "bg-white border-b border-gray-700"
      }`}
    >
      {/* Logo and Hamburger Menu */}
      <div className="text-lg md:text-[1.8vw] font-bold">
        <button
          className="lg:hidden md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <GiHamburgerMenu className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <h1
          className={`hidden md:block lg:block ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Chat-Application
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-2 md:space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="text-gray-800 dark:text-gray-200"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <div className="bg-gray-800 px-2 py-1 rounded-sm">
              <CiLight className="w-5 h-5 md:w-7 md:h-7" />
            </div>
          ) : (
            <div className="px-2 py-1 rounded-sm text-black">
              <MdLightMode className="w-5 h-5 md:w-7 md:h-7" />
            </div>
          )}
        </button>

        {/* Logout Button */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className={`px-2 py-1 ${
              isDarkMode ? "text-white" : "text-black"
            } rounded`}
            aria-label="Logout"
          >
            <TbLogout2
              className={`w-5 h-5 md:w-7 md:h-7 ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            />
          </button>
        )}

        {/* Profile Picture */}
        {isLoggedIn && (
          <img
            loading="lazy"
            src={user?.avatar}
            alt="Profile"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer"
            onClick={() => navigate("/profile")}
          />
        )}
      </nav>
    </header>
  );
}

export default Header;
