import { io } from "socket.io-client";
import { backendUrl } from "./config";

export const socket = io(backendUrl, {
  withCredentials: true,
  transports: ["websocket"],
});