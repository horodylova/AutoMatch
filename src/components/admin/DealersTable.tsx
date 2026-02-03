'use client';

import Link from 'next/link';
import styles from './admin.module.css';

interface Dealer {
  id: string;
  name: string;
  region: string;
  carsCount: number;
  status: 'active' | 'inactive';
  lastUpdate: string;
}

// Mock data for display
const MOCK_DEALERS: Dealer[] = [
  { id: '1', name: 'Toy Barn', region: 'Dublin, OH', carsCount: 45, status: 'active', lastUpdate: '15 min ago' },
  { id: '2', name: 'Honda Ohio', region: 'Columbus, OH', carsCount: 128, status: 'active', lastUpdate: '2 hours ago' },
  { id: '3', name: 'Ford Detroit', region: 'Detroit, MI', carsCount: 0, status: 'inactive', lastUpdate: '7 days ago' },
];

export default function DealersTable() {
  return (
    <div className={styles.card}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Dealer Name</th>
              <th>Region</th>
              <th>Cars</th>
              <th>Status</th>
              <th>Last Update</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DEALERS.map((dealer) => (
              <tr key={dealer.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{dealer.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--kendo-color-subtle)' }}>ID: {dealer.id}</div>
                </td>
                <td>{dealer.region}</td>
                <td>{dealer.carsCount}</td>
                <td>
                  <span className={`${styles.statusBadge} ${dealer.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    {dealer.status}
                  </span>
                </td>
                <td>{dealer.lastUpdate}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/dealers/${dealer.id}`} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                      View Cars
                    </Link>
                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm} ${styles.btnDanger}`}>
                      Disable
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
