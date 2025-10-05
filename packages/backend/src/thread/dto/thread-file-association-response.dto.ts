import { ApiProperty } from '@nestjs/swagger';

export class ThreadFileAssociationResponseDto {
  @ApiProperty({
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  threadId: string;

  @ApiProperty({
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  fileId: string;

  @ApiProperty({
    description: 'User ID who associated the file',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  associatedBy: string;

  @ApiProperty({
    description: 'Date when file was associated with thread',
    example: '2025-01-05T12:00:00.000Z',
  })
  associatedAt: Date;
}
