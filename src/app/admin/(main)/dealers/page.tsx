'use client';

import { useState, useEffect } from 'react';
import styles from '@/components/admin/admin.module.css';
import AddDealerModal from '@/components/admin/AddDealerModal';

interface Dealer {
  id: string;
  name: string;
  feedUrl: string | null;
  slug: string;
  createdAt: string;
  _count: {
    cars: number;
  };
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
      const res = await fetch('/api/admin/dealers');
      if (res.ok) {
        const data = await res.json();
        setDealers(data);
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
                  <th>Name</th>
                  <th>Feed URL</th>
                  <th>Cars</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dealers.map((dealer) => (
                  <tr key={dealer.id}>
                    <td style={{ fontWeight: 500 }}>{dealer.name}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dealer.feedUrl ? (
                        <a href={dealer.feedUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--kendo-color-primary)', textDecoration: 'none' }}>
                          {dealer.feedUrl}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--kendo-color-subtle)', fontStyle: 'italic' }}>No feed configured</span>
                      )}
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
