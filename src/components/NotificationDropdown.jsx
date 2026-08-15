import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Trash2,
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  CheckCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api/notificationsApi';
import './NotificationDropdown.css';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef(null);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80';
    if (avatarPath.startsWith('http')) return avatarPath;
    const serverOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    return `${serverOrigin}${cleanPath}`;
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Poll for notifications every 10s if logged in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await notificationsApi.markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((item) => (item._id === id ? { ...item, read: true } : item))
        );
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await notificationsApi.markAllAsRead();
      if (res.success) {
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await notificationsApi.deleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((item) => item._id !== id));
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await notificationsApi.clearAll();
      if (res.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const handleViewCandidate = (candidateId, notificationId) => {
    if (notificationId) {
      notificationsApi.markAsRead(notificationId).catch(() => {});
    }
    setIsOpen(false);
    if (candidateId) {
      navigate(`/candidates/${candidateId}`);
    } else {
      navigate('/dashboard?tab=applicants');
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notif-dropdown-wrapper" ref={wrapperRef}>
      <button
        className="notif-bell-btn"
        onClick={handleToggle}
        id="nav-bell"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />
        <span
          className={`notif-bell-badge ${
            unreadCount > 0 ? 'notif-bell-badge--active' : ''
          }`}
        >
          {unreadCount}
        </span>
      </button>

      {isOpen && (
        <div className="notif-menu" id="nav-bell-dropdown">
          <div className="notif-menu__header">
            <div className="notif-menu__title-group">
              <h4 className="notif-menu__title">Notifications</h4>
              {unreadCount > 0 && (
                <span className="notif-menu__count-pill">{unreadCount} new</span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="notif-menu__header-actions">
                {unreadCount > 0 && (
                  <button
                    className="notif-menu__action-btn"
                    onClick={handleMarkAllAsRead}
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} /> Mark read
                  </button>
                )}
                <button
                  className="notif-menu__action-btn notif-menu__action-btn--danger"
                  onClick={handleClearAll}
                  title="Clear all notifications"
                >
                  <Trash2 size={14} /> Clear all
                </button>
              </div>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notif-menu__empty">
              <div className="notif-menu__empty-icon">
                <Bell size={24} />
              </div>
              <div className="notif-menu__empty-text">No notifications yet</div>
              <div className="notif-menu__empty-subtext">
                When job seekers apply for your posted vacancies, candidate details & job applications will appear here.
              </div>
            </div>
          ) : (
            <ul className="notif-menu__list">
              {notifications.map((item) => {
                const candidate = item.sender || {};
                const job = item.job || {};
                const application = item.application || {};
                const isUnread = !item.read;

                return (
                  <li
                    key={item._id}
                    className={`notif-item ${
                      isUnread ? 'notif-item--unread' : ''
                    }`}
                  >
                    <div className="notif-item__top">
                      <div className="notif-item__avatar-wrapper">
                        <img
                          src={getAvatarUrl(candidate.avatar)}
                          alt={candidate.name || 'Candidate'}
                          className="notif-item__avatar"
                        />
                        {isUnread && <span className="notif-item__unread-dot" />}
                      </div>

                      <div className="notif-item__content">
                        <div className="notif-item__badge-row">
                          <span className="notif-item__type-tag">
                            <User size={12} /> Candidate Applied
                          </span>
                          <span className="notif-item__time">
                            <Clock size={11} style={{ display: 'inline', marginRight: '2px' }} />
                            {formatTime(item.createdAt)}
                          </span>
                        </div>

                        {/* Job Topic Title */}
                        <div className="notif-item__job-title">
                          <Briefcase size={15} className="notif-item__job-title-icon" />
                          <span>Applied for: <strong>{job.title || 'Job Opening'}</strong></span>
                        </div>

                        {/* Candidate Name */}
                        <div className="notif-item__candidate-name">
                          👤 {candidate.name || 'Anonymous Candidate'} {candidate.title ? `• ${candidate.title}` : ''}
                        </div>

                        {/* Candidate Detailed Info Card */}
                        <div className="notif-item__details-box">
                          <div className="notif-item__info-row">
                            {candidate.email && (
                              <div className="notif-item__info-item">
                                <Mail size={12} /> {candidate.email}
                              </div>
                            )}
                            {candidate.phone && (
                              <div className="notif-item__info-item">
                                <Phone size={12} /> {candidate.phone}
                              </div>
                            )}
                            {candidate.location && (
                              <div className="notif-item__info-item">
                                <MapPin size={12} /> {candidate.location}
                              </div>
                            )}
                          </div>

                          {candidate.skills && candidate.skills.length > 0 && (
                            <div className="notif-item__skills-row">
                              {candidate.skills.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className="notif-item__skill-chip">
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 4 && (
                                <span className="notif-item__skill-chip">
                                  +{candidate.skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}

                          {application.coverLetter && (
                            <div className="notif-item__cover-letter">
                              "{application.coverLetter.length > 90
                                ? `${application.coverLetter.slice(0, 90)}...`
                                : application.coverLetter}"
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="notif-item__actions">
                          <button
                            className="notif-item__btn-view"
                            onClick={() => handleViewCandidate(candidate._id, item._id)}
                          >
                            <ExternalLink size={13} /> View Candidate Details
                          </button>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            {isUnread && (
                              <button
                                className="notif-item__btn-icon"
                                onClick={(e) => handleMarkAsRead(e, item._id)}
                                title="Mark as read"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              className="notif-item__btn-icon notif-item__btn-icon--delete"
                              onClick={(e) => handleDelete(e, item._id)}
                              title="Delete notification"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {notifications.length > 0 && (
            <div className="notif-menu__footer">
              <button
                className="notif-menu__footer-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard?tab=applicants');
                }}
              >
                View All Applications in Dashboard →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
