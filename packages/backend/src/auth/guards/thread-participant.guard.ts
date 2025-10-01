import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThreadParticipant } from '../../thread-participant/entities/thread-participant.entity';

/**
 * Thread Participant Guard
 * - Ensures user is a participant of the thread
 * - Checks ThreadParticipant table
 * - Enforces thread access control
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, ThreadParticipantGuard)
 *
 * Assumes:
 * - JwtAuthGuard has already attached user to request
 * - Thread ID is available in request.params.threadId
 */
@Injectable()
export class ThreadParticipantGuard implements CanActivate {
  constructor(
    @InjectRepository(ThreadParticipant)
    private threadParticipantRepository: Repository<ThreadParticipant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const threadId = request.params?.threadId || request.body?.threadId;

    if (!threadId) {
      throw new ForbiddenException('Thread ID not provided');
    }

    // Check if user is a participant
    const participant = await this.threadParticipantRepository.findOne({
      where: {
        thread_id: threadId,
        user_id: user.id,
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this thread');
    }

    // Attach participant info to request for later use
    request.threadParticipant = participant;

    return true;
  }
}
