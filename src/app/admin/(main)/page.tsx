import styles from '@/components/admin/admin.module.css';

export default function AdminDashboard() {
  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>System Overview</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>15</div>
          <div className={styles.statLabel}>Total Dealers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>12</div>
          <div className={styles.statLabel}>Active Dealers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>12,847</div>
          <div className={styles.statLabel}>Total Cars</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>1,563</div>
          <div className={styles.statLabel}>Updated Today</div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: 18 }}>Recent Activity</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Source</th>
                <th>Event</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500 }}>Toy Barn</td>
                <td>Uploaded 45 cars</td>
                <td style={{ color: 'var(--kendo-color-subtle)' }}>15 minutes ago</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Honda Ohio</td>
                <td>Updated prices</td>
                <td style={{ color: 'var(--kendo-color-subtle)' }}>2 hours ago</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Ford Detroit</td>
                <td>Feed error</td>
                <td style={{ color: '#f87171' }}>Yesterday</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
