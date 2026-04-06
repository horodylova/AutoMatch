"use client";
import { useEffect, useState } from "react";
import styles from "./poll.module.css";

type Props = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
};

export default function PollBlock({ id, question, optionA, optionB }: Props) {
  const [voted, setVoted] = useState<"A" | "B" | null>(null);
  const [realTotal, setRealTotal] = useState<number>(0);
  const displayBase = 128;

  useEffect(() => {
    fetch(`/api/polls/stats?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => setRealTotal(data?.totals?.total || 0))
      .catch(() => {});
  }, [id, question]);

  const vote = async (opt: "A" | "B") => {
    if (voted) return;
    setVoted(opt);
    try {
      await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, option: opt }),
      });
      const res = await fetch(`/api/polls/stats?id=${encodeURIComponent(id)}`).then(r => r.json()).catch(() => null);
      if (res?.totals?.total != null) setRealTotal(res.totals.total);
    } catch {}
  };

  return (
    <section className={styles.wrap} aria-label="Article poll">
      <h3 className={styles.title}>{question}</h3>
      <div className={styles.votes}>{displayBase + realTotal} votes</div>
      <div className={styles.row}>
        <button
          className={`${styles.btn} ${voted === "A" ? styles.btnActive : ""}`}
          onClick={() => vote("A")}
          disabled={!!voted}
          aria-pressed={voted === "A"}
        >
          {optionA}
        </button>
        <button
          className={`${styles.btn} ${voted === "B" ? styles.btnActive : ""}`}
          onClick={() => vote("B")}
          disabled={!!voted}
          aria-pressed={voted === "B"}
        >
          {optionB}
        </button>
      </div>
    </section>
  );
}
