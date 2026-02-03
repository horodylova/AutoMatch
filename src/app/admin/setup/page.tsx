'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from '@/components/admin/admin.module.css';

function SetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  if (!token) {
    return (
      <div className={styles.adminContainer} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.card} style={{ textAlign: 'center', padding: 40 }}>
          <h1 className={styles.title} style={{ color: '#ff4d4d' }}>Invalid Link</h1>
          <p style={{ color: 'var(--kendo-color-subtle)' }}>This invitation link is invalid or missing a token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className={styles.card} style={{ width: '100%', maxWidth: 400, padding: 40, borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className={styles.logo} style={{ justifyContent: 'center', marginBottom: 12, fontSize: 24 }}>
            CarCupid <span style={{ fontSize: 12, opacity: 0.5, border: '1px solid currentColor', padding: '2px 6px', borderRadius: 4, marginLeft: 8, fontWeight: 500 }}>ADMIN</span>
          </div>
          <p className={styles.subtitle} style={{ fontSize: 15 }}>Set up your account password</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', color: '#4caf50' }}>
            <h3 style={{ marginBottom: 8 }}>Password Set!</h3>
            <p>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>New Password</label>
              <input 
                type="password" 
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 32 }}>
              <label className={styles.label}>Confirm Password</label>
              <input 
                type="password" 
                className={styles.input} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                required
              />
            </div>

            {error && <div style={{ color: '#ff4d4d', marginBottom: 16, fontSize: 14, textAlign: 'center' }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 600 }}>
                Set Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminSetupPage() {
  return (
    <Suspense fallback={<div className={styles.adminContainer}>Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}
