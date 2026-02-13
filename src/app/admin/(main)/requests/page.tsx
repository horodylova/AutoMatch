'use client';

import styles from '@/components/admin/admin.module.css';

interface Request {
  id: string;
  name: string;
  email: string;
  phone: string;
  dealership: string;
  status: 'new' | 'contacted' | 'approved' | 'declined';
  date: string;
}

const MOCK_REQUESTS: Request[] = [];

export default function RequestsPage() {
  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Partnership Requests</h1>
          <p className={styles.subtitle}>Review and approve new dealership applications</p>
        </div>
      </div>

      <div className={styles.card}>
        {MOCK_REQUESTS.length === 0 ? (
           <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--kendo-color-subtle)' }}>
             <p>No new partnership requests.</p>
           </div>
        ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Dealership</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REQUESTS.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{req.name}</div>
                  </td>
                  <td>{req.dealership}</td>
                  <td>
                    <div style={{ fontSize: 13 }}>{req.email}</div>
                    <div style={{ fontSize: 13, color: 'var(--kendo-color-subtle)' }}>{req.phone}</div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      req.status === 'new' ? styles.statusActive : 
                      req.status === 'contacted' ? '' :
                      req.status === 'approved' ? styles.statusActive :
                      styles.statusInactive
                    }`} style={{
                      backgroundColor: req.status === 'new' ? 'rgba(59, 130, 246, 0.15)' : undefined,
                      color: req.status === 'new' ? '#60a5fa' : undefined,
                      border: req.status === 'new' ? '1px solid rgba(59, 130, 246, 0.2)' : undefined,
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td>{req.date}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                        Review
                      </button>
                      {req.status === 'new' && (
                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
