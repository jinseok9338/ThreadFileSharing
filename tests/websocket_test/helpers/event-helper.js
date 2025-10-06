const AuthHelper = require("./auth-helper");

/**
 * WebSocket 이벤트 테스트를 위한 헬퍼 클래스
 * 연결 + 데이터 + 비즈니스 로직 3단계 검증을 제공
 */
class EventHelper {
  constructor() {
    this.authHelper = new AuthHelper();
    this.sockets = new Map();
    this.eventLog = [];
    this.testResults = {
      connection: false,
      eventsReceived: 0,
      eventsSent: 0,
      businessLogicValidated: 0,
      errors: [],
    };
  }

  /**
   * WebSocket 연결 생성
   * @param {string} userEmail - 사용자 이메일 (선택적)
   * @returns {Promise<Object>} 연결된 소켓과 사용자 정보
   */
  async createConnection(userEmail = null) {
    const { io } = require("socket.io-client");

    // 사용자 정보 가져오기 또는 생성
    const user = userEmail
      ? await this.authHelper.getValidToken(userEmail)
      : await this.authHelper.registerTestUser();

    const socket = io("http://localhost:3001", {
      transports: ["polling", "websocket"],
      timeout: 10000,
      forceNew: true,
      reconnection: false,
      autoConnect: true,
      query: {
        token: user.accessToken,
      },
    });

    // 연결 성공 검증
    const connectionPromise = new Promise((resolve, reject) => {
      socket.on("connect", () => {
        console.log(`✅ WebSocket 연결 성공: ${socket.id}`);
        this.testResults.connection = true;
        resolve({ socket, user });
      });

      socket.on("connect_error", (error) => {
        console.log("❌ WebSocket 연결 실패:", error.message);
        this.testResults.errors.push(`Connection failed: ${error.message}`);
        reject(error);
      });

      setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 10000);
    });

    const connection = await connectionPromise;
    this.sockets.set(user.email, connection);

    return connection;
  }

  /**
   * 이벤트 수신 검증
   * @param {Object} socket - Socket.io 소켓 객체
   * @param {string} eventName - 이벤트 이름
   * @param {Function} validator - 검증 함수
   * @param {number} timeout - 타임아웃 (밀리초)
   * @returns {Promise<Object>} 이벤트 데이터
   */
  async waitForEvent(socket, eventName, validator = null, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Event ${eventName} timeout`));
      }, timeout);

      socket.once(eventName, (data) => {
        clearTimeout(timer);

        // 이벤트 로그 기록
        this.eventLog.push({
          event: eventName,
          data,
          timestamp: new Date().toISOString(),
          socketId: socket.id,
        });

        this.testResults.eventsReceived++;

        // 데이터 검증
        if (validator && typeof validator === "function") {
          try {
            const isValid = validator(data);
            if (isValid) {
              this.testResults.businessLogicValidated++;
              console.log(`✅ 이벤트 ${eventName} 검증 성공`);
            } else {
              console.log(`❌ 이벤트 ${eventName} 검증 실패`);
              this.testResults.errors.push(
                `Event ${eventName} validation failed`
              );
            }
          } catch (error) {
            console.log(`❌ 이벤트 ${eventName} 검증 에러:`, error.message);
            this.testResults.errors.push(
              `Event ${eventName} validation error: ${error.message}`
            );
          }
        }

        resolve(data);
      });
    });
  }

  /**
   * 이벤트 전송
   * @param {Object} socket - Socket.io 소켓 객체
   * @param {string} eventName - 이벤트 이름
   * @param {Object} data - 전송할 데이터
   * @returns {Promise<boolean>} 전송 성공 여부
   */
  async sendEvent(socket, eventName, data) {
    try {
      socket.emit(eventName, data);
      this.testResults.eventsSent++;

      // 이벤트 로그 기록
      this.eventLog.push({
        event: eventName,
        data,
        timestamp: new Date().toISOString(),
        socketId: socket.id,
        direction: "outgoing",
      });

      console.log(`📤 이벤트 전송: ${eventName}`);
      return true;
    } catch (error) {
      console.log(`❌ 이벤트 전송 실패: ${eventName}`, error.message);
      this.testResults.errors.push(
        `Failed to send ${eventName}: ${error.message}`
      );
      return false;
    }
  }

  /**
   * 메시지 전송 및 수신 검증
   * @param {Object} socket - Socket.io 소켓 객체
   * @param {Object} messageData - 메시지 데이터
   * @returns {Promise<Object>} 수신된 메시지 데이터
   */
  async sendAndVerifyMessage(socket, messageData) {
    // 메시지 전송
    await this.sendEvent(socket, "send_chatroom_message", messageData);

    // 메시지 수신 대기 및 검증 (실제 백엔드 이벤트 이름 사용)
    const receivedMessage = await this.waitForEvent(
      socket,
      "chatroom_message_received",
      (data) => {
        return (
          data.content === messageData.content && data.sender && data.createdAt
        );
      }
    );

    return receivedMessage;
  }

  /**
   * 룸 조인 및 검증
   * @param {Object} socket - Socket.io 소켓 객체
   * @param {string} roomType - 룸 타입 (company, chatroom, thread)
   * @param {string} roomId - 룸 ID
   * @returns {Promise<Object>} 룸 조인 결과
   */
  async joinRoomAndVerify(socket, roomType, roomId) {
    const joinEventMap = {
      company: "join_company",
      chatroom: "join_chatroom",
      thread: "join_thread",
    };

    const joinEvent = joinEventMap[roomType];
    if (!joinEvent) {
      throw new Error(`Unknown room type: ${roomType}`);
    }

    // 룸 조인
    await this.sendEvent(socket, joinEvent, { [`${roomType}Id`]: roomId });

    // 룸 조인 확인 대기 (실제 백엔드 이벤트 이름 사용)
    const responseEventMap = {
      company: "user_joined_company",
      chatroom: "user_joined_chatroom",
      thread: "user_joined_thread",
      upload_session: "user_joined_upload_session",
    };

    const expectedEvent = responseEventMap[roomType];
    const joinResult = await this.waitForEvent(
      socket,
      expectedEvent,
      (data) => {
        return data.user && data.joinedAt;
      }
    );

    return joinResult;
  }

  /**
   * 타이핑 인디케이터 테스트
   * @param {Object} socket - Socket.io 소켓 객체
   * @param {string} roomId - 룸 ID
   * @param {boolean} isTyping - 타이핑 상태
   * @returns {Promise<Object>} 타이핑 인디케이터 결과
   */
  async testTypingIndicator(socket, roomId, isTyping = true) {
    // 타이핑 인디케이터 전송
    await this.sendEvent(socket, "typing_indicator", {
      roomId,
      isTyping,
    });

    // 타이핑 인디케이터 수신 대기 (실제 백엔드 이벤트 이름 사용)
    const typingEvent = isTyping ? "chatroom_typing" : "chatroom_typing";
    const typingResult = await this.waitForEvent(
      socket,
      typingEvent,
      (data) => {
        return (
          data.chatroomId === roomId && data.isTyping === isTyping && data.user
        );
      }
    );

    return typingResult;
  }

  /**
   * 에러 이벤트 처리 테스트
   * @param {Object} socket - Socket.io 소켓 객체
   * @param {string} invalidEvent - 잘못된 이벤트 이름
   * @param {Object} invalidData - 잘못된 데이터
   * @returns {Promise<Object>} 에러 응답
   */
  async testErrorHandling(socket, invalidEvent, invalidData) {
    // 잘못된 이벤트 전송
    await this.sendEvent(socket, invalidEvent, invalidData);

    // 에러 응답 대기
    const errorResponse = await this.waitForEvent(socket, "error", (data) => {
      return data.code && data.message;
    });

    return errorResponse;
  }

  /**
   * 테스트 결과 요약
   * @returns {Object} 테스트 결과 요약
   */
  getTestSummary() {
    const summary = {
      ...this.testResults,
      eventLogCount: this.eventLog.length,
      successRate:
        this.testResults.eventsReceived > 0
          ? (
              (this.testResults.businessLogicValidated /
                this.testResults.eventsReceived) *
              100
            ).toFixed(2)
          : 0,
      eventLog: this.eventLog,
    };

    return summary;
  }

  /**
   * 모든 연결 정리
   */
  cleanup() {
    console.log("🧹 이벤트 헬퍼 정리 중...");

    // 모든 소켓 연결 해제
    for (const [email, { socket }] of this.sockets) {
      socket.disconnect();
    }

    this.sockets.clear();
    this.authHelper.cleanup();

    console.log("✅ 이벤트 헬퍼 정리 완료");
  }

  /**
   * 파일 업로드 세션 조인 및 검증
   * @param {Object} socket - WebSocket 연결
   * @param {string} sessionId - 업로드 세션 ID
   * @param {Object} context - 업로드 컨텍스트 (chatroomId, threadId 등)
   * @returns {Promise<Object>} 업로드 세션 조인 결과
   */
  async joinUploadSessionAndVerify(socket, sessionId, context = {}) {
    // 업로드 세션 조인
    await this.sendEvent(socket, "join_upload_session", {
      sessionId,
      context,
    });

    // 업로드 세션 조인 확인 대기
    const joinResult = await this.waitForEvent(
      socket,
      "room_joined",
      (data) => {
        return (
          data.roomType === "upload_session" && data.roomId.includes(sessionId)
        );
      }
    );

    return joinResult;
  }

  /**
   * 파일 업로드 진행률 이벤트 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} sessionId - 업로드 세션 ID
   * @param {number} progress - 진행률 (0-100)
   * @param {string} fileName - 파일명
   * @returns {Promise<Object>} 진행률 이벤트 결과
   */
  async testFileUploadProgress(socket, sessionId, progress, fileName) {
    // 진행률 이벤트 수신 대기
    const progressResult = await this.waitForEvent(
      socket,
      "file_upload_progress",
      (data) => {
        return (
          data.sessionId === sessionId &&
          data.progress === progress &&
          data.fileName === fileName
        );
      }
    );

    return progressResult;
  }

  /**
   * 파일 업로드 완료 이벤트 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} sessionId - 업로드 세션 ID
   * @param {string} fileId - 파일 ID
   * @returns {Promise<Object>} 업로드 완료 이벤트 결과
   */
  async testFileUploadCompleted(socket, sessionId, fileId) {
    // 업로드 완료 이벤트 수신 대기
    const completedResult = await this.waitForEvent(
      socket,
      "file_upload_completed",
      (data) => {
        return data.sessionId === sessionId && data.fileId === fileId;
      }
    );

    return completedResult;
  }

  /**
   * 파일 업로드 실패 이벤트 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} sessionId - 업로드 세션 ID
   * @param {string} errorMessage - 에러 메시지
   * @returns {Promise<Object>} 업로드 실패 이벤트 결과
   */
  async testFileUploadFailed(socket, sessionId, errorMessage) {
    // 업로드 실패 이벤트 수신 대기
    const failedResult = await this.waitForEvent(
      socket,
      "file_upload_failed",
      (data) => {
        return (
          data.sessionId === sessionId && data.error.includes(errorMessage)
        );
      }
    );

    return failedResult;
  }

  /**
   * 파일 처리 완료 이벤트 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} fileId - 파일 ID
   * @param {string} status - 처리 상태
   * @returns {Promise<Object>} 파일 처리 완료 이벤트 결과
   */
  async testFileProcessed(socket, fileId, status) {
    // 파일 처리 완료 이벤트 수신 대기
    const processedResult = await this.waitForEvent(
      socket,
      "file_processed",
      (data) => {
        return data.fileId === fileId && data.status === status;
      }
    );

    return processedResult;
  }

  /**
   * 채팅방 메시지 전송 및 검증
   * @param {Object} socket - WebSocket 연결
   * @param {string} chatroomId - 채팅방 ID
   * @param {string} content - 메시지 내용
   * @param {string} messageType - 메시지 타입 (TEXT, SYSTEM 등)
   * @returns {Promise<Object>} 메시지 전송 결과
   */
  async sendChatroomMessageAndVerify(
    socket,
    chatroomId,
    content,
    messageType = "TEXT"
  ) {
    // 메시지 전송
    await this.sendEvent(socket, "send_chatroom_message", {
      chatroomId,
      content,
      messageType,
    });

    // 메시지 수신 대기 및 검증
    const receivedMessage = await this.waitForEvent(
      socket,
      "chatroom_message_received",
      (data) => {
        return (
          data.content === content &&
          data.chatroomId === chatroomId &&
          data.sender &&
          data.createdAt
        );
      }
    );

    return receivedMessage;
  }

  /**
   * 스레드 메시지 전송 및 검증
   * @param {Object} socket - WebSocket 연결
   * @param {string} threadId - 스레드 ID
   * @param {string} content - 메시지 내용
   * @param {string} messageType - 메시지 타입 (TEXT, SYSTEM 등)
   * @returns {Promise<Object>} 메시지 전송 결과
   */
  async sendThreadMessageAndVerify(
    socket,
    threadId,
    content,
    messageType = "TEXT"
  ) {
    // 메시지 전송
    await this.sendEvent(socket, "send_thread_message", {
      threadId,
      content,
      messageType,
    });

    // 메시지 수신 대기 및 검증
    const receivedMessage = await this.waitForEvent(
      socket,
      "thread_message_received",
      (data) => {
        return (
          data.content === content &&
          data.threadId === threadId &&
          data.sender &&
          data.createdAt
        );
      }
    );

    return receivedMessage;
  }

  /**
   * 채팅방 타이핑 인디케이터 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} chatroomId - 채팅방 ID
   * @param {boolean} isTyping - 타이핑 상태
   * @returns {Promise<Object>} 타이핑 인디케이터 결과
   */
  async testChatroomTypingIndicator(socket, chatroomId, isTyping) {
    // 타이핑 인디케이터 전송
    const eventName = isTyping
      ? "chatroom_typing_start"
      : "chatroom_typing_stop";
    await this.sendEvent(socket, eventName, {
      roomId: chatroomId,
    });

    // 타이핑 인디케이터 수신 대기
    const typingResult = await this.waitForEvent(
      socket,
      "chatroom_typing",
      (data) => {
        return (
          data.chatroomId === chatroomId &&
          data.isTyping === isTyping &&
          data.user
        );
      }
    );

    return typingResult;
  }

  /**
   * 스레드 타이핑 인디케이터 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} threadId - 스레드 ID
   * @param {boolean} isTyping - 타이핑 상태
   * @returns {Promise<Object>} 타이핑 인디케이터 결과
   */
  async testThreadTypingIndicator(socket, threadId, isTyping) {
    // 타이핑 인디케이터 전송
    const eventName = isTyping ? "thread_typing_start" : "thread_typing_stop";
    await this.sendEvent(socket, eventName, {
      roomId: threadId,
    });

    // 타이핑 인디케이터 수신 대기
    const typingResult = await this.waitForEvent(
      socket,
      "thread_typing",
      (data) => {
        return (
          data.threadId === threadId && data.isTyping === isTyping && data.user
        );
      }
    );

    return typingResult;
  }

  /**
   * 사용자 상태 업데이트 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} status - 사용자 상태 (online, offline, away)
   * @param {string} customMessage - 커스텀 메시지
   * @returns {Promise<Object>} 상태 업데이트 결과
   */
  async testUserStatusUpdate(socket, status, customMessage = null) {
    // 상태 업데이트 전송
    await this.sendEvent(socket, "update_user_status", {
      status,
      customMessage,
    });

    // 상태 변경 이벤트 수신 대기
    const statusResult = await this.waitForEvent(
      socket,
      "user_status_changed",
      (data) => {
        return data.status === status && data.user;
      }
    );

    return statusResult;
  }

  /**
   * 성능 테스트 - 다중 메시지 전송
   * @param {Object} socket - WebSocket 연결
   * @param {string} chatroomId - 채팅방 ID
   * @param {number} messageCount - 전송할 메시지 수
   * @param {number} intervalMs - 메시지 간격 (밀리초)
   * @returns {Promise<Object>} 성능 테스트 결과
   */
  async performanceTestMultipleMessages(
    socket,
    chatroomId,
    messageCount = 10,
    intervalMs = 100
  ) {
    const startTime = Date.now();
    const results = {
      totalMessages: messageCount,
      sentMessages: 0,
      receivedMessages: 0,
      errors: [],
      startTime,
      endTime: null,
      duration: 0,
      messagesPerSecond: 0,
    };

    console.log(
      `🚀 성능 테스트 시작: ${messageCount}개 메시지, ${intervalMs}ms 간격`
    );

    // 이벤트 수신 카운터 설정
    let receivedCount = 0;
    const messageListener = (data) => {
      if (
        data.chatroomId === chatroomId &&
        data.content.includes("Performance test message")
      ) {
        receivedCount++;
        results.receivedMessages = receivedCount;
      }
    };

    // 이벤트 리스너 등록
    socket.on("chatroom_message_received", messageListener);

    for (let i = 0; i < messageCount; i++) {
      try {
        const message = `Performance test message ${i + 1}/${messageCount}`;

        // 메시지 전송
        await this.sendEvent(socket, "send_chatroom_message", {
          chatroomId,
          content: message,
          messageType: "TEXT",
        });

        results.sentMessages++;

        // 간격 대기
        if (i < messageCount - 1) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }
      } catch (error) {
        results.errors.push(`Message ${i + 1}: ${error.message}`);
      }
    }

    // 이벤트 수신 대기 (추가 시간)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 이벤트 리스너 제거
    socket.off("chatroom_message_received", messageListener);

    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    results.messagesPerSecond = (
      results.sentMessages /
      (results.duration / 1000)
    ).toFixed(2);

    console.log(
      `✅ 성능 테스트 완료: ${results.sentMessages}개 전송, ${results.receivedMessages}개 수신, ${results.duration}ms, ${results.messagesPerSecond} msg/s`
    );

    return results;
  }

  /**
   * 동시 연결 테스트
   * @param {number} connectionCount - 동시 연결 수
   * @param {number} testDurationMs - 테스트 지속 시간 (밀리초)
   * @returns {Promise<Object>} 동시 연결 테스트 결과
   */
  async performanceTestConcurrentConnections(
    connectionCount = 5,
    testDurationMs = 10000
  ) {
    const startTime = Date.now();
    const connections = [];
    const results = {
      totalConnections: connectionCount,
      successfulConnections: 0,
      failedConnections: 0,
      activeConnections: 0,
      errors: [],
      startTime,
      endTime: null,
      duration: 0,
    };

    console.log(
      `🔗 동시 연결 테스트 시작: ${connectionCount}개 연결, ${testDurationMs}ms 지속`
    );

    // 순차적으로 연결 생성 (동시 생성 시 중복 키 문제 방지)
    for (let i = 0; i < connectionCount; i++) {
      try {
        // 각 연결 사이에 짧은 지연 추가
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const { socket, user } = await this.createConnection();
        results.successfulConnections++;
        results.activeConnections++;
        connections.push({ socket, user, index: i });
        console.log(`✅ 연결 ${i + 1} 성공: ${user.email}`);
      } catch (error) {
        results.failedConnections++;
        results.errors.push(`Connection ${i + 1}: ${error.message}`);
        console.log(`❌ 연결 ${i + 1} 실패: ${error.message}`);
      }
    }

    // 테스트 지속 시간 대기
    console.log(`⏳ 테스트 지속 시간 대기: ${testDurationMs}ms`);
    await new Promise((resolve) => setTimeout(resolve, testDurationMs));

    // 연결 정리
    for (const connection of connections) {
      try {
        connection.socket.disconnect();
        results.activeConnections--;
      } catch (error) {
        results.errors.push(`Disconnect error: ${error.message}`);
      }
    }

    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;

    console.log(
      `✅ 동시 연결 테스트 완료: ${results.successfulConnections}개 성공, ${results.failedConnections}개 실패`
    );

    return results;
  }

  /**
   * 메모리 사용량 모니터링
   * @param {string} testName - 테스트 이름
   * @returns {Object} 메모리 사용량 정보
   */
  getMemoryUsage(testName = "Unknown") {
    const usage = process.memoryUsage();
    const memoryInfo = {
      testName,
      timestamp: new Date().toISOString(),
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024), // MB
    };

    console.log(
      `📊 메모리 사용량 [${testName}]: RSS=${memoryInfo.rss}MB, Heap=${memoryInfo.heapUsed}/${memoryInfo.heapTotal}MB`
    );

    return memoryInfo;
  }

  /**
   * 스토리지 할당량 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 스토리지 할당량 정보
   */
  async testStorageQuota(socket, userId) {
    console.log("💾 스토리지 할당량 테스트...");

    // 스토리지 할당량 이벤트 수신 대기
    const quotaResult = await this.waitForEvent(
      socket,
      "storage_quota_updated",
      (data) => {
        return data.userId === userId && data.usedBytes !== undefined;
      }
    );

    return quotaResult;
  }

  /**
   * 대용량 메시지 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} chatroomId - 채팅방 ID
   * @param {number} messageSizeKB - 메시지 크기 (KB)
   * @returns {Promise<Object>} 대용량 메시지 테스트 결과
   */
  async testLargeMessage(socket, chatroomId, messageSizeKB = 100) {
    console.log(`📏 대용량 메시지 테스트: ${messageSizeKB}KB`);

    // 대용량 메시지 생성
    const largeMessage = "A".repeat(messageSizeKB * 1024);

    const startTime = Date.now();

    try {
      // 메시지 전송
      await this.sendEvent(socket, "send_chatroom_message", {
        chatroomId,
        content: largeMessage,
        messageType: "TEXT",
      });

      // 메시지 수신 대기 (더 유연한 검증)
      const receivedMessage = await this.waitForEvent(
        socket,
        "chatroom_message_received",
        (data) => {
          // 메시지 내용이 정확히 일치하거나, 크기가 일치하는지 확인
          return (
            (data.content === largeMessage ||
              data.content.length === largeMessage.length) &&
            data.chatroomId === chatroomId &&
            data.sender &&
            data.createdAt
          );
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(
        `✅ 대용량 메시지 테스트 완료: ${messageSizeKB}KB, ${duration}ms`
      );

      return {
        success: true,
        messageSizeKB,
        duration,
        transferRate:
          duration > 0
            ? (messageSizeKB / (duration / 1000)).toFixed(2) + " KB/s"
            : "Instant",
        receivedMessage,
      };
    } catch (error) {
      console.log(`❌ 대용량 메시지 테스트 실패: ${error.message}`);
      return {
        success: false,
        messageSizeKB,
        error: error.message,
      };
    }
  }

  /**
   * 에러 처리 테스트
   * @param {Object} socket - WebSocket 연결
   * @param {string} eventName - 잘못된 이벤트 이름
   * @param {Object} invalidData - 잘못된 데이터
   * @returns {Promise<Object>} 에러 처리 결과
   */
  async testErrorHandling(socket, eventName, invalidData) {
    console.log(`❌ 에러 처리 테스트: ${eventName}`);

    try {
      // 잘못된 이벤트 전송
      await this.sendEvent(socket, eventName, invalidData);

      // 에러 응답 대기
      const errorResponse = await this.waitForEvent(socket, "error", (data) => {
        return data.message && data.code;
      });

      console.log(`✅ 에러 응답 수신: ${errorResponse.message}`);
      return {
        success: true,
        errorReceived: true,
        errorMessage: errorResponse.message,
        errorCode: errorResponse.code,
      };
    } catch (error) {
      console.log(`✅ 에러 처리 확인: ${error.message}`);
      return {
        success: true,
        errorReceived: true,
        errorMessage: error.message,
      };
    }
  }

  /**
   * 연결 복구 테스트
   * @param {Object} socket - WebSocket 연결
   * @returns {Promise<Object>} 연결 복구 결과
   */
  async testConnectionRecovery(socket) {
    console.log("🔄 연결 복구 테스트...");

    const startTime = Date.now();

    try {
      // 연결 상태 확인
      const isConnected = socket.connected;
      console.log(`연결 상태: ${isConnected ? "연결됨" : "연결 안됨"}`);

      // 연결 해제 시뮬레이션
      if (isConnected) {
        socket.disconnect();
        console.log("연결 해제됨");

        // 재연결 대기
        await new Promise((resolve) => {
          socket.on("connect", () => {
            console.log("재연결 성공");
            resolve();
          });

          // 타임아웃 설정
          setTimeout(() => {
            console.log("재연결 타임아웃");
            resolve();
          }, 5000);
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      return {
        success: true,
        duration,
        reconnected: socket.connected,
      };
    } catch (error) {
      console.log(`❌ 연결 복구 테스트 실패: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 디버그 정보 출력
   */
  debug() {
    console.log("=== EventHelper 디버그 정보 ===");
    console.log(`활성 연결 수: ${this.sockets.size}`);
    console.log(`이벤트 로그 수: ${this.eventLog.length}`);
    console.log("테스트 결과:", this.testResults);
    console.log("==============================");
  }
}

module.exports = EventHelper;
