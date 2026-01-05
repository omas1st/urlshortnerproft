import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaTrash, 
  FaEnvelope, 
  FaBan,
  FaCheck,
  FaUserSlash,
  FaUserCheck,
  FaEye,
  FaArrowLeft
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api'; // use your axios instance with interceptors
import './UserManagement.css'

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageModal, setMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [userUrls, setUserUrls] = useState([]);
  const [urlModal, setUrlModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users'); // hits /api/admin/users via api baseURL
      // backend returns { success: true, users, pagination } — handle both shapes
      const data = response.data || {};
      const usersData = data.users || data;
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('fetchUsers error:', error?.response?.data || error.message || error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserUrls = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/urls`);
      const data = response.data || {};
      const urls = data.urls || [];
      // backend returns urls with property "id" — normalize to _id so UI remains unchanged
      const normalized = urls.map(u => ({ ...u, _id: u.id || u._id }));
      setUserUrls(normalized);
      setUrlModal(true);
    } catch (error) {
      console.error('fetchUserUrls error:', error?.response?.data || error.message || error);
      toast.error('Failed to fetch user URLs');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(user => (user._id || user.id) !== userId));
      setFilteredUsers(prev => prev.filter(user => (user._id || user.id) !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('deleteUser error:', error?.response?.data || error.message || error);
      toast.error('Failed to delete user');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // backend supports PUT /api/admin/users/:id to update user fields
      await api.put(`/admin/users/${userId}`, {
        isActive: !currentStatus
      });
      
      setUsers(prev => prev.map(user => 
        (user._id || user.id) === userId ? { ...user, isActive: !currentStatus } : user
      ));
      setFilteredUsers(prev => prev.map(user => 
        (user._id || user.id) === userId ? { ...user, isActive: !currentStatus } : user
      ));
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('toggleUserStatus error:', error?.response?.data || error.message || error);
      toast.error('Failed to update user status');
    }
  };

  const sendMessage = async (userId) => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await api.post(`/admin/users/${userId}/message`, {
        message: messageContent
      });
      
      toast.success('Message sent to user');
      setMessageModal(false);
      setMessageContent('');
      setSelectedUser(null);
    } catch (error) {
      console.error('sendMessage error:', error?.response?.data || error.message || error);
      toast.error('Failed to send message');
    }
  };

  // URL operations: use PUT /admin/urls/:id with appropriate body
  const restrictUrl = async (urlId) => {
    try {
      await api.put(`/admin/urls/${urlId}`, { isRestricted: true });
      setUserUrls(prev => prev.map(url => url._id === urlId ? { ...url, isRestricted: true } : url));
      toast.success('URL restricted');
    } catch (error) {
      console.error('restrictUrl error:', error?.response?.data || error.message || error);
      toast.error('Failed to restrict URL');
    }
  };

  const unrestrictUrl = async (urlId) => {
    try {
      await api.put(`/admin/urls/${urlId}`, { isRestricted: false });
      setUserUrls(prev => prev.map(url => url._id === urlId ? { ...url, isRestricted: false } : url));
      toast.success('URL unrestricted');
    } catch (error) {
      console.error('unrestrictUrl error:', error?.response?.data || error.message || error);
      toast.error('Failed to unrestrict URL');
    }
  };

  const disableUrl = async (urlId) => {
    try {
      await api.put(`/admin/urls/${urlId}`, { isActive: false });
      setUserUrls(prev => prev.map(url => url._id === urlId ? { ...url, isActive: false } : url));
      toast.success('URL disabled');
    } catch (error) {
      console.error('disableUrl error:', error?.response?.data || error.message || error);
      toast.error('Failed to disable URL');
    }
  };

  const enableUrl = async (urlId) => {
    try {
      await api.put(`/admin/urls/${urlId}`, { isActive: true });
      setUserUrls(prev => prev.map(url => url._id === urlId ? { ...url, isActive: true } : url));
      toast.success('URL enabled');
    } catch (error) {
      console.error('enableUrl error:', error?.response?.data || error.message || error);
      toast.error('Failed to enable URL');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management-page">
      <aside className="admin-sidebar">
        {/* Same sidebar as AdminPanel */}
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="container">
            <div className="header-content">
              <div className="back-section">
                <Link to="/admin" className="back-btn">
                  <FaArrowLeft /> Back to Dashboard
                </Link>
              </div>
              
              <h1>User Management</h1>
              
              <div className="search-section">
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search users by email or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container">
          {/* Users Table */}
          <section className="users-table-section">
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>URLs</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id || user.id}>
                      <td className="user-info">
                        <div className="avatar">
                          {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <strong>{user.username}</strong>
                          <small>ID: {(user._id || user.id || '').toString().substring(0, 8)}...</small>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <button 
                          onClick={() => fetchUserUrls(user._id || user.id)}
                          className="view-urls-btn"
                        >
                          <FaEye /> View URLs ({user.urlCount || 0})
                        </button>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setMessageModal(true);
                            }}
                            className="message-btn"
                            title="Send Message"
                          >
                            <FaEnvelope />
                          </button>
                          
                          <button
                            onClick={() => toggleUserStatus(user._id || user.id, user.isActive)}
                            className={`status-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? <FaBan /> : <FaCheck />}
                          </button>
                          
                          <button
                            onClick={() => deleteUser(user._id || user.id)}
                            className="delete-btn"
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <p className="no-users">No users found</p>
              )}
            </div>
            
            <div className="table-footer">
              <p>Total Users: {users.length}</p>
            </div>
          </section>
        </div>
      </main>

      {/* Message Modal */}
      {messageModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Send Message to {selectedUser.username}</h3>
              <button 
                onClick={() => {
                  setMessageModal(false);
                  setSelectedUser(null);
                  setMessageContent('');
                }}
                className="close-btn"
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                rows="6"
              />
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => sendMessage(selectedUser._id || selectedUser.id)}
                className="send-btn"
              >
                <FaEnvelope /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URLs Modal */}
      {urlModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>User URLs</h3>
              <button 
                onClick={() => {
                  setUrlModal(false);
                  setUserUrls([]);
                }}
                className="close-btn"
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              {userUrls.length === 0 ? (
                <p className="no-urls">No URLs found for this user</p>
              ) : (
                <div className="urls-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Short URL</th>
                        <th>Destination</th>
                        <th>Clicks</th>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userUrls.map(url => (
                        <tr key={url._id}>
                          <td>
                            <a 
                              href={`/s/${url.shortId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="short-url"
                            >
                              {`${window.location.origin}/s/${url.shortId}`}
                            </a>
                          </td>
                          <td>{(url.destinationUrl || '').substring(0, 50)}...</td>
                          <td>{url.clicks}</td>
                          <td>
                            {url.createdAt ? new Date(url.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <div className="url-status">
                              <span className={`status-badge ${url.isActive ? 'active' : 'inactive'}`}>
                                {url.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {url.isRestricted && (
                                <span className="status-badge restricted">Restricted</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="url-actions">
                              {url.isRestricted ? (
                                <button
                                  onClick={() => unrestrictUrl(url._id)}
                                  className="unrestrict-btn"
                                  title="Unrestrict URL"
                                >
                                  <FaCheck />
                                </button>
                              ) : (
                                <button
                                  onClick={() => restrictUrl(url._id)}
                                  className="restrict-btn"
                                  title="Restrict URL"
                                >
                                  <FaBan />
                                </button>
                              )}
                              
                              {url.isActive ? (
                                <button
                                  onClick={() => disableUrl(url._id)}
                                  className="disable-btn"
                                  title="Disable URL"
                                >
                                  <FaUserSlash />
                                </button>
                              ) : (
                                <button
                                  onClick={() => enableUrl(url._id)}
                                  className="enable-btn"
                                  title="Enable URL"
                                >
                                  <FaUserCheck />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
