// GET /api/admin/sector-admin - List all sector admins
// POST /api/admin/sector-admin - Create new sector admin

import crypto from 'crypto';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'REMMIC_SALT_2024').digest('hex');
};

const generatePassword = () => {
  return crypto.randomBytes(4).toString('hex') + '@Rm1';
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // List sector admins - In Phase-1, return from localStorage simulation
    return res.status(200).json({
      success: true,
      admins: [], // Client will merge with localStorage data
    });
  }

  if (req.method === 'POST') {
    try {
      const { fullName, email, phone, password, createdBy } = req.body;

      if (!fullName || !email) {
        return res.status(400).json({ success: false, error: 'Name and email are required' });
      }

      const finalPassword = password || generatePassword();
      const passwordHash = hashPassword(finalPassword);

      const newAdmin = {
        id: `SA-${Date.now()}`,
        fullName,
        email,
        phone: phone || '',
        role: 'sector_admin',
        adminRole: 'sector_admin',
        sector: 'REAL_ESTATE',
        isActive: true,
        passwordHash,
        createdAt: new Date().toISOString(),
        createdBy,
      };

      // Audit log
      console.log('Audit:', { action: 'sector_admin_created', admin: email, by: createdBy, time: new Date().toISOString() });

      return res.status(201).json({
        success: true,
        admin: newAdmin,
        generatedPassword: password ? null : finalPassword,
        message: 'Sector Admin created successfully',
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to create admin' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
