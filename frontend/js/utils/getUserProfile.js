import { errorMessageHandler } from "./errorMessage.js";
import { smartFetch } from "./fetchWithRefToken.js";

const fetchData = async (url) => {
  try {
    const res = await smartFetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    errorMessageHandler(error.message, error.status);
    return [];
  }
};

export const userProfile = await fetchData(
  `http://localhost:5000/api/user/myProfile`,
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }
);
