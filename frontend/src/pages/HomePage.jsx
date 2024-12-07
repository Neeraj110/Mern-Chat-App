
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ChatPage from "../components/ChatPage";


function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Determine if sidebar should be visible based on screen size
  const shouldShowSidebar = windowWidth >= 768 || isSidebarOpen;

  return (
    <div className="flex flex-col h-screen">
      <Header isLoggedIn={isLoggedIn} toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {shouldShowSidebar && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            closeSidebar={() => setIsSidebarOpen(false)}
            isAlwaysVisible={windowWidth >= 768}
          />
        )}

        <ChatPage />
      </div>
    </div>
  );
}

export default HomePage;
