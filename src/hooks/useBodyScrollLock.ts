import { useEffect } from 'react';

let lockCount = 0;

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      lockCount++;
      if (lockCount === 1) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      if (isLocked) {
        lockCount--;
        if (lockCount === 0) {
          document.body.style.overflow = '';
        }
      }
    };
  }, [isLocked]);
}
