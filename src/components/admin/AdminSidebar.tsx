'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';
import ChangePasswordModal from './ChangePasswordModal';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span>CarCupid</span>
        <span style={{ fontSize: 12, opacity: 0.5, border: '1px solid currentColor', padding: '2px 6px', borderRadius: 4 }}>ADMIN</span>
      </div>
      
      <nav className={styles.nav}>
        <Link 
          href="/admin" 
          className={`${styles.navItem} ${pathname === '/admin' ? styles.navItemActive : ''}`}
        >
          Dashboard
        </Link>
        <Link 
          href="/admin/dealers" 
          className={`${styles.navItem} ${isActive('/admin/dealers') ? styles.navItemActive : ''}`}
        >
          Dealers
        </Link>
        <Link 
          href="/admin/requests" 
          className={`${styles.navItem} ${isActive('/admin/requests') ? styles.navItemActive : ''}`}
        >
          Requests
        </Link>
        <Link 
          href="/admin/users" 
          className={`${styles.navItem} ${isActive('/admin/users') ? styles.navItemActive : ''}`}
        >
          Team
        </Link>
      </nav>

      <div className={styles.nav}>
        <button 
          onClick={() => setIsChangePasswordOpen(true)}
          className={styles.navItem} 
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none' }}
        >
          Change Password
        </button>
        <button 
          onClick={async () => {
            await fetch('/api/admin/logout', { method: 'POST' });
            window.location.href = '/admin/login';
          }}
          className={styles.navItem} 
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none' }}
        >
          Logout
        </button>
      </div>
      
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </aside>
  );
}
