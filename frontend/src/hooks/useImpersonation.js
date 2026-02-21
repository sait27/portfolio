import { useState, useEffect } from 'react';

export function useImpersonation() {
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    const originalAdminId = localStorage.getItem('original_admin_id');
    setIsImpersonating(!!originalAdminId);
  }, []);

  return { isImpersonating, setIsImpersonating };
}