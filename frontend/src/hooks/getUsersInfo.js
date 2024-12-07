import { axiosInstance } from "./userAuthApi";

export const getUsersInfo = async () => {
  try {
    const res = await axiosInstance.get("/users/get-allUsers");
    return res.data.data;
  } catch (error) {
    console.error(error);
  }
};

export const searchUser = async (name) => {
  try {
    const res = await axiosInstance.get(`/users/search-user?search=${name}`);
    return res.data.data;
  } catch (error) {
    console.log(error);
  }
};
