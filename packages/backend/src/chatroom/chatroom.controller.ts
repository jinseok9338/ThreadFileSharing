import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiSuccessArrayResponse,
  ApiSuccessCursorResponse,
} from '../common/decorators';
import { CursorPaginationQueryDto } from '../common/dto';
import { CursorBasedData } from '../common/dto/api-response.dto';
import { ChatRoomService } from './chatroom.service';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
import { ChatroomResponseDto } from './dto/chatroom-response.dto';
import type { AuthenticatedRequest } from '../common/types/request.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyRoleGuard } from '../auth/guards/company-role.guard';
import { RequireAdmin } from '../auth/decorators/permissions.decorator';

@ApiTags('ChatRooms')
@ApiExtraModels(ChatroomResponseDto)
@Controller('chatrooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  @UseGuards(CompanyRoleGuard)
  @RequireAdmin()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new chatroom' })
  @ApiSuccessResponse(ChatroomResponseDto, {
    status: 201,
    description: 'Chatroom created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async createChatRoom(
    @Body() createChatroomDto: CreateChatroomDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ChatroomResponseDto> {
    const userId = req.user.id;
    const companyId = req.user.companyId;

    return this.chatRoomService.createChatRoom(
      createChatroomDto,
      userId,
      companyId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all chatrooms for the company' })
  @ApiSuccessCursorResponse(ChatroomResponseDto, {
    status: 200,
    description: 'Chatrooms retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getChatRooms(
    @Request() req: AuthenticatedRequest,
    @Query() query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<ChatroomResponseDto>> {
    const companyId = req.user.companyId;
    return this.chatRoomService.getChatRoomsByCompany(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chatroom by ID' })
  @ApiParam({
    name: 'id',
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiSuccessResponse(ChatroomResponseDto, {
    status: 200,
    description: 'Chatroom retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Chatroom not found',
  })
  async getChatRoomById(
    @Param('id') id: string,
  ): Promise<ChatroomResponseDto | null> {
    return this.chatRoomService.getChatRoomById(id);
  }
}
