import { deleteFile } from '../../../lib/s3';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'key is required' });
    }

    // Security: Prevent deletion of files outside allowed paths
    const allowedPrefixes = ['properties/', 'documents/', 'uploads/'];
    const isAllowed = allowedPrefixes.some(prefix => key.startsWith(prefix));

    if (!isAllowed) {
      return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    await deleteFile(key);

    return res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
}
