// Fastify multipart configuration - handled in main.ts
export const multerConfig = {
  dest: '/tmp/uploads',
  limits: {
    fileSize: parseInt(
      process.env.FILE_UPLOAD_MAX_SIZE_BYTES || '107374182400',
      10,
    ), // 100GB default
    files: parseInt(process.env.FILE_UPLOAD_MAX_FILES || '10', 10),
  },
};
