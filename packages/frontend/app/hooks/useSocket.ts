import { useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { getSocket, connectSocket, disconnectSocket } from "~/lib/socket";

interface UseSocketOptions {
  autoConnect?: boolean;
  token?: string;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = false, token } = options;
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();

    if (autoConnect) {
      connectSocket(token);
    }

    return () => {
      // 컴포넌트 언마운트 시 연결 해제하지 않음
      // 다른 컴포넌트에서도 사용할 수 있도록
    };
  }, [autoConnect, token]);

  const connect = useCallback(
    (authToken?: string) => {
      socketRef.current = connectSocket(authToken || token);
    },
    [token]
  );

  const disconnect = useCallback(() => {
    disconnectSocket();
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit event "${event}": socket not connected`);
    }
  }, []);

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      socketRef.current?.on(event, callback);
    },
    []
  );

  const off = useCallback(
    (event: string, callback?: (...args: any[]) => void) => {
      if (callback) {
        socketRef.current?.off(event, callback);
      } else {
        socketRef.current?.off(event);
      }
    },
    []
  );

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};
