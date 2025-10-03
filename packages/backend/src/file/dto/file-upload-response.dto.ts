import { FileResponseDto } from './file-response.dto';
import { UploadSessionResponseDto } from './upload-session-response.dto';

export class FileUploadResponseDto {
  file?: FileResponseDto;
  uploadSession?: UploadSessionResponseDto;
  message: string;
  success: boolean;

  static singleFile(
    file: FileResponseDto,
    message = 'File uploaded successfully',
  ): FileUploadResponseDto {
    return {
      file,
      message,
      success: true,
    };
  }

  static multiFileSession(
    uploadSession: UploadSessionResponseDto,
    message = 'Upload session created successfully',
  ): FileUploadResponseDto {
    return {
      uploadSession,
      message,
      success: true,
    };
  }

  static completedSession(
    file: FileResponseDto,
    uploadSession: UploadSessionResponseDto,
    message = 'All files uploaded successfully',
  ): FileUploadResponseDto {
    return {
      file,
      uploadSession,
      message,
      success: true,
    };
  }
}
