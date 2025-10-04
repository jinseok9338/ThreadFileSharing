import { ApiProperty } from "@nestjs/swagger";

export class CommonResponseDto<T> {
  @ApiProperty({
    description: "Indicates if the request was successful",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Operation completed successfully",
  })
  message: string;

  @ApiProperty({
    description: "Response data",
  })
  data: T;

  @ApiProperty({
    description: "Error details (if any)",
    required: false,
  })
  error?: any;

  @ApiProperty({
    description: "Timestamp of the response",
    example: "2023-10-03T10:00:00Z",
  })
  timestamp?: string;
}
