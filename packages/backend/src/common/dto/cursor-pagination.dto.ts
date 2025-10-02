import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

/**
 * Cursor-based pagination query parameters
 */
export class CursorPaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Number of items to return (default: 20, max: 100)',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description:
      'Cursor for pagination - last item identifier from previous response',
    example: '2025-10-01T12:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  lastIndex?: string;
}
