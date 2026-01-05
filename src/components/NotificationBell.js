import React, { useState, useEffect } from 'react';
import { FaBell, FaEnvelope, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
      const unread = response.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="notification-bell">
      <button 
        className="bell-button"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h4>Notifications</h4>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-btn">
                  Mark all as read
                </button>
              )}
              <button 
                onClick={() => setShowNotifications(false)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    <FaEnvelope />
                  </div>
                  <div className="notification-content">
                    <p className="message">{notification.message}</p>
                    <span className="time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {notification.sender && (
                      <span className="sender">From: {notification.sender}</span>
                    )}
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification._id)}
                        className="mark-read-btn"
                      >
                        Mark read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notifications-footer">
            <a href="/notifications" className="view-all">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;