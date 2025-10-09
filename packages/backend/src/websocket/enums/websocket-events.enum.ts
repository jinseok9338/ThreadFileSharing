/**
 * Client to Server WebSocket Events
 * 클라이언트가 서버로 보내는 이벤트들
 */
export enum ClientToServerEvent {
  // Room Management
  JOIN_COMPANY = 'join_company',
  JOIN_CHATROOM = 'join_chatroom',
  JOIN_THREAD = 'join_thread',
  JOIN_UPLOAD_SESSION = 'join_upload_session',
  LEAVE_COMPANY = 'leave_company',
  LEAVE_CHATROOM = 'leave_chatroom',
  LEAVE_THREAD = 'leave_thread',
  LEAVE_UPLOAD_SESSION = 'leave_upload_session',

  // Messaging
  SEND_CHATROOM_MESSAGE = 'send_chatroom_message',
  SEND_THREAD_MESSAGE = 'send_thread_message',

  // Typing Indicators
  CHATROOM_TYPING_START = 'chatroom_typing_start',
  CHATROOM_TYPING_STOP = 'chatroom_typing_stop',
  THREAD_TYPING_START = 'thread_typing_start',
  THREAD_TYPING_STOP = 'thread_typing_stop',

  // User Status
  UPDATE_USER_STATUS = 'update_user_status',

  // Realtime Data Sync
  SYNC_CHATROOM_REALTIME_DATA = 'sync_chatroom_realtime_data',
  MARK_MESSAGES_READ = 'mark_messages_read',
}

/**
 * Server to Client WebSocket Events
 * 서버가 클라이언트로 보내는 이벤트들
 */
export enum ServerToClientEvent {
  // Connection
  CONNECTION_ESTABLISHED = 'connection_established',
  ERROR = 'error',

  // Room Join/Leave Events
  USER_JOINED_COMPANY = 'user_joined_company',
  USER_JOINED_CHATROOM = 'user_joined_chatroom',
  USER_JOINED_THREAD = 'user_joined_thread',
  ROOM_JOINED = 'room_joined',
  USER_LEFT_ROOM = 'user_left_room',

  // Message Events
  CHATROOM_MESSAGE_RECEIVED = 'chatroom_message_received',
  THREAD_MESSAGE_RECEIVED = 'thread_message_received',

  // Typing Events
  CHATROOM_TYPING = 'chatroom_typing',
  THREAD_TYPING = 'thread_typing',

  // User Status Events
  USER_STATUS_CHANGED = 'user_status_changed',

  // File Upload Events
  FILE_UPLOAD_PROGRESS = 'file_upload_progress',
  FILE_UPLOAD_COMPLETED = 'file_upload_completed',
  FILE_UPLOAD_FAILED = 'file_upload_failed',
  FILE_PROCESSED = 'file_processed',

  // Realtime Data Events
  CHATROOM_REALTIME_UPDATED = 'chatroom_realtime_updated',
  CHATROOM_REALTIME_DATA_SYNCED = 'chatroom_realtime_data_synced',
  MESSAGES_READ = 'messages_read',
  MESSAGES_READ_CONFIRMED = 'messages_read_confirmed',

  // Notification Events
  COMPANY_NOTIFICATION = 'company_notification',
}
