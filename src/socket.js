// src/socket.js
// import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:5000"; // replace with your backend URL if deployed
// export const socket = io(SOCKET_URL, {
//   autoConnect: false, // we will manually connect
// });
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
