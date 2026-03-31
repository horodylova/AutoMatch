'use client';

import { useState } from 'react';
import styles from './ChangePasswordModal.module.css';

interface AddDealerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDealerModal({ isOpen, onClose, onSuccess }: AddDealerModalProps) {
  const [name, setName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, feedUrl, contactName, contactEmail, contactPhone, website }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add dealer');
      }

      // Success
      onSuccess();
      onClose();
      setName('');
      setFeedUrl('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setWebsite('');
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
    <div className={styles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Add New Dealer</h2>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Dealer Name</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Toy Barn Dealership"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contact Name</label>
            <input
              type="text"
              className={styles.input}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. John Manager"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="name@dealership.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone</label>
            <input
              type="tel"
              className={styles.input}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 555 000 1234"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Website</label>
            <input
              type="url"
              className={styles.input}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://dealership.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Feed URL (CSV)</label>
            <input
              type="url"
              className={styles.input}
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://toybarn-dealer.com/feed/cars.csv"
              required
            />
            <p style={{ fontSize: 12, color: 'var(--kendo-color-subtle)', marginTop: 4 }}>
              Direct link to the dealer&apos;s inventory CSV file
            </p>
          </div>

          <div className={styles.actions}>
            <button 
              type="button" 
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.btnSubmit}`}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Dealer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
