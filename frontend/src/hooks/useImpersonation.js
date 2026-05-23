import { useState } from 'react';

export function useImpersonation() {
  const [isImpersonating, setIsImpersonating] = useState(() => Boolean(localStorage.getItem('original_admin_id')));

  return { isImpersonating, setIsImpersonating };
}
