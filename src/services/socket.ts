import { io, Socket } from "socket.io-client";

class SocketService {
  socket: Socket | null = null;

  connect() {
    const URL = import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}`
      : "http://localhost:3000";

    this.socket = io(URL, {
      withCredentials: true,
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      // console.log("🟢 Conectado a Socket.io");
    });

    this.socket.on("disconnect", () => {
      // console.log("🔴 Desconectado de Socket.io");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: any) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event: string) {
    if (!this.socket) return;
    this.socket.off(event);
  }
}

export default new SocketService();
