import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET || 'remmic-assets';
const S3_URL = process.env.NEXT_PUBLIC_S3_URL || `https://${BUCKET_NAME}.s3.eu-north-1.amazonaws.com`;

/**
 * Generate a presigned URL for uploading files directly from client
 * @param {string} key - The S3 object key (path/filename)
 * @param {string} contentType - MIME type of the file
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getPresignedUploadUrl(key, contentType, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return {
    uploadUrl: signedUrl,
    fileUrl: `${S3_URL}/${key}`,
    key,
  };
}

/**
 * Upload a file directly from server
 * @param {Buffer|Uint8Array|string} body - File content
 * @param {string} key - The S3 object key (path/filename)
 * @param {string} contentType - MIME type of the file
 */
export async function uploadFile(body, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return {
    fileUrl: `${S3_URL}/${key}`,
    key,
  };
}

/**
 * Delete a file from S3
 * @param {string} key - The S3 object key to delete
 */
export async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  return { success: true, key };
}

/**
 * Get a presigned URL for downloading/viewing private files
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getPresignedDownloadUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * List files in a specific folder/prefix
 * @param {string} prefix - The folder prefix to list
 * @param {number} maxKeys - Maximum number of keys to return
 */
export async function listFiles(prefix, maxKeys = 100) {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const response = await s3Client.send(command);
  return response.Contents?.map((item) => ({
    key: item.Key,
    url: `${S3_URL}/${item.Key}`,
    size: item.Size,
    lastModified: item.LastModified,
  })) || [];
}

/**
 * Generate unique filename for property images
 * @param {string} propertyId - Property ID
 * @param {string} originalFilename - Original filename
 * @param {string} type - Type of image (main, gallery, thumbnail)
 */
export function generatePropertyImageKey(propertyId, originalFilename, type = 'gallery') {
  const ext = originalFilename.split('.').pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `properties/${propertyId}/${type}/${timestamp}-${random}.${ext}`;
}

/**
 * Generate unique filename for documents
 * @param {string} propertyId - Property ID
 * @param {string} originalFilename - Original filename
 * @param {string} docType - Type of document (contract, report, etc)
 */
export function generateDocumentKey(propertyId, originalFilename, docType = 'general') {
  const ext = originalFilename.split('.').pop();
  const timestamp = Date.now();
  return `documents/${propertyId}/${docType}/${timestamp}-${originalFilename}`;
}

/**
 * Get public URL for a file (for publicly accessible files)
 * @param {string} key - The S3 object key
 */
export function getPublicUrl(key) {
  return `${S3_URL}/${key}`;
}

export { s3Client, BUCKET_NAME, S3_URL };
