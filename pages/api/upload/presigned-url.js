import { getPresignedUploadUrl, generatePropertyImageKey, generateDocumentKey } from '../../../lib/s3';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, contentType, propertyId, type = 'gallery', category = 'property' } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' });
    }

    // Validate content type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ error: 'File type not allowed' });
    }

    // Generate appropriate key based on category
    let key;
    if (category === 'property' && propertyId) {
      key = generatePropertyImageKey(propertyId, filename, type);
    } else if (category === 'document' && propertyId) {
      key = generateDocumentKey(propertyId, filename, type);
    } else {
      // Generic upload path
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const ext = filename.split('.').pop();
      key = `uploads/${timestamp}-${random}.${ext}`;
    }

    const result = await getPresignedUploadUrl(key, contentType);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}
