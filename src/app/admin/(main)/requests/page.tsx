'use client';

import { useEffect, useState } from 'react';
import styles from '@/components/admin/admin.module.css';

type RequestStatus = 'new' | 'contacted' | 'approved' | 'declined';

interface Request {
  id: string;
  contactName: string;
  email: string;
  phone: string | null;
  dealershipName: string;
  interest: string | null;
  status: RequestStatus;
  createdAt: string;
}

interface RawRequest {
  id: string;
  contactName: string;
  email: string;
  phone?: string | null;
  dealershipName: string;
  interest?: string | null;
  status?: string;
  createdAt: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/admin/requests');
        if (!res.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await res.json();
        const mapped: Request[] = (data as RawRequest[]).map((item) => ({
          id: item.id,
          contactName: item.contactName,
          email: item.email,
          phone: item.phone || null,
          dealershipName: item.dealershipName,
          interest: item.interest || null,
          status: (item.status || 'new') as RequestStatus,
          createdAt: item.createdAt,
        }));
        setRequests(mapped);
      } catch (error) {
        console.error('Failed to load partnership requests', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleReview = async (id: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: 'contacted' as RequestStatus }),
      });
      if (!res.ok) {
        throw new Error('Failed to update request status');
      }
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: 'contacted' } : req
        )
      );
    } catch (error) {
      console.error('Failed to update partnership request status', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/requests?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete request');
      }
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error('Failed to delete partnership request', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Partnership Requests</h1>
          <p className={styles.subtitle}>Review and approve new dealership applications</p>
        </div>
      </div>

      <div className={styles.card}>
        {requests.length === 0 ? (
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
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div className={styles.contactName}>{req.contactName}</div>
                  </td>
                  <td>{req.dealershipName}</td>
                  <td>
                    <div style={{ fontSize: 13 }}>{req.email}</div>
                    {req.phone && (
                      <div style={{ fontSize: 13, color: 'var(--kendo-color-subtle)' }}>{req.phone}</div>
                    )}
                    {req.interest && (
                      <div style={{ fontSize: 13, color: 'var(--kendo-color-subtle)' }}>{req.interest}</div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        req.status === 'new'
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                      style={{
                        backgroundColor: req.status === 'new' ? 'rgba(59, 130, 246, 0.15)' : undefined,
                        color: req.status === 'new' ? '#60a5fa' : undefined,
                        border: req.status === 'new' ? '1px solid rgba(59, 130, 246, 0.2)' : undefined,
                      }}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {new Date(req.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                        onClick={() => handleReview(req.id)}
                        disabled={req.status !== 'new'}
                      >
                        Review
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                        onClick={() => handleDelete(req.id)}
                      >
                        Delete
                      </button>
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
