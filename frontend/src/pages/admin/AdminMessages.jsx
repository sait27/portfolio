import { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { FaClock, FaEnvelope, FaEnvelopeOpen, FaFilter, FaSearch, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { userApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Messages' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchMessages = () => {
    userApi.getMessages()
      .then((res) => {
        const data = res.data?.results || res.data || [];
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const filteredMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return messages
      .filter((message) => {
        const matchesSearch = !term || [
          message.sender_name,
          message.sender_email,
          message.subject,
          message.content,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

        const matchesStatus = statusFilter === 'all'
          || (statusFilter === 'unread' && !message.is_read)
          || (statusFilter === 'read' && message.is_read);

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0));
  }, [messages, searchTerm, statusFilter]);

  const unreadCount = useMemo(() => messages.filter((item) => !item.is_read).length, [messages]);
  const activeSelectedMessageId = useMemo(() => {
    if (filteredMessages.length === 0) {
      return null;
    }

    const hasSelectedMessage = filteredMessages.some((item) => item.id === selectedMessageId);
    if (hasSelectedMessage) {
      return selectedMessageId;
    }

    const preferredMessage = filteredMessages.find((item) => !item.is_read) || filteredMessages[0];
    return preferredMessage?.id ?? null;
  }, [filteredMessages, selectedMessageId]);
  const selectedMessage = useMemo(
    () => messages.find((item) => item.id === activeSelectedMessageId) || null,
    [activeSelectedMessageId, messages]
  );

  const messageInsights = useMemo(() => [
    { label: 'Total', value: messages.length },
    { label: 'Unread', value: unreadCount },
    { label: 'Read', value: Math.max(messages.length - unreadCount, 0) },
    { label: 'Filtered', value: filteredMessages.length },
  ], [messages.length, unreadCount, filteredMessages.length]);

  const toggleRead = async (message, silent = false) => {
    try {
      await userApi.updateMessage(message.id, { is_read: !message.is_read });
      setMessages((prev) => prev.map((item) =>
        item.id === message.id ? { ...item, is_read: !item.is_read } : item
      ));
      if (!silent) {
        toast.success(!message.is_read ? 'Marked as read' : 'Marked as unread');
      }
    } catch {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await userApi.deleteMessage(id);
      setMessages((prev) => prev.filter((item) => item.id !== id));
      if (activeSelectedMessageId === id) {
        setSelectedMessageId(null);
      }
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleOpenMessage = (message) => {
    setSelectedMessageId(message.id);
    if (!message.is_read) {
      toggleRead(message, true);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-content-page">
      <div className="admin-page-header admin-content-page__header">
        <div>
          <h1>Messages</h1>
          <p>{unreadCount} unread message{unreadCount === 1 ? '' : 's'} in your inbox.</p>
        </div>
      </div>

      <div className="admin-content-insights">
        {messageInsights.map((item) => (
          <div key={item.label} className="admin-content-insights__item">
            <span className="admin-content-insights__label">{item.label}</span>
            <strong className="admin-content-insights__value">{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-content-toolbar glass">
        <label className="admin-panel__search">
          <FaSearch />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by sender, email, subject, or message"
            aria-label="Search messages"
          />
        </label>
        <label className="admin-content-filter">
          <FaFilter />
          <select
            className="form-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter messages by read status"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <LoadingSkeleton variant="text" count={6} />
      ) : messages.length === 0 ? (
        <div className="admin-empty-state glass">
          <FaEnvelope />
          <p>No messages yet.</p>
        </div>
      ) : (
        <div className="messages-layout">
          <div className="messages-list">
            {filteredMessages.length === 0 ? (
              <div className="admin-empty-state">
                <FaEnvelope />
                <p>No messages match your current filters.</p>
              </div>
            ) : (
              filteredMessages.map((message, index) => (
                <Motion.div
                  key={message.id}
                  className={`message-item ${!message.is_read ? 'message-item--unread' : ''} ${activeSelectedMessageId === message.id ? 'message-item--selected' : ''}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleOpenMessage(message)}
                >
                  <div className="message-item__header">
                    <span className="message-item__name">{message.sender_name || 'Unknown Sender'}</span>
                    <span className="message-item__date">
                      <FaClock style={{ fontSize: '0.6rem' }} /> {formatDate(message.created_at)}
                    </span>
                  </div>
                  <div className="message-item__subject">{message.subject || '(no subject)'}</div>
                  <div className="message-item__preview">{(message.content || '').substring(0, 80)}...</div>
                </Motion.div>
              ))
            )}
          </div>

          <div className="message-detail glass">
            {selectedMessage ? (
              <>
                <div className="message-detail__header">
                  <div>
                    <h3>{selectedMessage.subject || '(no subject)'}</h3>
                    <p className="message-detail__from">
                      From: <strong>{selectedMessage.sender_name || 'Unknown'}</strong> &lt;{selectedMessage.sender_email}&gt;
                    </p>
                    <p className="message-detail__date">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="admin-btn admin-btn--edit"
                      onClick={() => toggleRead(selectedMessage)}
                    >
                      {selectedMessage.is_read ? <><FaEnvelope /> Mark Unread</> : <><FaEnvelopeOpen /> Mark Read</>}
                    </button>
                    <button
                      className="admin-btn admin-btn--delete"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
                <div className="message-detail__body">
                  {(selectedMessage.content || '').split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <div className="message-detail__reply">
                  <a
                    href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject || ''}`}
                    className="btn btn-primary btn-sm"
                  >
                    Reply via Email
                  </a>
                </div>
              </>
            ) : (
              <div className="admin-empty-state">
                <FaEnvelope />
                <p>Select a message to read.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
