/**
 * ChatRoom Entity Types
 */

export interface ChatRoom {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateChatRoomDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
  avatarUrl?: string;
}

export interface UpdateChatRoomDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

export interface ChatRoomResponseDto {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  isPrivate: boolean;
  createdBy: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoomListResponseDto {
  chatrooms: ChatRoomResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AddMemberDto {
  userId: string;
}

export interface RemoveMemberDto {
  userId: string;
}

export interface ChatRoomMemberDto {
  id: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface ChatRoomMembersResponseDto {
  members: ChatRoomMemberDto[];
  total: number;
}


