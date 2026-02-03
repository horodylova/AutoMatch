'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/components/admin/admin.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/admin');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminContainer} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className={styles.card} style={{ width: '100%', maxWidth: 400, padding: '40px', borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className={styles.logo} style={{ justifyContent: 'center', marginBottom: 12, fontSize: 24 }}>
            CarCupid <span style={{ fontSize: 12, opacity: 0.5, border: '1px solid currentColor', padding: '2px 6px', borderRadius: 4, marginLeft: 8, fontWeight: 500 }}>ADMIN</span>
          </div>
          <p className={styles.subtitle} style={{ fontSize: 15 }}>Sign in to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.formGroup}>
            <label className={styles.label} style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginLeft: 2 }}>Email Address</label>
            <input 
              type="email" 
              className={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@carcupid.fit" 
              style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)' }} 
              required
            />
          </div>

          <div className={styles.formGroup} style={{ marginBottom: 32 }}>
            <label className={styles.label} style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginLeft: 2 }}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)' }} 
              required
            />
          </div>

          {error && <div style={{ color: '#ff4d4d', marginBottom: 24, textAlign: 'center', fontSize: 14 }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.btnPrimary}`} 
              style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 600, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
