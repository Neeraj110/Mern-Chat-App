import { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../hooks/userAuthApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatar: null,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar" && files[0]) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    console.log(formData);

    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.avatar
      );
      toast.success("Signup successful");
      navigate("/");
    } catch (error) {
      toast.error(error);
      setError(error);
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
        <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded"
        />
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded"
        />

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 text-white rounded ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Signing Up..." : "Sign Up"}
        </button>

        <Link to="/" className="block text-center mt-4 hover:underline">
          Already have an account? <span className="text-blue-600">Login</span>
        </Link>
      </form>
    </div>
  );
}

export default Signup;
