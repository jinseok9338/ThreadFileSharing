import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket, connectSocket, disconnectSocket } from "~/lib/socket";
import useTokenStore from "~/stores/tokenStore";

/**
 * WebSocket 연결 관리 Hook
 * - 싱글톤 Socket 인스턴스를 관리
 * - 연결 상태를 정확하게 추적
 * - 토큰 기반 인증
 */
export const useSocket = () => {
  const tokenStore = useTokenStore();
  const token = tokenStore.accessToken;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 싱글톤 소켓 인스턴스 가져오기
    const socket = getSocket();
    socketRef.current = socket;

    // 연결 상태 추적 핸들러
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    };

    // 이벤트 리스너 등록
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // 초기 연결 상태 설정
    setIsConnected(socket.connected);

    // 토큰이 있으면 연결 시도
    if (token && !socket.connected) {
      connectSocket(token);
    }

    return () => {
      // 이벤트 리스너만 정리 (연결은 유지)
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [token]);

  const connect = () => {
    console.log("🔌 [useSocket] Manual connect requested");
    socketRef.current = connectSocket(token || undefined);
  };

  const disconnect = () => {
    disconnectSocket();
  };

  const emit = (event: string, data?: any) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn(`Cannot emit event "${event}": socket not connected`);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    const socket = socketRef.current;
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    const socket = socketRef.current;
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};
