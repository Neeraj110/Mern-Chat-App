import axios from "axios";

// In your code
// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = "https://mern-chat-app-7pza.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const login = async (email, password) => {
  try {
    const res = await axiosInstance.post("/users/login", { email, password });

    if (res.data.success) {
      console.log(res.data);
      
      return res.data.data; // Return user data if login is successful
    } else {
      throw new Error(res.data.error || "Login failed");
    }
  } catch (error) {
    throw (
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
};

export const signup = async (name, email, password, avatar) => {
  try {
    if (!name || !email || !password || !avatar) {
      throw new Error("All fields are required");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    const res = await axiosInstance.post("/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    throw (
      error?.response?.data?.message || error.message || "Something went wrong"
    );
  }
};

export const logout = async () => {
  try {
    const res = await axiosInstance.get("/users/logout");
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
