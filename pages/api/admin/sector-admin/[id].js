// PATCH /api/admin/sector-admin/[id] - Update sector admin
// DELETE /api/admin/sector-admin/[id] - Deactivate sector admin

import crypto from 'crypto';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'REMMIC_SALT_2024').digest('hex');
};

const generatePassword = () => {
  return crypto.randomBytes(4).toString('hex') + '@Rm1';
};

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { action, fullName, email, phone, updatedBy } = req.body;

      // Handle different actions
      if (action === 'toggle_status') {
        console.log('Audit:', { action: 'sector_admin_status_toggled', adminId: id, by: updatedBy, time: new Date().toISOString() });
        return res.status(200).json({ success: true, message: 'Status updated' });
      }

      if (action === 'reset_password') {
        const newPassword = generatePassword();
        const passwordHash = hashPassword(newPassword);
        console.log('Audit:', { action: 'sector_admin_password_reset', adminId: id, by: updatedBy, time: new Date().toISOString() });
        return res.status(200).json({ success: true, newPassword, passwordHash, message: 'Password reset successfully' });
      }

      // Update profile
      console.log('Audit:', { action: 'sector_admin_updated', adminId: id, by: updatedBy, time: new Date().toISOString() });
      return res.status(200).json({ success: true, message: 'Admin updated successfully' });

    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to update admin' });
    }
  }

  if (req.method === 'DELETE') {
    console.log('Audit:', { action: 'sector_admin_deleted', adminId: id, time: new Date().toISOString() });
    return res.status(200).json({ success: true, message: 'Admin deactivated' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
