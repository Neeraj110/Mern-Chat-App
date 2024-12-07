import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { login } from "../hooks/userAuthApi";
import { setCredential } from "../redux/authSlice";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      if (user) {
        dispatch(setCredential(user));
        navigate("/home");
        toast.success("Login successful");
      }
    } catch (err) {
      toast.error(err || "Login failed"); // Show appropriate error
      setError(err); // Optionally, save error for rendering in UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-[400px] p-6 shadow-lg bg-white rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {/* Email Input */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded"
          required
        />

        {/* Password Input */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded"
          required
        />

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 text-white rounded ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Logging In..." : "Login"}
        </button>

        {/* Signup Link */}
        <Link to="/signup" className="block text-center mt-4 hover:underline">
          Don't have an account? <span className="text-blue-600">Signup</span>
        </Link>
      </form>
    </div>
  );
}

export default Login;
