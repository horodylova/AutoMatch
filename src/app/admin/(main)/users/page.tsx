'use client';

import { useState, useEffect } from 'react';
import styles from '@/components/admin/admin.module.css';

interface Admin {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminsRes, meRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/me')
      ]);

      if (adminsRes.ok) {
        const data = await adminsRes.json();
        setAdmins(data);
      }

      if (meRes.ok) {
        const data = await meRes.json();
        setCurrentUserRole(data.role);
        setCurrentUserId(data.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add user');
      }
      
      setSuccess(true);
      setNewEmail('');
      fetchAdmins();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAdmins(admins.filter(admin => admin.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the user');
    }
  };

  if (loading) return <div className={styles.loadingState}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 className={styles.title}>Team</h1>
          <p className={styles.subtitle}>Manage admin access</p>
        </div>
        {currentUserRole === 'SUPER_ADMIN' && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsModalOpen(true)}>
            Add Member
          </button>
        )}
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              {currentUserRole === 'SUPER_ADMIN' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.email}</td>
                <td>
                  <span className={styles.badge}>{admin.role}</span>
                </td>
                <td>
                  <span className={styles.badge} style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: '1px solid rgba(76, 175, 80, 0.2)' }}>Active</span>
                </td>
                <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                {currentUserRole === 'SUPER_ADMIN' && (
                  <td>
                    {admin.id !== currentUserId && (
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className={styles.btn}
                        style={{
                          padding: '4px 8px',
                          fontSize: 12,
                          background: 'rgba(255, 77, 77, 0.1)',
                          color: '#ff4d4d',
                          border: '1px solid rgba(255, 77, 77, 0.2)'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className={styles.card} style={{ width: '100%', maxWidth: 500, margin: 20 }}>
            <h2 className={styles.title} style={{ fontSize: 20, marginBottom: 24 }}>Add New Admin</h2>
            
            {!success ? (
              <form onSubmit={handleAddUser}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="colleague@carcupid.fit"
                    required
                  />
                </div>
                
                {error && <div style={{ color: '#ff4d4d', marginBottom: 16, fontSize: 14 }}>{error}</div>}
                
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className={styles.btn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create Admin</button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                  <div style={{ color: '#4caf50', fontWeight: 600, marginBottom: 8 }}>User created successfully!</div>
                  <div style={{ fontSize: 14, color: 'var(--kendo-color-subtle)', marginBottom: 8 }}>
                    The user can now log in with the default password:
                  </div>
                  <div style={{ 
                    background: '#000', padding: 12, borderRadius: 4, 
                    fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold',
                    border: '1px solid var(--kendo-color-border)',
                    textAlign: 'center', color: '#fff'
                  }}>
                    00000
                  </div>
                </div>
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`} 
                  style={{ width: '100%' }}
                  onClick={() => {
                    setSuccess(false);
                    setIsModalOpen(false);
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
