import { IsString, IsOptional, IsInt, Min, Max, IsUUID, IsEnum } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class InitiateUploadDto {
  @ApiProperty({
    description: "Original filename of the file to upload",
    example: "large-video.mp4",
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: "Total file size in bytes",
    example: 10737418240,
    type: "integer",
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(107374182400) // 100GB limit
  totalSizeBytes: number;

  @ApiProperty({
    description: "MIME type of the file",
    example: "video/mp4",
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: "Size of each chunk in bytes",
    example: 5242880,
    type: "integer",
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1048576) // 1MB minimum
  @Max(104857600) // 100MB maximum
  chunkSizeBytes: number;

  @ApiProperty({
    description: "Checksum of the entire file",
    example: "sha256:abc123...",
  })
  @IsString()
  checksum: string;

  @ApiPropertyOptional({
    description: "ID of the chatroom where the file will be shared",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  chatroomId?: string;

  @ApiPropertyOptional({
    description: "ID of the thread where the file will be shared",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsOptional()
  @IsUUID()
  threadId?: string;

  @ApiPropertyOptional({
    description: "Additional metadata for the file",
    example: { description: "Project presentation video" },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
