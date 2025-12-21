import React from "react";
import { useRouter } from "next/navigation";
import { clearQuizAnswers } from "../../../utils/storage";

interface ExitModalProps {
  onCancel: () => void;
  destination?: string;
  onConfirm?: () => void;
}

export default function ExitModal({ onCancel, destination = "/", onConfirm }: ExitModalProps) {
  const router = useRouter();

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "var(--kendo-color-surface)",
        borderRadius: "24px",
        padding: "32px",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        border: "1px solid var(--kendo-color-border-alt)",
        animation: "fadeIn 0.2s ease-out"
      }}>
        <h3 style={{
          fontSize: "24px",
          fontWeight: 800,
          marginBottom: "12px",
          color: "var(--kendo-color-on-surface)"
        }}>
          Leaving the driver&apos;s seat?
        </h3>
        <p style={{
          fontSize: "16px",
          lineHeight: 1.6,
          color: "var(--kendo-color-on-surface)",
          marginBottom: "28px"
        }}>
          Life moves fast. We can park your progress here for 24 hours so you don&apos;t lose your spot
        </p>
        <div style={{ display: "grid", gap: "12px" }}>
          <button
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              } else {
                router.push(destination);
              }
            }}
            style={{
              padding: "16px 32px",
              justifySelf: "center",
              borderRadius: "99px",
              background: "var(--kendo-color-primary)",
              color: "var(--kendo-color-on-app-surface)",
              border: "none",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.1s ease",
              boxShadow: "0 4px 12px rgba(201,71,45,0.25)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Yes, save matches
          </button>
          <button
            onClick={() => {
              clearQuizAnswers();
              router.push(destination);
            }}
            style={{
              padding: "16px",
              borderRadius: "99px",
              background: "transparent",
              color: "var(--kendo-color-on-surface)",
              opacity: 0.6,
              border: "none",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
          >
            No, start fresh
          </button>
        </div>
        <button 
          onClick={onCancel}
          style={{
            marginTop: "16px",
            background: "none",
            border: "none",
            fontSize: "14px",
            color: "rgba(14,27,36,0.4)",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          Cancel and return to quiz
        </button>
      </div>
    </div>
  );
}
