import styles from '@/components/admin/admin.module.css';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const totalDealers = await prisma.dealer.count();
  const activeDealers = await prisma.dealer.count({
    where: {
      feedUrl: {
        not: null
      }
    }
  });
  const totalCars = await prisma.car.count();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const updatedToday = await prisma.car.count({
    where: {
      updatedAt: {
        gte: today
      }
    }
  });

  // Fetch dealers to derive recent activity
  const dealersForActivity = await prisma.dealer.findMany({
    select: {
      name: true,
      createdAt: true,
      _count: {
        select: { cars: true }
      },
      cars: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
        select: { updatedAt: true }
      }
    }
  });

  // Generate a combined list of activities (Creations and Updates)
  interface Activity {
    id: string;
    source: string;
    event: string;
    time: Date;
    color: string;
  }

  const activities: Activity[] = dealersForActivity.flatMap((dealer: typeof dealersForActivity[number]) => {
    const events: Activity[] = [];

    // Event 1: Dealer Creation
    events.push({
      id: `${dealer.name}-created-${dealer.createdAt.getTime()}`,
      source: dealer.name,
      event: 'Dealer Registered',
      time: dealer.createdAt,
      color: 'var(--kendo-color-primary)'
    });

    // Event 2: Last Inventory Update (only if cars exist)
    if (dealer.cars.length > 0) {
      events.push({
        id: `${dealer.name}-updated-${dealer.cars[0].updatedAt.getTime()}`,
        source: dealer.name,
        event: `Inventory Synced (${dealer._count.cars} cars total)`,
        time: dealer.cars[0].updatedAt,
        color: 'var(--kendo-color-success)' // Green for success/active
      });
    }

    return events;
  })
  .sort((a: Activity, b: Activity) => b.time.getTime() - a.time.getTime())
  .slice(0, 10); // Show top 10 most recent events

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
          <div className={styles.statValue}>{totalDealers}</div>
          <div className={styles.statLabel}>Total Dealers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{activeDealers}</div>
          <div className={styles.statLabel}>Active Dealers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalCars.toLocaleString()}</div>
          <div className={styles.statLabel}>Total Cars</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{updatedToday.toLocaleString()}</div>
          <div className={styles.statLabel}>Updated Today</div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: 18 }}>Recent Activity</h3>
        {activities.length > 0 ? (
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
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td style={{ fontWeight: 500 }}>{activity.source}</td>
                    <td>{activity.event}</td>
                    <td style={{ color: 'var(--kendo-color-subtle)' }}>
                      {activity.time.toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: 'numeric', 
                        minute: 'numeric',
                        hour12: true 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--kendo-color-subtle)' }}>
            No recent activity found. Add a dealer to get started.
          </div>
        )}
      </div>
    </div>
  );
}
