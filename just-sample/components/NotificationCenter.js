import { useState, useEffect, createContext, useContext } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'

// Notification Context
const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Notification Provider
export function NotificationProvider({ children }) {
  const { user } = useFirebase()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    priceAlerts: true,
    investmentUpdates: true,
    marketNews: true,
    systemUpdates: true,
    transactionAlerts: true
  })

  // Load notifications and preferences
  useEffect(() => {
    if (user) {
      loadNotifications()
      loadPreferences()
      // Simulate real-time notifications
      const interval = setInterval(checkForNewNotifications, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  const loadNotifications = () => {
    const stored = localStorage.getItem('userNotifications')
    if (stored) {
      const notifs = JSON.parse(stored)
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
    } else {
      // Generate some sample notifications for demo
      generateSampleNotifications()
    }
  }

  const loadPreferences = () => {
    const stored = localStorage.getItem('notificationPreferences')
    if (stored) {
      setPreferences(JSON.parse(stored))
    }
  }

  const generateSampleNotifications = () => {
    const sampleNotifications = [
      {
        id: `notif-${Date.now()}-1`,
        type: 'price_alert',
        title: 'Price Alert: DHA Phase 5 Shares',
        message: 'Share price increased by 5.2% to PKR 15,760 per share',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        icon: 'ðŸ“ˆ',
        action: {
          type: 'navigate',
          url: '/investment-shares?property=dha-phase-5'
        }
      },
      {
        id: `notif-${Date.now()}-2`,
        type: 'investment_update',
        title: 'Investment Update: Emaar Heights',
        message: 'Construction milestone achieved. Expected ROI updated to 18.5%',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium',
        icon: 'ðŸ—ï¸',
        action: {
          type: 'navigate',
          url: '/portfolio'
        }
      },
      {
        id: `notif-${Date.now()}-3`,
        type: 'transaction',
        title: 'Investment Successful',
        message: 'Your investment of PKR 50,000 in Gulberg Residencia has been confirmed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'high',
        icon: 'âœ…',
        action: {
          type: 'navigate',
          url: '/portfolio'
        }
      },
      {
        id: `notif-${Date.now()}-4`,
        type: 'market_news',
        title: 'Market Update',
        message: 'Real estate market shows 12% growth in Q4. Great time to invest!',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        icon: 'ðŸ“°',
        action: {
          type: 'navigate',
          url: '/market-insights'
        }
      },
      {
        id: `notif-${Date.now()}-5`,
        type: 'system',
        title: 'KYC Verification Required',
        message: 'Complete your KYC verification to unlock full investment features',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        icon: 'ðŸ”’',
        action: {
          type: 'navigate',
          url: '/kyc-verification'
        }
      }
    ]

    setNotifications(sampleNotifications)
    setUnreadCount(sampleNotifications.filter(n => !n.read).length)
    localStorage.setItem('userNotifications', JSON.stringify(sampleNotifications))
  }

  const checkForNewNotifications = () => {
    // Simulate receiving new notifications
    const shouldAddNotification = Math.random() < 0.3 // 30% chance

    if (shouldAddNotification) {
      const notificationTypes = [
        {
          type: 'price_alert',
          title: 'Price Alert',
          getMessage: () => `Share price changed by ${(Math.random() * 10 - 5).toFixed(1)}%`,
          icon: 'ðŸ“Š',
          priority: 'medium'
        },
        {
          type: 'market_news',
          title: 'Market Update',
          getMessage: () => 'New property listing available for investment',
          icon: 'ðŸ ',
          priority: 'low'
        },
        {
          type: 'investment_update',
          title: 'Investment Update',
          getMessage: () => 'Monthly rental income has been credited to your account',
          icon: 'ðŸ’°',
          priority: 'medium'
        }
      ]

      const randomNotif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      addNotification({
        type: randomNotif.type,
        title: randomNotif.title,
        message: randomNotif.getMessage(),
        priority: randomNotif.priority,
        icon: randomNotif.icon
      })
    }
  }

  const addNotification = (notification) => {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      localStorage.setItem('userNotifications', JSON.stringify(updated))
      return updated
    })

    setUnreadCount(prev => prev + 1)

    // Show browser notification if permission granted
    if (preferences.push && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
      localStorage.setItem('userNotifications', JSON.stringify(updated))
      return updated
    })

    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      localStorage.setItem('userNotifications', JSON.stringify(updated))
      return updated
    })
    setUnreadCount(0)
  }

  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId)
      const updated = prev.filter(n => n.id !== notificationId)
      localStorage.setItem('userNotifications', JSON.stringify(updated))
      
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1))
      }
      
      return updated
    })
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
    localStorage.setItem('userNotifications', JSON.stringify([]))
  }

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences)
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences))
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  const contextValue = {
    notifications,
    unreadCount,
    preferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    requestNotificationPermission
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

// Notification Bell Component
export function NotificationBell({ size = 'default' }) {
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const bellStyles = {
    default: {
      button: {
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '8px',
        transition: 'all 0.3s ease'
      },
      icon: {
        fontSize: '20px',
        color: '#6b7280'
      }
    },
    large: {
      button: {
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '12px',
        borderRadius: '12px',
        transition: 'all 0.3s ease'
      },
      icon: {
        fontSize: '24px',
        color: '#6b7280'
      }
    }
  }

  const currentStyle = bellStyles[size] || bellStyles.default

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={currentStyle.button}
        onMouseOver={(e) => {
          e.target.style.background = '#f3f4f6'
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'none'
        }}
      >
        <span style={currentStyle.icon}>ðŸ””</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#ff5e01',
            color: '#fff',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '18px'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  )
}

// Notification Dropdown Component
function NotificationDropdown({ onClose }) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  const recentNotifications = notifications.slice(0, 5)

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />

      {/* Dropdown */}
      <div style={{
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '8px',
        width: '380px',
        maxHeight: '500px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        zIndex: 1000,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            Notifications
          </h3>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff5e01',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {recentNotifications.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>ðŸ””</div>
              <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
            </div>
          ) : (
            recentNotifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f9fafb',
                  background: notification.read ? '#fff' : '#fef3e7',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id)
                  }
                  if (notification.action) {
                    // Handle navigation
                    window.location.href = notification.action.url
                  }
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ fontSize: '20px', flexShrink: 0 }}>
                    {notification.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {notification.title}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      lineHeight: '1.4',
                      marginBottom: '6px'
                    }}>
                      {notification.message}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af'
                    }}>
                      {formatNotificationTime(notification.timestamp)}
                    </div>
                  </div>
                  {!notification.read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#ff5e01',
                      flexShrink: 0,
                      marginTop: '6px'
                    }} />
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f3f4f6'
                    e.target.style.color = '#ef4444'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'none'
                    e.target.style.color = '#9ca3af'
                  }}
                >
                  âœ•
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 5 && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #f3f4f6',
            textAlign: 'center'
          }}>
            <a
              href="/notifications"
              style={{
                color: '#ff5e01',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              View all notifications
            </a>
          </div>
        )}
      </div>
    </>
  )
}

// Notification Settings Component
export default function NotificationSettings() {
  const { preferences, updatePreferences, requestNotificationPermission } = useNotifications()
  const [pushPermission, setPushPermission] = useState('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission)
    }
  }, [])

  const handlePreferenceChange = (key, value) => {
    updatePreferences({
      ...preferences,
      [key]: value
    })
  }

  const enablePushNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setPushPermission('granted')
      handlePreferenceChange('push', true)
    }
  }

  const settingSections = [
    {
      title: 'Delivery Methods',
      settings: [
        {
          key: 'email',
          label: 'Email Notifications',
          description: 'Receive notifications via email',
          type: 'toggle'
        },
        {
          key: 'push',
          label: 'Push Notifications',
          description: 'Receive real-time browser notifications',
          type: 'toggle',
          disabled: pushPermission !== 'granted'
        },
        {
          key: 'sms',
          label: 'SMS Notifications',
          description: 'Receive important alerts via SMS',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Notification Types',
      settings: [
        {
          key: 'priceAlerts',
          label: 'Price Alerts',
          description: 'Share price changes and market movements',
          type: 'toggle'
        },
        {
          key: 'investmentUpdates',
          label: 'Investment Updates',
          description: 'Updates on your property investments',
          type: 'toggle'
        },
        {
          key: 'transactionAlerts',
          label: 'Transaction Alerts',
          description: 'Investment confirmations and payments',
          type: 'toggle'
        },
        {
          key: 'marketNews',
          label: 'Market News',
          description: 'Real estate market insights and trends',
          type: 'toggle'
        },
        {
          key: 'systemUpdates',
          label: 'System Updates',
          description: 'Platform updates and maintenance notices',
          type: 'toggle'
        }
      ]
    }
  ]

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f1f5f9'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937'
        }}>
          Notification Settings
        </h2>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px'
        }}>
          Manage how you receive notifications and updates
        </p>
      </div>

      {/* Push Notification Setup */}
      {pushPermission !== 'granted' && (
        <div style={{
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>ðŸ””</span>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#c2410c' }}>
                Enable Push Notifications
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#c2410c' }}>
                Get instant alerts for price changes and important updates
              </p>
              <button
                onClick={enablePushNotifications}
                style={{
                  background: '#ff5e01',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <div key={sectionIndex} style={{ marginBottom: '40px' }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {section.title}
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            {section.settings.map((setting) => (
              <div
                key={setting.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '16px',
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  background: setting.disabled ? '#f9fafb' : '#fff'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: setting.disabled ? '#9ca3af' : '#374151',
                    marginBottom: '4px'
                  }}>
                    {setting.label}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: setting.disabled ? '#9ca3af' : '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    {setting.description}
                  </div>
                </div>

                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  marginLeft: '16px'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences[setting.key] || false}
                    onChange={(e) => handlePreferenceChange(setting.key, e.target.checked)}
                    disabled={setting.disabled}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: setting.disabled ? 'not-allowed' : 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: preferences[setting.key] && !setting.disabled ? '#ff5e01' : '#e5e7eb',
                    borderRadius: '24px',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: preferences[setting.key] && !setting.disabled ? '23px' : '3px',
                      bottom: '3px',
                      backgroundColor: '#fff',
                      borderRadius: '50%',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '20px',
        borderTop: '1px solid #f1f5f9'
      }}>
        <button
          style={{
            background: '#ff5e01',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#e54e00'}
          onMouseOut={(e) => e.target.style.background = '#ff5e01'}
        >
          Save Preferences
        </button>
      </div>
    </div>
  )
}

// Helper function to format notification timestamps
function formatNotificationTime(timestamp) {
  const now = new Date()
  const notifTime = new Date(timestamp)
  const diffMs = now - notifTime
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return notifTime.toLocaleDateString()
}
