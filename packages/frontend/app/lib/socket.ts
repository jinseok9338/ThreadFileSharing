import { io, Socket } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // 연결 이벤트 로깅
    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  return socket;
};

export const connectSocket = (token?: string): Socket => {
  const socket = getSocket();

  if (token) {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const emitEvent = (event: string, data?: any): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn(`Cannot emit event "${event}": socket not connected`);
  }
};

export const onEvent = (
  event: string,
  callback: (...args: any[]) => void
): void => {
  const socket = getSocket();
  socket.on(event, callback);
};

export const offEvent = (
  event: string,
  callback?: (...args: any[]) => void
): void => {
  const socket = getSocket();
  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
};

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
  emitEvent,
  onEvent,
  offEvent,
};
