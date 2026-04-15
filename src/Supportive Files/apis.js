import axios from "axios";
export const config = {
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
};

export const handleLogin = async (username, password) => {
    console.log("Attempting login with:", { username, password ,config});
  try {
    const response = await axios.post("http://localhost:8080/api/auth/login", {
      name: username,
      email:password
    },config);
    return response.data;
  } catch (error) {
    console.log("Its Error, Login error:", error);
    // throw error;
  }
};