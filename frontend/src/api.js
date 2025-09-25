import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:3001",
  withCredentials: true // ✅ important for sending cookies
});

export default api;
