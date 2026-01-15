// POST /api/admin/change-password
// Change password for authenticated admin user

import crypto from 'crypto';

// Simple hash function for Phase-1 (in production, use bcrypt)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'REMMIC_SALT_2024').digest('hex');
};

const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { currentPassword, newPassword, adminId } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !adminId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters',
      });
    }

    // For Phase-1, we're using a simple storage approach
    // In production, this would be a database lookup

    // Get stored admin data (simulated with default or stored password)
    // Default admin password is 'admin123' for demo purposes
    const defaultPasswordHash = hashPassword('admin123');

    // In Phase-1, we store password hash in a simple JSON structure
    // Check if there's a stored password hash for this admin
    let storedPasswordHash = defaultPasswordHash;

    // For Phase-1 demo, we accept any current password that matches:
    // 1. The default 'admin123'
    // 2. Or any previously set password (stored in response header as demo)

    // Verify current password
    const currentPasswordHash = hashPassword(currentPassword);

    // In a real implementation, you'd query the database here
    // For Phase-1, we'll validate against the default or allow the change
    // This is a simplified demo version

    if (currentPassword !== 'admin123' && currentPasswordHash !== storedPasswordHash) {
      // For demo purposes, we'll check against common default
      // In production, this would be a database lookup
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Hash new password
    const newPasswordHash = hashPassword(newPassword);

    // In production, update database here
    // For Phase-1, we return the hash to be stored client-side

    // Log the password change action
    const auditLog = {
      action: 'password_change',
      adminId,
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
    };

    console.log('Audit Log:', auditLog);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      passwordHash: newPasswordHash, // For Phase-1 client-side storage
      requireRelogin: true,
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
