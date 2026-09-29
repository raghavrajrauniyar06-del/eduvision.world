/**
 * StorageService - Abstract Storage Interface for EduVision
 * Allows pluggable storage providers (Google Drive, Shared Drives, S3, etc.)
 */
class StorageService {
  constructor(provider) {
    if (!provider) {
      throw new Error("StorageService requires a concrete StorageProvider instance.");
    }
    this.provider = provider;
  }

  /**
   * Upload an audio call recording using hierarchical pathing
   * @param {Object} params
   * @param {ReadableStream|Buffer} params.fileBuffer - Audio file buffer
   * @param {string} params.fileName - Safe generated filename
   * @param {string} params.mimeType - Audio MIME type
   * @param {string} params.leadId - Primary Lead ID (e.g. LEAD-000123)
   * @param {string} params.studentName - Human readable name for folder
   * @param {string} params.dateStr - Date in YYYY-MM-DD format
   * @param {string} [params.cachedLeadFolderId] - Cached folder ID from database
   * @returns {Promise<{ fileId: string, folderId: string, webViewLink: string, storageProvider: string }>}
   */
  async uploadCallRecording(params) {
    return await this.provider.uploadCallRecording(params);
  }

  /**
   * Stream a file securely by its file ID
   */
  async getFileStream(fileId, headers) {
    return await this.provider.getFileStream(fileId, headers);
  }

  /**
   * Get metadata for a file
   */
  async getFileMetadata(fileId) {
    return await this.provider.getFileMetadata(fileId);
  }

  /**
   * Delete a file if authorized
   */
  async deleteFile(fileId) {
    return await this.provider.deleteFile(fileId);
  }

  /**
   * Get current storage provider identity
   */
  getProviderName() {
    return this.provider.name;
  }
}

module.exports = StorageService;
