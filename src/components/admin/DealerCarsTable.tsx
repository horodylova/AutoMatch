'use client';

import styles from './admin.module.css';

interface Car {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  price: number;
  status: 'active' | 'sold' | 'pending';
  image: string;
  uploadedAt: string;
}

const MOCK_CARS: Car[] = [
  {
    id: '1',
    vin: '1G1...4582',
    year: 2023,
    make: 'Honda',
    model: 'CR-V EX-L',
    price: 34500,
    status: 'active',
    image: '/placeholder-car.jpg',
    uploadedAt: '2 days ago'
  },
  {
    id: '2',
    vin: '2T1...9931',
    year: 2020,
    make: 'Toyota',
    model: 'Camry SE',
    price: 22900,
    status: 'active',
    image: '/placeholder-car.jpg',
    uploadedAt: '5 days ago'
  },
  {
    id: '3',
    vin: 'JN1...2201',
    year: 2019,
    make: 'Nissan',
    model: 'Rogue SV',
    price: 18500,
    status: 'sold',
    image: '/placeholder-car.jpg',
    uploadedAt: '2 weeks ago'
  }
];

export default function DealerCarsTable() {
  return (
    <div className={styles.card}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Image</th>
              <th>Vehicle</th>
              <th>VIN</th>
              <th>Price</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CARS.map((car) => (
              <tr key={car.id}>
                <td>
                  <div style={{ width: 60, height: 40, backgroundColor: '#333', borderRadius: 4 }}></div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#fff' }}>
                    {car.year} {car.make} {car.model}
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{car.vin}</td>
                <td>${car.price.toLocaleString()}</td>
                <td>
                  <span className={`${styles.statusBadge} ${car.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    {car.status}
                  </span>
                </td>
                <td>{car.uploadedAt}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
                      Edit
                    </button>
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
