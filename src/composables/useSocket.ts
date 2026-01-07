// src/composables/useSocket.ts
import { ref } from "vue";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";

const socket = ref<Socket | null>(null);
const isConnected = ref(false);

export function useSocket() {
  const authStore = useAuthStore();

  const connect = () => {
    if (socket.value?.connected) return;

    const token = authStore.token || localStorage.getItem("token");

    // Choose URL based on env or default
    const URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    // Clean URL to base origin if needed, but socket.io client handles it nicely usually
    // Assuming backend is at localhost:3000

    socket.value = io(URL, {
      auth: {
        token: token,
      },
      transports: ["websocket"],
    });

    socket.value.on("connect", () => {
      // console.log("Socket connected:", socket.value?.id);
      isConnected.value = true;
    });

    socket.value.on("disconnect", () => {
      // console.log("Socket disconnected");
      isConnected.value = false;
    });

    socket.value.on("connect_error", (err) => {
      // console.error("Socket connection error:", err.message);
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socket.value?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socket.value?.off(event, callback);
  };

  const emit = (event: string, ...args: any[]) => {
    socket.value?.emit(event, ...args);
  };

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    on,
    off,
    emit,
  };
}
