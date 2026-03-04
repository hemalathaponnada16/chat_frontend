import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export default api;
// import axios from "axios";

// const instance = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// instance.interceptors.request.use((config) => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   if (user?.token) {
//     config.headers.Authorization = `Bearer ${user.token}`;
//   }
//   return config;
// });
// export default instance;

// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// export default api;
// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
//   withCredentials: true, // if using cookies
// });

// export default api;
// import axios from "axios";

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
// });

// export default api;