import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateGroup from "./pages/CreateGroup";

// Main App Component
function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      {/* Toast Notifications */}
      <ToastContainer
        className="pl-[4rem] pr-[2rem] mt-[1rem] text-[.8rem] md:p-0"
        autoClose={1000}
      />
      <Routes>
        {/* Redirect logged-in users trying to visit login/signup */}
        <Route
          path="/login"
          element={user ? <Navigate to="/home" /> : <Login />}
        />

        <Route
          path="/signup"
          element={user ? <Navigate to="/home" /> : <Signup />}
        />

        {/* Protected Home Route */}
        <Route
          path="/home"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />

        {/* Protected Create Group Route */}
        <Route
          path="/create-group"
          element={user ? <CreateGroup /> : <Navigate to="/login" />}
        />

        {/* Handle any invalid route by redirecting */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
