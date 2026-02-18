import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/client';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = () => {
    setLoading(true);
    adminApi.getMessages()
      .then(res => {
        const data = res.data.results || res.data;
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleRead = async (msg) => {
    try {
      await adminApi.updateMessage(msg.id, { is_read: !msg.is_read });
      fetchMessages();
    } catch {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await adminApi.deleteMessage(id);
      toast.success('Message deleted');
      if (selectedMessage?.id === id) setSelectedMessage(null);
      fetchMessages();
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Messages</h1>
        <p>{messages.filter(m => !m.is_read).length} unread messages</p>
      </div>

      {loading ? (
        <LoadingSkeleton variant="text" count={6} />
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <FaEnvelope style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          <p>No messages yet.</p>
        </div>
      ) : (
        <div className="messages-layout">
          {/* Message List */}
          <div className="messages-list">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                className={`message-item ${!msg.is_read ? 'message-item--unread' : ''} ${selectedMessage?.id === msg.id ? 'message-item--selected' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (!msg.is_read) toggleRead(msg);
                }}
              >
                <div className="message-item__header">
                  <span className="message-item__name">{msg.sender_name}</span>
                  <span className="message-item__date">
                    <FaClock style={{ fontSize: '0.6rem' }} /> {formatDate(msg.created_at)}
                  </span>
                </div>
                <div className="message-item__subject">{msg.subject || '(no subject)'}</div>
                <div className="message-item__preview">
                  {msg.content?.substring(0, 80)}...
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Detail */}
          <div className="message-detail glass">
            {selectedMessage ? (
              <>
                <div className="message-detail__header">
                  <div>
                    <h3>{selectedMessage.subject || '(no subject)'}</h3>
                    <p className="message-detail__from">
                      From: <strong>{selectedMessage.sender_name}</strong> &lt;{selectedMessage.sender_email}&gt;
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
                  {selectedMessage.content?.split('\n').map((p, i) => (
                    <p key={i}>{p}</p>
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
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FaEnvelope style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }} />
                <p>Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
