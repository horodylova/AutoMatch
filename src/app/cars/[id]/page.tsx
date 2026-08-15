"use client";
import { useParams } from "next/navigation";
import styles from "@/components/cars/cars.module.css";
import CarDetails from "@/components/cars/CarDetails";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className={styles.page}>
      <div className="container" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <CarDetails id={String(id || "")} />
      </div>
    </div>
  );
}
