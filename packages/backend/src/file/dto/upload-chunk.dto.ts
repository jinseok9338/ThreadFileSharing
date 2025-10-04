import { IsString, IsInt, Min, Max, IsUUID, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class UploadChunkDto {
  @ApiProperty({
    description: "Unique session ID for the upload",
    example: "upload_session_123e4567-e89b-12d3-a456-426614174000",
  })
  @IsString()
  @IsUUID()
  sessionId: string;

  @ApiProperty({
    description: "Zero-based index of this chunk",
    example: 0,
    type: "integer",
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  chunkIndex: number;

  @ApiProperty({
    description: "Size of this chunk in bytes",
    example: 5242880,
    type: "integer",
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(104857600) // 100MB maximum per chunk
  chunkSizeBytes: number;

  @ApiProperty({
    description: "Checksum of this chunk",
    example: "sha256:chunk_abc123...",
  })
  @IsString()
  chunkChecksum: string;

  @ApiProperty({
    description: "Base64 encoded chunk data",
    example: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  })
  @IsString()
  chunkData: string;

  @ApiProperty({
    description: "Whether this is the final chunk",
    example: false,
  })
  isFinalChunk: boolean;
}
