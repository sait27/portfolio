import { useState, useEffect } from 'react';
import { FaUserSecret, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { adminApi } from '../api/client';

export default function ImpersonationBanner() {
  const [stopping, setStopping] = useState(false);
  const originalAdminId = localStorage.getItem('original_admin_id');

  useEffect(() => {
    if (originalAdminId) {
      document.body.classList.add('impersonation-active');
    } else {
      document.body.classList.remove('impersonation-active');
    }
    
    return () => {
      document.body.classList.remove('impersonation-active');
    };
  }, [originalAdminId]);

  if (!originalAdminId) return null;

  const handleStopImpersonation = async () => {
    try {
      setStopping(true);
      const response = await adminApi.stopImpersonation(originalAdminId);
      
      // Update tokens back to admin
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.removeItem('original_admin_id');
      document.body.classList.remove('impersonation-active');
      
      toast.success('Stopped impersonation');
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setStopping(false);
      toast.error('Failed to stop impersonation');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      color: 'white',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      zIndex: 9999,
      fontSize: '0.875rem',
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
    }}>
      <FaUserSecret />
      <span>You are impersonating a user</span>
      <button
        onClick={handleStopImpersonation}
        disabled={stopping}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <FaSignOutAlt />
        {stopping ? 'Stopping...' : 'Stop Impersonation'}
      </button>
    </div>
  );
}