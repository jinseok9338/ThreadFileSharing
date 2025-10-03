import { FileResponseDto } from './file-response.dto';

export class FileListResponseDto {
  files: FileResponseDto[];
  total: number;
  hasNext: boolean;
  nextIndex?: string;

  static fromFiles(
    files: FileResponseDto[],
    total: number,
    hasNext: boolean,
    nextIndex?: string,
  ): FileListResponseDto {
    return {
      files,
      total,
      hasNext,
      nextIndex,
    };
  }
}
