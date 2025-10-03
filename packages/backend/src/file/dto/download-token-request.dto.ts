import { IsUUID, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DownloadTokenRequestDto {
  @IsUUID()
  fileId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxDownloads?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Parse duration string like "1h", "30m", "1d"
      const match = value.match(/^(\d+)([hmd])$/);
      if (match) {
        const num = parseInt(match[1]);
        const unit = match[2];
        const now = new Date();

        switch (unit) {
          case 'h':
            return new Date(now.getTime() + num * 60 * 60 * 1000);
          case 'm':
            return new Date(now.getTime() + num * 60 * 1000);
          case 'd':
            return new Date(now.getTime() + num * 24 * 60 * 60 * 1000);
        }
      }
    }
    return value;
  })
  expiresIn?: string = '1h';

  @IsOptional()
  @IsString()
  purpose?: string;
}
