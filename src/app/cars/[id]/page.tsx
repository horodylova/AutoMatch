"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "@/components/cars/cars.module.css";
import Loader from "@/components/Loader";
import CarDetails from "@/components/cars/CarDetails";
import { fetchDataset } from "@/lib/dataset";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const run = async () => {
      await fetchDataset();
      if (active) setReady(true);
    };
    run();
    return () => { active = false; };
  }, []);
  return (
    <div className={styles.page}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {ready ? <CarDetails id={String(id || "")} /> : <Loader />}
      </div>
    </div>
  );
}
