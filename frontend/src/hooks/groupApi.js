import { axiosInstance } from "./userAuthApi";

export const useCreateGroup = async (data) => {
  try {
    const response = await axiosInstance.post("/groups/create-group", data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const useGetGroups = async () => {
  try {
    const response = await axiosInstance.get("/groups/get-groups");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const addMemberToGroup = async (groupId, members) => {
  try {
    const response = await axiosInstance.post(`/groups/add-group/${groupId}`, {
      members,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const removeMemberFromGroup = async (conversationId, members) => {
  try {
    const response = await axiosInstance.patch(
      `/groups/remove-group/${conversationId}`,
      {
        members,
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const deleteGroup = async (groupId) => {
  try {
    const response = await axiosInstance.delete(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const leaveGroup = async (groupId) => {
  try {
    const response = await axiosInstance.patch(`/groups/${groupId}/leave`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
