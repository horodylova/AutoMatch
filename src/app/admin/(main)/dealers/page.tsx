'use client';

import { useState, useEffect } from 'react';
import styles from '@/components/admin/admin.module.css';
import AddDealerModal from '@/components/admin/AddDealerModal';

interface Dealer {
  id: string;
  name: string;
  feedUrl: string | null;
  slug: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  billingStatus?: string;
  termStartAt?: string | null;
  termEndAt?: string | null;
  createdAt: string;
  _count: {
    cars: number;
  };
  payments?: {
    method: 'card' | 'us_bank_account' | 'invoice';
    termMonths: number;
    startDate: string;
    endDate: string;
    status: 'succeeded' | 'failed' | 'processing';
  }[];
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const res = await fetch('/api/admin/dealers', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setDealers(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load dealers', res.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this dealer? This will also delete all their cars.')) return;

    try {
      const res = await fetch(`/api/admin/dealers/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchDealers();
      } else {
        alert('Failed to delete dealer');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  if (loading) return <div className={styles.loadingState}>Loading...</div>;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dealers</h1>
          <p className={styles.subtitle}>Manage your dealer network and their inventory status</p>
        </div>
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => setIsModalOpen(true)}
        >
          Add Dealer
        </button>
      </div>
      
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        {dealers.length === 0 ? (
           <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--kendo-color-subtle)' }}>
             <p>No dealers added yet.</p>
             <button 
               className={`${styles.btn} ${styles.btnPrimary}`}
               style={{ marginTop: 16 }}
               onClick={() => setIsModalOpen(true)}
             >
               Add your first dealer
             </button>
           </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Contact</th>
                  <th>Dealer</th>
                  <th>Feed URL</th>
                  <th>Billing</th>
                  <th>Activation</th>
                  <th>Cars</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dealers.map((dealer) => (
                  <tr key={dealer.id}>
                    <td style={{ fontSize: 12, color: 'var(--kendo-color-subtle)' }}>{dealer.id}</td>
                    <td className={styles.contactCell}>
                      <div className={styles.contactName}>{dealer.contactName || '—'}</div>
                      <div className={styles.contactMeta}>
                        {dealer.contactEmail || '—'}{dealer.contactPhone ? ` • ${dealer.contactPhone}` : ''}
                      </div>
                      {dealer.website && (
                        <div className={styles.contactWebsite}>
                          <a href={dealer.website} target="_blank" rel="noopener noreferrer">
                            {dealer.website}
                          </a>
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{dealer.name}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dealer.feedUrl ? (
                        <a href={dealer.feedUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--kendo-color-primary)', textDecoration: 'none' }}>
                          {dealer.feedUrl}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--kendo-color-subtle)', fontStyle: 'italic' }}>No feed configured</span>
                      )}
                    </td>
                    <td style={{ minWidth: 160 }}>
                      {dealer.payments && dealer.payments.length > 0 ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {dealer.payments[0].method === 'invoice' ? 'Subscription' : 'One-time'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--kendo-color-subtle)' }}>
                            {dealer.payments[0].method === 'invoice' ? 'Subscription' : dealer.payments[0].method === 'us_bank_account' ? 'ACH' : 'Card'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--kendo-color-subtle)' }}>—</span>
                      )}
                    </td>
                    <td style={{ minWidth: 180 }}>
                      <div>
                        <span style={{ color: 'var(--kendo-color-subtle)', fontSize: 12 }}>Start</span>{' '}
                        <span>{dealer.termStartAt ? new Date(dealer.termStartAt).toLocaleDateString() : '—'}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--kendo-color-subtle)', fontSize: 12 }}>End</span>{' '}
                        <span>{dealer.termEndAt ? new Date(dealer.termEndAt).toLocaleDateString() : '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.badge} style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--kendo-color-on-app-surface)' }}>
                        {dealer._count.cars} cars
                      </span>
                    </td>
                    <td>{new Date(dealer.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleDelete(dealer.id)}
                          className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
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

      <AddDealerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDealers}
      />
    </div>
  );
}
