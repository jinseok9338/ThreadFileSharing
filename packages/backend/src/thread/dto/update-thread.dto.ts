import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateThreadDto {
  @ApiProperty({
    description: 'Updated thread title',
    example: 'Updated discussion about new features',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title?: string;

  @ApiProperty({
    description: 'Updated thread description',
    example: 'Updated thread description for discussing new features',
    maxLength: 1000,
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Whether the thread is archived',
    example: false,
    required: false,
  })
  @IsBoolean({ message: 'isArchived must be a boolean' })
  @IsOptional()
  isArchived?: boolean;
}
