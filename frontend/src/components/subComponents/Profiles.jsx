import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";

function Profiles() {
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    password: "",
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, avatar: e.target.files[0] });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      if (form.password) formData.append("password", form.password);
      if (form.avatar) formData.append("avatar", form.avatar);

      const response = await axios.put("/api/user/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data.message);
      // Update Redux state or re-fetch user details if needed
      // dispatch({ type: "UPDATE_USER", payload: response.data.user });

      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Profile</h1>

      <form onSubmit={handleUpdateUser}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <div>
          <label htmlFor="avatar">Avatar</label>
          <input
            type="file"
            name="avatar"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

export default Profiles;
