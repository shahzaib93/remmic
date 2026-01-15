import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin, withAdminAuth, AdminRoles } from '../../contexts/AdminContext';
import { useFirebase } from '../../contexts/FirebaseContext';

function AdminSettings() {
  const router = useRouter();
  const { adminUser, addNotification, logAction } = useAdmin();
  const { user, updateProfile, logout } = useFirebase();

  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  // Platform settings
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'REMMIC',
    supportEmail: 'support@remmic.com',
    currency: 'LKR',
    timezone: 'Asia/Colombo',
    maintenanceMode: false,
  });

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNewEvaluation: true,
    emailNewListing: true,
    emailAuctionEnd: true,
    emailMaintenanceRequest: true,
    pushNotifications: true,
    dailyDigest: false,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    ipWhitelist: '',
  });

  useEffect(() => {
    if (adminUser) {
      setProfileForm({
        fullName: adminUser.name || adminUser.fullName || '',
        email: adminUser.email || '',
        phone: adminUser.phone || '',
      });
    }

    const storedPlatform = localStorage.getItem('remmic_platform_settings');
    const storedNotifications = localStorage.getItem('remmic_notification_prefs');
    const storedSecurity = localStorage.getItem('remmic_security_settings');

    if (storedPlatform) setPlatformSettings(JSON.parse(storedPlatform));
    if (storedNotifications) setNotificationPrefs(JSON.parse(storedNotifications));
    if (storedSecurity) setSecuritySettings(JSON.parse(storedSecurity));
  }, [adminUser]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = { ...adminUser, ...profileForm, name: profileForm.fullName };
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      if (updateProfile) {
        await updateProfile({ fullName: profileForm.fullName, email: profileForm.email, phone: profileForm.phone });
      }
      logAction('settings', 'profile_update', adminUser.uid, 'Profile updated');
      addNotification('success', 'Profile updated successfully');
    } catch (error) {
      addNotification('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePlatformSave = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('remmic_platform_settings', JSON.stringify(platformSettings));
      logAction('settings', 'platform_update', 'system', 'Platform settings updated');
      addNotification('success', 'Platform settings saved');
    } catch (error) {
      addNotification('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('remmic_notification_prefs', JSON.stringify(notificationPrefs));
      logAction('settings', 'notification_update', adminUser.uid, 'Notification preferences updated');
      addNotification('success', 'Notification preferences saved');
    } catch (error) {
      addNotification('error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('remmic_security_settings', JSON.stringify(securitySettings));
      logAction('settings', 'security_update', adminUser.uid, 'Security settings updated');
      addNotification('success', 'Security settings saved');
    } catch (error) {
      addNotification('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validation
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          adminId: adminUser.uid || adminUser.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || 'Failed to change password');
        return;
      }

      // Store new password hash
      const updatedUser = { ...adminUser, passwordHash: data.passwordHash };
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));

      logAction('settings', 'password_change', adminUser.uid, 'Password changed');
      addNotification('success', 'Password changed successfully. Please re-login.');

      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Force re-login
      if (data.requireRelogin) {
        setTimeout(() => {
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('adminUser');
          if (logout) logout();
          router.push('/admin-dashboard/login');
        }, 2000);
      }
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    logAction('settings', 'logout_all', adminUser.uid, 'Logged out from all sessions');
    addNotification('success', 'Logged out from all sessions');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    if (logout) await logout();
    router.push('/admin-dashboard/login');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
    { id: 'platform', label: 'Platform', superOnly: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
    { id: 'notifications', label: 'Notifications', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> },
    { id: 'security', label: 'Security', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> },
  ];

  const visibleTabs = tabs.filter(tab => !tab.superOnly || adminUser?.adminRole === AdminRoles.SUPER_ADMIN);

  return (
    <AdminLayout title="Settings">
      <div className="settings-page">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Manage your account and platform settings</p>
        </div>

        <div className="settings-layout">
          <div className="settings-sidebar">
            {visibleTabs.map(tab => (
              <button key={tab.id} className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="settings-content">
            {activeTab === 'profile' && (
              <div className="settings-panel">
                <div className="panel-header">
                  <h2>Profile Settings</h2>
                  <p>Update your personal information</p>
                </div>
                <form onSubmit={handleProfileSave}>
                  <div className="form-section">
                    <div className="avatar-section">
                      <div className="avatar-large">{profileForm.fullName?.charAt(0)?.toUpperCase() || 'A'}</div>
                      <div className="avatar-info">
                        <h3>{profileForm.fullName || 'Admin User'}</h3>
                        <span className="role-badge">{adminUser?.adminRole === AdminRoles.SUPER_ADMIN ? 'Super Admin' : 'Sector Admin'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} placeholder="Enter your full name" />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="Enter your email" />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+94 XX XXX XXXX" />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'platform' && adminUser?.adminRole === AdminRoles.SUPER_ADMIN && (
              <div className="settings-panel">
                <div className="panel-header">
                  <h2>Platform Settings</h2>
                  <p>Configure global platform settings</p>
                </div>
                <form onSubmit={handlePlatformSave}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Site Name</label>
                      <input type="text" value={platformSettings.siteName} onChange={(e) => setPlatformSettings({ ...platformSettings, siteName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Support Email</label>
                      <input type="email" value={platformSettings.supportEmail} onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Default Currency</label>
                      <select value={platformSettings.currency} onChange={(e) => setPlatformSettings({ ...platformSettings, currency: e.target.value })}>
                        <option value="LKR">LKR - Sri Lankan Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Timezone</label>
                      <select value={platformSettings.timezone} onChange={(e) => setPlatformSettings({ ...platformSettings, timezone: e.target.value })}>
                        <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>
                  </div>
                  <div className="toggle-section">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <h4>Maintenance Mode</h4>
                        <p>Temporarily disable public access</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={platformSettings.maintenanceMode} onChange={(e) => setPlatformSettings({ ...platformSettings, maintenanceMode: e.target.checked })} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-panel">
                <div className="panel-header">
                  <h2>Notification Preferences</h2>
                  <p>Choose how you want to be notified</p>
                </div>
                <form onSubmit={handleNotificationSave}>
                  <div className="toggle-section">
                    <h3 className="section-title">Email Notifications</h3>
                    {[
                      { key: 'emailNewEvaluation', title: 'New Evaluations', desc: 'Get notified when a new property evaluation is submitted' },
                      { key: 'emailNewListing', title: 'New Listings', desc: 'Get notified when a new property listing is created' },
                      { key: 'emailAuctionEnd', title: 'Auction End', desc: 'Get notified when an auction ends' },
                      { key: 'emailMaintenanceRequest', title: 'Maintenance Requests', desc: 'Get notified when a maintenance request is submitted' },
                    ].map(item => (
                      <div key={item.key} className="toggle-item">
                        <div className="toggle-info">
                          <h4>{item.title}</h4>
                          <p>{item.desc}</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={notificationPrefs[item.key]} onChange={(e) => setNotificationPrefs({ ...notificationPrefs, [item.key]: e.target.checked })} />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-panel">
                <div className="panel-header">
                  <h2>Security Settings</h2>
                  <p>Manage your account security</p>
                </div>
                <form onSubmit={handleSecuritySave}>
                  <div className="toggle-section">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <h4>Two-Factor Authentication</h4>
                        <p>Add an extra layer of security</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={securitySettings.twoFactorEnabled} onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Session Timeout</label>
                      <select value={securitySettings.sessionTimeout} onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                  </div>
                  <div className="danger-zone">
                    <h3>Account Actions</h3>
                    <div className="danger-item">
                      <div className="danger-info">
                        <h4>Change Password</h4>
                        <p>Update your account password</p>
                      </div>
                      <button type="button" className="btn-outline" onClick={() => setShowPasswordModal(true)}>Change Password</button>
                    </div>
                    <div className="danger-item">
                      <div className="danger-info">
                        <h4>Logout All Sessions</h4>
                        <p>Sign out from all devices</p>
                      </div>
                      <button type="button" className="btn-danger" onClick={handleLogoutAll}>Logout All</button>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Change Password</h3>
                <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <form onSubmit={handleChangePassword}>
                {passwordError && <div className="error-message">{passwordError}</div>}
                <div className="form-group">
                  <label>Current Password *</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="Enter current password" required />
                </div>
                <div className="form-group">
                  <label>New Password *</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Minimum 8 characters" required minLength={8} />
                </div>
                <div className="form-group">
                  <label>Confirm New Password *</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Re-enter new password" required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={changingPassword}>{changingPassword ? 'Changing...' : 'Change Password'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style jsx>{`
          .settings-page { padding: 0; }
          .page-header { margin-bottom: 24px; }
          .page-header h1 { font-family: var(--font-playfair), 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #ffffff; margin: 0 0 4px 0; }
          .page-header p { color: #9ca3af; font-size: 14px; margin: 0; }
          .settings-layout { display: grid; grid-template-columns: 240px 1fr; gap: 24px; }
          .settings-sidebar { background: #111111; border: 1px solid #222222; border-radius: 12px; padding: 12px; height: fit-content; position: sticky; top: 100px; }
          .sidebar-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 14px; background: transparent; border: none; border-radius: 8px; color: #9ca3af; font-size: 14px; cursor: pointer; transition: all 0.2s ease; }
          .sidebar-item:hover { background: rgba(201, 162, 39, 0.08); color: #c9a227; }
          .sidebar-item.active { background: rgba(201, 162, 39, 0.15); color: #c9a227; }
          .settings-content { min-height: 500px; }
          .settings-panel { background: #111111; border: 1px solid #222222; border-radius: 12px; padding: 24px; }
          .panel-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #222222; }
          .panel-header h2 { font-family: var(--font-playfair), 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 4px 0; }
          .panel-header p { color: #6b7280; font-size: 14px; margin: 0; }
          .avatar-section { display: flex; align-items: center; gap: 20px; padding: 20px; background: #0a0a0a; border-radius: 12px; margin-bottom: 24px; }
          .avatar-large { width: 72px; height: 72px; background: linear-gradient(135deg, #c9a227 0%, #e0b82e 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: #0a0a0a; }
          .avatar-info h3 { font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 8px 0; }
          .role-badge { display: inline-block; padding: 4px 12px; background: rgba(201, 162, 39, 0.15); border: 1px solid rgba(201, 162, 39, 0.3); border-radius: 20px; color: #c9a227; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px; }
          .form-group { display: flex; flex-direction: column; gap: 8px; }
          .form-group label { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
          .form-group input, .form-group select { padding: 12px 14px; background: #0a0a0a; border: 1px solid #333333; border-radius: 8px; color: #ffffff; font-size: 14px; transition: border-color 0.2s ease; }
          .form-group input:focus, .form-group select:focus { outline: none; border-color: #c9a227; }
          .toggle-section { margin-bottom: 24px; }
          .section-title { font-size: 14px; font-weight: 600; color: #c9a227; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #0a0a0a; border-radius: 8px; margin-bottom: 12px; }
          .toggle-info h4 { font-size: 14px; font-weight: 600; color: #ffffff; margin: 0 0 4px 0; }
          .toggle-info p { font-size: 13px; color: #6b7280; margin: 0; }
          .toggle-switch { position: relative; width: 48px; height: 26px; }
          .toggle-switch input { opacity: 0; width: 0; height: 0; }
          .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #333333; border-radius: 26px; transition: 0.3s; }
          .toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: #ffffff; border-radius: 50%; transition: 0.3s; }
          .toggle-switch input:checked + .toggle-slider { background: #c9a227; }
          .toggle-switch input:checked + .toggle-slider:before { transform: translateX(22px); }
          .danger-zone { margin-top: 32px; padding-top: 24px; border-top: 1px solid #222222; }
          .danger-zone h3 { font-size: 14px; font-weight: 600; color: #c9a227; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .danger-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #0a0a0a; border: 1px solid #222222; border-radius: 8px; margin-bottom: 12px; }
          .danger-info h4 { font-size: 14px; font-weight: 600; color: #ffffff; margin: 0 0 4px 0; }
          .danger-info p { font-size: 13px; color: #6b7280; margin: 0; }
          .form-actions { display: flex; justify-content: flex-end; padding-top: 24px; border-top: 1px solid #222222; }
          .btn-primary { padding: 12px 24px; background: linear-gradient(135deg, #c9a227 0%, #e0b82e 100%); border: none; border-radius: 8px; color: #0a0a0a; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
          .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(201, 162, 39, 0.4); }
          .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
          .btn-outline { padding: 8px 16px; background: transparent; border: 1px solid #c9a227; border-radius: 6px; color: #c9a227; font-size: 13px; cursor: pointer; transition: all 0.2s ease; }
          .btn-outline:hover { background: rgba(201, 162, 39, 0.1); }
          .btn-danger { padding: 8px 16px; background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 6px; color: #ef4444; font-size: 13px; cursor: pointer; }
          .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }
          .btn-cancel { padding: 12px 24px; background: transparent; border: 1px solid #333333; border-radius: 8px; color: #9ca3af; font-size: 14px; cursor: pointer; }
          .btn-cancel:hover { background: #1a1a1a; color: #ffffff; }
          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .modal-content { background: #111111; border: 1px solid #222222; border-radius: 12px; padding: 24px; width: 100%; max-width: 440px; }
          .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .modal-header h3 { font-family: var(--font-playfair), 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: #ffffff; margin: 0; }
          .modal-close { background: none; border: none; color: #6b7280; cursor: pointer; padding: 4px; }
          .modal-close:hover { color: #ffffff; }
          .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
          .modal-actions .btn-primary, .modal-actions .btn-cancel { flex: 1; }
          .error-message { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px; color: #ef4444; font-size: 13px; margin-bottom: 16px; }
          @media (max-width: 1024px) { .settings-layout { grid-template-columns: 1fr; } .settings-sidebar { position: static; display: flex; flex-wrap: wrap; gap: 8px; } .sidebar-item { width: auto; } }
          @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .avatar-section { flex-direction: column; text-align: center; } .toggle-item, .danger-item { flex-direction: column; gap: 12px; align-items: flex-start; } }
        `}</style>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(AdminSettings, 'settings');
