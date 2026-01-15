import { useState, useCallback } from 'react';

/**
 * Hook for uploading files to S3 using presigned URLs
 */
export function useS3Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Upload a single file to S3
   * @param {File} file - The file to upload
   * @param {Object} options - Upload options
   * @param {string} options.propertyId - Property ID (for property images)
   * @param {string} options.type - Type of image (main, gallery, thumbnail)
   * @param {string} options.category - Category (property, document)
   */
  const uploadFile = useCallback(async (file, options = {}) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Get presigned URL from API
      const presignedResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          ...options,
        }),
      });

      if (!presignedResponse.ok) {
        const err = await presignedResponse.json();
        throw new Error(err.error || 'Failed to get upload URL');
      }

      const { uploadUrl, fileUrl, key } = await presignedResponse.json();

      // Upload file directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      setProgress(100);
      setUploading(false);

      return { fileUrl, key, filename: file.name };
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  }, []);

  /**
   * Upload multiple files to S3
   * @param {FileList|File[]} files - The files to upload
   * @param {Object} options - Upload options
   */
  const uploadFiles = useCallback(async (files, options = {}) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    const results = [];
    const fileArray = Array.from(files);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const result = await uploadFile(file, options);
        results.push(result);
        setProgress(Math.round(((i + 1) / fileArray.length) * 100));
      }

      setUploading(false);
      return results;
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  }, [uploadFile]);

  /**
   * Delete a file from S3
   * @param {string} key - The S3 object key to delete
   */
  const deleteFile = useCallback(async (key) => {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete file');
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    uploadFile,
    uploadFiles,
    deleteFile,
    uploading,
    progress,
    error,
  };
}

export default useS3Upload;
