import styles from '@/components/admin/admin.module.css';

export default function DealersPage() {
  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dealers</h1>
          <p className={styles.subtitle}>Manage your dealer network and their inventory status</p>
        </div>
      </div>
      
      <div className={styles.card}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--kendo-color-subtle)' }}>
          <p>Dealers functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
}
