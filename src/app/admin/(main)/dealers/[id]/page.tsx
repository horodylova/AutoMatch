'use client';

import Link from 'next/link';
import DealerCarsTable from '@/components/admin/DealerCarsTable';
import styles from '@/components/admin/admin.module.css';

export default function DealerDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/dealers" className={styles.btn} style={{ paddingLeft: 0, color: 'var(--kendo-color-subtle)' }}>
          ← Back to Dealers
        </Link>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Toy Barn Motors</h1>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
            <span className={`${styles.statusBadge} ${styles.statusActive}`}>Active</span>
            <span style={{ color: 'var(--kendo-color-subtle)', fontSize: 14 }}>Dublin, OH</span>
            <span style={{ color: 'var(--kendo-color-subtle)', fontSize: 14 }}>•</span>
            <span style={{ color: 'var(--kendo-color-subtle)', fontSize: 14 }}>ID: {params.id}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnSecondary}`}>Edit Dealer</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>Sync Inventory</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        <div className={styles.card} style={{ marginBottom: 0, padding: 20 }}>
          <div style={{ color: 'var(--kendo-color-subtle)', fontSize: 13, marginBottom: 4 }}>Total Cars</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>45</div>
        </div>
        <div className={styles.card} style={{ marginBottom: 0, padding: 20 }}>
          <div style={{ color: 'var(--kendo-color-subtle)', fontSize: 13, marginBottom: 4 }}>Active</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#4ade80' }}>42</div>
        </div>
        <div className={styles.card} style={{ marginBottom: 0, padding: 20 }}>
          <div style={{ color: 'var(--kendo-color-subtle)', fontSize: 13, marginBottom: 4 }}>Last Sync</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>15 min ago</div>
        </div>
        <div className={styles.card} style={{ marginBottom: 0, padding: 20 }}>
          <div style={{ color: 'var(--kendo-color-subtle)', fontSize: 13, marginBottom: 4 }}>API Key</div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#fff' }}>••••••••a1b2</div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Inventory</h2>
      <DealerCarsTable />
    </div>
  );
}
