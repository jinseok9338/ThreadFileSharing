import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class EditMessageDto {
  @ApiProperty({
    description: 'Updated message content',
    example: 'Hello everyone! (edited)',
    maxLength: 2000,
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(2000, { message: 'Content cannot exceed 2000 characters' })
  content: string;
}
