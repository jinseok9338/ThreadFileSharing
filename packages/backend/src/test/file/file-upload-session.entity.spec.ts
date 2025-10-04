import { FileUploadSession } from '../../file/entities/file-upload-session.entity';
import { UploadStatus } from '../../common/enums/upload-status.enum';

describe('FileUploadSession Entity', () => {
  let uploadSession: FileUploadSession;

  beforeEach(() => {
    uploadSession = new FileUploadSession();
    uploadSession.id = 'test-id';
    uploadSession.sessionId = 'test-session-id';
    uploadSession.originalFileName = 'test-file.mp4';
    uploadSession.totalSizeBytes = BigInt(1000000); // 1MB
    uploadSession.uploadedChunks = 0;
    uploadSession.totalChunks = 10;
    uploadSession.uploadedBytes = BigInt(0);
    uploadSession.status = UploadStatus.PENDING;
    uploadSession.chunkMetadata = [];
    uploadSession.metadata = {};
    uploadSession.uploadedById = 'user-id';
    uploadSession.createdAt = new Date();
    uploadSession.updatedAt = new Date();
  });

  describe('progressPercentage', () => {
    it('should return 0 when totalSizeBytes is 0', () => {
      uploadSession.totalSizeBytes = BigInt(0);
      uploadSession.uploadedBytes = BigInt(100);

      expect(uploadSession.progressPercentage).toBe(0);
    });

    it('should return 0 when uploadedBytes is 0', () => {
      uploadSession.uploadedBytes = BigInt(0);

      expect(uploadSession.progressPercentage).toBe(0);
    });

    it('should return 50 when half of file is uploaded', () => {
      uploadSession.uploadedBytes = BigInt(500000); // 50% of 1MB

      expect(uploadSession.progressPercentage).toBe(50);
    });

    it('should return 100 when file is fully uploaded', () => {
      uploadSession.uploadedBytes = BigInt(1000000); // 100% of 1MB

      expect(uploadSession.progressPercentage).toBe(100);
    });

    it('should handle large file sizes correctly', () => {
      uploadSession.totalSizeBytes = BigInt('1073741824'); // 1GB
      uploadSession.uploadedBytes = BigInt('536870912'); // 512MB (50%)

      expect(uploadSession.progressPercentage).toBe(50);
    });

    it('should handle very large file sizes (>4GB)', () => {
      uploadSession.totalSizeBytes = BigInt('10737418240'); // 10GB
      uploadSession.uploadedBytes = BigInt('5368709120'); // 5GB (50%)

      expect(uploadSession.progressPercentage).toBe(50);
    });

    it('should handle partial uploads correctly', () => {
      uploadSession.uploadedBytes = BigInt(250000); // 25% of 1MB

      expect(uploadSession.progressPercentage).toBe(25);
    });

    it('should handle files smaller than chunk size correctly', () => {
      uploadSession.totalSizeBytes = BigInt(50); // 50 bytes file
      uploadSession.uploadedBytes = BigInt(50); // 50 bytes uploaded (smaller than 1KB chunk)

      expect(uploadSession.progressPercentage).toBe(100);
    });

    it('should handle files where uploaded bytes exceed total size', () => {
      uploadSession.totalSizeBytes = BigInt(50); // 50 bytes file
      uploadSession.uploadedBytes = BigInt(1024); // 1KB chunk size (larger than file)

      // Should cap at 100% even if uploaded bytes exceed total size
      expect(uploadSession.progressPercentage).toBe(100);
    });
  });

  describe('remainingBytes', () => {
    it('should return total size when nothing is uploaded', () => {
      expect(uploadSession.remainingBytes).toBe(BigInt(1000000));
    });

    it('should return 0 when fully uploaded', () => {
      uploadSession.uploadedBytes = BigInt(1000000);

      expect(uploadSession.remainingBytes).toBe(BigInt(0));
    });

    it('should return correct remaining bytes for partial upload', () => {
      uploadSession.uploadedBytes = BigInt(300000);

      expect(uploadSession.remainingBytes).toBe(BigInt(700000));
    });

    it('should handle large file sizes correctly', () => {
      uploadSession.totalSizeBytes = BigInt('1073741824'); // 1GB
      uploadSession.uploadedBytes = BigInt('268435456'); // 256MB

      expect(uploadSession.remainingBytes).toBe(BigInt('805306368')); // 768MB
    });
  });

  describe('isCompleted', () => {
    it('should return true when status is COMPLETED', () => {
      uploadSession.status = UploadStatus.COMPLETED;

      expect(uploadSession.isCompleted).toBe(true);
    });

    it('should return false when status is not COMPLETED', () => {
      uploadSession.status = UploadStatus.PENDING;

      expect(uploadSession.isCompleted).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should return true when expiresAt is in the past', () => {
      uploadSession.expiresAt = new Date(Date.now() - 1000); // 1 second ago

      expect(uploadSession.isExpired).toBe(true);
    });

    it('should return false when expiresAt is in the future', () => {
      uploadSession.expiresAt = new Date(Date.now() + 1000); // 1 second from now

      expect(uploadSession.isExpired).toBe(false);
    });

    it('should return false when expiresAt is null', () => {
      uploadSession.expiresAt = null;

      expect(uploadSession.isExpired).toBe(false);
    });
  });

  describe('BigInt serialization', () => {
    it('should serialize BigInt values correctly', () => {
      // Set up BigInt serialization for this test
      const originalToJSON = BigInt.prototype.toJSON;
      (BigInt.prototype as any).toJSON = function () {
        return this.toString();
      };

      try {
        uploadSession.totalSizeBytes = BigInt('1073741824');
        uploadSession.uploadedBytes = BigInt('536870912');

        const serialized = JSON.stringify(uploadSession);

        expect(serialized).toContain('"totalSizeBytes":"1073741824"');
        expect(serialized).toContain('"uploadedBytes":"536870912"');
      } finally {
        // Restore original toJSON
        BigInt.prototype.toJSON = originalToJSON;
      }
    });

    it('should handle BigInt in getter methods during serialization', () => {
      uploadSession.totalSizeBytes = BigInt('1073741824');
      uploadSession.uploadedBytes = BigInt('536870912');

      // This should not throw an error
      const progress = uploadSession.progressPercentage;
      const remaining = uploadSession.remainingBytes;

      expect(progress).toBe(50);
      expect(remaining).toBe(BigInt('536870912'));
    });
  });
});
